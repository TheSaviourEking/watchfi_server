import { FastifyInstance } from "fastify";
import { getAllBrandsHandler, getBrandsByIdHandler, postBrandsHandler } from "./brands.controller";

export default function brandRoutes(server: FastifyInstance) {
    server.get('/', getAllBrandsHandler);

    server.get('/:id', getBrandsByIdHandler);

    server.post('/', postBrandsHandler);
}