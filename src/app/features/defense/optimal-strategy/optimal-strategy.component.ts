import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DefenseService } from '../../../core/services/defense.service';
import { OptimalStrategyResponse } from '../../../core/models/defense.model';
import { UiButtonComponent } from '../../../shared/components/ui-button/ui-button.component';

@Component({
  selector: 'app-optimal-strategy',
  standalone: true,
  imports: [ReactiveFormsModule, UiButtonComponent],
  template: `
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">&#127919; Estrategia Óptima</h1>
        <p class="page-subtitle">Calcula la mejor combinación de zombies a eliminar dado tu armamento</p>
      </div>

      <!-- Params form -->
      <div class="card">
        <form [formGroup]="form" (ngSubmit)="calculate()" class="params-form">
          <div class="form-group">
            <label for="bullets">Balas disponibles</label>
            <input id="bullets" type="number" formControlName="bullets" min="1" placeholder="Ej: 30" />
            @if (form.get('bullets')?.touched && form.get('bullets')?.errors?.['required']) {
              <span class="field-error">Campo requerido.</span>
            }
          </div>
          <div class="form-group">
            <label for="seconds">Segundos disponibles</label>
            <input id="seconds" type="number" formControlName="secondsAvailable" min="1" placeholder="Ej: 90" />
            @if (form.get('secondsAvailable')?.touched && form.get('secondsAvailable')?.errors?.['required']) {
              <span class="field-error">Campo requerido.</span>
            }
          </div>
          <app-ui-button type="submit" variant="primary" [loading]="loading()">
            Calcular Estrategia
          </app-ui-button>
        </form>
      </div>

      @if (error()) {
        <div class="alert alert--error">&#9888; {{ error() }}</div>
      }

      <!-- Results -->
      @if (result()) {
        <div class="results">
          <!-- Stats row -->
          <div class="stats-row">
            <div class="stat-card stat-card--primary">
              <span class="stat-label">Puntaje total</span>
              <span class="stat-value">{{ result()!.totalScore }}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Balas usadas</span>
              <span class="stat-value">{{ result()!.usedBullets }} / {{ result()!.usedBullets + result()!.remainingBullets }}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Segundos usados</span>
              <span class="stat-value">{{ result()!.usedSeconds }}s / {{ result()!.usedSeconds + result()!.remainingSeconds }}s</span>
            </div>
            <div class="stat-card stat-card--success">
              <span class="stat-label">Zombies a eliminar</span>
              <span class="stat-value">{{ result()!.selectedZombies.length }}</span>
            </div>
          </div>

          <!-- Zombie table -->
          @if (result()!.selectedZombies.length > 0) {
            <div class="card">
              <h3 class="section-title">Orden de eliminación (mayor a menor amenaza)</h3>
              <table class="ztable">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tipo</th>
                    <th>Balas</th>
                    <th>Tiempo</th>
                    <th>Puntos</th>
                  </tr>
                </thead>
                <tbody>
                  @for (z of result()!.selectedZombies; track z.id; let i = $index) {
                    <tr>
                      <td class="muted">{{ i + 1 }}</td>
                      <td><strong>{{ z.tipo }}</strong></td>
                      <td>{{ z.balasNecesarias }}</td>
                      <td>{{ z.tiempoDisparo }}s</td>
                      <td><span class="pts">+{{ z.nivelAmenaza }}</span></td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <div class="alert">Con esos recursos no es posible eliminar ningún zombie.</div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page-content { padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-5); }
    .page-header { }
    .page-title { font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); color: var(--color-text-primary); margin: 0 0 var(--space-1); }
    .page-subtitle { font-size: var(--font-size-sm); color: var(--color-text-secondary); margin: 0; }

    .card {
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border-default);
      border-radius: var(--radius-lg);
      padding: var(--space-6);
    }

    .params-form {
      display: flex;
      gap: var(--space-4);
      align-items: flex-end;
      flex-wrap: wrap;
      .form-group { flex: 1; min-width: 160px; }
    }

    .form-group {
      display: flex; flex-direction: column; gap: var(--space-1);
      label { font-size: var(--font-size-sm); color: var(--color-text-secondary); font-weight: var(--font-weight-medium); }
      input {
        background: var(--color-bg-elevated); border: 1px solid var(--color-border-default);
        border-radius: var(--radius-md); padding: var(--space-2) var(--space-3);
        color: var(--color-text-primary); font-size: var(--font-size-md);
        &:focus { outline: none; border-color: var(--color-accent-primary); }
      }
    }
    .field-error { font-size: var(--font-size-xs); color: var(--color-accent-danger); }

    .alert {
      padding: var(--space-3) var(--space-4); border-radius: var(--radius-md);
      background: var(--color-bg-surface); border: 1px solid var(--color-border-default);
      color: var(--color-text-secondary); font-size: var(--font-size-sm);
      &--error { background: var(--color-accent-danger-bg); border-color: var(--color-accent-danger); color: var(--color-accent-danger); }
    }

    .results { display: flex; flex-direction: column; gap: var(--space-5); }

    .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--space-4); }
    .stat-card {
      background: var(--color-bg-surface); border: 1px solid var(--color-border-default);
      border-radius: var(--radius-lg); padding: var(--space-4);
      display: flex; flex-direction: column; gap: var(--space-1);
      &--primary { border-color: var(--color-accent-primary); background: var(--color-accent-primary-bg); }
      &--success { border-color: var(--color-accent-success); background: var(--color-accent-success-bg); }
    }
    .stat-label { font-size: var(--font-size-xs); color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
    .stat-value { font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); color: var(--color-text-primary); }

    .section-title { font-size: var(--font-size-md); font-weight: var(--font-weight-semibold); color: var(--color-text-primary); margin: 0 0 var(--space-4); }

    .ztable {
      width: 100%; border-collapse: collapse;
      th { padding: var(--space-2) var(--space-3); text-align: left; font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--color-border-default); }
      td { padding: var(--space-3); font-size: var(--font-size-md); color: var(--color-text-primary); border-bottom: 1px solid var(--color-border-muted); }
      tr:last-child td { border-bottom: none; }
    }
    .muted { color: var(--color-text-muted); }
    .pts { color: var(--color-accent-success); font-weight: var(--font-weight-semibold); }
  `],
})
export class OptimalStrategyComponent {
  private readonly defenseSvc = inject(DefenseService);
  private readonly fb = inject(FormBuilder);

  loading = signal(false);
  error   = signal('');
  result  = signal<OptimalStrategyResponse | null>(null);

  form = this.fb.nonNullable.group({
    bullets:          [30, [Validators.required, Validators.min(1)]],
    secondsAvailable: [90, [Validators.required, Validators.min(1)]],
  });

  calculate(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading.set(true);
    this.error.set('');
    this.result.set(null);

    const { bullets, secondsAvailable } = this.form.getRawValue();

    this.defenseSvc.getOptimalStrategy(bullets, secondsAvailable).subscribe({
      next: res => {
        if (res.isSuccess && res.data) {
          // Order by threat level descending
          const sorted = [...res.data.selectedZombies].sort((a, b) => b.nivelAmenaza - a.nivelAmenaza);
          this.result.set({ ...res.data, selectedZombies: sorted });
        } else {
          this.error.set(res.message ?? 'Error al calcular estrategia.');
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo conectar con el servidor.');
        this.loading.set(false);
      },
    });
  }
}
