import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Plano } from '../models/plano.model';

@Injectable({ providedIn: 'root' })
export class PlanosService {
  private readonly http = inject(HttpClient);

  listar(): Observable<Plano[]> {
    return this.http.get<Plano[]>(`${environment.apiBaseUrl}/publico/planos`);
  }
}
