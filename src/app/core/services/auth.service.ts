import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { AuthUser, LoginRequest, LoginResponse } from '../models/auth.model';

const TOKEN_KEY = 'app_token';
const USER_KEY  = 'app_user';

function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return {};
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);

  readonly currentUser = signal<AuthUser | null>(this.loadUser());
  readonly isLoggedIn  = computed(() => this.currentUser() !== null);
  readonly isAdmin     = computed(() => this.currentUser()?.rol === 'Admin');
  readonly isDefensor  = computed(() => {
    const rol = this.currentUser()?.rol;
    return rol === 'Defensor' || rol === 'Admin';
  });

  login(request: LoginRequest) {
    return this.http
      .post<ApiResponse<LoginResponse>>(`${environment.apiUrl}/auth/token`, request)
      .pipe(
        tap(res => {
          if (res.isSuccess && res.data) {
            const payload = decodeJwtPayload(res.data.accessToken);
            const rawRoles = payload['role'];
            const roles: string[] = Array.isArray(rawRoles)
              ? rawRoles as string[]
              : rawRoles ? [rawRoles as string] : [];

            const user: AuthUser = {
              userId: (payload['sub'] as string) ?? '',
              nombre: (payload['unique_name'] as string) ?? request.username,
              rol:    roles.includes('Admin') ? 'Admin' : 'Defensor',
              token:  res.data.accessToken,
            };
            localStorage.setItem(TOKEN_KEY, res.data.accessToken);
            localStorage.setItem(USER_KEY, JSON.stringify(user));
            this.currentUser.set(user);
          }
        }),
      );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private loadUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
