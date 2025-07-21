import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../../lib/prisma";

// Define query parameter interface
interface WatchQueryParams {
    brand?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    isAvailable?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    limit?: string;
    offset?: string;
}

// Define params interface
interface WatchParams {
    id: string;
}

// Define request body interface
interface CreateWatchBody {
    name: string;
    price: number;
    referenceCode: string;
    description?: string;
    primaryPhotoUrl: string;
    brandId: string;
    stockQuantity?: number;
    isAvailable?: boolean;
    colors?: string[]; // Array of Color IDs
    categories?: string[]; // Array of Category IDs
    concepts?: string[]; // Array of Concept IDs
    materials?: string[]; // Array of Material IDs
    photos?: { photoUrl: string; altText?: string; order?: number }[];
    specificationHeadings?: {
        heading: string;
        description?: string;
        specificationPoints?: { label: string; value: string }[];
    }[];
}

// Fastify controller to fetch watches
// const getAllCollectionsHandler = async (
//     request: FastifyRequest<{ Querystring: WatchQueryParams }>,
//     reply: FastifyReply
// ) => {
//     try {
//         // Extract query parameters with defaults
//         const {
//             brand,
//             category,
//             minPrice,
//             maxPrice,
//             isAvailable,
//             sortBy = 'name', // Default sort by name
//             sortOrder = 'asc', // Default ascending
//             limit = '10', // Default 10 items per page
//             offset = '0', // Default no offset
//         } = request.query;

//         // Build the where clause for filtering
//         const where: any = {};

//         // Filter by brand name (case-insensitive)
//         if (brand) {
//             where.brand = {
//                 name: {
//                     equals: brand,
//                     mode: 'insensitive',
//                 },
//             };
//         }

//         // Filter by category name (via WatchCategory relation)
//         if (category) {
//             where.categories = {
//                 some: {
//                     category: {
//                         name: {
//                             equals: category,
//                             mode: 'insensitive',
//                         },
//                     },
//                 },
//             };
//         }

//         // Filter by price range
//         if (minPrice) {
//             const minPriceNum = parseFloat(minPrice);
//             if (isNaN(minPriceNum) || minPriceNum < 0) {
//                 return reply.status(400).send({ error: 'Invalid minPrice. Must be a non-negative number.' });
//             }
//             where.price = { ...where.price, gte: minPriceNum };
//         }
//         if (maxPrice) {
//             const maxPriceNum = parseFloat(maxPrice);
//             if (isNaN(maxPriceNum) || maxPriceNum < 0) {
//                 return reply.status(400).send({ error: 'Invalid maxPrice. Must be a non-negative number.' });
//             }
//             where.price = { ...where.price, lte: maxPriceNum };
//         }

//         // Filter by availability
//         if (isAvailable !== undefined) {
//             where.isAvailable = isAvailable === 'true';
//         }

//         // Exclude soft-deleted watches
//         where.deletedAt = null;

//         // Build the orderBy clause for sorting
//         const orderBy: any = {};
//         if (sortBy === 'price' || sortBy === 'name') {
//             orderBy[sortBy] = sortOrder === 'desc' ? 'desc' : 'asc';
//         } else {
//             return reply.status(400).send({ error: 'Invalid sortBy parameter. Use "price" or "name".' });
//         }

//         // Parse pagination parameters
//         const limitNum = parseInt(limit, 10);
//         const offsetNum = parseInt(offset, 10);
//         if (isNaN(limitNum) || limitNum <= 0) {
//             return reply.status(400).send({ error: 'Invalid limit parameter. Must be a positive number.' });
//         }
//         if (isNaN(offsetNum) || offsetNum < 0) {
//             return reply.status(400).send({ error: 'Invalid offset parameter. Must be a non-negative number.' });
//         }

//         // Fetch watches with related data
//         const watches = await prisma.watch.findMany({
//             where,
//             orderBy,
//             take: limitNum,
//             skip: offsetNum,
//             include: {
//                 brand: true,
//                 colors: { include: { color: true } },
//                 categories: { include: { category: true } },
//                 concepts: { include: { concept: true } },
//                 materials: { include: { material: true } },
//                 photos: true,
//                 specificationHeadings: {
//                     include: { specificationPoints: true },
//                 },
//                 bookings: { // Include bookings via BookingWatch
//                     include: {
//                         booking: {
//                             include: {
//                                 customer: true,
//                                 cryptoPayments: true, // Include CryptoPayment for bookings
//                             },
//                         },
//                     },
//                 },
//             },
//         });

//         // Fetch total count for pagination metadata
//         const totalCount = await prisma.watch.count({ where });

//         // Send the response
//         return reply.status(200).send({
//             data: watches,
//             pagination: {
//                 total: totalCount,
//                 limit: limitNum,
//                 offset: offsetNum,
//                 totalPages: Math.ceil(totalCount / limitNum),
//             },
//         });
//     } catch (error) {
//         request.log.error('Error fetching watches:', error);
//         return reply.status(500).send({ error: `Failed to fetch watches: ${(error as Error).message}` });
//     }
// };

const getAllCollectionsHandle = async (request, reply) => {
    try {
        const { page = 1, pageSize = 10, offset, limit, brand, category, concept, material, color, minPrice, maxPrice, isAvailable } = request.query;

        // Use offset and limit if provided, otherwise calculate from page and pageSize
        const skip = offset ? parseInt(offset) : (page - 1) * pageSize;
        const take = limit ? parseInt(limit) : parseInt(pageSize);

        const categoryMap = {
            sport: ['Dive Watch', 'Chronograph'],
            luxury: ['Dress Watch'],
            aviation: ['Pilot Watch'],
            'for-men': ['for-men'],
            'for-women': ['for-women'],
        };
        const conceptMap = {
            diving: ['Sport'],
            dress: ['Luxury', 'Modern'],
            vintage: ['Vintage'],
        };

        const where = {
            deletedAt: null,
        };

        if (brand) {
            // where.brand = { name: brand, mode: 'insensitive' };
        }
        if (category) {
            // const dbCategories = categoryMap[category.toLowerCase()] || [category];
            const dbCategories = [category];
            where.categories = {
                some: {
                    category: { name: { in: dbCategories } },
                },
            };
        }
        if (concept) {
            // const dbConcepts = conceptMap[concept.toLowerCase()] || [concept];
            const dbConcepts = [concept];
            where.concepts = {
                some: {
                    concept: { name: { in: dbConcepts } },
                },
            };
        }
        if (material) {
            where.materials = {
                some: {
                    material: { name: { equals: material, mode: 'insensitive' } },
                },
            };
        }
        if (color) {
            where.colors = {
                some: {
                    color: { name: { equals: color, mode: 'insensitive' } },
                },
            };
        }
        if (minPrice) {
            where.price = { gte: parseFloat(minPrice) };
        }
        if (maxPrice) {
            where.price = { ...where.price, lte: parseFloat(maxPrice) };
        }
        if (isAvailable !== undefined) {
            where.isAvailable = isAvailable === 'true';
        }

        const totalItems = await prisma.watch.count({ where });
        const watches = await prisma.watch.findMany({
            where,
            skip,
            take,
            include: {
                brand: { select: { name: true } },
                categories: { include: { category: { select: { name: true } } } },
                concepts: { include: { concept: { select: { name: true } } } },
                materials: { include: { material: { select: { name: true } } } },
                colors: { include: { color: { select: { name: true } } } },
            },
            orderBy: { createdAt: 'desc' },
        });

        const formattedWatches = watches.map(watch => ({
            id: watch.id,
            name: watch.name,
            description: watch.description,
            price: watch.price,
            stockQuantity: watch.stockQuantity,
            isAvailable: watch.isAvailable,
            brand: watch.brand,
            categories: watch.categories.map(c => ({ category: c.category })),
            concepts: watch.concepts.map(c => ({ concept: c.concept })),
            materials: watch.materials.map(m => ({ material: m.material })),
            colors: watch.colors.map(c => ({ color: c.color })),
            createdAt: watch.createdAt.toISOString(),
            updatedAt: watch.updatedAt.toISOString(),
            deletedAt: watch.deletedAt ? watch.deletedAt.toISOString() : null,
        }));

        return reply.status(200).send({
            success: true,
            // data: formattedWatches,
            data: watches,
            meta: {
                totalItems,
                totalPages: Math.ceil(totalItems / take),
                currentPage: offset ? Math.floor(offset / take) + 1 : parseInt(page),
                pageSize: take,
            },
        });
    } catch (error) {
        request.log.error('Error fetching collections:', error);
        return reply.status(500).send({ error: `Failed to fetch collections: ${error.message}` });
    }
};

const getAllCollectionsHandler = async (request, reply) => {
    try {
        const { page = 1, pageSize = 10, offset, limit, brand, category, concept, material, color, minPrice, maxPrice, isAvailable } = request.query;

        // Use offset and limit if provided, otherwise calculate from page and pageSize
        const skip = offset ? parseInt(offset) : (page - 1) * pageSize;
        const take = limit ? parseInt(limit) : parseInt(pageSize);

        const categoryMap = {
            sport: ['Dive Watch', 'Chronograph'],
            luxury: ['Dress Watch'],
            aviation: ['Pilot Watch'],
            'for-men': ['for-men'],
            'for-women': ['for-women'],
        };
        const conceptMap = {
            diving: ['Sport'],
            dress: ['Luxury', 'Modern'],
            vintage: ['Vintage'],
        };

        const where = {
            deletedAt: null,
        };

        if (brand) {
            where.brand = { name: { equals: brand, mode: 'insensitive' } };
        }
        if (category) {
            const dbCategories = categoryMap[category.toLowerCase()] || [category];
            where.categories = {
                some: {
                    category: { name: { in: dbCategories, mode: 'insensitive' } },
                },
            };
        }
        if (concept) {
            const dbConcepts = conceptMap[concept.toLowerCase()] || [concept];
            where.concepts = {
                some: {
                    concept: { name: { in: dbConcepts, mode: 'insensitive' } },
                },
            };
        }
        if (material) {
            where.materials = {
                some: {
                    material: { name: { equals: material, mode: 'insensitive' } },
                },
            };
        }
        if (color) {
            where.colors = {
                some: {
                    color: { name: { equals: color, mode: 'insensitive' } },
                },
            };
        }
        if (minPrice) {
            where.price = { gte: parseFloat(minPrice) };
        }
        if (maxPrice) {
            where.price = { ...where.price, lte: parseFloat(maxPrice) };
        }
        if (isAvailable !== undefined) {
            where.isAvailable = isAvailable === 'true';
        }

        const totalItems = await prisma.watch.count({ where });
        const watches = await prisma.watch.findMany({
            where,
            skip,
            take,
            include: {
                brand: { select: { name: true } },
                categories: { include: { category: { select: { name: true } } } },
                concepts: { include: { concept: { select: { name: true } } } },
                materials: { include: { material: { select: { name: true } } } },
                colors: { include: { color: { select: { name: true } } } },
            },
            orderBy: { createdAt: 'desc' },
        });

        const formattedWatches = watches.map(watch => ({
            id: watch.id,
            name: watch.name,
            description: watch.description,
            price: watch.price,
            stockQuantity: watch.stockQuantity,
            isAvailable: watch.isAvailable,
            brand: watch.brand,
            categories: watch.categories.map(c => ({ category: c.category })),
            concepts: watch.concepts.map(c => ({ concept: c.concept })),
            materials: watch.materials.map(m => ({ material: m.material })),
            colors: watch.colors.map(c => ({ color: c.color })),
            createdAt: watch.createdAt.toISOString(),
            updatedAt: watch.updatedAt.toISOString(),
            deletedAt: watch.deletedAt ? watch.deletedAt.toISOString() : null,
        }));

        return reply.status(200).send({
            success: true,
            data: formattedWatches,
            meta: {
                totalItems,
                totalPages: Math.ceil(totalItems / take),
                currentPage: offset ? Math.floor(offset / take) + 1 : parseInt(page),
                pageSize: take,
            },
        });
    } catch (error) {
        request.log.error('Error fetching collections:', error);
        return reply.status(500).send({ error: `Failed to fetch collections: ${error.message}` });
    }
};


// Fastify controller to fetch a watch by ID
const getWatchByIdHandler = async (
    request: FastifyRequest<{ Params: WatchParams }>,
    reply: FastifyReply
) => {
    try {
        const { id } = request.params;

        // Validate UUID format (basic check for 36-character UUID)
        if (!id || id.length !== 36) {
            return reply.status(400).send({ error: 'Invalid watch ID. Must be a valid UUID.' });
        }

        // Fetch watch with related data
        const watch = await prisma.watch.findFirst({
            where: {
                id,
                deletedAt: null, // Exclude soft-deleted watches
            },
            include: {
                brand: true,
                colors: { include: { color: true } },
                categories: { include: { category: true } },
                concepts: { include: { concept: true } },
                materials: { include: { material: true } },
                photos: true,
                specificationHeadings: {
                    include: { specificationPoints: true },
                },
                bookings: { // Include bookings via BookingWatch
                    include: {
                        booking: {
                            include: {
                                customer: true,
                                cryptoPayments: true, // Include CryptoPayment for bookings
                            },
                        },
                    },
                },
            },
        });

        // Check if watch exists
        if (!watch) {
            return reply.status(404).send({ error: 'Watch not found or has been deleted.' });
        }

        // Send the response
        return reply.status(200).send({ data: watch });
    } catch (error) {
        request.log.error('Error fetching watch by ID:', error);
        return reply.status(500).send({ error: `Failed to fetch watch: ${(error as Error).message}` });
    }
};

// Fastify controller to create a watch
const postWatchHandler = async (
    request: FastifyRequest<{ Body: CreateWatchBody }>,
    reply: FastifyReply
) => {
    try {
        const {
            name,
            price,
            referenceCode,
            description,
            primaryPhotoUrl,
            brandId,
            stockQuantity = 0,
            isAvailable = true,
            colors = [],
            categories = [],
            concepts = [],
            materials = [],
            photos = [],
            specificationHeadings = [],
        } = request.body;

        // Validate required fields
        if (!name || typeof name !== 'string' || name.length > 255) {
            return reply.status(400).send({ error: 'Invalid or missing name. Must be a string up to 255 characters.' });
        }
        if (!price || typeof price !== 'number' || price < 0 || price > 99999999.99) {
            return reply.status(400).send({ error: 'Invalid or missing price. Must be a number between 0 and 99999999.99.' });
        }
        if (!referenceCode || typeof referenceCode !== 'string' || referenceCode.length > 255) {
            return reply.status(400).send({ error: 'Invalid or missing referenceCode. Must be a string up to 255 characters.' });
        }
        if (!primaryPhotoUrl || typeof primaryPhotoUrl !== 'string' || primaryPhotoUrl.length > 500) {
            return reply.status(400).send({ error: 'Invalid or missing primaryPhotoUrl. Must be a string up to 500 characters.' });
        }
        if (!brandId || typeof brandId !== 'string' || brandId.length !== 36) {
            return reply.status(400).send({ error: 'Invalid or missing brandId. Must be a valid UUID.' });
        }
        if (typeof stockQuantity !== 'number' || stockQuantity < 0) {
            return reply.status(400).send({ error: 'Invalid stockQuantity. Must be a non-negative number.' });
        }
        if (typeof isAvailable !== 'boolean') {
            return reply.status(400).send({ error: 'Invalid isAvailable. Must be a boolean.' });
        }
        // Ensure isAvailable is false if stockQuantity is 0
        if (stockQuantity === 0 && isAvailable) {
            return reply.status(400).send({ error: 'Invalid isAvailable. Must be false if stockQuantity is 0.' });
        }

        // Validate brand exists
        const brand = await prisma.brand.findUnique({ where: { id: brandId } });
        if (!brand) {
            return reply.status(400).send({ error: 'Brand not found.' });
        }

        // Validate unique name and referenceCode
        const existingWatch = await prisma.watch.findFirst({
            where: {
                OR: [{ name }, { referenceCode }],
            },
        });
        if (existingWatch) {
            return reply.status(400).send({ error: 'Watch name or referenceCode already exists.' });
        }

        // Validate related IDs
        if (colors.length > 0) {
            const validColors = await prisma.color.findMany({ where: { id: { in: colors } } });
            if (validColors.length !== colors.length) {
                return reply.status(400).send({ error: 'One or more color IDs are invalid.' });
            }
        }
        if (categories.length > 0) {
            const validCategories = await prisma.category.findMany({ where: { id: { in: categories } } });
            if (validCategories.length !== categories.length) {
                return reply.status(400).send({ error: 'One or more category IDs are invalid.' });
            }
        }
        if (concepts.length > 0) {
            const validConcepts = await prisma.concept.findMany({ where: { id: { in: concepts } } });
            if (validConcepts.length !== concepts.length) {
                return reply.status(400).send({ error: 'One or more concept IDs are invalid.' });
            }
        }
        if (materials.length > 0) {
            const validMaterials = await prisma.material.findMany({ where: { id: { in: materials } } });
            if (validMaterials.length !== materials.length) {
                return reply.status(400).send({ error: 'One or more material IDs are invalid.' });
            }
        }

        // Validate photos
        if (photos.length > 0) {
            for (const photo of photos) {
                if (!photo.photoUrl || typeof photo.photoUrl !== 'string' || photo.photoUrl.length > 500) {
                    return reply.status(400).send({ error: 'Invalid photoUrl in photos. Must be a string up to 500 characters.' });
                }
                if (photo.altText && (typeof photo.altText !== 'string' || photo.altText.length > 255)) {
                    return reply.status(400).send({ error: 'Invalid altText in photos. Must be a string up to 255 characters or omitted.' });
                }
                if (photo.order !== undefined && (typeof photo.order !== 'number' || !Number.isInteger(photo.order) || photo.order < 0)) {
                    return reply.status(400).send({ error: 'Invalid order in photos. Must be a non-negative integer or omitted.' });
                }
            }
        }

        // Validate specification headings and points
        if (specificationHeadings.length > 0) {
            for (const heading of specificationHeadings) {
                if (!heading.heading || typeof heading.heading !== 'string' || heading.heading.length > 255) {
                    return reply.status(400).send({ error: 'Invalid heading in specificationHeadings. Must be a string up to 255 characters.' });
                }
                if (heading.description && (typeof heading.description !== 'string' || heading.description.length > 255)) {
                    return reply.status(400).send({ error: 'Invalid description in specificationHeadings. Must be a string up to 255 characters or omitted.' });
                }
                if (heading.specificationPoints && heading.specificationPoints.length > 0) {
                    for (const point of heading.specificationPoints) {
                        if (!point.label || typeof point.label !== 'string' || point.label.length > 255) {
                            return reply.status(400).send({ error: 'Invalid label in specificationPoints. Must be a string up to 255 characters.' });
                        }
                        if (!point.value || typeof point.value !== 'string' || point.value.length > 500) {
                            return reply.status(400).send({ error: 'Invalid value in specificationPoints. Must be a string up to 500 characters.' });
                        }
                    }
                }
            }
        }

        // Create watch and related data in a transaction
        const watch = await prisma.$transaction(async (prisma) => {
            // Create the watch
            const newWatch = await prisma.watch.create({
                data: {
                    name,
                    price,
                    referenceCode,
                    description,
                    primaryPhotoUrl,
                    brandId,
                    stockQuantity,
                    isAvailable,
                },
            });

            // Create related WatchColor records
            if (colors.length > 0) {
                await prisma.watchColor.createMany({
                    data: colors.map((colorId) => ({
                        watchId: newWatch.id,
                        colorId,
                    })),
                });
            }

            // Create related WatchCategory records
            if (categories.length > 0) {
                await prisma.watchCategory.createMany({
                    data: categories.map((categoryId) => ({
                        watchId: newWatch.id,
                        categoryId,
                    })),
                });
            }

            // Create related WatchConcept records
            if (concepts.length > 0) {
                await prisma.watchConcept.createMany({
                    data: concepts.map((conceptId) => ({
                        watchId: newWatch.id,
                        conceptId,
                    })),
                });
            }

            // Create related WatchMaterial records
            if (materials.length > 0) {
                await prisma.watchMaterial.createMany({
                    data: materials.map((materialId) => ({
                        watchId: newWatch.id,
                        materialId,
                    })),
                });
            }

            // Create related WatchPhoto records
            if (photos.length > 0) {
                await prisma.watchPhoto.createMany({
                    data: photos.map((photo) => ({
                        watchId: newWatch.id,
                        photoUrl: photo.photoUrl,
                        altText: photo.altText,
                        order: photo.order || 0,
                    })),
                });
            }

            // Create related WatchSpecificationHeading and WatchSpecificationPoint records
            if (specificationHeadings.length > 0) {
                for (const heading of specificationHeadings) {
                    const newHeading = await prisma.watchSpecificationHeading.create({
                        data: {
                            watchId: newWatch.id,
                            heading: heading.heading,
                            description: heading.description,
                        },
                    });

                    if (heading.specificationPoints && heading.specificationPoints.length > 0) {
                        await prisma.watchSpecificationPoint.createMany({
                            data: heading.specificationPoints.map((point) => ({
                                headingId: newHeading.id,
                                label: point.label,
                                value: point.value,
                            })),
                        });
                    }
                }
            }

            // Fetch the created watch with related data
            return prisma.watch.findUnique({
                where: { id: newWatch.id },
                include: {
                    brand: true,
                    colors: { include: { color: true } },
                    categories: { include: { category: true } },
                    concepts: { include: { concept: true } },
                    materials: { include: { material: true } },
                    photos: true,
                    specificationHeadings: {
                        include: { specificationPoints: true },
                    },
                    bookings: { // Include bookings via BookingWatch
                        include: {
                            booking: {
                                include: {
                                    customer: true,
                                    cryptoPayments: true, // Include CryptoPayment for bookings
                                },
                            },
                        },
                    },
                },
            });
        });

        // Send the response
        return reply.status(201).send({ data: watch });
    } catch (error) {
        request.log.error('Error creating watch:', error);
        return reply.status(500).send({ error: `Failed to create watch: ${(error as Error).message}` });
    }
};

export { getAllCollectionsHandler, getWatchByIdHandler, postWatchHandler };