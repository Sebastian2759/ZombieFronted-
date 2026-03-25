import { Zombie } from './zombie.model';

export interface OptimalStrategyResponse {
  totalScore: number;
  usedBullets: number;
  usedSeconds: number;
  remainingBullets: number;
  remainingSeconds: number;
  selectedZombies: Zombie[];
}

export interface RecordDefenseRequest {
  usuarioId: string;
  simulacionId: string;
  puntosObtenidos: number;
  zombiesEliminados: string[];
}

export interface RecordDefenseResponse {
  id: string;
  puntosObtenidos: number;
}
