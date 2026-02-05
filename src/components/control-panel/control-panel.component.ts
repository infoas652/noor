
import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PortfolioData, PortfolioDataService } from '../../services/portfolio-data.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-control-panel',
  templateUrl: './control-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink],
})
export class ControlPanelComponent implements OnInit {
  portfolioService = inject(PortfolioDataService);
  authService = inject(AuthService);
  
  editableData = signal<PortfolioData>({} as PortfolioData);
  skillsInput: string = '';

  // For credentials change
  currentPassword = signal('');
  newUsername = signal(''); // This is for the new email
  newPassword = signal('');
  credentialUpdateMessage = signal<{text: string, type: 'success' | 'error'} | null>(null);

  ngOnInit() {
    const currentData = this.portfolioService.data();
    this.editableData.set(JSON.parse(JSON.stringify(currentData)));
    this.skillsInput = currentData.skills.join(', ');
    this.newUsername.set(this.authService.username()());
  }

  handleImageUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.editableData.update(data => ({ ...data, profilePicture: e.target.result as string }));
      };
      reader.readAsDataURL(file);
    }
  }

  async saveChanges(): Promise<void> {
    const updatedSkills = this.skillsInput.split(',').map(s => s.trim()).filter(s => s);
    this.editableData.update(data => ({ ...data, skills: updatedSkills }));
    await this.portfolioService.updateData(this.editableData());
    alert('تم حفظ بيانات الملف الشخصي بنجاح!');
  }

  async updateCredentials(): Promise<void> {
    this.credentialUpdateMessage.set(null);

    if (!this.currentPassword()) {
       this.credentialUpdateMessage.set({text: 'يرجى إدخال كلمة المرور الحالية.', type: 'error'});
      return;
    }

    if (!this.newUsername()) {
       this.credentialUpdateMessage.set({text: 'البريد الإلكتروني الجديد لا يمكن أن يكون فارغًا.', type: 'error'});
      return;
    }
    
    const passwordToUpdate = this.newPassword() ? this.newPassword() : undefined;
    const result = await this.authService.updateCredentials(this.currentPassword(), this.newUsername(), passwordToUpdate);

    if (result.success) {
      this.credentialUpdateMessage.set({text: result.message, type: 'success'});
      this.currentPassword.set('');
      this.newPassword.set('');
    } else {
      this.credentialUpdateMessage.set({text: result.message, type: 'error'});
    }
  }

  async logout(): Promise<void> {
    await this.authService.logout();
  }
}
