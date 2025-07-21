import { FastifyInstance } from "fastify";
import { getAllCustomersHandler, getCustomerByIdHandler, postCustomerHandler } from "./customer.controller";

export default function customerRoutes(server: FastifyInstance) {
    server.get('/', getAllCustomersHandler);

    server.get('/:id', getCustomerByIdHandler);

    server.post('/', postCustomerHandler);
}