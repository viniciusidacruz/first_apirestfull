import fastify from "fastify";
import crypto from "node:crypto";

import { knex } from "./configs";

const app = fastify();

app.get("/hello", async () => {
  const transactions = await knex("transactions").select("*");

  return transactions;
});

app
  .listen({
    port: 4000,
  })
  .then(() => {
    console.log("HTTP Server Running in port http://localhost:4000");
  });
