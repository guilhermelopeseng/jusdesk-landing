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
      pergunta: 'A jurimetria cobre a comarca do meu escritório?',
      resposta:
        'O JusDesk foi pensado justamente para comarcas menores, que os sistemas nacionais grandes não cobrem com profundidade. A estatística é construída por vara, dentro da própria comarca.',
    },
    {
      pergunta: 'Como funciona o pagamento?',
      resposta:
        'Você escolhe o plano na própria página, informa nome da conta e e-mail, e é redirecionado para o checkout seguro do Stripe.',
    },
    {
      pergunta: 'Minha conta fica ativa imediatamente após o pagamento?',
      resposta:
        'O pagamento é confirmado na hora, mas a ativação da conta é feita manualmente pela nossa equipe e você recebe um e-mail assim que estiver pronta.',
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
