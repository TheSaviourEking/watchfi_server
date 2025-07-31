import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../../lib/prisma";

// GET /api/brands - Fetch all brands
const getAllBrandsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        // const brand = await prisma.brand.findMany({

        // })
        const brands = await prisma.brand.findMany({
            select: {
                id: true,
                name: true,
                logoUrl: true,
                description: true,
            },
        });
        return reply.status(200).send(brands);
    } catch (error) {
        console.error("Error fetching brands:", error);
        return reply.status(500).send({ message: "Failed to fetch brands" });
    }
};

// GET /api/brands/:id - Fetch a brand by ID
const getBrandsByIdHandler = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
) => {
    try {
        const { id } = request.params;
        const brand = await prisma.brand.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                logoUrl: true,
                description: true,
            },
        });

        if (!brand) {
            return reply.status(404).send({ message: "Brand not found" });
        }

        return reply.status(200).send(brand);
    } catch (error) {
        console.error("Error fetching brand by ID:", error);
        return reply.status(500).send({ message: "Failed to fetch brand" });
    }
};

// POST /api/brands - Create a new brand
const postBrandsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        // Assuming the request body is multipart/form-data from WatchForm.jsx
        const data = await request.file(); // Handle file upload
        const fields = await request.body; // Access non-file form fields

        const { name, brandDescription } = fields; // Form fields from WatchForm.jsx
        let logoUrl = fields.brandLogoUrl?.value; // URL if provided

        // Validate required fields
        if (!name?.value) {
            return reply.status(400).send({ message: "Brand name is required" });
        }

        // Handle file upload for logo if provided
        if (data && data.fieldname === "newBrandLogoFile") {
            // Save the file (e.g., to a storage service or local disk)
            // For this example, we'll assume you save it and get a URL
            // Replace this with your file storage logic (e.g., AWS S3, local filesystem)
            const fileName = `${Date.now()}-${data.filename}`;
            // Example: Save file to ./uploads (configure your storage solution)
            await data.toBuffer(); // Process the file (e.g., save to disk or upload to S3)
            logoUrl = `/uploads/${fileName}`; // Update with actual storage URL
        } else if (!logoUrl) {
            return reply.status(400).send({ message: "Brand logo (file or URL) is required" });
        }

        // Create the brand in the database
        const brand = await prisma.brand.create({
            data: {
                name: name.value,
                logoUrl,
                description: brandDescription?.value || null,
            },
            select: {
                id: true,
                name: true,
                logoUrl: true,
                description: true,
            },
        });

        return reply.status(201).send(brand);
    } catch (error) {
        console.error("Error creating brand:", error);
        return reply.status(500).send({ message: "Failed to create brand" });
    }
};

export { getAllBrandsHandler, getBrandsByIdHandler, postBrandsHandler };