import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';


const pathToEnv = path.resolve(__dirname, '../../', '.env');
const prismaSchemaPath = path.resolve(__dirname, '../..', 'src', 'database', 'prisma', 'schema.prisma');
dotenv.config({ path: pathToEnv });

const DATABASE_URL_TEST = process.env.DATABASE_URL_TEST;

process.env.DATABASE_URL = DATABASE_URL_TEST;

module.exports = async function globalSetup() { 
  if (!DATABASE_URL_TEST) {
    throw new Error('DATABASE_URL_TEST não está definida no .env');
  }

  if (!DATABASE_URL_TEST.includes('test')) {
    throw new Error('A URL do banco de teste deve conter "test" como medida de segurança.');
  }

  process.env.DATABASE_URL = DATABASE_URL_TEST;


  console.log(`\n[E2E Setup] Usando DATABASE_URL_TEST: ${DATABASE_URL_TEST}`);

  // Para SQLite, garantir que o arquivo de DB de teste é removido antes de iniciar
  if (DATABASE_URL_TEST.startsWith('file:')) {
    const dbFileName = path.basename(DATABASE_URL_TEST.replace('file:', ''));

    const absolutePath = path.resolve(__dirname, '../../..', 'src', 'database', dbFileName);

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      console.log(`SQLite de teste apagado: ${absolutePath}`);
    } else {
      console.log(`Nenhum banco SQLite encontrado em: ${absolutePath}`);
    }
  }

  try {
    // Aplica as migrações do Prisma para o banco de teste
    execSync(`npx prisma migrate deploy --schema=${prismaSchemaPath}`, {
      env: { ...process.env }, // Passa todas as variáveis de ambiente atuais
      stdio: 'inherit', // Mostra o output do comando no console
    });

    console.log('Migrações aplicadas com sucesso ao banco de testes.');
  } catch (error) {
    console.error('Erro ao aplicar migrações:', error);
    process.exit(1); 
  }
};
