# Integração da landing — cadastro e planos

Documento para o time de front-end da landing page pública. Cobre os dois endpoints
do módulo `api_public` usados na contratação. Desde 2026-10-24 **não há pagamento na
landing**: o cliente envia o cadastro e o time gera a cobrança no Asaas pelo painel
(modelo completo em `cobranca-asaas.md`, no backend).

## 1. Listar planos

`GET /publico/planos` — planos ativos com preços por periodicidade (`valorCiclo` já com
o desconto de trimestral/anual) e limites inclusos. Sem mudança.

## 2. Enviar cadastro

`POST /publico/cadastro`

```json
{
  "planoId": "uuid-do-plano",
  "nomeConta": "Escritório Silva Advocacia",
  "emailContato": "voce@escritorio.com.br",
  "confirmacaoEmail": "voce@escritorio.com.br",
  "telefoneCelular": "(11) 91234-5678",
  "documento": "123.456.789-09",
  "periodicidade": "ANUAL"
}
```

- `documento`: CPF (11 dígitos) ou CNPJ (14), com ou sem máscara — o Asaas exige.
- `periodicidade`: obrigatória para plano `FIXO` (`MENSAL`, `TRIMESTRAL`, `ANUAL`);
  omitir para `ILIMITADO`.
- `confirmacaoEmail` precisa ser igual a `emailContato`.

Resposta `201`: `{ "contaId": "uuid" }`. Depois, levar o usuário para
`/contratacao/sucesso` (página "Cadastro recebido").

Erros (`400`, corpo `StandardError` ou mapa campo → mensagem):
`periodicidade_obrigatoria`, `periodicidade_invalida`, `preco_inexistente`, validação
de campos. `404` se o plano não existe ou está inativo.

## 3. O que acontece depois

1. A conta fica `PENDENTE` e o cliente recebe um e-mail "Recebemos seu cadastro".
2. O suporte gera a cobrança no Asaas (assinatura para planos fixos; fatura mensal no
   dia 1 para o Ilimitado). O Asaas envia a cobrança ao cliente (Pix, boleto ou cartão).
3. No primeiro pagamento a conta é ativada sozinha e o cliente recebe o convite para
   definir a senha (ou o suporte libera o acesso antes).

A página de sucesso não deve prometer acesso imediato nem oferecer login direto.
