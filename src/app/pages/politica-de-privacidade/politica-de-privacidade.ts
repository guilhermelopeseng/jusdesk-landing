import { Component, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Header } from '../../shared/components/header/header';
import { Footer } from '../../shared/components/footer/footer';

@Component({
  selector: 'app-politica-de-privacidade',
  imports: [Header, Footer],
  templateUrl: './politica-de-privacidade.html',
  styleUrl: '../legal-page.scss',
})
export class PoliticaDePrivacidade {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  constructor() {
    this.title.setTitle('Política de privacidade — JusDesk');
    this.meta.updateTag({
      name: 'description',
      content: 'Como o JusDesk coleta, usa e protege os dados dos seus usuários.',
    });
  }
}
