import { Component, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { Header } from '../../shared/components/header/header';
import { Footer } from '../../shared/components/footer/footer';

@Component({
  selector: 'app-contratacao-sucesso',
  imports: [Header, Footer, RouterLink],
  templateUrl: './contratacao-sucesso.html',
  styleUrl: './contratacao-sucesso.scss',
})
export class ContratacaoSucesso {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  constructor() {
    this.title.setTitle('Cadastro recebido — JusDesk');
    this.meta.updateTag({ name: 'robots', content: 'noindex' });
  }
}
