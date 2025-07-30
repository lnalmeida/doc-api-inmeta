import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', (): any => {
  const url =
    process.env.DATABASE_URL ||
    'postgresql://postgres:password@localhost:5432/doc-api-inmeta-db?schema=public';
  const provider = process.env.DATABASE_PROVIDER || 'postgresql';

  if (!url) {
    throw new Error('DATABASE_URL não definida');
  }

  if (!provider) {
    throw new Error('DATABASE_PROVIDER não definida');
  }

  return {
    url,
    provider,
  };
});
