import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Erro interno do servidor';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();

      this.logger.warn(
        `HTTP Exception (${status}) for ${request.method} ${request.url}: ${JSON.stringify(message)}`,
      );
    } else if (exception instanceof PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002': // Unique constraint violation (ex: CPF duplicado)
          status = HttpStatus.CONFLICT;
          const fields =
            (exception.meta as { target?: string[] })?.target?.join(', ') ||
            'campo(s) único(s)';
          message = `Violação de unicidade: O ${fields} fornecido já existe.`;
          break;
        case 'P2025': // Record not found (ex: tentando atualizar ou deletar um registro inexistente)
          status = HttpStatus.NOT_FOUND;
          message =
            (exception.meta as { cause?: string })?.cause ||
            'Registro não encontrado para a operação.';
          break;
        case 'P2003': // Foreign key constraint failed (ex: tentando inserir um registro com uma FK que não existe)
          status = HttpStatus.BAD_REQUEST;
          const relation =
            (exception.meta as { modelName?: string; fieldName?: string })
              ?.fieldName || 'relação';
          message = `Violação de chave estrangeira: A ${relation} especificada não existe.`;
          break;
        default:
          status = HttpStatus.BAD_REQUEST;
          message = `Erro no banco de dados: ${exception.message.split('\n').pop()}`; // Pega a última linha da mensagem de erro
          break;
      }
      this.logger.error(
        `Prisma Known Error (${exception.code}) for ${request.method} ${request.url}: ${message}`,
      );
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = `Erro interno do servidor: ${exception.message}`;
      this.logger.error(
        `Unhandled Error for ${request.method} ${request.url}: ${exception.message}`,
        exception.stack,
      );
    } else {
      this.logger.error(
        `Unknown Error for ${request.method} ${request.url}: ${JSON.stringify(exception)}`,
      );
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
