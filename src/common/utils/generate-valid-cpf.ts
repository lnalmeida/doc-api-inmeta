import { cpf } from 'cpf-cnpj-validator'

export const generateValidCpf = (base: string) => {
  // Gera um CPF base e garante que seja válido
  let generatedCpf: string;
  do {
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const tempCpf = `123.${randomSuffix}.456-78`; 
    generatedCpf = cpf.generate();
  } while (!cpf.isValid(generatedCpf));

  return generatedCpf;
};
