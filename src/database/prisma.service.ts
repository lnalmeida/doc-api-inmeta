import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";


@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect()
        .then(() => {
          console.log("Conectado ao Banco de Dados");
        })
        .catch((error) => {
          console.error("Erro de conexão com o banco de dados:", error);
        });
  }
    async onModuleDestroy() {
        await this.$disconnect()
            .then(() => {
            console.log("Desconectado do Banco de Dados");
            })
            .catch((error) => {
            console.error("Erro durante a desconexão:", error);
            });
    }
};