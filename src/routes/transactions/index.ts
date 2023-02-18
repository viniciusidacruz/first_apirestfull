import { z } from "zod";
import crypto from "node:crypto";
import { FastifyInstance } from "fastify";

import { knex } from "../../configs/database";

export async function transactionsRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    const transactions = await knex("transactions").select();

    return {
      transactions,
      total: transactions.length,
    };
  });

  app.get("/summary", async () => {
    const summary = await knex("transactions")
      .sum("amount", { as: "amount" })
      .first();

    return {
      summary,
    };
  });

  app.get("/:id", async (request, response) => {
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getTransactionParamsSchema.parse(request.params);

    const transaction = await knex("transactions").where("id", id).first();

    return {
      transaction,
    };
  });

  app.post("/", async (request, response) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      category: z.string(),
      type: z.enum(["credit", "debit"]),
    });

    const { amount, category, title, type } = createTransactionBodySchema.parse(
      request.body
    );

    const id = crypto.randomUUID();

    await knex("transactions").insert({
      id,
      title,
      amount: type === "credit" ? amount : amount * -1,
      category,
    });

    return response.status(201).send({ id });
  });

  app.post;
}
