import { cpf } from 'cpf-cnpj-validator'

export const generateValidCpf = (base: string) => {
  // Gera um CPF base e garante que seja válido
  let generatedCpf: string;
  do {
    // Apenas para garantir unicidade simples no contexto do mock
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const tempCpf = `123.${randomSuffix}.456-78`; // Formato base
    generatedCpf = cpf.generate(); // Gera um CPF algorítmicamente válido
  } while (!cpf.isValid(generatedCpf)); // Apenas para ter certeza

  return generatedCpf;
};
