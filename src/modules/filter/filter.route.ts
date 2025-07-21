import { FastifyInstance } from "fastify";
// import { getAllCollectionsHandler, getWatchByIdHandler, postWatchHandler } from "./product.controller";
import { getFilterOptionsHandler } from "./filter.controller";

export default function filterRoutes(server: FastifyInstance) {
    server.get('/', getFilterOptionsHandler);

    // server.get('/:id', getWatchByIdHandler);

    // server.post('/', postWatchHandler);
};