import * as fs from 'fs';
import { resolve } from 'path';

async function globalTeardown() {
  const testDbPath = resolve(__dirname, '../../test.db');
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
    console.log('Banco de dados de teste (test.db) removido.');
  }
}

module.exports = async () => {
  await globalTeardown();
};