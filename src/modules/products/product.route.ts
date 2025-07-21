import { FastifyInstance } from "fastify";
import { getAllCollectionsHandler, getWatchByIdHandler, postWatchHandler } from "./product.controller";

export default function productRoutes(server: FastifyInstance) {
    server.get('/', getAllCollectionsHandler);

    server.get('/:id', getWatchByIdHandler);

    server.post('/', postWatchHandler);
}