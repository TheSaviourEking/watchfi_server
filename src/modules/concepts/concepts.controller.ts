import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../../lib/prisma";

// GET /api/concepts - Fetch all concepts
const getAllConceptsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const concepts = await prisma.concept.findMany({
            select: {
                id: true,
                name: true,
            },
        });
        return reply.status(200).send(concepts);
    } catch (error) {
        console.error("Error fetching concepts:", error);
        return reply.status(500).send({ error: "Failed to fetch concepts" });
    }
};

// GET /api/concepts/:id - Fetch a concept by ID
const getConceptsByIdHandler = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
) => {
    try {
        const { id } = request.params;
        const concept = await prisma.concept.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
            },
        });

        if (!concept) {
            return reply.status(404).send({ error: "Concept not found" });
        }

        return reply.status(200).send(concept);
    } catch (error) {
        console.error("Error fetching concept by ID:", error);
        return reply.status(500).send({ error: "Failed to fetch concept" });
    }
};

// POST /api/concepts - Create a new concept
const postConceptsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { name } = request.body as { name: string };
        if (!name || typeof name !== "string" || name.length > 100) {
            return reply.status(400).send({ error: "Invalid or missing name. Must be a string up to 100 characters." });
        }

        const existingConcept = await prisma.concept.findFirst({
            where: { name },
        });
        if (existingConcept) {
            return reply.status(400).send({ error: "Concept name already exists." });
        }

        const concept = await prisma.concept.create({
            data: { name },
            select: {
                id: true,
                name: true,
            },
        });

        return reply.status(201).send(concept);
    } catch (error) {
        console.error("Error creating concept:", error);
        if (error.code === "P2002") {
            return reply.status(400).send({ error: "Concept name already exists." });
        }
        return reply.status(500).send({ error: "Failed to create concept" });
    }
};

export { getAllConceptsHandler, getConceptsByIdHandler, postConceptsHandler };