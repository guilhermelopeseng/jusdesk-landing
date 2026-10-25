import { Periodicidade } from './plano.model';

export interface CadastroPayload {
  planoId: string;
  nomeConta: string;
  emailContato: string;
  confirmacaoEmail: string;
  telefoneCelular: string;
  /** CPF ou CNPJ — o Asaas exige para emitir a cobranca. */
  documento: string;
  periodicidade?: Periodicidade;
}

export interface CadastroResponse {
  contaId: string;
}
