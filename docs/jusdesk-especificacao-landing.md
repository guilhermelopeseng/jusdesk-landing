# JusDesk — Especificação da Landing Page (Angular SSG)

> **Atualizado em 2026-10-24:** não há mais checkout Stripe. O formulário da seção de planos envia `POST /publico/cadastro` (com CPF/CNPJ, sem pagamento) e leva para `/contratacao/sucesso` ("Cadastro recebido"); a rota `/contratacao/cancelado` foi removida. A cobrança é feita depois pelo Asaas. Contrato atualizado em `jusdesk-checkout-landing-integracao.md`; onde este documento fala em Stripe/checkout, vale esse fluxo novo.

Documento acionável para quem for implementar a landing page pública (`jusdesk.com.br`) em Angular. Cobre estrutura de projeto, rotas, integração com o backend (`api_public`) e direção de design. Não repete o que já está resolvido em `jusdesk-checkout-landing-integracao.md` (contrato HTTP dos endpoints) — leia os dois documentos juntos.

---

## 1. Objetivo e escopo

Duas funções, nesta ordem de prioridade:

1. **Converter** — explicar o diferencial (jurimetria hiperlocal por vara, na comarca do próprio advogado) de um jeito que um advogado autônomo ou escritório pequeno entenda em segundos, e levar até o checkout.
2. **Cadastrar** — fluxo de contratação de plano (`POST /publico/checkout`) até o redirect pro Stripe Checkout hospedado.

Não é escopo desta landing: área logada, dashboard, nada que exija JWT. Tudo aqui é público, módulo `api_public`.

---

## 2. Projeto e modo de renderização

Projeto Angular separado (`jusdesk-landing`), workspace próprio, criado com `ng new --ssr` (hybrid rendering: SSR + SSG no mesmo mecanismo do Angular atual, controlado por `app.routes.server.ts`).

### Decisão de arquitetura: nem tudo na página é prerenderizado

A página institucional (hero, pilares do produto, como funciona, rodapé) é conteúdo estático de verdade — isso é prerenderizado em build (`RenderMode.Prerender`), vira HTML puro, serve de CDN, SEO ótimo.

A seção de **preços** consome `GET /publico/planos`, que é dado do backend e muda sem redeploy do front (mudança de valor, criação de plano novo). Se essa chamada for feita em build-time e "congelada" no HTML estático, qualquer alteração de preço no backend fica desatualizada na landing até o próximo build/deploy.

Duas opções — **escolher uma e documentar a escolha no README do projeto**, não deixar implícito:

- **Opção A (recomendada para V1): fetch client-side.** A seção de planos prerenderiza um skeleton/loading, e o componente busca `/publico/planos` no browser via `httpClient` assim que hidrata. Preço sempre correto, sem precisar de rebuild. Custo: essa seção especificamente não aparece pronta pra crawler de SEO (aceitável — não é o texto que carrega a página nos buscadores).
- **Opção B: prerender + rebuild disparado por webhook.** Preço sai pronto no HTML (melhor para SEO/performance), mas exige que qualquer alteração de plano no backend dispare um rebuild do front (CI/CD acoplado a um evento do backend). Mais infraestrutura pra manter — só vale a pena se SEO de preço for prioridade comprovada.

Este documento assume **Opção A**. Se o time decidir pela B, o restante da spec de UI não muda — só a estratégia de fetch do `PlanosService` (seção 6).

**Cuidado de implementação (Opção A):** no Angular, o modo de renderização (`Prerender`/`Server`/`Client`) é definido **por rota**, não por componente — então isso não é "a rota `/` vira `Client`" (isso descartaria o SSG da página inteira). A rota `/` continua `RenderMode.Prerender` em `app.routes.server.ts`; só a chamada HTTP do componente de planos precisa ser isolada pra rodar exclusivamente no browser. Se o `PlanosService.listar()` for chamado direto no `ngOnInit()` sem nenhuma guarda, ele executa também durante o prerender em build (ambiente server-like) e acaba assando o preço no HTML estático mesmo assim — virando a Opção B sem querer. Usar `afterNextRender()` (só roda no client, nunca durante SSR/prerender):

```ts
// planos.component.ts
constructor(private planosService: PlanosService) {
  afterNextRender(() => {
    this.planosService.listar().subscribe(planos => this.planos.set(planos));
  });
}
```

Resultado: hero, pilares, como funciona e rodapé saem prontos no HTML prerenderizado (SEO/LCP); só o bloco de planos nasce como skeleton estático e é preenchido com dado real assim que hidrata no browser.

### Rotas obrigatórias com path exato

O backend, por padrão, redireciona o usuário para `https://jusdesk.com.br/contratacao/sucesso` e `https://jusdesk.com.br/contratacao/cancelado` depois do Stripe Checkout (`STRIPE_SUCCESS_URL`/`STRIPE_CANCEL_URL`, ver `jusdesk-checkout-landing-integracao.md` seção 4). Essas envs **podem** ser trocadas pelo backend, mas o caminho de menor esforço é o front implementar exatamente esses dois paths:

- `/contratacao/sucesso`
- `/contratacao/cancelado`

Se por qualquer razão o front quiser paths diferentes, é preciso avisar o time de backend pra ajustar a env — não é algo resolvido só do lado do Angular.

---

## 3. Estrutura de rotas

| Path | Prerender (SSG) | Conteúdo |
|---|---|---|
| `/` | Sim (shell) / fetch client-side (planos) | Home: hero, pilares, como funciona, prova social (se houver), planos, FAQ, CTA final |
| `/contratacao/sucesso` | Sim | Confirmação pós-pagamento — **mensagem correta é "pagamento confirmado, ativação em breve por e-mail"**, nunca "sua conta já está pronta, faça login" (ativação é manual na V1, ver seção 4) |
| `/contratacao/cancelado` | Sim | Checkout cancelado, CTA pra tentar de novo ou falar com comercial |
| `/politica-de-privacidade`, `/termos-de-uso` | Sim | Estático, sem integração |

Não criar rota de "cadastro" separada da home: o formulário de contratação (nome da conta, e-mail, escolha de plano/periodicidade) vive na própria seção de planos da home e dispara `POST /publico/checkout` diretamente — não existe uma tela intermediária de "criar conta" antes do Stripe, porque não há conta de usuário/senha nesse fluxo (é o Stripe que coleta pagamento).

---

## 4. Fluxo de contratação (o que a UI precisa cobrir)

1. Usuário vê os planos (`GET /publico/planos` — ver contrato completo em `jusdesk-checkout-landing-integracao.md` seção 2).
2. Para plano `FIXO`: mostrar seletor de periodicidade (Mensal/Trimestral/Anual) com `valorCiclo` de cada uma (já vem calculado, **não recalcular no front**). Para plano `ILIMITADO`: **não mostrar seletor de periodicidade** — o payload de checkout não pode incluir `periodicidade` nesse caso (dá erro de validação se incluir).
3. Usuário escolhe um plano → abre formulário com `nomeConta` e `emailContato`.
4. Front chama `POST /publico/checkout`. Sucesso → redireciona (`window.location.href`, não router Angular, porque é domínio externo) pra `checkoutUrl` retornada.
5. Erros possíveis (ver tabela completa no doc de integração): tratar `StandardError` (`{status, error, message, path}`) e o formato separado de erro de validação de campo (`{campo: mensagem}`) como **dois parsers diferentes** — não assumir que todo erro 4xx vem no mesmo shape.
6. Erro 500 genérico: mensagem tipo "algo deu errado, tente novamente ou fale com o suporte" — não expor detalhe técnico, e não tentar diferenciar o cenário de `falha_checkout` (isso é tratado manualmente pelo comercial, não é responsabilidade do front, conforme o doc de integração seção 5).

Depois do redirect ao Stripe, o front não tem mais controle — a página de sucesso/cancelado é só a aterrissagem de volta.

---

## 5. Estrutura de pastas sugerida

```
src/app/
  core/
    services/
      planos.service.ts       # GET /publico/planos
      checkout.service.ts     # POST /publico/checkout
    models/
      plano.model.ts
      checkout.model.ts
      api-error.model.ts       # union type: StandardError | FieldValidationError
  pages/
    home/
      home.component.ts
      sections/
        hero/
        pilares/                # os 3 pilares do MVP, ver seção 7
        como-funciona/
        planos/                 # consome PlanosService + formulário de checkout
        faq/
        cta-final/
    contratacao-sucesso/
    contratacao-cancelado/
  shared/
    components/
      header/
      footer/
      docket-stat/              # elemento de assinatura visual, ver seção 8
  environments/
    environment.ts              # apiBaseUrl: http://localhost:8081
    environment.production.ts   # apiBaseUrl: a definir pelo time de infra
```

---

## 6. Integração com API — pontos de atenção

- Base URL vem de `environment.apiBaseUrl`, nunca hardcoded no componente.
- `PlanosService.listar()` — chamada client-side (ver decisão da seção 2), com estado de loading/erro explícito no componente de planos (nunca mostrar tela de preço vazia sem indicar que está carregando).
- `CheckoutService.criar(payload)` — payload já deve montar `periodicidade` como `undefined`/omitido quando o plano for `ILIMITADO`, não como string vazia.
- Parser de erro único (`parseApiError`) que tenta primeiro o shape `StandardError` (tem `status`/`error`/`path`) e cai pro shape de validação de campo (mapa simples) se não bater — usado tanto no formulário de checkout quanto em qualquer chamada futura desse módulo.
- Nenhuma chamada autenticada aqui — não implementar interceptor de JWT nesse projeto (é módulo público, diferente do app principal).

---

## 7. Conteúdo dos 3 pilares (copy-base, ajustar tom na implementação)

Não inventar funcionalidade que não existe — a landing vende o que o MVP realmente entrega:

1. **Radar de prazos** — monitoramento de publicação, sem precisar entrar em diário oficial pra conferir manualmente.
2. **Resumo da publicação por IA** — entender rápido do que se trata, sem ler o texto jurídico inteiro.
3. **Jurimetria hiperlocal** — este é o gancho principal de venda: estatística real de decisões *da própria comarca*, por vara — algo que sistema nacional grande não constrói pra cidade desse porte. Vale a pena a home dedicar mais espaço visual a este pilar do que aos outros dois.

---

## 8. Direção de design

Contexto: advocacia de comarca pequena — o público não quer "startup do Vale do Silício", quer confiança e seriedade, mas também não quer parecer sistema de 2010. Precisa equilibrar moderno com profissional.

**Evitar deliberadamente** os três clichês de design gerado por IA: (1) fundo creme + serifada de alto contraste + terracota; (2) fundo quase-preto + um único acento neon; (3) layout estilo jornal com hairlines e zero border-radius. Nenhum dos três tem relação com o conteúdo real do produto.

**Direção proposta — "docket" (ficha processual), não "startup dashboard":**

- **Cor:** base neutra clara mas não creme (`#F5F5F3` ou tom de papel acinzentado), tinta principal quase-preta com leve azul (`#14182B`), acento em azul-tinta profundo (`#1F3B5C`) — cor de carimbo/selo oficial, não de app de tecnologia — e um segundo acento em dourado-latão desaturado (`#A9895A`) usado com muita moderação (só em elementos de destaque, nunca em área grande). Evitar terracota/laranja como acento primário.
- **Tipografia:** uma serifada de exibição com caráter (para títulos e para o elemento de assinatura descrito abaixo) pareada com uma sans-serif neutra e legível pro corpo do texto — evitar repetir a mesma dupla de fontes que apareceria em qualquer outro brief. Para os números da seção de jurimetria (percentuais, contagens), usar uma fonte monoespaçada — isso não é decoração, é reforçar visualmente que o diferencial do produto é dado estatístico real, não promessa genérica.
- **Elemento de assinatura:** um componente estilizado como "entrada de ficha/livro de registro" (`docket-stat`) — uma linha horizontal com régua fina, número em monoespaçada grande, e um rótulo curto (ex: "2ª Vara Cível — taxa de procedência"), usado tanto no hero quanto na seção de jurimetria. É o único elemento visualmente "ousado" da página — o resto do layout fica disciplinado ao redor dele.
- **Marcadores numerados (01/02/03) para os pilares:** só usar se fizer sentido como sequência real de uso do produto (radar → resumo → estatística é, de fato, a ordem em que o advogado interage com o sistema no dia a dia) — não usar só por hábito visual.
- **Motion:** micro-interação de hover nos cards de plano e uma revelação sutil ao rolar até a seção de jurimetria (ex: o número do `docket-stat` "preenchendo" ao entrar na tela) — sem sequência de animação exagerada na carga da página.
- **Responsivo:** mobile-first de verdade (advogado pequeno frequentemente acessa por celular), foco de teclado visível, respeitar `prefers-reduced-motion`.

Este é o ponto de partida do agente para o passe de design — antes de codificar, vale revisar esta direção contra o brief e ajustar o que ainda parecer genérico, seguindo o mesmo princípio de "nenhuma escolha sem justificativa" que o resto da documentação do JusDesk já segue.

---

## 9. SEO e metadados

Como a home é majoritariamente prerenderizada (SSG), aproveitar:
- `title`/`meta description` por rota, definidos via `Meta`/`Title` do Angular em cada componente de página (não só no `index.html` genérico).
- Dados estruturados (`schema.org/LegalService` ou similar) no `<head>` da home — ajuda a landing a aparecer melhor pra buscas locais ("advocacia software [cidade]").
- `sitemap.xml` e `robots.txt` estáticos na pasta `public/`.
- As páginas `/contratacao/sucesso` e `/contratacao/cancelado` devem ter `<meta name="robots" content="noindex">` — não são páginas que devem aparecer em busca.

---

## 10. Pendências / decisões em aberto

Seguindo o padrão do restante da documentação do JusDesk — registrar em vez de decidir implicitamente:

- **Domínio/porta de produção do backend** (`apiBaseUrl` de `environment.production.ts`) — depende do que o time de infra definir para o deploy do `api_public`.
- **Opção A vs B da seção 2** (fetch client-side vs prerender+rebuild dos planos) — este documento assume A; revisar se performance de SEO da seção de preços virar prioridade.
- **Conteúdo de prova social** (depoimentos, número de advogados atendidos) — não inventar números ou depoimentos fictícios antes de existir base real de clientes; se não houver conteúdo real ainda, a seção de prova social fica fora da V1 em vez de simulada.
- **Analytics/tracking** (ex: GA4, Meta Pixel) — não mencionado em nenhum documento anterior do projeto; precisa decisão explícita do time comercial antes de implementar, inclusive por causa de LGPD/cookie consent se for adicionado.
