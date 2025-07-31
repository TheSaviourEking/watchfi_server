import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../../lib/prisma";

// Regular expression for validating hex color codes (e.g., #FF0000)
const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;

// GET /api/colors - Fetch all colors
const getAllColorsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const colors = await prisma.color.findMany({
            select: {
                id: true,
                name: true,
            },
        });
        return reply.status(200).send(colors);
    } catch (error) {
        console.error("Error fetching colors:", error);
        return reply.status(500).send({ error: "Failed to fetch colors" });
    }
};

// GET /api/colors/:id - Fetch a color by ID
const getColorsByIdHandler = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
) => {
    try {
        const { id } = request.params;
        const color = await prisma.color.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
            },
        });

        if (!color) {
            return reply.status(404).send({ error: "Color not found" });
        }

        return reply.status(200).send(color);
    } catch (error) {
        console.error("Error fetching color by ID:", error);
        return reply.status(500).send({ error: "Failed to fetch color" });
    }
};

// POST /api/colors - Create a new color
const postColorsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { name, hex } = request.body as { name: string; hex?: string };
        if (!name || typeof name !== "string" || name.length > 100) {
            return reply.status(400).send({ error: "Invalid or missing name. Must be a string up to 100 characters." });
        }
        if (hex && (typeof hex !== "string" || !HEX_REGEX.test(hex))) {
            return reply.status(400).send({ error: "Invalid hex code. Must be a valid 6-digit hex color code (e.g., #FF0000) or omitted." });
        }

        const existingColor = await prisma.color.findFirst({
            where: { name },
        });
        if (existingColor) {
            return reply.status(400).send({ error: "Color name already exists." });
        }

        const color = await prisma.color.create({
            data: {
                name,
                hex: hex || null,
            },
            select: {
                id: true,
                name: true,
            },
        });

        return reply.status(201).send(color);
    } catch (error) {
        console.error("Error creating color:", error);
        if (error.code === "P2002") {
            return reply.status(400).send({ error: "Color name already exists." });
        }
        return reply.status(500).send({ error: "Failed to create color" });
    }
};

export { getAllColorsHandler, getColorsByIdHandler, postColorsHandler };