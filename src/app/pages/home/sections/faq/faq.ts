import { Component, signal } from '@angular/core';

interface Pergunta {
  pergunta: string;
  resposta: string;
}

@Component({
  selector: 'app-faq',
  templateUrl: './faq.html',
  styleUrl: './faq.scss',
})
export class Faq {
  protected readonly perguntas: Pergunta[] = [
    {
      pergunta: 'Quais tribunais o JusDesk acompanha?',
      resposta:
        'As publicações vêm do Diário de Justiça Eletrônico Nacional (DJEN), que reúne todos os tribunais, buscadas pela OAB de cada advogado. As movimentações são consultadas no próprio tribunal ou por um serviço parceiro, com foco inicial nos tribunais do Piauí.',
    },
    {
      pergunta: 'Como chegam os alertas?',
      resposta:
        'Por WhatsApp, por e-mail ou pelos dois, conforme você escolher em cada processo. Publicações vêm com um resumo feito por IA.',
    },
    {
      pergunta: 'Como funciona o pagamento?',
      resposta:
        'Você escolhe o plano na própria página e envia o cadastro. Nosso time envia a cobrança pelo Asaas e você paga como preferir: Pix, boleto ou cartão. Planos trimestral e anual têm desconto.',
    },
    {
      pergunta: 'Quando minha conta fica ativa?',
      resposta:
        'Assim que o primeiro pagamento é confirmado pelo Asaas, a conta é ativada automaticamente e você recebe um e-mail para definir sua senha.',
    },
    {
      pergunta: 'Posso trocar de plano depois?',
      resposta: 'Sim, é só falar com o nosso suporte comercial para ajustar o plano contratado.',
    },
  ];

  protected readonly abertaIndex = signal<number | null>(null);

  protected alternar(index: number): void {
    this.abertaIndex.update((atual) => (atual === index ? null : index));
  }
}
