import { Component, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { Header } from '../../shared/components/header/header';
import { Footer } from '../../shared/components/footer/footer';

@Component({
  selector: 'app-contratacao-cancelado',
  imports: [Header, Footer, RouterLink],
  templateUrl: './contratacao-cancelado.html',
  styleUrl: './contratacao-cancelado.scss',
})
export class ContratacaoCancelado {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  constructor() {
    this.title.setTitle('Checkout cancelado — JusDesk');
    this.meta.updateTag({ name: 'robots', content: 'noindex' });
  }
}
