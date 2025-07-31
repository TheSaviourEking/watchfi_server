import { FastifyInstance } from "fastify";
import { getAllColorsHandler, getColorsByIdHandler, postColorsHandler } from "./color.controller";

export default function colorRoutes(server: FastifyInstance) {
    server.get('/', getAllColorsHandler);

    server.get('/:id', getColorsByIdHandler);

    server.post('/', postColorsHandler);
}