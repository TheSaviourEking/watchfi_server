import { FastifyInstance } from "fastify";
import { getAllBookingsHandler, getBookingByIdHandler, postBookingHandler } from "./booking.controller";
// import { getAllCollectionsHandler, getWatchByIdHandler, postWatchHandler } from "./product.controller";

export default function bookingRoutes(server: FastifyInstance) {
    server.get('/', getAllBookingsHandler);

    server.get('/:id', getBookingByIdHandler);

    server.post('/', postBookingHandler);
}