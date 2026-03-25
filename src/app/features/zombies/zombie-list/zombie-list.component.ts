import { Component, inject, OnInit, signal } from '@angular/core';
import { ZombieService } from '../../../core/services/zombie.service';
import { Zombie } from '../../../core/models/zombie.model';

@Component({
  selector: 'app-zombie-list',
  standalone: true,
  template: `
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">&#129503; Tipos de Zombies</h1>
        <p class="page-subtitle">Catálogo de amenazas registradas en base de datos</p>
      </div>

      @if (loading()) {
        <div class="state-box">Cargando amenazas...</div>
      } @else if (error()) {
        <div class="state-box state-box--error">&#9888; {{ error() }}</div>
      } @else if (zombies().length === 0) {
        <div class="state-box">No hay zombies registrados.</div>
      } @else {
        <div class="table-wrapper">
          <table class="ztable">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Tiempo Disparo (s)</th>
                <th>Balas Necesarias</th>
                <th>Nivel Amenaza</th>
              </tr>
            </thead>
            <tbody>
              @for (z of zombies(); track z.id) {
                <tr>
                  <td><span class="zombie-name">{{ z.tipo }}</span></td>
                  <td>{{ z.tiempoDisparo }}s</td>
                  <td>{{ z.balasNecesarias }}</td>
                  <td>
                    <span class="threat-badge" [class]="threatClass(z.nivelAmenaza)">
                      {{ z.nivelAmenaza }} pts
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-content { padding: var(--space-6); }
    .page-header { margin-bottom: var(--space-6); }
    .page-title { font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); color: var(--color-text-primary); margin: 0 0 var(--space-1); }
    .page-subtitle { font-size: var(--font-size-sm); color: var(--color-text-secondary); margin: 0; }

    .state-box {
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border-default);
      border-radius: var(--radius-lg);
      padding: var(--space-8);
      text-align: center;
      color: var(--color-text-secondary);
      &--error { border-color: var(--color-accent-danger); color: var(--color-accent-danger); }
    }

    .table-wrapper {
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border-default);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    .ztable {
      width: 100%;
      border-collapse: collapse;
      th {
        background: var(--color-bg-elevated);
        padding: var(--space-3) var(--space-4);
        text-align: left;
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border-bottom: 1px solid var(--color-border-default);
      }
      td {
        padding: var(--space-3) var(--space-4);
        font-size: var(--font-size-md);
        color: var(--color-text-primary);
        border-bottom: 1px solid var(--color-border-muted);
      }
      tr:last-child td { border-bottom: none; }
      tr:hover td { background: var(--color-bg-elevated); }
    }

    .zombie-name { font-weight: var(--font-weight-medium); }

    .threat-badge {
      display: inline-block;
      padding: 2px var(--space-2);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      &.low    { background: var(--color-accent-success-bg); color: var(--color-accent-success); }
      &.medium { background: var(--color-accent-warning-bg); color: var(--color-accent-warning); }
      &.high   { background: var(--color-accent-danger-bg);  color: var(--color-accent-danger);  }
    }
  `],
})
export class ZombieListComponent implements OnInit {
  private readonly zombieSvc = inject(ZombieService);

  zombies = signal<Zombie[]>([]);
  loading = signal(true);
  error   = signal('');

  ngOnInit(): void {
    this.zombieSvc.getAll().subscribe({
      next: res => {
        this.zombies.set(res.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el catálogo de zombies.');
        this.loading.set(false);
      },
    });
  }

  threatClass(nivel: number): string {
    if (nivel >= 80) return 'high';
    if (nivel >= 40) return 'medium';
    return 'low';
  }
}
