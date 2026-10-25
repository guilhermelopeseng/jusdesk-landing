/** CPF (11 dígitos) ou CNPJ (14 dígitos) com dígito verificador válido. Recebe só dígitos. */
export function documentoValido(digitos: string): boolean {
  if (digitos.length === 11) return cpfValido(digitos);
  if (digitos.length === 14) return cnpjValido(digitos);
  return false;
}

function todosIguais(digitos: string): boolean {
  return /^(\d)\1+$/.test(digitos);
}

function cpfValido(cpf: string): boolean {
  if (todosIguais(cpf)) return false;
  const digito = (tamanho: number) => {
    let soma = 0;
    for (let i = 0; i < tamanho; i++) soma += Number(cpf[i]) * (tamanho + 1 - i);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  return digito(9) === Number(cpf[9]) && digito(10) === Number(cpf[10]);
}

const PESOS_CNPJ = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

function cnpjValido(cnpj: string): boolean {
  if (todosIguais(cnpj)) return false;
  const digito = (tamanho: number) => {
    let soma = 0;
    for (let i = 0; i < tamanho; i++) soma += Number(cnpj[i]) * PESOS_CNPJ[PESOS_CNPJ.length - tamanho + i];
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  return digito(12) === Number(cnpj[12]) && digito(13) === Number(cnpj[13]);
}
