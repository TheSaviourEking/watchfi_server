import { FastifyInstance } from "fastify";
import { deleteWatchHandler, getAllCollectionsHandler, getWatchByIdHandler, postWatchHandler, putWatchHandler } from "./product.controller";

export default function productRoutes(server: FastifyInstance) {
    server.get('/', getAllCollectionsHandler);

    server.get('/:id', getWatchByIdHandler);

    server.post('/', postWatchHandler);

    server.put('/:id', putWatchHandler);

    server.delete('/:id', deleteWatchHandler)
}