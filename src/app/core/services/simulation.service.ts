import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Simulation } from '../models/simulation.model';

@Injectable({ providedIn: 'root' })
export class SimulationService {
  private readonly http = inject(HttpClient);

  getAll() {
    return this.http.get<ApiResponse<Simulation[]>>(`${environment.apiUrl}/simulations`);
  }
}
