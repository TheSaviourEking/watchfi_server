import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../../lib/prisma";

// GET /api/categories - Fetch all categories
const getAllCategoriesHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const categories = await prisma.category.findMany({
            select: {
                id: true,
                name: true,
            },
        });
        return reply.status(200).send(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        return reply.status(500).send({ error: "Failed to fetch categories" });
    }
};

// GET /api/categories/:id - Fetch a category by ID
const getCategoriesByIdHandler = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
) => {
    try {
        const { id } = request.params;
        const category = await prisma.category.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
            },
        });

        if (!category) {
            return reply.status(404).send({ error: "Category not found" });
        }

        return reply.status(200).send(category);
    } catch (error) {
        console.error("Error fetching category by ID:", error);
        return reply.status(500).send({ error: "Failed to fetch category" });
    }
};

// POST /api/categories - Create a new category
const postCategoriesHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { name } = request.body as { name: string };
        if (!name || typeof name !== "string" || name.length > 100) {
            return reply.status(400).send({ error: "Invalid or missing name. Must be a string up to 100 characters." });
        }

        const existingCategory = await prisma.category.findFirst({
            where: { name },
        });
        if (existingCategory) {
            return reply.status(400).send({ error: "Category name already exists." });
        }

        const category = await prisma.category.create({
            data: { name },
            select: {
                id: true,
                name: true,
            },
        });

        return reply.status(201).send(category);
    } catch (error) {
        console.error("Error creating category:", error);
        if (error.code === "P2002") {
            return reply.status(400).send({ error: "Category name already exists." });
        }
        return reply.status(500).send({ error: "Failed to create category" });
    }
};

export { getAllCategoriesHandler, getCategoriesByIdHandler, postCategoriesHandler };