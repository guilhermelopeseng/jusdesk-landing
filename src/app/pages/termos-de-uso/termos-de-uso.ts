import { Component, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Header } from '../../shared/components/header/header';
import { Footer } from '../../shared/components/footer/footer';

@Component({
  selector: 'app-termos-de-uso',
  imports: [Header, Footer],
  templateUrl: './termos-de-uso.html',
  styleUrl: '../legal-page.scss',
})
export class TermosDeUso {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  constructor() {
    this.title.setTitle('Termos de uso — JusDesk');
    this.meta.updateTag({
      name: 'description',
      content: 'Condições de uso do JusDesk para advogados e escritórios.',
    });
  }
}
