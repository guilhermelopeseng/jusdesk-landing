import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'contratacao/sucesso',
    loadComponent: () =>
      import('./pages/contratacao-sucesso/contratacao-sucesso').then((m) => m.ContratacaoSucesso),
  },
  {
    path: 'politica-de-privacidade',
    loadComponent: () =>
      import('./pages/politica-de-privacidade/politica-de-privacidade').then(
        (m) => m.PoliticaDePrivacidade,
      ),
  },
  {
    path: 'termos-de-uso',
    loadComponent: () => import('./pages/termos-de-uso/termos-de-uso').then((m) => m.TermosDeUso),
  },
];
