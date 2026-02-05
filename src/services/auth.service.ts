import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { auth } from '../firebase';
import { 
  User,
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateEmail, 
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router: Router = inject(Router);
  private _isAuthenticated = signal<boolean>(false);
  private currentUser = signal<User | null>(null);

  constructor() {
    onAuthStateChanged(auth, (user) => {
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
  
  get username() {
    return signal(this.currentUser()?.email ?? '').asReadonly();
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  }

  async logout(): Promise<void> {
    await signOut(auth);
    this.router.navigate(['/admin']);
  }

  async updateCredentials(currentPassword: string, newEmail: string, newPassword?: string): Promise<{success: boolean, message: string}> {
    const user = this.currentUser();
    if (!user || !user.email) {
      return { success: false, message: 'لا يوجد مستخدم مسجل حاليًا.' };
    }
    
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      if (newEmail && newEmail !== user.email) {
        await updateEmail(user, newEmail);
      }

      if (newPassword) {
        await updatePassword(user, newPassword);
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
