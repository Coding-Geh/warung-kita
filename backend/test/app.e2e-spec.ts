import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/infrastructure/modules/app.module';
import * as request from 'supertest';

describe('App E2E', () => {
	let app: INestApplication;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	it('/ (GET) health', async () => {
		const res = await request(app.getHttpServer()).get('/').expect(200);
		expect(res.body).toBeDefined();
	});
});
