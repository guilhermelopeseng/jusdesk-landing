import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CadastroPayload, CadastroResponse } from '../models/cadastro.model';

/** Cadastro pela landing, sem pagamento: o time gera a cobranca no Asaas depois. */
@Injectable({ providedIn: 'root' })
export class CadastroService {
  private readonly http = inject(HttpClient);

  criar(payload: CadastroPayload): Observable<CadastroResponse> {
    return this.http.post<CadastroResponse>(`${environment.apiBaseUrl}/publico/cadastro`, payload);
  }
}
