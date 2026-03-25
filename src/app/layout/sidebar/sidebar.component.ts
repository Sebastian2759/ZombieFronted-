import { Component, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Inicio',             icon: '&#127968;', route: '/home' },
  { label: 'Zombies',            icon: '&#129503;', route: '/zombies' },
  { label: 'Estrategia Óptima',  icon: '&#127919;', route: '/defense/strategy' },
  { label: 'Registrar Defensa',  icon: '&#128270;', route: '/defense/record' },
  { label: 'Ranking',            icon: '&#127942;', route: '/ranking' },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" [class.sidebar--open]="open()">
      <nav class="sidebar__nav">
        @for (item of visibleItems(); track item.route) {
          <a
            class="sidebar__item"
            [routerLink]="item.route"
            routerLinkActive="sidebar__item--active"
            [routerLinkActiveOptions]="{ exact: false }">
            <span class="sidebar__item-icon" [innerHTML]="item.icon"></span>
            <span class="sidebar__item-label">{{ item.label }}</span>
          </a>
        }
      </nav>
    </aside>
  `,
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  open = input(true);
  private readonly auth = inject(AuthService);

  visibleItems() {
    const role = this.auth.currentUser()?.rol;
    return NAV_ITEMS.filter(item => {
      if (!item.roles) return true;
      return role && item.roles.includes(role);
    });
  }
}
