import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UiButtonComponent } from '../../../shared/components/ui-button/ui-button.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, UiButtonComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb     = inject(FormBuilder);
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);

  loading = signal(false);
  error   = signal('');

  form = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading.set(true);
    this.error.set('');

    const { username, password } = this.form.getRawValue();

    this.auth.login({ username, password }).subscribe({
      next:  () => { this.loading.set(false); this.router.navigate(['/home']); },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Credenciales inválidas.');
        this.loading.set(false);
      },
    });
  }

  fieldError(field: 'username' | 'password'): string {
    const ctrl = this.form.get(field);
    if (!ctrl?.touched || !ctrl.errors) return '';
    if (ctrl.errors['required'])  return 'Campo requerido.';
    if (ctrl.errors['minlength']) return 'Mínimo 6 caracteres.';
    return '';
  }
}
