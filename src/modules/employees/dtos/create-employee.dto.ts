import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsDateString } from 'class-validator';
import { IsCPF } from 'src/common/validators/is-cpf.validator';

export class CreateEmployeeDto {
  @ApiProperty({
    description: 'Nome completo do colaborador',
    example: 'João da Silva',
  })
  @IsString({ message: 'O nome deve ser uma string.' })
  @IsNotEmpty({ message: 'O nome não pode ser vazio.' })
  @MaxLength(255, { message: 'O nome não pode ter mais de 255 caracteres.' })
  name: string;

  @ApiProperty({
    description:
      'CPF do colaborador (formato "000.000.000-00" ou "00000000000")',
    example: '123.456.789-00',
  })
  @IsString({ message: 'O CPF deve ser uma string.' })
  @IsNotEmpty({ message: 'O CPF não pode ser vazio.' })
  @IsCPF({ message: 'O CPF é inválido.' })
  cpf: string;

  @ApiProperty({
    description:
      'Data de contratação do colaborador (formato ISO 8601: YYYY-MM-DD)',
    example: '2023-01-15',
  })
  @IsDateString(
    {},
    {
      message:
        'A data de contratação deve ser uma data válida no formato ISO 8601.',
    },
  )
  hiredAt: string;
}
