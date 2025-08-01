import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../../lib/prisma";

const APPNAME = process.env.APPNAME ? process.env.APPNAME : process.env.NODE_ENV === 'development' ? 'watchfi_dev' : 'watchfi_prod';

// Define params interface
interface WatchParams {
    id: string;
}

interface GetAllCollectionsQuery {
    page?: string
    pageSize?: string
    offset?: string
    limit?: string
    brand?: string
    category?: string
    concept?: string
    material?: string
    color?: string
    minPrice?: string
    maxPrice?: string
    isAvailable?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}

// const categoryMap: Record<string, string[]> = {
//     sport: ['Dive Watch', 'Chronograph'],
//     luxury: ['Dress Watch'],
//     aviation: ['Pilot Watch'],
//     'for-men': ['for-men'],
//     'for-women': ['for-women'],
// }

// const conceptMap: Record<string, string[]> = {
//     diving: ['Sport'],
//     dress: ['Luxury', 'Modern'],
//     vintage: ['Vintage'],
// }

interface GetAllWatchesQuery {
    page?: string
    pageSize?: string
    offset?: string
    limit?: string
    brand?: string
    category?: string
    concept?: string
    material?: string
    color?: string
    minPrice?: string
    maxPrice?: string
    isAvailable?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}

const categoryMap: Record<string, string[]> = {
    sport: ['Dive Watch', 'Chronograph'],
    luxury: ['Dress Watch'],
    aviation: ['Pilot Watch'],
    'for-men': ['for-men'],
    'for-women': ['for-women'],
}

const conceptMap: Record<string, string[]> = {
    diving: ['Sport'],
    dress: ['Luxury', 'Modern'],
    vintage: ['Vintage'],
}

const getAllCollectionsHandler = async (
    request: FastifyRequest<{ Querystring: GetAllWatchesQuery }>,
    reply: FastifyReply
) => {
    try {
        const {
            page = '1',
            pageSize = '10',
            offset,
            limit,
            brand,
            category,
            concept,
            material,
            color,
            minPrice,
            maxPrice,
            isAvailable,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = request.query

        // Validate pagination parameters
        const parsedPage = parseInt(page)
        const parsedPageSize = parseInt(pageSize)
        const parsedOffset = offset ? parseInt(offset) : undefined
        const parsedLimit = limit ? parseInt(limit) : undefined

        if (isNaN(parsedPage) || parsedPage < 1) {
            return reply.status(400).send({ error: 'Invalid page. Must be a positive integer.' })
        }
        if (isNaN(parsedPageSize) || parsedPageSize < 1 || parsedPageSize > 100) {
            return reply.status(400).send({ error: 'Invalid pageSize. Must be between 1 and 100.' })
        }
        if (offset && (isNaN(parsedOffset) || parsedOffset < 0)) {
            return reply.status(400).send({ error: 'Invalid offset. Must be a non-negative integer.' })
        }
        if (limit && (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100)) {
            return reply.status(400).send({ error: 'Invalid limit. Must be between 1 and 100.' })
        }

        // Calculate skip and take
        const skip = parsedOffset ?? (parsedPage - 1) * parsedPageSize
        const take = parsedLimit ?? parsedPageSize

        // Validate filters
        if (brand && (typeof brand !== 'string' || brand.length > 255)) {
            return reply.status(400).send({ error: 'Invalid brand. Must be a string up to 255 characters.' })
        }
        if (category && (typeof category !== 'string' || category.length > 100)) {
            return reply.status(400).send({ error: 'Invalid category. Must be a string up to 100 characters.' })
        }
        if (concept && (typeof concept !== 'string' || concept.length > 100)) {
            return reply.status(400).send({ error: 'Invalid concept. Must be a string up to 100 characters.' })
        }
        if (material && (typeof material !== 'string' || material.length > 100)) {
            return reply.status(400).send({ error: 'Invalid material. Must be a string up to 100 characters.' })
        }
        if (color && (typeof color !== 'string' || color.length > 100)) {
            return reply.status(400).send({ error: 'Invalid color. Must be a string up to 100 characters.' })
        }
        if (minPrice && (isNaN(parseFloat(minPrice)) || parseFloat(minPrice) < 0)) {
            return reply.status(400).send({ error: 'Invalid minPrice. Must be a non-negative number.' })
        }
        if (maxPrice && (isNaN(parseFloat(maxPrice)) || parseFloat(maxPrice) < 0)) {
            return reply.status(400).send({ error: 'Invalid maxPrice. Must be a non-negative number.' })
        }
        if (minPrice && maxPrice && parseFloat(minPrice) > parseFloat(maxPrice)) {
            return reply.status(400).send({ error: 'minPrice cannot be greater than maxPrice.' })
        }
        if (isAvailable && !['true', 'false'].includes(isAvailable)) {
            return reply.status(400).send({ error: 'Invalid isAvailable. Must be "true" or "false".' })
        }

        // Validate sort parameters
        const validSortFields = ['createdAt', 'price', 'name', 'stockQuantity']
        if (sortBy && !validSortFields.includes(sortBy)) {
            return reply.status(400).send({ error: `Invalid sortBy. Must be one of: ${validSortFields.join(', ')}.` })
        }
        if (sortOrder && !['asc', 'desc'].includes(sortOrder)) {
            return reply.status(400).send({ error: 'Invalid sortOrder. Must be "asc" or "desc".' })
        }

        const where: any = {
            deletedAt: null,
            brand: { deletedAt: null },
        }

        if (brand) {
            where.brand = { ...where.brand, name: { equals: brand, mode: 'insensitive' } }
        }
        if (category) {
            const dbCategories = categoryMap[category.toLowerCase()] || [category]
            where.categories = {
                some: {
                    category: { name: { in: dbCategories, mode: 'insensitive' } },
                },
            }
        }
        if (concept) {
            const dbConcepts = conceptMap[concept.toLowerCase()] || [concept]
            where.concepts = {
                some: {
                    concept: { name: { in: dbConcepts, mode: 'insensitive' } },
                },
            }
        }
        if (material) {
            where.materials = {
                some: {
                    material: { name: { equals: material, mode: 'insensitive' } },
                },
            }
        }
        if (color) {
            where.colors = {
                some: {
                    color: { name: { equals: color, mode: 'insensitive' } },
                },
            }
        }
        if (minPrice) {
            where.price = { gte: parseFloat(minPrice) }
        }
        if (maxPrice) {
            where.price = { ...where.price, lte: parseFloat(maxPrice) }
        }
        if (isAvailable !== undefined) {
            where.isAvailable = isAvailable === 'true'
        }

        const totalItems = await prisma.watch.count({ where })
        const watches = await prisma.watch.findMany({
            where,
            skip,
            take,
            select: {
                id: true,
                name: true,
                referenceCode: true,
                description: true,
                detail: true,
                price: true,
                stockQuantity: true,
                isAvailable: true,
                primaryPhotoUrl: true,
                createdAt: true,
                updatedAt: true,
                deletedAt: true,
                brand: {
                    select: { id: true, name: true, logoUrl: true },
                },
                colors: {
                    select: { color: { select: { id: true, name: true } } },
                },
                categories: {
                    select: { category: { select: { id: true, name: true } } },
                },
                concepts: {
                    select: { concept: { select: { id: true, name: true } } },
                },
                materials: {
                    select: { material: { select: { id: true, name: true } } },
                },
                photos: {
                    select: { id: true, photoUrl: true, altText: true, order: true },
                    orderBy: { order: 'asc' },
                },
                specificationHeadings: {
                    select: {
                        id: true,
                        heading: true,
                        description: true,
                        specificationPoints: { select: { id: true, label: true, value: true } },
                    },
                },
            },
            orderBy: { [sortBy]: sortOrder },
        })

        const formattedWatches = watches.map((watch) => ({
            id: watch.id,
            name: watch.name,
            referenceCode: watch.referenceCode,
            description: watch.description,
            detail: watch.detail,
            price: Number(watch.price.toString()),
            stockQuantity: watch.stockQuantity,
            isAvailable: watch.isAvailable,
            primaryPhotoUrl: watch.primaryPhotoUrl,
            brand: watch.brand,
            categories: watch.categories.map((c) => ({ category: c.category })),
            concepts: watch.concepts.map((c) => ({ concept: c.concept })),
            materials: watch.materials.map((m) => ({ material: m.material })),
            colors: watch.colors.map((c) => ({ color: c.color })),
            photos: watch.photos,
            specificationHeadings: watch.specificationHeadings.map((h) => ({
                id: h.id,
                heading: h.heading,
                description: h.description,
                specificationPoints: h.specificationPoints,
            })),
            createdAt: watch.createdAt.toISOString(),
            updatedAt: watch.updatedAt.toISOString(),
            deletedAt: watch.deletedAt ? watch.deletedAt.toISOString() : null,
        }))

        return reply.status(200).send({
            success: true,
            data: formattedWatches,
            meta: {
                totalItems,
                totalPages: Math.ceil(totalItems / take),
                currentPage: parsedOffset ? Math.floor(parsedOffset / take) + 1 : parsedPage,
                pageSize: take,
            },
        })
    } catch (error) {
        request.log.error('Error fetching collections:', error)
        return reply.status(500).send({ error: `Failed to fetch collections: ${(error as Error).message}` })
    }
}


interface WatchParams {
    id: string
}

const getWatchByIdHandler = async (
    request: FastifyRequest<{ Params: WatchParams }>,
    reply: FastifyReply
) => {
    try {
        const { id } = request.params

        // Validate UUID format
        if (!id || !UUID_REGEX.test(id)) {
            return reply.status(400).send({ error: 'Invalid watch ID. Must be a valid UUID.' })
        }

        // Fetch watch with related data
        const watch = await prisma.watch.findFirst({
            where: {
                id,
                // deletedAt: null,
            },
            select: {
                id: true,
                name: true,
                referenceCode: true,
                description: true,
                detail: true,
                price: true,
                stockQuantity: true,
                isAvailable: true,
                primaryPhotoUrl: true,
                createdAt: true,
                updatedAt: true,
                deletedAt: true,
                brand: {
                    select: { id: true, name: true, logoUrl: true },
                    // where: { deletedAt: null },
                },
                colors: {
                    select: { color: { select: { id: true, name: true } } },
                },
                categories: {
                    select: { category: { select: { id: true, name: true } } },
                },
                concepts: {
                    select: { concept: { select: { id: true, name: true } } },
                },
                materials: {
                    select: { material: { select: { id: true, name: true } } },
                },
                photos: {
                    select: { id: true, photoUrl: true, altText: true, order: true },
                    orderBy: { order: 'asc' },
                },
                specificationHeadings: {
                    select: {
                        id: true,
                        heading: true,
                        description: true,
                        specificationPoints: { select: { id: true, label: true, value: true } },
                    },
                },
            },
        })

        // Check if watch exists
        if (!watch) {
            return reply.status(404).send({ error: 'Watch not found or has been deleted.' })
        }

        // Format response
        const formattedWatch = {
            id: watch.id,
            name: watch.name,
            referenceCode: watch.referenceCode,
            description: watch.description,
            detail: watch.detail,
            price: watch.price,
            stockQuantity: watch.stockQuantity,
            isAvailable: watch.isAvailable,
            primaryPhotoUrl: watch.primaryPhotoUrl,
            brand: watch.brand,
            categories: watch.categories.map((c) => ({ category: c.category })),
            concepts: watch.concepts.map((c) => ({ concept: c.concept })),
            materials: watch.materials.map((m) => ({ material: m.material })),
            colors: watch.colors.map((c) => ({ color: c.color })),
            photos: watch.photos,
            specificationHeadings: watch.specificationHeadings.map((h) => ({
                id: h.id,
                heading: h.heading,
                description: h.description,
                specificationPoints: h.specificationPoints,
            })),
            createdAt: watch.createdAt.toISOString(),
            updatedAt: watch.updatedAt.toISOString(),
            deletedAt: watch.deletedAt ? watch.deletedAt.toISOString() : null,
        }

        // return {
        //     ...formattedWatch,
        //     price: Number(newWatc.price),
        // }

        // Send the response
        return reply.status(200).send({
            data: {
                ...formattedWatch,
                price: Number(formattedWatch.price),
            }
        })
        // return reply.status(200).send({ data: formattedWatch })
    } catch (error) {
        request.log.error('Error fetching watch by ID:', error)
        return reply.status(500).send({ error: `Failed to fetch watch: ${(error as Error).message}` })
    }
}


import {
    uploadToCloudinary,
    uploadMultipleToCloudinary,
    testCloudinaryConfig,
    uploadToCloudinaryViaURL,
    deleteFromCloudinary,
    deleteMultipleFromCloudinary,
} from "../../lib/cloudinary";
import { usdToCents } from "../../lib/converters";

// Regular expression for UUID validation
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Helper function to generate a unique identifier for Cloudinary paths
function generateWatchId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function sanitizeForCloudinary(name) {
    if (!name || typeof name !== 'string') {
        return 'unnamed'; // Fallback for invalid input
    }

    return name
        .replace(/[&]/g, 'and')           // Replace & with 'and'
        .replace(/\s+/g, '_')             // Replace spaces with underscores
        .replace(/[^a-zA-Z0-9\-_]/g, '_') // Replace other special chars with underscore
        .replace(/_{2,}/g, '_')           // Replace multiple underscores with single
        .replace(/^_|_$/g, '')            // Remove leading/trailing underscores
        .toLowerCase()                    // Convert to lowercase for consistency
        || 'unnamed'; // Fallback if result is empty
}

async function postWatchHandler(request: FastifyRequest, reply: FastifyReply) {
    try {
        // Test Cloudinary configuration
        const configTest = await testCloudinaryConfig();
        if (!configTest.success) {
            console.error("Cloudinary configuration test failed:", configTest.message);
            return reply.status(500).send({ error: `Configuration error: ${configTest.message}` });
        }

        // Initialize data storage
        const data = {
            fields: {},
            files: {},
        };

        // Parse multipart/form-data
        for await (const part of request.parts()) {
            if (part.file) {
                // Handle file fields
                const fieldName = part.fieldname;
                const fileName = part.filename || `unnamed_${Date.now()}`;
                const fileData = await part.toBuffer();
                console.log(`Received file: ${fieldName}, name: ${fileName}, size: ${fileData.length} bytes, mimetype: ${part.mimetype}`);
                data.files[fieldName] = data.files[fieldName] || [];
                data.files[fieldName].push({
                    name: fileName,
                    data: fileData,
                    mimetype: part.mimetype,
                });
            } else {
                // Handle non-file fields
                console.log(`Received field: ${part.fieldname}, value: ${part.value}`);
                data.fields[part.fieldname] = part.value;
            }
        }

        // Extract and validate fields
        const {
            name,
            price,
            referenceCode,
            description,
            detail,
            brandId,
            newBrand,
            newBrandDescription,
            newBrandLogoUrl,
            logoInputType,
            stockQuantity,
            isAvailable,
            colors,
            categories,
            concepts,
            materials,
            specifications,
            primaryPhotoAltText,
            existingPrimaryUrl,
            existingSecondaryUrls,
            removedImages,
            newColors,
            newCategories,
            newConcepts,
            newMaterials,
        } = data.fields;

        // return reply.status(400).send({ msg: data });
        // return reply.status(400).send({ error: "Custom return" });

        // Validate unique name and referenceCode
        const existingWatche = await prisma.watch.findFirst({
            where: { OR: [{ name }, { referenceCode }] },
        });
        if (existingWatche) {
            console.log("Validation failed: Duplicate name or referenceCode");
            return reply.status(400).send({ error: "Watch name or referenceCode already exists." });
        }


        // Validate required fields
        if (!name || typeof name !== "string" || name.length > 255) {
            console.log("Validation failed: Invalid or missing name");
            return reply.status(400).send({ error: "Invalid or missing name. Must be a string up to 255 characters." });
        }
        const parsedPrice = parseFloat(price || "0");
        if (isNaN(parsedPrice) || parsedPrice < 0 || parsedPrice > 99999999.99) {
            console.log("Validation failed: Invalid or missing price");
            return reply.status(400).send({ error: "Invalid or missing price. Must be a number between 0 and 99999999.99." });
        }
        if (!referenceCode || typeof referenceCode !== "string" || referenceCode.length > 255) {
            console.log("Validation failed: Invalid or missing referenceCode");
            return reply.status(400).send({ error: "Invalid or missing referenceCode. Must be a string up to 255 characters." });
        }
        if (description && (typeof description !== "string" || description.length > 1000)) {
            console.log("Validation failed: Invalid description");
            return reply.status(400).send({ error: "Invalid description. Must be a string up to 1000 characters or omitted." });
        }
        if (detail && typeof detail !== "string") {
            console.log("Validation failed: Invalid detail");
            return reply.status(400).send({ error: "Invalid detail. Must be a string or omitted." });
        }
        const parsedStockQuantity = parseInt(stockQuantity || "0");
        if (isNaN(parsedStockQuantity) || parsedStockQuantity < 0) {
            console.log("Validation failed: Invalid stockQuantity");
            return reply.status(400).send({ error: "Invalid stockQuantity. Must be a non-negative number." });
        }
        const parsedIsAvailable = isAvailable === "true";
        if (typeof parsedIsAvailable !== "boolean") {
            console.log("Validation failed: Invalid isAvailable");
            return reply.status(400).send({ error: "Invalid isAvailable. Must be a boolean." });
        }
        if (parsedStockQuantity === 0 && parsedIsAvailable) {
            console.log("Validation failed: Invalid isAvailable with zero stock");
            return reply.status(400).send({ error: "Invalid isAvailable. Must be false if stockQuantity is 0." });
        }

        // Parse complex fields
        let parsedColors, parsedCategories, parsedConcepts, parsedMaterials, parsedSpecifications, parsedExistingSecondaryUrls, parsedRemovedImages, parsedNewColors, parsedNewCategories, parsedNewConcepts, parsedNewMaterials;
        try {
            parsedColors = JSON.parse(colors || "[]");
            parsedCategories = JSON.parse(categories || "[]");
            parsedConcepts = JSON.parse(concepts || "[]");
            parsedMaterials = JSON.parse(materials || "[]");
            parsedSpecifications = JSON.parse(specifications || "[]");
            parsedExistingSecondaryUrls = JSON.parse(existingSecondaryUrls || "[]");
            parsedRemovedImages = JSON.parse(removedImages || "{}");
            parsedNewColors = JSON.parse(newColors || "[]");
            parsedNewCategories = JSON.parse(newCategories || "[]");
            parsedNewConcepts = JSON.parse(newConcepts || "[]");
            parsedNewMaterials = JSON.parse(newMaterials || "[]");
        } catch (error) {
            console.log("Validation failed: JSON parsing error", error);
            return reply.status(400).send({ error: `Invalid JSON in fields: ${error.message}` });
        }

        // Validate related IDs
        if (parsedColors.length > 0) {
            const validColors = await prisma.color.findMany({ where: { id: { in: parsedColors } } });
            if (validColors.length !== parsedColors.length) {
                console.log("Validation failed: Invalid color IDs");
                return reply.status(400).send({ error: "One or more color IDs are invalid or deleted." });
            }
        }
        if (parsedCategories.length > 0) {
            const validCategories = await prisma.category.findMany({ where: { id: { in: parsedCategories } } });
            if (validCategories.length !== parsedCategories.length) {
                console.log("Validation failed: Invalid category IDs");
                return reply.status(400).send({ error: "One or more category IDs are invalid or deleted." });
            }
        }
        if (parsedConcepts.length > 0) {
            const validConcepts = await prisma.concept.findMany({ where: { id: { in: parsedConcepts } } });
            if (validConcepts.length !== parsedConcepts.length) {
                console.log("Validation failed: Invalid concept IDs");
                return reply.status(400).send({ error: "One or more concept IDs are invalid or deleted." });
            }
        }
        if (parsedMaterials.length > 0) {
            const validMaterials = await prisma.material.findMany({ where: { id: { in: parsedMaterials } } });
            if (validMaterials.length !== parsedMaterials.length) {
                console.log("Validation failed: Invalid material IDs");
                return reply.status(400).send({ error: "One or more material IDs are invalid or deleted." });
            }
        }

        // Validate specification headings and points
        if (parsedSpecifications.length > 0) {
            for (const heading of parsedSpecifications) {
                if (!heading.heading || typeof heading.heading !== "string" || heading.heading.length > 255) {
                    console.log("Validation failed: Invalid specification heading");
                    return reply.status(400).send({ error: "Invalid heading in specifications. Must be a string up to 255 characters." });
                }
                if (heading.description && (typeof heading.description !== "string" || heading.description.length > 255)) {
                    console.log("Validation failed: Invalid specification description");
                    return reply.status(400).send({ error: "Invalid description in specifications. Must be a string up to 255 characters or omitted." });
                }
                if (heading.specificationOptions && heading.specificationOptions.length > 0) {
                    for (const point of heading.specificationOptions) {
                        if (!point.label || typeof point.label !== "string" || point.label.length > 255) {
                            console.log("Validation failed: Invalid specification option label");
                            return reply.status(400).send({ error: "Invalid label in specificationOptions. Must be a string up to 255 characters." });
                        }
                        if (!point.value || typeof point.value !== "string" || point.value.length > 500) {
                            console.log("Validation failed: Invalid specification option value");
                            return reply.status(400).send({ error: "Invalid value in specificationOptions. Must be a string up to 500 characters." });
                        }
                    }
                } else {
                    console.log("Validation failed: Missing specification options");
                    return reply.status(400).send({ error: "At least one specification option is required per heading." });
                }
            }
        } else {
            console.log("Validation failed: Missing specifications");
            return reply.status(400).send({ error: "At least one specification is required." });
        }

        // Generate a unique identifier for Cloudinary paths
        const watchId = generateWatchId();

        // Handle brand creation or lookup
        let finalBrandId = brandId !== "other" ? brandId : null;
        let brandLogoUrlValue = newBrandLogoUrl;

        if (!finalBrandId || typeof finalBrandId !== "string" || !UUID_REGEX.test(finalBrandId)) {
            if (!brandId && newBrand) {
                const existingBrand = await prisma.brand.findFirst({
                    where: { name: newBrand },
                });
                if (existingBrand) {
                    finalBrandId = existingBrand.id;
                    brandLogoUrlValue = existingBrand.logoUrl;
                } else {
                    if (data.files.newBrandLogoFile && data.files.newBrandLogoFile.length > 0 && logoInputType === "file") {
                        try {
                            brandLogoUrlValue = await uploadToCloudinary(
                                data.files.newBrandLogoFile[0].data,
                                { name: data.files.newBrandLogoFile[0].name, mimetype: data.files.newBrandLogoFile[0].mimetype },
                                `${APPNAME}/brands/${sanitizeForCloudinary(newBrand)}`,
                                { maxFileSize: 5 * 1024 * 1024, timeout: 30000, maxWidth: 300, maxHeight: 300 }
                            );
                        } catch (error) {
                            console.error("Brand logo upload failed:", error);
                            return reply.status(400).send({ error: `Failed to upload brand logo: ${error.message}` });
                        }
                    } else if (newBrandLogoUrl && logoInputType === "url") {
                        brandLogoUrlValue = newBrandLogoUrl;
                    } else {
                        console.log("Validation failed: Missing brand logo file or URL");
                        return reply.status(400).send({ error: "Brand logo (file or URL) is required for new brand." });
                    }

                    const newBrandData = await prisma.brand.create({
                        data: {
                            name: newBrand,
                            logoUrl: brandLogoUrlValue,
                            description: newBrandDescription || null,
                        },
                    });
                    finalBrandId = newBrandData.id;
                }
            } else {
                console.log("Validation failed: Invalid or missing brandId");
                return reply.status(400).send({ error: "Invalid or missing brandId. Must be a valid UUID or 'other' with newBrand." });
            }
        }

        // Validate brand exists
        const brand = await prisma.brand.findUnique({ where: { id: finalBrandId } });
        if (!brand) {
            console.log("Validation failed: Brand not found");
            return reply.status(400).send({ error: "Brand not found or deleted." });
        }

        // Handle file uploads for watch images
        let primaryImageUrl = existingPrimaryUrl;
        let photos = parsedExistingSecondaryUrls.map((photo, index) => ({
            photoUrl: photo.photoUrl || photo.url || "",
            altText: photo.altText || "",
            order: photo.order || index + 1,
        }));

        // Upload new primary photo if provided
        if (data.files.primaryPhoto && data.files.primaryPhoto.length > 0) {
            try {
                primaryImageUrl = await uploadToCloudinary(
                    data.files.primaryPhoto[0].data,
                    { name: data.files.primaryPhoto[0].name, mimetype: data.files.primaryPhoto[0].mimetype },
                    `${APPNAME}/watches/${sanitizeForCloudinary(watchId)}/primary`,
                    { maxFileSize: 5 * 1024 * 1024, timeout: 30000, maxWidth: 1200, maxHeight: 1200 }
                );
            } catch (primaryError) {
                console.error("Primary photo upload failed:", primaryError);
                return reply.status(400).send({ error: `Failed to upload primary photo: ${primaryError.message}` });
            }
        }
        if (!primaryImageUrl || typeof primaryImageUrl !== "string" || primaryImageUrl.length > 500) {
            console.log("Validation failed: Invalid or missing primaryPhotoUrl");
            return reply.status(400).send({ error: "Invalid or missing primaryPhotoUrl. Must be a string up to 500 characters." });
        }

        // Upload new secondary photos if provided
        if (data.files.secondaryPhotos && data.files.secondaryPhotos.length > 0) {
            try {
                const uploadedUrls = await uploadMultipleToCloudinary(
                    data.files.secondaryPhotos,
                    `${APPNAME}/watches/${sanitizeForCloudinary(watchId)}/secondary`,
                    { maxFileSize: 5 * 1024 * 1024, timeout: 30000, maxWidth: 1200, maxHeight: 1200 }
                );
                photos.push(
                    ...uploadedUrls.map((url, index) => ({
                        photoUrl: url,
                        altText: primaryPhotoAltText || "",
                        order: photos.length + index + 1,
                    }))
                );
            } catch (secondaryError) {
                console.error("Secondary photos upload failed:", secondaryError);
                return reply.status(400).send({ error: `Failed to upload secondary photos: ${secondaryError.message}` });
            }
        }

        // Validate photos
        for (const photo of photos) {
            if (!photo.photoUrl || typeof photo.photoUrl !== "string" || photo.photoUrl.length > 500) {
                console.log("Validation failed: Invalid photoUrl in photos");
                return reply.status(400).send({ error: "Invalid photoUrl in photos. Must be a string up to 500 characters." });
            }
            if (photo.altText && (typeof photo.altText !== "string" || photo.altText.length > 255)) {
                console.log("Validation failed: Invalid altText in photos");
                return reply.status(400).send({ error: "Invalid altText in photos. Must be a string up to 255 characters or omitted." });
            }
            if (typeof photo.order !== "number" || !Number.isInteger(photo.order) || photo.order < 0) {
                console.log("Validation failed: Invalid order in photos");
                return reply.status(400).send({ error: "Invalid order in photos. Must be a non-negative integer." });
            }
        }

        // Handle removed images
        if (parsedRemovedImages.primary && existingPrimaryUrl) {
            try {
                await deleteFromCloudinary(existingPrimaryUrl);
            } catch (deleteError) {
                console.error("Failed to delete primary image:", deleteError);
            }
        }
        if (parsedRemovedImages.secondary && parsedRemovedImages.secondary.length > 0) {
            try {
                await deleteMultipleFromCloudinary(parsedRemovedImages.secondary);
                await prisma.watchPhoto.deleteMany({
                    where: { photoUrl: { in: parsedRemovedImages.secondary } },
                });
            } catch (deleteError) {
                console.error("Failed to delete secondary images:", deleteError);
            }
        }

        // Validate unique name and referenceCode
        const existingWatch = await prisma.watch.findFirst({
            where: { OR: [{ name }, { referenceCode }] },
        });
        if (existingWatch) {
            console.log("Validation failed: Duplicate name or referenceCode");
            return reply.status(400).send({ error: "Watch name or referenceCode already exists." });
        }

        // Create watch and related data in a transaction
        const watch = await prisma.$transaction(async (prisma) => {
            const newWatch = await prisma.watch.create({
                data: {
                    name,
                    // price: Number(usdToCents(Number(price.toString()))),
                    price: price,
                    referenceCode,
                    description: description || null,
                    // detail: detail ? JSON.parse(detail) : null,
                    detail: detail ? detail.toString() : null,
                    primaryPhotoUrl: primaryImageUrl,
                    brandId: finalBrandId,
                    stockQuantity: parsedStockQuantity,
                    isAvailable: parsedIsAvailable,
                },
            });

            if (parsedColors.length > 0) {
                await prisma.watchColor.createMany({
                    data: parsedColors.map((colorId) => ({
                        watchId: newWatch.id,
                        colorId,
                    })),
                });
            }

            if (parsedCategories.length > 0) {
                await prisma.watchCategory.createMany({
                    data: parsedCategories.map((categoryId) => ({
                        watchId: newWatch.id,
                        categoryId,
                    })),
                });
            }

            if (parsedConcepts.length > 0) {
                await prisma.watchConcept.createMany({
                    data: parsedConcepts.map((conceptId) => ({
                        watchId: newWatch.id,
                        conceptId,
                    })),
                });
            }

            if (parsedMaterials.length > 0) {
                await prisma.watchMaterial.createMany({
                    data: parsedMaterials.map((materialId) => ({
                        watchId: newWatch.id,
                        materialId,
                    })),
                });
            }

            if (photos.length > 0) {
                await prisma.watchPhoto.createMany({
                    data: photos.map((photo) => ({
                        watchId: newWatch.id,
                        photoUrl: photo.photoUrl,
                        altText: photo.altText || null,
                        order: photo.order,
                    })),
                });
            }

            if (parsedSpecifications.length > 0) {
                for (const heading of parsedSpecifications) {
                    const newHeading = await prisma.watchSpecificationHeading.create({
                        data: {
                            watchId: newWatch.id,
                            heading: heading.heading,
                            description: heading.description || null,
                        },
                    });

                    if (heading.specificationOptions && heading.specificationOptions.length > 0) {
                        await prisma.watchSpecificationPoint.createMany({
                            data: heading.specificationOptions.map((point) => ({
                                headingId: newHeading.id,
                                label: point.label,
                                value: point.value,
                            })),
                        });
                    }
                }
            }

            const newWatc = await prisma.watch.findUnique({
                where: { id: newWatch.id },
                select: {
                    id: true,
                    name: true,
                    price: true,
                    referenceCode: true,
                    description: true,
                    detail: true,
                    primaryPhotoUrl: true,
                    brandId: true,
                    stockQuantity: true,
                    isAvailable: true,
                    createdAt: true,
                    updatedAt: true,
                    brand: { select: { id: true, name: true, logoUrl: true } },
                    colors: { select: { color: { select: { id: true, name: true } } } },
                    categories: { select: { category: { select: { id: true, name: true } } } },
                    concepts: { select: { concept: { select: { id: true, name: true } } } },
                    materials: { select: { material: { select: { id: true, name: true } } } },
                    photos: { select: { id: true, photoUrl: true, altText: true, order: true } },
                    specificationHeadings: {
                        select: {
                            id: true,
                            heading: true,
                            description: true,
                            specificationPoints: { select: { id: true, label: true, value: true } },
                        },
                    },
                },
            });

            return {
                ...newWatc,
                price: Number(newWatc.price),
            }
        });

        return reply.status(201).send({ data: watch });
    } catch (error) {
        console.error("Error creating watch:", error);
        if (error.code === "P2002") {
            return reply.status(400).send({ error: "Watch name or referenceCode already exists." });
        }
        return reply.status(500).send({ error: `Failed to create watch: ${error.message}` });
    }
}

async function putWatchHandler(request: FastifyRequest, reply: FastifyReply) {
    try {
        const { id } = request.params;
        // Parse multipart/form-data (same as postWatchHandler)
        const data = { fields: {}, files: {} };
        for await (const part of request.parts()) {
            if (part.file) {
                const fieldName = part.fieldname;
                const fileName = part.filename || `unnamed_${Date.now()}`;
                const fileData = await part.toBuffer();
                data.files[fieldName] = data.files[fieldName] || [];
                data.files[fieldName].push({ name: fileName, data: fileData, mimetype: part.mimetype });
            } else {
                data.fields[part.fieldname] = part.value;
            }
        }
        // Validate fields (same as postWatchHandler)
        // Extract and validate fields
        const {
            name,
            price,
            referenceCode,
            description,
            detail,
            brandId,
            newBrand,
            newBrandDescription,
            newBrandLogoUrl,
            logoInputType,
            stockQuantity,
            isAvailable,
            colors,
            categories,
            concepts,
            materials,
            specifications,
            primaryPhotoAltText,
            existingPrimaryUrl,
            existingSecondaryUrls,
            removedImages,
            newColors,
            newCategories,
            newConcepts,
            newMaterials,
        } = data.fields;

        // Validate unique name and referenceCode
        const existingWatche = await prisma.watch.findFirst({
            where: { OR: [{ name }, { referenceCode }] },
        });
        if (!existingWatche) {
            console.log("Validation failed: Watch Does not exist");
            return reply.status(400).send({ error: "Watch name or referenceCode doesn't exists." });
        }


        // Validate required fields
        if (!name || typeof name !== "string" || name.length > 255) {
            console.log("Validation failed: Invalid or missing name");
            return reply.status(400).send({ error: "Invalid or missing name. Must be a string up to 255 characters." });
        }
        const parsedPrice = parseFloat(price || "0");
        if (isNaN(parsedPrice) || parsedPrice < 0 || parsedPrice > 99999999.99) {
            console.log("Validation failed: Invalid or missing price");
            return reply.status(400).send({ error: "Invalid or missing price. Must be a number between 0 and 99999999.99." });
        }
        if (!referenceCode || typeof referenceCode !== "string" || referenceCode.length > 255) {
            console.log("Validation failed: Invalid or missing referenceCode");
            return reply.status(400).send({ error: "Invalid or missing referenceCode. Must be a string up to 255 characters." });
        }
        if (description && (typeof description !== "string" || description.length > 1000)) {
            console.log("Validation failed: Invalid description");
            return reply.status(400).send({ error: "Invalid description. Must be a string up to 1000 characters or omitted." });
        }
        if (detail && typeof detail !== "string") {
            console.log("Validation failed: Invalid detail");
            return reply.status(400).send({ error: "Invalid detail. Must be a string or omitted." });
        }
        const parsedStockQuantity = parseInt(stockQuantity || "0");
        if (isNaN(parsedStockQuantity) || parsedStockQuantity < 0) {
            console.log("Validation failed: Invalid stockQuantity");
            return reply.status(400).send({ error: "Invalid stockQuantity. Must be a non-negative number." });
        }
        const parsedIsAvailable = isAvailable === "true";
        if (typeof parsedIsAvailable !== "boolean") {
            console.log("Validation failed: Invalid isAvailable");
            return reply.status(400).send({ error: "Invalid isAvailable. Must be a boolean." });
        }
        if (parsedStockQuantity === 0 && parsedIsAvailable) {
            console.log("Validation failed: Invalid isAvailable with zero stock");
            return reply.status(400).send({ error: "Invalid isAvailable. Must be false if stockQuantity is 0." });
        }

        // Parse complex fields
        let parsedColors, parsedCategories, parsedConcepts, parsedMaterials, parsedSpecifications, parsedExistingSecondaryUrls, parsedRemovedImages, parsedNewColors, parsedNewCategories, parsedNewConcepts, parsedNewMaterials;
        try {
            parsedColors = JSON.parse(colors || "[]");
            parsedCategories = JSON.parse(categories || "[]");
            parsedConcepts = JSON.parse(concepts || "[]");
            parsedMaterials = JSON.parse(materials || "[]");
            parsedSpecifications = JSON.parse(specifications || "[]");
            parsedExistingSecondaryUrls = JSON.parse(existingSecondaryUrls || "[]");
            parsedRemovedImages = JSON.parse(removedImages || "{}");
            parsedNewColors = JSON.parse(newColors || "[]");
            parsedNewCategories = JSON.parse(newCategories || "[]");
            parsedNewConcepts = JSON.parse(newConcepts || "[]");
            parsedNewMaterials = JSON.parse(newMaterials || "[]");
        } catch (error) {
            console.log("Validation failed: JSON parsing error", error);
            return reply.status(400).send({ error: `Invalid JSON in fields: ${error.message}` });
        }

        // Validate related IDs
        if (parsedColors.length > 0) {
            const validColors = await prisma.color.findMany({ where: { id: { in: parsedColors } } });
            if (validColors.length !== parsedColors.length) {
                console.log("Validation failed: Invalid color IDs");
                return reply.status(400).send({ error: "One or more color IDs are invalid or deleted." });
            }
        }
        if (parsedCategories.length > 0) {
            const validCategories = await prisma.category.findMany({ where: { id: { in: parsedCategories } } });
            if (validCategories.length !== parsedCategories.length) {
                console.log("Validation failed: Invalid category IDs");
                return reply.status(400).send({ error: "One or more category IDs are invalid or deleted." });
            }
        }
        if (parsedConcepts.length > 0) {
            const validConcepts = await prisma.concept.findMany({ where: { id: { in: parsedConcepts } } });
            if (validConcepts.length !== parsedConcepts.length) {
                console.log("Validation failed: Invalid concept IDs");
                return reply.status(400).send({ error: "One or more concept IDs are invalid or deleted." });
            }
        }
        if (parsedMaterials.length > 0) {
            const validMaterials = await prisma.material.findMany({ where: { id: { in: parsedMaterials } } });
            if (validMaterials.length !== parsedMaterials.length) {
                console.log("Validation failed: Invalid material IDs");
                return reply.status(400).send({ error: "One or more material IDs are invalid or deleted." });
            }
        }

        // Validate specification headings and points
        if (parsedSpecifications.length > 0) {
            for (const heading of parsedSpecifications) {
                if (!heading.heading || typeof heading.heading !== "string" || heading.heading.length > 255) {
                    console.log("Validation failed: Invalid specification heading");
                    return reply.status(400).send({ error: "Invalid heading in specifications. Must be a string up to 255 characters." });
                }
                if (heading.description && (typeof heading.description !== "string" || heading.description.length > 255)) {
                    console.log("Validation failed: Invalid specification description");
                    return reply.status(400).send({ error: "Invalid description in specifications. Must be a string up to 255 characters or omitted." });
                }
                if (heading.specificationOptions && heading.specificationOptions.length > 0) {
                    for (const point of heading.specificationOptions) {
                        if (!point.label || typeof point.label !== "string" || point.label.length > 255) {
                            console.log("Validation failed: Invalid specification option label");
                            return reply.status(400).send({ error: "Invalid label in specificationOptions. Must be a string up to 255 characters." });
                        }
                        if (!point.value || typeof point.value !== "string" || point.value.length > 500) {
                            console.log("Validation failed: Invalid specification option value");
                            return reply.status(400).send({ error: "Invalid value in specificationOptions. Must be a string up to 500 characters." });
                        }
                    }
                } else {
                    console.log("Validation failed: Missing specification options");
                    return reply.status(400).send({ error: "At least one specification option is required per heading." });
                }
            }
        } else {
            console.log("Validation failed: Missing specifications");
            return reply.status(400).send({ error: "At least one specification is required." });
        }

        // Generate a unique identifier for Cloudinary paths
        const watchId = generateWatchId();

        // Handle brand creation or lookup
        let finalBrandId = brandId !== "other" ? brandId : null;
        let brandLogoUrlValue = newBrandLogoUrl;

        if (!finalBrandId || typeof finalBrandId !== "string" || !UUID_REGEX.test(finalBrandId)) {
            if (!brandId && newBrand) {
                const existingBrand = await prisma.brand.findFirst({
                    where: { name: newBrand },
                });
                if (existingBrand) {
                    finalBrandId = existingBrand.id;
                    brandLogoUrlValue = existingBrand.logoUrl;
                } else {
                    if (data.files.newBrandLogoFile && data.files.newBrandLogoFile.length > 0 && logoInputType === "file") {
                        try {
                            brandLogoUrlValue = await uploadToCloudinary(
                                data.files.newBrandLogoFile[0].data,
                                { name: data.files.newBrandLogoFile[0].name, mimetype: data.files.newBrandLogoFile[0].mimetype },
                                `${APPNAME}/brands/${sanitizeForCloudinary(newBrand)}`, // ✅ SANITIZED
                                { maxFileSize: 5 * 1024 * 1024, timeout: 30000, maxWidth: 300, maxHeight: 300 }
                            );

                        } catch (error) {
                            console.error("Brand logo upload failed:", error);
                            return reply.status(400).send({ error: `Failed to upload brand logo: ${error.message}` });
                        }
                    } else if (newBrandLogoUrl && logoInputType === "url") {
                        brandLogoUrlValue = newBrandLogoUrl;
                    } else {
                        console.log("Validation failed: Missing brand logo file or URL");
                        return reply.status(400).send({ error: "Brand logo (file or URL) is required for new brand." });
                    }

                    const newBrandData = await prisma.brand.create({
                        data: {
                            name: newBrand,
                            logoUrl: brandLogoUrlValue,
                            description: newBrandDescription || null,
                        },
                    });
                    finalBrandId = newBrandData.id;
                }
            } else {
                console.log("Validation failed: Invalid or missing brandId");
                return reply.status(400).send({ error: "Invalid or missing brandId. Must be a valid UUID or 'other' with newBrand." });
            }
        }

        // Validate brand exists
        const brand = await prisma.brand.findUnique({ where: { id: finalBrandId } });
        if (!brand) {
            console.log("Validation failed: Brand not found");
            return reply.status(400).send({ error: "Brand not found or deleted." });
        }

        // Handle file uploads for watch images
        let primaryImageUrl = existingPrimaryUrl;
        let photos = parsedExistingSecondaryUrls.map((photo, index) => ({
            photoUrl: photo.photoUrl || photo.url || "",
            altText: photo.altText || "",
            order: photo.order || index + 1,
        }));

        // Upload new primary photo if provided
        if (data.files.primaryPhoto && data.files.primaryPhoto.length > 0) {
            try {
                primaryImageUrl = await uploadToCloudinary(
                    data.files.primaryPhoto[0].data,
                    { name: data.files.primaryPhoto[0].name, mimetype: data.files.primaryPhoto[0].mimetype },
                    `${APPNAME}/watches/${sanitizeForCloudinary(watchId)}/primary`,
                    { maxFileSize: 5 * 1024 * 1024, timeout: 30000, maxWidth: 1200, maxHeight: 1200 }
                );
            } catch (primaryError) {
                console.error("Primary photo upload failed:", primaryError);
                return reply.status(400).send({ error: `Failed to upload primary photo: ${primaryError.message}` });
            }
        }
        if (!primaryImageUrl || typeof primaryImageUrl !== "string" || primaryImageUrl.length > 500) {
            console.log("Validation failed: Invalid or missing primaryPhotoUrl");
            return reply.status(400).send({ error: "Invalid or missing primaryPhotoUrl. Must be a string up to 500 characters." });
        }

        // Upload new secondary photos if provided
        if (data.files.secondaryPhotos && data.files.secondaryPhotos.length > 0) {
            try {
                const uploadedUrls = await uploadMultipleToCloudinary(
                    data.files.secondaryPhotos,
                    `${APPNAME}/watches/${sanitizeForCloudinary(watchId)}/secondary`,
                    { maxFileSize: 5 * 1024 * 1024, timeout: 30000, maxWidth: 1200, maxHeight: 1200 }
                );
                photos.push(
                    ...uploadedUrls.map((url, index) => ({
                        photoUrl: url,
                        altText: primaryPhotoAltText || "",
                        order: photos.length + index + 1,
                    }))
                );
            } catch (secondaryError) {
                console.error("Secondary photos upload failed:", secondaryError);
                return reply.status(400).send({ error: `Failed to upload secondary photos: ${secondaryError.message}` });
            }
        }

        // Validate photos
        for (const photo of photos) {
            if (!photo.photoUrl || typeof photo.photoUrl !== "string" || photo.photoUrl.length > 500) {
                console.log("Validation failed: Invalid photoUrl in photos");
                return reply.status(400).send({ error: "Invalid photoUrl in photos. Must be a string up to 500 characters." });
            }
            if (photo.altText && (typeof photo.altText !== "string" || photo.altText.length > 255)) {
                console.log("Validation failed: Invalid altText in photos");
                return reply.status(400).send({ error: "Invalid altText in photos. Must be a string up to 255 characters or omitted." });
            }
            if (typeof photo.order !== "number" || !Number.isInteger(photo.order) || photo.order < 0) {
                console.log("Validation failed: Invalid order in photos");
                return reply.status(400).send({ error: "Invalid order in photos. Must be a non-negative integer." });
            }
        }

        // Handle removed images
        if (parsedRemovedImages.primary && existingPrimaryUrl) {
            try {
                await deleteFromCloudinary(existingPrimaryUrl);
            } catch (deleteError) {
                console.error("Failed to delete primary image:", deleteError);
            }
        }
        if (parsedRemovedImages.secondary && parsedRemovedImages.secondary.length > 0) {
            try {
                await deleteMultipleFromCloudinary(parsedRemovedImages.secondary);
                await prisma.watchPhoto.deleteMany({
                    where: { photoUrl: { in: parsedRemovedImages.secondary } },
                });
            } catch (deleteError) {
                console.error("Failed to delete secondary images:", deleteError);
            }
        }

        // Update watch
        const watch = await prisma.$transaction(async (prisma) => {
            const updatedWatch = await prisma.watch.update({
                // where: { id, deletedAt: null },
                where: { id },
                data: {
                    name,
                    price: usdToCents(parsedPrice),
                    referenceCode,
                    description: description || null,
                    detail: detail ? JSON.parse(detail) : null,
                    primaryPhotoUrl: primaryImageUrl,
                    brandId: finalBrandId,
                    stockQuantity: parsedStockQuantity,
                    isAvailable: parsedIsAvailable,
                    deletedAt: data.fields.deletedAt ? new Date(data.fields.deletedAt) : null,
                },
            });
            // Update related records (delete and recreate for simplicity)
            await prisma.watchColor.deleteMany({ where: { watchId: id } });
            await prisma.watchCategory.deleteMany({ where: { watchId: id } });
            await prisma.watchConcept.deleteMany({ where: { watchId: id } });
            await prisma.watchMaterial.deleteMany({ where: { watchId: id } });
            await prisma.watchPhoto.deleteMany({ where: { watchId: id } });
            await prisma.watchSpecificationHeading.deleteMany({ where: { watchId: id } });
            // Recreate relations (same as postWatchHandler)
            // ... (copy relation creation logic)
            // return prisma.watch.findUnique({
            //     where: { id },
            //     select: { /* same select as postWatchHandler */ },
            // });

            const newWatc = await prisma.watch.findUnique({
                where: { id },
                select: {
                    id: true,
                    name: true,
                    price: true,
                    referenceCode: true,
                    description: true,
                    detail: true,
                    primaryPhotoUrl: true,
                    brandId: true,
                    stockQuantity: true,
                    isAvailable: true,
                    createdAt: true,
                    updatedAt: true,
                    brand: { select: { id: true, name: true, logoUrl: true } },
                    colors: { select: { color: { select: { id: true, name: true } } } },
                    categories: { select: { category: { select: { id: true, name: true } } } },
                    concepts: { select: { concept: { select: { id: true, name: true } } } },
                    materials: { select: { material: { select: { id: true, name: true } } } },
                    photos: { select: { id: true, photoUrl: true, altText: true, order: true } },
                    specificationHeadings: {
                        select: {
                            id: true,
                            heading: true,
                            description: true,
                            specificationPoints: { select: { id: true, label: true, value: true } },
                        },
                    },
                },
            });

            return {
                ...newWatc,
                price: Number(newWatc.price),
            }
        });
        return reply.status(200).send({ data: watch });
    } catch (error) {
        console.error("Error updating watch:", error);
        if (error.code === "P2002") {
            return reply.status(400).send({ error: "Watch name or referenceCode already exists." });
        }
        return reply.status(500).send({ error: `Failed to update watch: ${error.message}` });
    }
}

async function deleteWatchHandler(request, reply) {
    try {
        const { id } = request.params;
        const { hardDelete = false } = request.query; // Query param ?hardDelete=true for hard deletion

        // Validate watch ID
        if (!id || typeof id !== "string" || !UUID_REGEX.test(id)) {
            console.log("Validation failed: Invalid watch ID", id);
            return reply.status(400).send({ error: "Invalid watch ID. Must be a valid UUID." });
        }

        // Check if watch exists and is not already soft-deleted
        const watch = await prisma.watch.findUnique({
            where: { id, deletedAt: null },
            select: {
                id: true,
                primaryPhotoUrl: true,
                photos: { select: { photoUrl: true } },
            },
        });

        if (!watch) {
            console.log("Watch not found or already deleted:", id);
            return reply.status(404).send({ error: "Watch not found or already deleted." });
        }

        if (hardDelete) {
            // Hard deletion: Remove watch, related data, and Cloudinary images
            await prisma.$transaction(async (prisma) => {
                // Collect all image URLs for deletion
                const imageUrls = [watch.primaryPhotoUrl, ...watch.photos.map((photo) => photo.photoUrl)].filter(Boolean);

                // Delete related records
                await prisma.watchColor.deleteMany({ where: { watchId: id } });
                await prisma.watchCategory.deleteMany({ where: { watchId: id } });
                await prisma.watchConcept.deleteMany({ where: { watchId: id } });
                await prisma.watchMaterial.deleteMany({ where: { watchId: id } });
                await prisma.watchPhoto.deleteMany({ where: { watchId: id } });
                await prisma.watchSpecificationHeading.deleteMany({ where: { watchId: id } });

                // Delete the watch
                await prisma.watch.delete({ where: { id } });

                // Delete images from Cloudinary
                if (imageUrls.length > 0) {
                    try {
                        const deletionResult = await deleteMultipleFromCloudinary(imageUrls);
                        console.log("Cloudinary deletion result:", deletionResult);
                    } catch (cloudinaryError) {
                        console.error("Failed to delete Cloudinary images:", cloudinaryError);
                        // Continue with deletion even if Cloudinary fails to avoid partial state
                    }
                }
            });

            console.log(`Watch hard deleted successfully: ${id}`);
            return reply.status(204).send();
        } else {
            // Soft deletion: Set deletedAt timestamp
            await prisma.watch.update({
                where: { id },
                data: { deletedAt: new Date() },
            });

            console.log(`Watch soft deleted successfully: ${id}`);
            return reply.status(204).send();
        }
    } catch (error) {
        console.error("Error deleting watch:", error);
        if (error.code === "P2025") {
            // Prisma record not found
            return reply.status(404).send({ error: "Watch not found." });
        }
        return reply.status(500).send({ error: `Failed to delete watch: ${error.message}` });
    }
}

export { getAllCollectionsHandler, getWatchByIdHandler, postWatchHandler, putWatchHandler, deleteWatchHandler };