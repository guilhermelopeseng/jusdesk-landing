import { Component, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Header } from '../../shared/components/header/header';
import { Footer } from '../../shared/components/footer/footer';
import { Hero } from './sections/hero/hero';
import { Pilares } from './sections/pilares/pilares';
import { ComoFunciona } from './sections/como-funciona/como-funciona';
import { Planos } from './sections/planos/planos';
import { Faq } from './sections/faq/faq';
import { CtaFinal } from './sections/cta-final/cta-final';

@Component({
  selector: 'app-home',
  imports: [Header, Footer, Hero, Pilares, ComoFunciona, Planos, Faq, CtaFinal],
  templateUrl: './home.html',
})
export class Home {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  constructor() {
    this.title.setTitle('JusDesk — Monitoramento de processos e publicações para advogados');
    this.meta.updateTag({
      name: 'description',
      content:
        'JusDesk: monitoramento de processos e das publicações do DJEN pela sua OAB, com alertas por WhatsApp e e-mail, resumo por IA e assistente no WhatsApp para advogados autônomos e escritórios.',
    });
  }
}
