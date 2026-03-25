import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { OptimalStrategyResponse, RecordDefenseRequest, RecordDefenseResponse } from '../models/defense.model';
import { RankingItem } from '../models/ranking.model';

@Injectable({ providedIn: 'root' })
export class DefenseService {
  private readonly http = inject(HttpClient);

  getOptimalStrategy(bullets: number, secondsAvailable: number) {
    const params = new HttpParams()
      .set('bullets', bullets)
      .set('secondsAvailable', secondsAvailable);
    return this.http.get<ApiResponse<OptimalStrategyResponse>>(
      `${environment.apiUrl}/defense/optimal-strategy`,
      { params }
    );
  }

  recordDefense(request: RecordDefenseRequest) {
    let params = new HttpParams()
      .set('usuarioId', request.usuarioId)
      .set('simulacionId', request.simulacionId)
      .set('puntosObtenidos', request.puntosObtenidos);
    request.zombiesEliminados.forEach(id => {
      params = params.append('zombiesEliminados', id);
    });
    return this.http.post<ApiResponse<RecordDefenseResponse>>(
      `${environment.apiUrl}/defense/record`,
      null,
      { params }
    );
  }

  getRanking(top = 10) {
    const params = new HttpParams().set('top', top);
    return this.http.get<ApiResponse<RankingItem[]>>(
      `${environment.apiUrl}/defense/ranking`,
      { params }
    );
  }
}
