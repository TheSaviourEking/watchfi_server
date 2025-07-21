import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../../lib/prisma";
import { isValidSolanaWallet } from "../../lib/validation";

interface CreateCustomerBody {
    pseudonym: string;
    walletAddress?: string; // Added for Solana wallet address
}

// Define params interface
interface CustomerParams {
    id: string;
}

// Define query parameter interface
interface CustomerQueryParams {
    pseudonym?: string;
    walletAddress?: string; // Added for filtering by wallet address
    sortBy?: 'pseudonym' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
    limit?: string;
    offset?: string;
}

// Fastify controller to fetch all customers
export const getAllCustomersHandler = async (
    request: FastifyRequest<{ Querystring: CustomerQueryParams }>,
    reply: FastifyReply
) => {
    try {
        // Extract query parameters with defaults
        const {
            pseudonym,
            walletAddress,
            sortBy = 'pseudonym', // Default sort by pseudonym
            sortOrder = 'asc', // Default ascending
            limit = '10', // Default 10 items per page
            offset = '0', // Default no offset
        } = request.query;

        // Build the where clause for filtering
        const where: any = {};

        // Filter by pseudonym (case-insensitive partial match)
        if (pseudonym) {
            if (typeof pseudonym !== 'string' || pseudonym.length > 100) {
                return reply.status(400).send({ error: 'Invalid pseudonym. Must be a string up to 100 characters.' });
            }
            where.pseudonym = {
                contains: pseudonym,
                mode: 'insensitive',
            };
        }

        // Filter by walletAddress
        if (walletAddress) {
            if (typeof walletAddress !== 'string' || walletAddress.length !== 44) {
                return reply.status(400).send({ error: 'Invalid walletAddress. Must be a valid Solana wallet address (44 characters).' });
            }
            where.walletAddress = walletAddress;
        }

        // Build the orderBy clause for sorting
        const orderBy: any = {};
        if (sortBy === 'pseudonym' || sortBy === 'createdAt') {
            orderBy[sortBy] = sortOrder === 'desc' ? 'desc' : 'asc';
        } else {
            return reply.status(400).send({ error: 'Invalid sortBy parameter. Use "pseudonym" or "createdAt".' });
        }

        // Parse pagination parameters
        const limitNum = parseInt(limit, 10);
        const offsetNum = parseInt(offset, 10);
        if (isNaN(limitNum) || limitNum <= 0) {
            return reply.status(400).send({ error: 'Invalid limit parameter. Must be a positive number.' });
        }
        if (isNaN(offsetNum) || offsetNum < 0) {
            return reply.status(400).send({ error: 'Invalid offset parameter. Must be a non-negative number.' });
        }

        // Fetch customers with related data
        const customers = await prisma.customer.findMany({
            where,
            orderBy,
            take: limitNum,
            skip: offsetNum,
            include: {
                bookings: {
                    include: {
                        watches: {
                            include: {
                                watch: true,
                            },
                        },
                        cryptoPayments: true, // Include CryptoPayment relation
                    },
                },
            },
        });

        // Fetch total count for pagination metadata
        const totalCount = await prisma.customer.count({ where });

        // Send the response
        return reply.status(200).send({
            data: customers,
            pagination: {
                total: totalCount,
                limit: limitNum,
                offset: offsetNum,
                totalPages: Math.ceil(totalCount / limitNum),
            },
        });
    } catch (error) {
        request.log.error('Error fetching customers:', error);
        return reply.status(500).send({ error: `Failed to fetch customers: ${(error as Error).message}` });
    }
};

// Fastify controller to fetch a customer by ID
export const getCustomerByIdHandler = async (
    request: FastifyRequest<{ Params: CustomerParams }>,
    reply: FastifyReply
) => {
    try {
        const { id } = request.params;

        // Validate UUID format (basic check for 36-character UUID)
        // if (!id || id.length !== 36) {
        if (!id || !isValidSolanaWallet(id)) {
            return reply.status(400).send({ error: 'Invalid Solana wallet address.' });
        }
        // if (!id || id.length !== 36) {
        //     return reply.status(400).send({ error: 'Invalid customer ID. Must be a valid UUID.' });
        // }

        // Fetch customer with related data
        const customer = await prisma.customer.findUnique({
            where: {
                id,
            },
            include: {
                bookings: {
                    include: {
                        watches: {
                            include: {
                                watch: true,
                            },
                        },
                        cryptoPayments: true, // Include CryptoPayment relation
                    },
                },
            },
        });

        // Check if customer exists
        if (!customer) {
            return reply.status(404).send({ error: 'Customer not found.' });
        }

        // Send the response
        return reply.status(200).send({ data: customer });
    } catch (error) {
        request.log.error('Error fetching customer by ID:', error);
        return reply.status(500).send({ error: `Failed to fetch customer: ${(error as Error).message}` });
    }
};

// Fastify controller to create a customer
export const postCustomerHandler = async (
    request: FastifyRequest<{ Body: CreateCustomerBody }>,
    reply: FastifyReply
) => {
    try {
        const { pseudonym, walletAddress } = request.body;

        // Validate required fields
        // if (!pseudonym || typeof pseudonym !== 'string' || pseudonym.length > 100) {
        //     return reply.status(400).send({ error: 'Invalid or missing pseudonym. Must be a string up to 100 characters.' });
        // }
        // if (walletAddress && (typeof walletAddress !== 'string' || walletAddress.length !== 44)) {
        //     return reply.status(400).send({ error: 'Invalid walletAddress. Must be a valid Solana wallet address (44 characters) or omitted.' });
        // }

        if (!walletAddress || !isValidSolanaWallet(walletAddress)) {
            return reply.status(400).send({ error: 'Invalid Solana wallet address.' });
        }


        // Validate unique pseudonym
        // const existingCustomerByPseudonym = await prisma.customer.findUnique({
        //     where: { pseudonym }
        // });
        // if (existingCustomerByPseudonym) {
        //     return reply.status(400).send({ error: 'Pseudonym already exists.' });
        // }

        // Validate unique walletAddress if provided
        if (walletAddress) {
            const existingCustomerByWallet = await prisma.customer.findUnique({
                where: { walletAddress },
            });
            if (existingCustomerByWallet) {
                // return reply.status(400).send({ error: 'Wallet address already exists.' });
                return reply.status(201).send({ data: existingCustomerByWallet });
            }
        }

        // Create customer
        const customer = await prisma.customer.create({
            data: {
                pseudonym,
                walletAddress, // Include walletAddress if provided
            },
            include: {
                bookings: {
                    include: {
                        watches: { include: { watch: true } },
                        cryptoPayments: true, // Include CryptoPayment relation
                    },
                },
            },
        });

        // Send the response
        return reply.status(201).send({ data: customer });
    } catch (error) {
        request.log.error('Error creating customer:', error);
        return reply.status(500).send({ error: `Failed to create customer: ${(error as Error).message}` });
    }
};