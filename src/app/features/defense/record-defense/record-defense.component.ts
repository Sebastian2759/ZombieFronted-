import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { DefenseService } from '../../../core/services/defense.service';
import { SimulationService } from '../../../core/services/simulation.service';
import { ZombieService } from '../../../core/services/zombie.service';
import { AuthService } from '../../../core/services/auth.service';
import { Simulation } from '../../../core/models/simulation.model';
import { Zombie } from '../../../core/models/zombie.model';
import { UiButtonComponent } from '../../../shared/components/ui-button/ui-button.component';

@Component({
  selector: 'app-record-defense',
  standalone: true,
  imports: [UiButtonComponent],
  template: `
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">&#128270; Registrar Defensa</h1>
        <p class="page-subtitle">Registra los zombies eliminados en una simulación</p>
      </div>

      @if (loadError()) {
        <div class="alert alert--error">&#9888; {{ loadError() }}</div>
      }

      @if (success()) {
        <div class="alert alert--success">&#10003; Defensa registrada correctamente. Puntos: {{ success() }}</div>
      }

      @if (submitError()) {
        <div class="alert alert--error">&#9888; {{ submitError() }}</div>
      }

      <div class="card">
        <!-- Simulation selector -->
        <div class="form-group">
          <label>Selecciona una simulación</label>
          <select (change)="onSimulationChange($event)">
            <option value="">-- Selecciona --</option>
            @for (sim of simulations(); track sim.id) {
              <option [value]="sim.id">
                {{ sim.ubicacion }} · {{ sim.balasDisponible }} balas · {{ sim.tiempoDisponible }}s
              </option>
            }
          </select>
        </div>

        <!-- Zombie checklist -->
        @if (selectedSim()) {
          <div class="section">
            <p class="section-label">Zombies eliminados</p>
            <div class="zombie-grid">
              @for (z of zombies(); track z.id) {
                <label class="zombie-check" [class.selected]="isSelected(z.id)">
                  <input type="checkbox" [checked]="isSelected(z.id)" (change)="toggleZombie(z)" />
                  <span class="zombie-info">
                    <strong>{{ z.tipo }}</strong>
                    <span class="muted">{{ z.balasNecesarias }} balas · {{ z.tiempoDisparo }}s · +{{ z.nivelAmenaza }}pts</span>
                  </span>
                </label>
              }
            </div>
          </div>

          <!-- Summary -->
          <div class="summary-row">
            <div class="summary-item">
              <span>Balas usadas</span>
              <strong [class.over]="bulletsUsed() > selectedSim()!.balasDisponible">
                {{ bulletsUsed() }} / {{ selectedSim()!.balasDisponible }}
              </strong>
            </div>
            <div class="summary-item">
              <span>Tiempo usado</span>
              <strong [class.over]="secondsUsed() > selectedSim()!.tiempoDisponible">
                {{ secondsUsed() }}s / {{ selectedSim()!.tiempoDisponible }}s
              </strong>
            </div>
            <div class="summary-item summary-item--accent">
              <span>Puntos obtenidos</span>
              <strong>{{ totalPoints() }}</strong>
            </div>
          </div>

          @if (overBudget()) {
            <div class="alert alert--warning">
              &#9888; Excedes los recursos disponibles. Deselecciona algunos zombies.
            </div>
          }

          <app-ui-button
            variant="primary"
            [loading]="submitting()"
            [disabled]="selectedZombies().length === 0 || overBudget()"
            (clicked)="submit()">
            Registrar Defensa
          </app-ui-button>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-content { padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-5); }
    .page-title { font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); color: var(--color-text-primary); margin: 0 0 var(--space-1); }
    .page-subtitle { font-size: var(--font-size-sm); color: var(--color-text-secondary); margin: 0; }

    .card {
      background: var(--color-bg-surface); border: 1px solid var(--color-border-default);
      border-radius: var(--radius-lg); padding: var(--space-6);
      display: flex; flex-direction: column; gap: var(--space-5);
    }

    .form-group {
      display: flex; flex-direction: column; gap: var(--space-1);
      label { font-size: var(--font-size-sm); color: var(--color-text-secondary); font-weight: var(--font-weight-medium); margin-bottom: var(--space-1); }
      select {
        background: var(--color-bg-elevated); border: 1px solid var(--color-border-default);
        border-radius: var(--radius-md); padding: var(--space-2) var(--space-3);
        color: var(--color-text-primary); font-size: var(--font-size-md); width: 100%;
        &:focus { outline: none; border-color: var(--color-accent-primary); }
      }
    }

    .section { display: flex; flex-direction: column; gap: var(--space-3); }
    .section-label { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin: 0; }

    .zombie-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: var(--space-2); }
    .zombie-check {
      display: flex; align-items: flex-start; gap: var(--space-2);
      background: var(--color-bg-elevated); border: 1px solid var(--color-border-default);
      border-radius: var(--radius-md); padding: var(--space-3); cursor: pointer;
      transition: border-color var(--transition-fast);
      input { margin-top: 2px; accent-color: var(--color-accent-primary); cursor: pointer; }
      &.selected { border-color: var(--color-accent-primary); background: var(--color-accent-primary-bg); }
      &:hover { border-color: var(--color-border-emphasis); }
    }
    .zombie-info { display: flex; flex-direction: column; gap: 2px; font-size: var(--font-size-md); color: var(--color-text-primary); }
    .muted { font-size: var(--font-size-xs); color: var(--color-text-muted); }

    .summary-row { display: flex; gap: var(--space-4); flex-wrap: wrap; }
    .summary-item {
      flex: 1; min-width: 120px;
      background: var(--color-bg-elevated); border: 1px solid var(--color-border-default);
      border-radius: var(--radius-md); padding: var(--space-3);
      display: flex; flex-direction: column; gap: var(--space-1);
      span { font-size: var(--font-size-xs); color: var(--color-text-muted); }
      strong { font-size: var(--font-size-lg); color: var(--color-text-primary); }
      strong.over { color: var(--color-accent-danger); }
      &--accent strong { color: var(--color-accent-success); }
    }

    .alert {
      padding: var(--space-3) var(--space-4); border-radius: var(--radius-md); font-size: var(--font-size-sm);
      &--error   { background: var(--color-accent-danger-bg);  border: 1px solid var(--color-accent-danger);  color: var(--color-accent-danger); }
      &--success { background: var(--color-accent-success-bg); border: 1px solid var(--color-accent-success); color: var(--color-accent-success); }
      &--warning { background: var(--color-accent-warning-bg); border: 1px solid var(--color-accent-warning); color: var(--color-accent-warning); }
    }
  `],
})
export class RecordDefenseComponent implements OnInit {
  private readonly defenseSvc    = inject(DefenseService);
  private readonly simulationSvc = inject(SimulationService);
  private readonly zombieSvc     = inject(ZombieService);
  private readonly auth          = inject(AuthService);

  simulations    = signal<Simulation[]>([]);
  zombies        = signal<Zombie[]>([]);
  selectedSim    = signal<Simulation | null>(null);
  selectedZombies = signal<Zombie[]>([]);
  loadError      = signal('');
  submitError    = signal('');
  success        = signal<number | null>(null);
  submitting     = signal(false);

  bulletsUsed  = computed(() => this.selectedZombies().reduce((s, z) => s + z.balasNecesarias, 0));
  secondsUsed  = computed(() => this.selectedZombies().reduce((s, z) => s + z.tiempoDisparo, 0));
  totalPoints  = computed(() => this.selectedZombies().reduce((s, z) => s + z.nivelAmenaza, 0));
  overBudget   = computed(() => {
    const sim = this.selectedSim();
    if (!sim) return false;
    return this.bulletsUsed() > sim.balasDisponible || this.secondsUsed() > sim.tiempoDisponible;
  });

  ngOnInit(): void {
    this.simulationSvc.getAll().subscribe({
      next: res => this.simulations.set(res.data ?? []),
      error: () => this.loadError.set('No se pudieron cargar las simulaciones.'),
    });
    this.zombieSvc.getAll().subscribe({
      next: res => this.zombies.set(res.data ?? []),
      error: () => this.loadError.set('No se pudieron cargar los zombies.'),
    });
  }

  onSimulationChange(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    const sim = this.simulations().find(s => s.id === id) ?? null;
    this.selectedSim.set(sim);
    this.selectedZombies.set([]);
    this.success.set(null);
    this.submitError.set('');
  }

  isSelected(id: string): boolean {
    return this.selectedZombies().some(z => z.id === id);
  }

  toggleZombie(zombie: Zombie): void {
    const current = this.selectedZombies();
    if (this.isSelected(zombie.id)) {
      this.selectedZombies.set(current.filter(z => z.id !== zombie.id));
    } else {
      this.selectedZombies.set([...current, zombie]);
    }
  }

  submit(): void {
    const sim    = this.selectedSim();
    const userId = this.auth.currentUser()?.userId;
    if (!sim || !userId) return;

    this.submitting.set(true);
    this.submitError.set('');
    this.success.set(null);

    this.defenseSvc.recordDefense({
      usuarioId:         userId,
      simulacionId:      sim.id,
      puntosObtenidos:   this.totalPoints(),
      zombiesEliminados: this.selectedZombies().map(z => z.id),
    }).subscribe({
      next: res => {
        if (res.isSuccess) {
          this.success.set(this.totalPoints());
          this.selectedZombies.set([]);
        } else {
          this.submitError.set(res.message ?? 'Error al registrar defensa.');
        }
        this.submitting.set(false);
      },
      error: () => {
        this.submitError.set('Error de conexión con el servidor.');
        this.submitting.set(false);
      },
    });
  }
}
