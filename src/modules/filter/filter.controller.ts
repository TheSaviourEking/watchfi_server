import prisma from "../../lib/prisma";

export const getFilterOptionsHandler = async (request, reply) => {
    try {
        const brands = await prisma.brand.findMany({
            where: { deletedAt: null },
            select: { name: true },
            orderBy: { name: 'asc' },
        });
        const categories = await prisma.category.findMany({
            // where: { deletedAt: null },
            select: { name: true },
            orderBy: { name: 'asc' },
        });
        const concepts = await prisma.concept.findMany({
            // where: { deletedAt: null },
            select: { name: true },
            orderBy: { name: 'asc' },
        });
        const materials = await prisma.material.findMany({
            // where: { deletedAt: null },
            select: { name: true },
            orderBy: { name: 'asc' },
        });
        const colors = await prisma.color.findMany({
            // where: { deletedAt: null },
            select: { name: true },
            orderBy: { name: 'asc' },
        });

        const categoryMap = {
            'Dress Watch': 'luxury',
            'Dive Watch': 'sport',
            'Chronograph': 'sport',
        };
        const conceptMap = {
            'Sport': 'diving',
            'Luxury': 'dress',
            'Modern': 'dress',
            'Vintage': 'vintage',
        };

        return reply.status(200).send({
            success: true,
            data: {
                brands: brands.map(brand => brand.name),
                categories: [
                    // ...categories.map(category => categoryMap[category.name] || category.name),
                    ...categories.map(category => category.name),
                    'for-men',
                    'for-women',
                ],
                // concepts: concepts.map(concept => conceptMap[concept.name] || concept.name),
                concepts: concepts.map(concept => concept.name),
                materials: materials.map(material => material.name.toLowerCase()),
                colors: colors.map(color => color.name.toLowerCase()),
            },
        });
    } catch (error) {
        request.log.error('Error fetching filter options:', error);
        return reply.status(500).send({ error: `Failed to fetch filter options: ${error.message}` });
    }
};