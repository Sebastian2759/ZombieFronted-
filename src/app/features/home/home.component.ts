import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="dashboard">
      <div class="dashboard__header">
        <div>
          <h1 class="dashboard__title">&#9762; Bienvenido, {{ auth.currentUser()?.nombre }}</h1>
          <p class="dashboard__subtitle">Sistema de Defensa Z-SAFE — Rol: <span class="role-badge">{{ auth.currentUser()?.rol }}</span></p>
        </div>
      </div>

      <div class="dashboard__grid">
        <a routerLink="/zombies" class="dash-card">
          <div class="dash-card__icon">&#129503;</div>
          <div class="dash-card__body">
            <h3>Catálogo de Zombies</h3>
            <p>Consulta todos los tipos de amenazas registradas con sus características.</p>
          </div>
          <span class="dash-card__arrow">&#8594;</span>
        </a>

        <a routerLink="/defense/strategy" class="dash-card dash-card--primary">
          <div class="dash-card__icon">&#127919;</div>
          <div class="dash-card__body">
            <h3>Estrategia Óptima</h3>
            <p>Calcula la mejor combinación de zombies a eliminar según tus recursos.</p>
          </div>
          <span class="dash-card__arrow">&#8594;</span>
        </a>

        <a routerLink="/defense/record" class="dash-card">
          <div class="dash-card__icon">&#128270;</div>
          <div class="dash-card__body">
            <h3>Registrar Defensa</h3>
            <p>Documenta una defensa real marcando los zombies eliminados en una simulación.</p>
          </div>
          <span class="dash-card__arrow">&#8594;</span>
        </a>

        <a routerLink="/ranking" class="dash-card dash-card--success">
          <div class="dash-card__icon">&#127942;</div>
          <div class="dash-card__body">
            <h3>Ranking</h3>
            <p>Clasificación de los mejores defensores por puntos de amenaza eliminados.</p>
          </div>
          <span class="dash-card__arrow">&#8594;</span>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: var(--space-6);
      &__header {
        margin-bottom: var(--space-8);
        display: flex; align-items: flex-start; justify-content: space-between;
      }
      &__title {
        font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold);
        color: var(--color-text-primary); margin: 0 0 var(--space-1);
      }
      &__subtitle { font-size: var(--font-size-md); color: var(--color-text-secondary); margin: 0; }
      &__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--space-4); }
    }

    .role-badge {
      background: var(--color-accent-primary-bg); color: var(--color-accent-primary);
      padding: 2px var(--space-2); border-radius: var(--radius-full);
      font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);
    }

    .dash-card {
      display: flex; flex-direction: column; gap: var(--space-3);
      background: var(--color-bg-surface); border: 1px solid var(--color-border-default);
      border-radius: var(--radius-xl); padding: var(--space-6);
      text-decoration: none; color: inherit;
      transition: border-color var(--transition-normal), transform var(--transition-normal), box-shadow var(--transition-normal);
      position: relative;

      &:hover {
        border-color: var(--color-border-emphasis);
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }
      &--primary { border-color: var(--color-accent-primary); background: var(--color-accent-primary-bg); }
      &--success { border-color: var(--color-accent-success); background: var(--color-accent-success-bg); }

      &__icon { font-size: 32px; line-height: 1; }
      &__body {
        flex: 1;
        h3 { font-size: var(--font-size-lg); font-weight: var(--font-weight-semibold); color: var(--color-text-primary); margin: 0 0 var(--space-1); }
        p  { font-size: var(--font-size-sm); color: var(--color-text-secondary); margin: 0; line-height: var(--line-height-normal); }
      }
      &__arrow { align-self: flex-end; color: var(--color-text-muted); font-size: var(--font-size-lg); }
    }
  `],
})
export class HomeComponent {
  readonly auth = inject(AuthService);
}
