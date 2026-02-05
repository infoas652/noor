
import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { ControlPanelComponent } from './components/control-panel/control-panel.component';
import { authGuard } from './guards/auth.guard';

export const APP_ROUTES: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'admin', component: LoginComponent },
  { 
    path: 'admin/dashboard', 
    component: ControlPanelComponent,
    canActivate: [authGuard] 
  },
  { path: '**', redirectTo: 'home' } // Wildcard route
];
