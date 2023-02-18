import { z } from "zod";
import { FastifyInstance } from "fastify";
import crypto, { randomUUID } from "node:crypto";

import { knex } from "../../configs/database";
import { checkSessionIdExists } from "../../middlewares/check-session-id-exists";

export async function transactionsRoutes(app: FastifyInstance) {
  app.get(
    "/",
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, response) => {
      const { sessionId } = request.cookies;

      if (!sessionId) {
        return response.status(401).send({ error: "Unauthorized" });
      }

      const transactions = await knex("transactions")
        .where("session_id", sessionId)
        .select();

      return {
        transactions,
        total: transactions.length,
      };
    }
  );

  app.get(
    "/summary",
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies;

      const summary = await knex("transactions")
        .where("session_id", sessionId)
        .sum("amount", { as: "amount" })
        .first();

      return {
        summary,
      };
    }
  );

  app.get(
    "/:id",
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies;

      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      });

      const { id } = getTransactionParamsSchema.parse(request.params);

      const transaction = await knex("transactions")
        .where("id", id)
        .andWhere("session_id", sessionId)
        .first();

      return {
        transaction,
      };
    }
  );

  app.delete(
    "/:id",
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies;

      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      });

      const { id } = getTransactionParamsSchema.parse(request.params);

      const transaction = await knex("transactions")
        .where("id", id)
        .andWhere("session_id", sessionId)
        .del();

      return {
        transaction,
      };
    }
  );

  app.put(
    "/:id",
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies;

      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      });

      const createTransactionBodySchema = z.object({
        title: z.string(),
        amount: z.number(),
        category: z.string(),
        type: z.enum(["credit", "debit"]),
      });

      const { id } = getTransactionParamsSchema.parse(request.params);
      const { amount, category, title, type } =
        createTransactionBodySchema.parse(request.body);

      const transaction = await knex("transactions")
        .where("id", id)
        .andWhere("session_id", sessionId)
        .update({
          id,
          title,
          amount: type === "credit" ? amount : amount * -1,
          category,
          session_id: sessionId,
        });

      return {
        transaction,
      };
    }
  );

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

    let sessionId = request.cookies.sessionId;

    if (!sessionId) {
      sessionId = randomUUID();

      response.cookie("sessionId", sessionId, {
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 Days,
      });
    }

    const id = crypto.randomUUID();

    await knex("transactions").insert({
      id,
      title,
      amount: type === "credit" ? amount : amount * -1,
      category,
      session_id: sessionId,
    });

    return response.status(201).send({ id });
  });
}
