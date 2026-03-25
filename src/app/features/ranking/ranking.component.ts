import { Component, inject, OnInit, signal } from '@angular/core';
import { DefenseService } from '../../core/services/defense.service';
import { RankingItem } from '../../core/models/ranking.model';

type SortKey = keyof Pick<RankingItem, 'posicion' | 'nombre' | 'totalPuntos'>;
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-ranking',
  standalone: true,
  template: `
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">&#127942; Ranking de Defensores</h1>
        <p class="page-subtitle">Top defensores por puntos de amenaza eliminados</p>
      </div>

      <!-- Controls -->
      <div class="controls">
        <label class="top-label">
          Mostrar top
          <select (change)="onTopChange($event)">
            <option value="10" selected>10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </label>
      </div>

      @if (loading()) {
        <div class="state-box">Cargando ranking...</div>
      } @else if (error()) {
        <div class="state-box state-box--error">&#9888; {{ error() }}</div>
      } @else if (items().length === 0) {
        <div class="state-box">No hay defensas registradas aún.</div>
      } @else {
        <div class="table-wrapper">
          <table class="ztable">
            <thead>
              <tr>
                <th (click)="sort('posicion')" class="sortable">
                  # {{ sortIcon('posicion') }}
                </th>
                <th (click)="sort('nombre')" class="sortable">
                  Defensor {{ sortIcon('nombre') }}
                </th>
                <th>Email</th>
                <th>Rol</th>
                <th (click)="sort('totalPuntos')" class="sortable">
                  Puntos {{ sortIcon('totalPuntos') }}
                </th>
              </tr>
            </thead>
            <tbody>
              @for (item of sortedItems(); track item.posicion) {
                <tr [class.top3]="item.posicion <= 3">
                  <td>
                    @if (item.posicion === 1) { <span class="medal">&#129351;</span> }
                    @else if (item.posicion === 2) { <span class="medal">&#129352;</span> }
                    @else if (item.posicion === 3) { <span class="medal">&#129353;</span> }
                    @else { <span class="pos-num">{{ item.posicion }}</span> }
                  </td>
                  <td><strong>{{ item.nombre }}</strong></td>
                  <td class="muted">{{ item.email }}</td>
                  <td>
                    <span class="role-badge" [class]="'role-badge--' + item.rol.toLowerCase()">
                      {{ item.rol }}
                    </span>
                  </td>
                  <td><span class="pts">{{ item.totalPuntos }}</span></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-content { padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-5); }
    .page-title { font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); color: var(--color-text-primary); margin: 0 0 var(--space-1); }
    .page-subtitle { font-size: var(--font-size-sm); color: var(--color-text-secondary); margin: 0; }

    .controls { display: flex; gap: var(--space-4); align-items: center; }
    .top-label {
      display: flex; align-items: center; gap: var(--space-2);
      font-size: var(--font-size-sm); color: var(--color-text-secondary);
      select {
        background: var(--color-bg-elevated); border: 1px solid var(--color-border-default);
        border-radius: var(--radius-md); padding: var(--space-1) var(--space-3);
        color: var(--color-text-primary); font-size: var(--font-size-sm);
        &:focus { outline: none; border-color: var(--color-accent-primary); }
      }
    }

    .state-box {
      background: var(--color-bg-surface); border: 1px solid var(--color-border-default);
      border-radius: var(--radius-lg); padding: var(--space-8); text-align: center; color: var(--color-text-secondary);
      &--error { border-color: var(--color-accent-danger); color: var(--color-accent-danger); }
    }

    .table-wrapper {
      background: var(--color-bg-surface); border: 1px solid var(--color-border-default);
      border-radius: var(--radius-lg); overflow: hidden;
    }

    .ztable {
      width: 100%; border-collapse: collapse;
      th {
        background: var(--color-bg-elevated); padding: var(--space-3) var(--space-4);
        text-align: left; font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold);
        color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.05em;
        border-bottom: 1px solid var(--color-border-default);
        &.sortable { cursor: pointer; user-select: none; &:hover { color: var(--color-text-primary); } }
      }
      td {
        padding: var(--space-3) var(--space-4); font-size: var(--font-size-md);
        color: var(--color-text-primary); border-bottom: 1px solid var(--color-border-muted);
      }
      tr:last-child td { border-bottom: none; }
      tr:hover td { background: var(--color-bg-elevated); }
      tr.top3 td { background: rgba(210, 153, 34, 0.05); }
    }

    .medal { font-size: 20px; }
    .pos-num { color: var(--color-text-muted); font-size: var(--font-size-md); }
    .muted { color: var(--color-text-secondary); font-size: var(--font-size-sm); }
    .pts { color: var(--color-accent-success); font-weight: var(--font-weight-bold); font-size: var(--font-size-lg); }

    .role-badge {
      display: inline-block; padding: 2px var(--space-2); border-radius: var(--radius-full);
      font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold);
      &--admin    { background: var(--color-accent-purple-bg); color: var(--color-accent-purple); }
      &--defensor { background: var(--color-accent-primary-bg); color: var(--color-accent-primary); }
    }
  `],
})
export class RankingComponent implements OnInit {
  private readonly defenseSvc = inject(DefenseService);

  items    = signal<RankingItem[]>([]);
  loading  = signal(true);
  error    = signal('');
  top      = signal(10);
  sortKey  = signal<SortKey>('posicion');
  sortDir  = signal<SortDir>('asc');

  sortedItems() {
    const key = this.sortKey();
    const dir = this.sortDir() === 'asc' ? 1 : -1;
    return [...this.items()].sort((a, b) => {
      const av = a[key] as string | number;
      const bv = b[key] as string | number;
      if (av < bv) return -1 * dir;
      if (av > bv) return  1 * dir;
      return 0;
    });
  }

  ngOnInit(): void {
    this.load();
  }

  onTopChange(event: Event): void {
    this.top.set(Number((event.target as HTMLSelectElement).value));
    this.load();
  }

  sort(key: SortKey): void {
    if (this.sortKey() === key) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    }
  }

  sortIcon(key: SortKey): string {
    if (this.sortKey() !== key) return '↕';
    return this.sortDir() === 'asc' ? '↑' : '↓';
  }

  private load(): void {
    this.loading.set(true);
    this.defenseSvc.getRanking(this.top()).subscribe({
      next: res => {
        this.items.set(res.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el ranking.');
        this.loading.set(false);
      },
    });
  }
}
