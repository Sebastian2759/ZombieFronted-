import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Zombie } from '../models/zombie.model';

@Injectable({ providedIn: 'root' })
export class ZombieService {
  private readonly http = inject(HttpClient);

  getAll() {
    return this.http.get<ApiResponse<Zombie[]>>(`${environment.apiUrl}/zombies`);
  }
}
