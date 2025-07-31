import { FastifyInstance } from "fastify";
import { getAllConceptsHandler, getConceptsByIdHandler, postConceptsHandler } from "./concepts.controller";

export default function conceptRoutes(server: FastifyInstance) {
  server.get("/", getAllConceptsHandler);
  server.get("/:id", getConceptsByIdHandler);
  server.post("/", postConceptsHandler);
}