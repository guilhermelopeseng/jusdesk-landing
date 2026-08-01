# JusDesk — Landing Page

Landing page pública do JusDesk (`jusdesk.com.br`), em Angular 22 com hybrid rendering (SSR + SSG).
Veja a especificação completa em [`docs/jusdesk-especificacao-landing.md`](docs/jusdesk-especificacao-landing.md).

## Decisão de arquitetura: preços via fetch client-side (Opção A)

A home inteira é prerenderizada (`RenderMode.Prerender`, ver `src/app/app.routes.server.ts`), exceto
a seção de planos: `PlanosService.listar()` é chamado dentro de `afterNextRender()`
(`src/app/pages/home/sections/planos/planos.ts`), o que garante que a chamada a
`GET /publico/planos` roda **apenas no browser**, nunca durante o prerender em build. Isso mantém o
preço sempre atualizado sem exigir rebuild a cada mudança de plano no backend — ao custo de essa
seção específica não estar pronta no HTML para crawlers de SEO (aceitável, não é o texto que carrega
a página nos buscadores).

Se a prioridade mudar para SEO/performance da seção de preços, ver Opção B na especificação (seção 2).

## Development server

```bash
npm start
```

Abra `http://localhost:4200/`.

## Build

```bash
npm run build
```

## Testes

```bash
npm test
```

## Variáveis de ambiente

`apiBaseUrl` é definido em `src/environments/environment.ts` (dev) e
`src/environments/environment.production.ts` (produção — endpoint definitivo pendente do time de
infra, ver seção 10 da especificação).
