import { FastifyInstance } from "fastify";
import { getAllMaterialsHandler, getMaterialsByIdHandler, postMaterialsHandler } from "./materials.controller";

export default function materialRoutes(server: FastifyInstance) {
    server.get("/", getAllMaterialsHandler);
    server.get("/:id", getMaterialsByIdHandler);
    server.post("/", postMaterialsHandler);
}
