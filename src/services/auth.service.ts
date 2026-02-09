import { Injectable, signal, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { firebaseAuth } from '../firebase';
// FIX: Import firebase compat libraries to use the v8 API.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router: Router = inject(Router);
  private _isAuthenticated = signal<boolean>(false);
  // FIX: Use firebase.User as the User type is not exported from 'firebase/auth' when using the compat layer.
  private currentUser = signal<firebase.User | null>(null);

  username = computed(() => this.currentUser()?.email ?? '');

  constructor() {
    // FIX: Use the onAuthStateChanged method from the firebaseAuth instance (v8 compat API).
    firebaseAuth.onAuthStateChanged((user) => {
      if (user) {
        this.currentUser.set(user);
        this._isAuthenticated.set(true);
      } else {
        this.currentUser.set(null);
        this._isAuthenticated.set(false);
      }
    });
  }

  get isAuthenticated() {
    return this._isAuthenticated.asReadonly();
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      // FIX: Use the signInWithEmailAndPassword method from the firebaseAuth instance (v8 compat API).
      await firebaseAuth.signInWithEmailAndPassword(email, password);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  }

  async logout(): Promise<void> {
    // FIX: Use the signOut method from the firebaseAuth instance (v8 compat API).
    await firebaseAuth.signOut();
    this.router.navigate(['/admin']);
  }

  async updateCredentials(currentPassword: string, newEmail: string, newPassword?: string): Promise<{success: boolean, message: string}> {
    const user = this.currentUser();
    if (!user || !user.email) {
      return { success: false, message: 'لا يوجد مستخدم مسجل حاليًا.' };
    }
    
    try {
      // FIX: Use the v8 compat API for creating credentials and re-authenticating.
      const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
      await user.reauthenticateWithCredential(credential);

      if (newEmail && newEmail !== user.email) {
        // FIX: Use the updateEmail method on the user object (v8 compat API).
        await user.updateEmail(newEmail);
      }

      if (newPassword) {
        // FIX: Use the updatePassword method on the user object (v8 compat API).
        await user.updatePassword(newPassword);
      }
      
      return { success: true, message: 'تم تحديث بيانات الاعتماد بنجاح!' };
    } catch (error: any) {
      console.error("Credential update failed:", error);
      let message = 'حدث خطأ غير متوقع.';
      if (error.code === 'auth/wrong-password') {
        message = 'كلمة المرور الحالية غير صحيحة.';
      } else if (error.code === 'auth/email-already-in-use') {
        message = 'البريد الإلكتروني الجديد مستخدم بالفعل.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'البريد الإلكتروني غير صالح.';
      }
      return { success: false, message: message };
    }
  }
}
