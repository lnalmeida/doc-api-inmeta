import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export { IsNotEmpty, IsString };

@ValidatorConstraint({ async: false })
export class IsCpfConstraint implements ValidatorConstraintInterface {
  validate(cpf: string, args: ValidationArguments) {
    if (!cpf) return false;

    // Remove caracteres não numéricos
    cpf = cpf.replace(/[^\d]/g, '');

    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) {
      return false;
    }

    // Verifica CPFs com todos os dígitos iguais
    if (/^(\d)\1{10}$/.test(cpf)) {
      return false;
    }

    // Calcula e valida o primeiro dígito verificador
    let sum = 0;
    let remainder;
    for (let i = 1; i <= 9; i++) {
      sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) {
      remainder = 0;
    }
    if (remainder !== parseInt(cpf.substring(9, 10))) {
      return false;
    }

    // Calcula e valida o segundo dígito verificador
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) {
      remainder = 0;
    }
    if (remainder !== parseInt(cpf.substring(10, 11))) {
      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'CPF inválido.';
  }
}

export function IsCPF(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCpfConstraint,
    });
  };
}