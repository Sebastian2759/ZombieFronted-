import { Component, inject, output } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  template: `
    <nav class="navbar">
      <div class="navbar__brand">
        <span class="navbar__logo">&#9762;</span>
        <span class="navbar__title">Z-SAFE</span>
      </div>

      <div class="navbar__actions">
        @if (auth.isLoggedIn()) {
          <div class="navbar__user">
            <span class="navbar__user-name">{{ auth.currentUser()?.nombre }}</span>
            <span class="navbar__user-role">{{ auth.currentUser()?.rol }}</span>
          </div>
          <button class="navbar__logout" (click)="auth.logout()">Salir</button>
        }
        <button class="navbar__menu-btn" (click)="menuToggle.emit()">&#9776;</button>
      </div>
    </nav>
  `,
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  readonly auth = inject(AuthService);
  menuToggle = output<void>();
}
