import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { NavbarComponent } from './components/layout/navbar/navbar.component';
import { FooterComponent } from './components/layout/footer/footer.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent],
})
export class AppComponent {
  // FIX: Explicitly type the injected Router as type inference was failing.
  private router: Router = inject(Router);
  
  private routerEvents = toSignal(
    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
  );

  isAdminRoute = computed(() => {
    const navEndEvent = this.routerEvents() as NavigationEnd;
    return navEndEvent?.urlAfterRedirects?.startsWith('/admin');
  });
}