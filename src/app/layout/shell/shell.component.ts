import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent],
  template: `
    <app-navbar (menuToggle)="sidebarOpen.set(!sidebarOpen())" />
    <div class="shell__body">
      <app-sidebar [open]="sidebarOpen()" />
      <main class="shell__main">
        <router-outlet />
      </main>
    </div>
  `,
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  sidebarOpen = signal(true);
}
