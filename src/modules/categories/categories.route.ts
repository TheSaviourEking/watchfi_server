import { FastifyInstance } from "fastify";
import { getAllCategoriesHandler, getCategoriesByIdHandler, postCategoriesHandler } from "./categories.controller";
import { deleteWatchHandler, putWatchHandler } from "../products/product.controller";

export default function categoriesRoutes(server: FastifyInstance) {
    server.get('/', getAllCategoriesHandler);

    server.get('/:id', getCategoriesByIdHandler);

    server.post('/', postCategoriesHandler);

    server.put('/:id', putWatchHandler);

    server.delete('/:id', deleteWatchHandler)
}