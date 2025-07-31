import { FastifyInstance } from "fastify";
import { getAllCategoriesHandler, getCategoriesByIdHandler, postCategoriesHandler } from "./categories.controller";

export default function categoriesRoutes(server: FastifyInstance) {
    server.get('/', getAllCategoriesHandler);

    server.get('/:id', getCategoriesByIdHandler);

    server.post('/', postCategoriesHandler);
}