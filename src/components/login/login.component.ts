import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
})
export class LoginComponent {
  authService = inject(AuthService);
  router: Router = inject(Router);

  username = ''; // This is for the user's email
  password = '';
  errorMessage = signal<string | null>(null);

  async login(): Promise<void> {
    this.errorMessage.set(null);
    const success = await this.authService.login(this.username, this.password);
    if (success) {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.errorMessage.set('البريد الإلكتروني أو كلمة المرور غير صالحة.');
    }
  }
}
