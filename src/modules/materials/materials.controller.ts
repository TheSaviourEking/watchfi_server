import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../../lib/prisma";

// GET /api/materials - Fetch all materials
const getAllMaterialsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const materials = await prisma.material.findMany({
            select: {
                id: true,
                name: true,
            },
        });
        return reply.status(200).send(materials);
    } catch (error) {
        console.error("Error fetching materials:", error);
        return reply.status(500).send({ error: "Failed to fetch materials" });
    }
};

// GET /api/materials/:id - Fetch a material by ID
const getMaterialsByIdHandler = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
) => {
    try {
        const { id } = request.params;
        const material = await prisma.material.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
            },
        });

        if (!material) {
            return reply.status(404).send({ error: "Material not found" });
        }

        return reply.status(200).send(material);
    } catch (error) {
        console.error("Error fetching material by ID:", error);
        return reply.status(500).send({ error: "Failed to fetch material" });
    }
};

// POST /api/materials - Create a new material
const postMaterialsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { name } = request.body as { name: string };
        if (!name || typeof name !== "string" || name.length > 100) {
            return reply.status(400).send({ error: "Invalid or missing name. Must be a string up to 100 characters." });
        }

        const existingMaterial = await prisma.material.findFirst({
            where: { name },
        });
        if (existingMaterial) {
            return reply.status(400).send({ error: "Material name already exists." });
        }

        const material = await prisma.material.create({
            data: { name },
            select: {
                id: true,
                name: true,
            },
        });

        return reply.status(201).send(material);
    } catch (error) {
        console.error("Error creating material:", error);
        if (error.code === "P2002") {
            return reply.status(400).send({ error: "Material name already exists." });
        }
        return reply.status(500).send({ error: "Failed to create material" });
    }
};

export { getAllMaterialsHandler, getMaterialsByIdHandler, postMaterialsHandler };