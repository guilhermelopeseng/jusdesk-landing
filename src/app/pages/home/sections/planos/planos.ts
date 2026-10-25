import { DecimalPipe, LowerCasePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, afterNextRender, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormField, email, form, required, submit, validate } from '@angular/forms/signals';
import { ApiError, isStandardError, parseApiError } from '../../../../core/models/api-error.model';
import { CicloPreco, Periodicidade, Plano } from '../../../../core/models/plano.model';
import { CadastroService } from '../../../../core/services/cadastro.service';
import { PlanosService } from '../../../../core/services/planos.service';

interface CheckoutForm {
  nomeConta: string;
  emailContato: string;
  confirmacaoEmail: string;
  telefoneCelular: string;
  documento: string;
}

const TELEFONE_CELULAR_REGEX = /^\d{2}9\d{8}$/;

const ROTULO_PERIODICIDADE: Record<Periodicidade, string> = {
  MENSAL: 'Mensal',
  TRIMESTRAL: 'Trimestral',
  ANUAL: 'Anual',
};

const PERIODICIDADES: Periodicidade[] = ['MENSAL', 'TRIMESTRAL', 'ANUAL'];

@Component({
  selector: 'app-planos',
  imports: [FormField, DecimalPipe, LowerCasePipe],
  templateUrl: './planos.html',
  styleUrl: './planos.scss',
  host: {
    id: 'planos',
  },
})
export class Planos {
  private readonly planosService = inject(PlanosService);
  private readonly cadastroService = inject(CadastroService);
  private readonly router = inject(Router);

  protected readonly rotuloPeriodicidade = ROTULO_PERIODICIDADE;
  protected readonly periodicidades = PERIODICIDADES;

  protected readonly planos = signal<Plano[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);

  protected readonly periodicidadeVisualizacao = signal<Periodicidade>('MENSAL');

  protected readonly planosOrdenados = computed(() =>
    [...this.planos()].sort((a, b) => a.ordemExibicao - b.ordemExibicao),
  );

  protected readonly planoSelecionado = signal<Plano | null>(null);
  protected readonly periodicidadeSelecionada = signal<Periodicidade | null>(null);

  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);

  protected readonly modelo = signal<CheckoutForm>({
    nomeConta: '',
    emailContato: '',
    confirmacaoEmail: '',
    telefoneCelular: '',
    documento: '',
  });
  protected readonly checkoutForm = form(this.modelo, (path) => {
    required(path.nomeConta, { message: 'Informe o nome da conta.' });
    required(path.emailContato, { message: 'Informe o e-mail de contato.' });
    email(path.emailContato, { message: 'Informe um e-mail válido.' });
    required(path.confirmacaoEmail, { message: 'Confirme o e-mail de contato.' });
    validate(path.confirmacaoEmail, (ctx) => {
      if (ctx.value() !== ctx.valueOf(path.emailContato)) {
        return { kind: 'emailMismatch', message: 'Os e-mails informados não coincidem.' };
      }
      return null;
    });
    required(path.telefoneCelular, { message: 'Informe o telefone celular.' });
    validate(path.telefoneCelular, (ctx) => {
      const digitos = ctx.value().replace(/\D/g, '');
      if (!TELEFONE_CELULAR_REGEX.test(digitos)) {
        return { kind: 'telefoneInvalido', message: 'Informe um telefone celular válido, com DDD.' };
      }
      return null;
    });
    required(path.documento, { message: 'Informe o CPF ou CNPJ.' });
    validate(path.documento, (ctx) => {
      const digitos = ctx.value().replace(/\D/g, '');
      if (digitos.length !== 11 && digitos.length !== 14) {
        return { kind: 'documentoInvalido', message: 'Informe um CPF (11 dígitos) ou CNPJ (14 dígitos).' };
      }
      return null;
    });
  });

  protected readonly cicloAtivo = computed(() => {
    const plano = this.planoSelecionado();
    const periodicidade = this.periodicidadeSelecionada();
    if (!plano || !periodicidade) return null;
    return plano.precos?.find((ciclo) => ciclo.periodicidade === periodicidade) ?? null;
  });

  constructor() {
    afterNextRender(() => {
      this.planosService.listar().subscribe({
        next: (planos) => {
          this.planos.set(planos);
          this.loading.set(false);
        },
        error: () => {
          this.loadError.set(true);
          this.loading.set(false);
        },
      });
    });
  }

  protected precoExibido(plano: Plano): CicloPreco | null {
    if (plano.tipo !== 'FIXO') return null;
    const periodicidade = this.periodicidadeVisualizacao();
    return (
      plano.precos?.find((ciclo) => ciclo.periodicidade === periodicidade) ?? plano.precos?.[0] ?? null
    );
  }

  protected escolherPeriodicidadeVisualizacao(periodicidade: Periodicidade): void {
    this.periodicidadeVisualizacao.set(periodicidade);
  }

  protected escolherPlano(plano: Plano): void {
    this.submitError.set(null);
    this.planoSelecionado.set(plano);
    this.periodicidadeSelecionada.set(
      plano.tipo === 'FIXO'
        ? (plano.precos?.find((ciclo) => ciclo.periodicidade === this.periodicidadeVisualizacao())
            ?.periodicidade ??
            plano.precos?.[0]?.periodicidade ??
            null)
        : null,
    );
  }

  protected selecionarPeriodicidade(periodicidade: Periodicidade): void {
    this.periodicidadeSelecionada.set(periodicidade);
  }

  protected formatarTelefone(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digitos = input.value.replace(/\D/g, '').slice(0, 11);
    let formatado = digitos;
    if (digitos.length > 2) {
      formatado = `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
    }
    if (digitos.length > 7) {
      formatado = `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
    }
    this.checkoutForm.telefoneCelular().value.set(formatado);
  }

  protected fecharFormulario(): void {
    this.planoSelecionado.set(null);
    this.periodicidadeSelecionada.set(null);
  }

  protected async enviarCheckout(): Promise<void> {
    const plano = this.planoSelecionado();
    if (!plano) return;

    this.submitError.set(null);

    const submetido = await submit(this.checkoutForm, async (field) => {
      this.submitting.set(true);
      try {
        const valor = field().value();
        const response = await this.cadastroService
          .criar({
            planoId: plano.id,
            nomeConta: valor.nomeConta,
            emailContato: valor.emailContato,
            confirmacaoEmail: valor.confirmacaoEmail,
            telefoneCelular: valor.telefoneCelular,
            documento: valor.documento,
            periodicidade: plano.tipo === 'FIXO' ? (this.periodicidadeSelecionada() ?? undefined) : undefined,
          })
          .toPromise();

        if (response) {
          await this.router.navigate(['/contratacao/sucesso']);
        }
        return undefined;
      } catch (err) {
        this.tratarErro(err);
        return undefined;
      } finally {
        this.submitting.set(false);
      }
    });

    if (!submetido) {
      this.submitting.set(false);
    }
  }

  private tratarErro(err: unknown): void {
    if (err instanceof HttpErrorResponse) {
      const parsed: ApiError = parseApiError(err.error);
      if (isStandardError(parsed)) {
        this.submitError.set(
          err.status >= 500
            ? 'Algo deu errado, tente novamente ou fale com o suporte.'
            : parsed.message,
        );
      } else {
        const mensagens = Object.values(parsed);
        this.submitError.set(mensagens[0] ?? 'Verifique os dados informados.');
      }
      return;
    }
    this.submitError.set('Algo deu errado, tente novamente ou fale com o suporte.');
  }
}
