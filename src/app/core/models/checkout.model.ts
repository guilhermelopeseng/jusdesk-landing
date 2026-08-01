import { Periodicidade } from './plano.model';

export interface CheckoutPayload {
  planoId: string;
  nomeConta: string;
  emailContato: string;
  confirmacaoEmail: string;
  telefoneCelular: string;
  periodicidade?: Periodicidade;
}

export interface CheckoutResponse {
  checkoutUrl: string;
}
