import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module'; 
import { PrismaService } from '../../../src/database/prisma.service'; 
import { config } from 'dotenv';

config({ path: '.env.test', override: true });

describe('DocumentTypeController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  process.env.NODE_ENV = 'test';
  beforeAll(async () => {

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    
    app = moduleFixture.createNestApplication();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    app.useGlobalPipes(new (await import('@nestjs/common')).ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    app.useGlobalFilters(new (await import('../../../src/common/filters/global-http-exception.filter')).AllExceptionsFilter());

    await app.init();
  });

  beforeEach(async () => {
    await prismaService.$transaction([
      prismaService.employeeDocument.deleteMany({}),
      prismaService.employee.deleteMany({}),
      prismaService.documentType.deleteMany({}),
    ]);
  });

  afterAll(async () => {
    await prismaService.employeeDocument.deleteMany({});
    await prismaService.employee.deleteMany({});
    await prismaService.documentType.deleteMany({});
    await app.close();
  });

  it('/document-type (POST) - deve criar um novo tipo de documento com sucesso', async () => {
    const createDto = { name: 'RG' };
    return request(app.getHttpServer())
      .post('/document-type')
      .send(createDto)
      .expect(201) 
      .expect((res) => {
        expect(res.body.id).toBeDefined();
        expect(res.body.name).toBe(createDto.name);
      });
  });

  it('/document-type (POST) - não deve criar tipo de documento com nome duplicado', async () => {
    const createDto = { name: 'CPF' };

    await request(app.getHttpServer()).post('/document-type').send(createDto).expect(201);

    return request(app.getHttpServer())
      .post('/document-type')
      .send(createDto)
      .expect(409) 
      .expect((res) => {
     expect(res.statusCode).toBe(409);
      expect(res.body.path).toBe('/document-type');
      expect(res.body.message).toMatchObject({
        error: 'Conflict',
        message: 'Um tipo de documento com o nome "CPF" já existe.',
        statusCode: 409,
        });
      });
  });

  it('/document-type?name=[name]&page=[page]&limit=[limit] (GET) - deve listar tipos de documentos com paginação e filtro', async () => {

    await request(app.getHttpServer()).post('/document-type').send({ name: 'CNH' });
    await request(app.getHttpServer()).post('/document-type').send({ name: 'Titulo de Eleitor'});
    await request(app.getHttpServer()).post('/document-type').send({ name: 'RG'});

    const countInDb = await prismaService.documentType.count();
    console.log(`[DEBUG - GET Docs] Total de documentos no DB antes do GET: ${countInDb}`);


    const res1 = await request(app.getHttpServer())
      .get('/document-type?page=1&limit=2')
      .expect(200);

    console.log(`[DEBUG - GET Docs] Resposta da API (data.length): ${res1.body.data.length}, total: ${res1.body.total}`);

    expect(res1.body.data.length).toBe(2);
    expect(res1.body.total).toBe(3); 
    expect(res1.body.page).toBe(1);
    expect(res1.body.limit).toBe(2);


    const res2 = await request(app.getHttpServer())
      .get('/document-type?name=RG')
      .expect(200);

    expect(res2.body.data.length).toBe(1);
    expect(res2.body.data[0].name).toBe('RG');
    expect(res2.body.total).toBe(1);
  });

  it('/document-type/:id (GET) - deve retornar 404 se o tipo de documento não existir', async () => {
    return request(app.getHttpServer())
      .get('/document-type/99999999')
      .expect(404)
      .expect((res) => {
        expect(res.body.message).toMatchObject({
          error: 'Not Found',
          message: 'Tipo de documento com ID \"99999999\" não encontrado.',
          statusCode: 404,
        });
      });
  });
});