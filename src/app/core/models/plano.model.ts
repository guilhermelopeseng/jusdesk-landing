export type TipoPlano = 'FIXO' | 'ILIMITADO';

export type Periodicidade = 'MENSAL' | 'TRIMESTRAL' | 'ANUAL';

export interface CicloPreco {
  periodicidade: Periodicidade;
  valorBaseMensal: number;
  percentualDesconto: number;
  valorCiclo: number;
}

export interface LimiteRecurso {
  recursoCodigo: string;
  recursoNome: string;
  limiteIncluso: number;
  permiteAvulso: boolean;
  precoUnidadeAvulso: number;
}

export interface Plano {
  id: string;
  codigo: string;
  nome: string;
  descricao: string;
  tipo: TipoPlano;
  ordemExibicao: number;
  precos: CicloPreco[] | null;
  limites: LimiteRecurso[] | null;
}
