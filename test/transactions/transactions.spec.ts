import supertest from 'supertest';
import { afterAll, beforeAll, expect, test } from 'vitest';

import { app } from '../../src/app';

beforeAll(async () => {
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

test('should create new transaction', async () => {
  const response = await supertest(app.server)
    .post('/transactions')
    .send({
      title: 'New transaction',
      amount: 5000,
      category: 'Fast food',
      type: 'credit',
    });

  expect(response.statusCode).toEqual(201);
});
