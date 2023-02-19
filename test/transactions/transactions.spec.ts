import supertest from "supertest";
import { execSync } from "node:child_process";
import { afterAll, beforeAll, expect, it, describe, beforeEach } from "vitest";

import { app } from "../../src/app";

describe("Transactions routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
  });

  it("should be able to create a new transaction", async () => {
    const response = await supertest(app.server).post("/transactions").send({
      title: "New transaction",
      amount: 5000,
      category: "Fast food",
      type: "credit",
    });

    expect(response.statusCode).toEqual(201);
  });

  it("should be able to list all transactions", async () => {
    const createTransactionResponse = await supertest(app.server)
      .post("/transactions")
      .send({
        title: "New transaction",
        amount: 5000,
        category: "Fast food",
        type: "credit",
      });

    const cookies = createTransactionResponse.get("Set-Cookie");

    const requestAllTransactionsResponse = await supertest(app.server)
      .get("/transactions")
      .set("Cookie", cookies);

    expect(requestAllTransactionsResponse.statusCode).toEqual(200);
    expect(requestAllTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: "New transaction",
        category: "Fast food",
        amount: 5000,
      }),
    ]);
  });

  it("should be able to get specific transaction", async () => {
    const createTransactionResponse = await supertest(app.server)
      .post("/transactions")
      .send({
        title: "New transaction",
        amount: 5000,
        category: "Fast food",
        type: "credit",
      });

    const cookies = createTransactionResponse.get("Set-Cookie");
    const id = createTransactionResponse.body.id;

    const requestSpecificTransaction = await supertest(app.server)
      .get(`/transactions/${id}`)
      .set("Cookie", cookies);

    expect(requestSpecificTransaction.statusCode).toEqual(200);
  });
});
