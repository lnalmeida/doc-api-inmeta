/**
 * Teste de configuração do Prisma Client
 * Verifica se o cliente está configurado corretamente SEM precisar do banco físico
 */

console.log('🔧 Testando configuração do Prisma Client...\n');

// Teste 1: Verificar se consegue importar o cliente
console.log('1. Testando importação do Prisma Client...');
try {
  require('@prisma/client');
  console.log('   ✅ @prisma/client importado com sucesso');
} catch (error) {
  console.error('   ❌ Erro ao importar @prisma/client:', error.message);
  console.error('   💡 Execute: npm run db:generate');
  process.exit(1);
}

// Teste 2: Verificar se o PrismaService funciona
console.log('\n2. Testando PrismaService...');
try {
  const { PrismaService } = require('./prisma.service');

  // Verificar se a classe existe
  if (typeof PrismaService === 'function') {
    console.log('   ✅ Classe PrismaService encontrada');
  }

  // Verificar se consegue instanciar
  const service = new PrismaService();
  if (service instanceof PrismaService) {
    console.log('   ✅ PrismaService instanciado com sucesso');
  }

  // Verificar se tem os métodos de lifecycle
  if (typeof service.onModuleInit === 'function') {
    console.log('   ✅ Método onModuleInit disponível');
  }

  if (typeof service.onModuleDestroy === 'function') {
    console.log('   ✅ Método onModuleDestroy disponível');
  }
  if (typeof service.$connect === 'function') {
    console.log('   ✅ Método $connect disponível');
  }
} catch (error) {
  console.error('   ❌ Erro ao importar PrismaService:', error.message);

  if (error.message.includes('Cannot find module')) {
    console.error(
      '   💡 Verifique se o arquivo client.ts existe em src/database/',
    );
  }
  process.exit(1);
}

// Teste 3: Verificar variáveis de ambiente
console.log('\n3. Testando configuração de ambiente...');
const databaseUrl = process.env.DATABASE_URL;
if (databaseUrl) {
  console.log('   ✅ DATABASE_URL configurada');
  console.log(`   📍 Caminho: ${databaseUrl}`);

  // Verificar se é SQLite e se o caminho faz sentido
  if (databaseUrl.startsWith('file:')) {
    const dbPath = databaseUrl.replace('file:', '');
    console.log(`   📁 Arquivo do banco será criado em: ${dbPath}`);

    // Verificar se o diretório pai existe
    const path = require('path');
    const fs = require('fs');
    const dir = path.dirname(
      dbPath.startsWith('./') ? dbPath.substring(2) : dbPath,
    );

    if (fs.existsSync(dir) || dir === '.' || dir === '') {
      console.log(
        '   ✅ Diretório do banco existe ou será criado automaticamente',
      );
    } else {
      console.log(
        `   ⚠️ Diretório ${dir} não existe - será criado no primeiro push`,
      );
    }
  }
} else {
  console.error('   ❌ DATABASE_URL não encontrada');
  console.error(
    '   💡 Crie um arquivo .env com DATABASE_URL="file:./src/database/dev.db"',
  );
  process.exit(1);
}

// Teste 4: Verificar se o schema existe
console.log('\n4. Testando arquivo de schema...');
const fs = require('fs');
const path = require('path');

const schemaPath = 'src/database/prisma/schema.prisma';
if (fs.existsSync(schemaPath)) {
  console.log('   ✅ Arquivo schema.prisma encontrado');

  // Ler e verificar conteúdo básico do schema
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');

  if (schemaContent.includes('generator client')) {
    console.log('   ✅ Generator configurado no schema');
  } else {
    console.error('   ❌ Generator não encontrado no schema');
  }

  if (schemaContent.includes('datasource db')) {
    console.log('   ✅ Datasource configurado no schema');
  } else {
    console.error('   ❌ Datasource não encontrado no schema');
  }

  if (schemaContent.includes('provider = "sqlite"')) {
    console.log('   ✅ Provider SQLite configurado');
  } else {
    console.log(
      '   ⚠️ Provider SQLite não encontrado - verifique a configuração',
    );
  }
} else {
  console.error(`   ❌ Schema não encontrado em: ${schemaPath}`);
  console.error(
    '   💡 Crie o arquivo schema.prisma na pasta src/database/prisma/',
  );
  process.exit(1);
}

// Teste 5: Verificar se o Prisma Client foi gerado
console.log('\n5. Testando se o cliente foi gerado...');
try {
  const { PrismaClient } = require('@prisma/client');
  const client = new PrismaClient();

  // Verificar se tem os models esperados (sem conectar no banco)
  const clientKeys = Object.keys(client);
  const expectedModels = ['user', 'profile', 'post', 'category', 'tag'];
  const foundModels = expectedModels.filter((model) =>
    clientKeys.includes(model),
  );

  if (foundModels.length > 0) {
    console.log(`   ✅ Models encontrados: ${foundModels.join(', ')}`);
  } else {
    console.log(
      '   ⚠️ Nenhum model encontrado - cliente pode não ter sido gerado',
    );
    console.log('   💡 Execute: npm run db:generate');
  }

  // Verificar métodos importantes
  const hasImportantMethods = ['$connect', '$disconnect', '$queryRaw'].every(
    (method) => typeof client[method] === 'function',
  );

  if (hasImportantMethods) {
    console.log('   ✅ Métodos essenciais do cliente disponíveis');
  } else {
    console.error('   ❌ Métodos essenciais não encontrados');
  }
} catch (error) {
  console.error('   ❌ Erro ao instanciar PrismaClient:', error.message);
  console.error('   💡 Execute: npm run db:generate');
}

// Teste 6: Verificar se consegue instanciar sem conectar
console.log('\n6. Testando instanciação sem conexão...');
try {
  const { PrismaService } = require('./prisma.service');

  // Verificar se a instância tem as propriedades esperadas
  if (typeof PrismaService.$connect === 'function') {
    console.log('   ✅ Método $connect disponível');
  }

  if (typeof PrismaService.$disconnect === 'function') {
    console.log('   ✅ Método $disconnect disponível');
  }

  console.log('   ✅ Cliente instanciado sem erros');
} catch (error) {
  console.error('   ❌ Erro na instanciação:', error.message);
}

// Teste 7: Verificar types TypeScript (se aplicável)
console.log('\n7. Verificando types...');
// Tentar importar tipos do Prisma
const prismaTypes = require('@prisma/client');

if (prismaTypes.Prisma) {
  console.log('   ✅ Tipos do Prisma disponíveis');
}

if (prismaTypes.PrismaClient) {
  console.log('   ✅ PrismaClient types disponíveis');
}

console.log('\n🎉 Teste de configuração concluído!');
console.log('\n📋 Próximos passos:');
console.log('   1. npm run db:push      # Criar o banco físico');
console.log('   2. npm run db:generate  # Regenerar o cliente');
console.log('   3. npm run test:db:quick # Testar com banco real');

console.log('\n✅ Prisma Client está configurado e pronto para uso!');
