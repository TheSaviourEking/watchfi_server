import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../../lib/prisma";
import { processCardPayment, processCryptoPayment } from "../../lib/payment";
import { isValidSolanaWallet } from "../../lib/validation";
import { connect } from "http2";

// Define request body interface
// interface CreateBookingBody {
//     customerId: string;
//     watchItems: { watchId: string; quantity: number; unitPrice: number }[];
//     discount?: number;
//     paymentMethodId?: string;
//     shipmentAddress?: string;
//     paymentStatus?: 'PENDING' | 'PAID' | 'FAILED';
//     shipmentStatus?: 'PENDING' | 'SHIPPED' | 'DELIVERED';
//     status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
// }

interface CreateBookingBody {
    customerId: string;
    watchItems: { id: string; quantity: number; price: number }[];
    discount?: number;
    paymentMethodType?: 'CARD' | 'CRYPTO';
    shipmentAddress?: string;
    paymentStatus?: 'PENDING' | 'PAID' | 'FAILED';
    shipmentStatus?: 'PENDING' | 'SHIPPED' | 'DELIVERED';
    status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}

// Define query parameter interface
interface BookingQueryParams {
    customerId?: string;
    paymentStatus?: 'PENDING' | 'PAID' | 'FAILED';
    shipmentStatus?: 'PENDING' | 'SHIPPED' | 'DELIVERED';
    status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
    sortBy?: 'totalPrice' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
    limit?: string;
    offset?: string;
}

// Define params interface
interface BookingParams {
    id: string;
}

// export const getAllBookingsHandler = async (
//     request: FastifyRequest<{ Querystring: BookingQueryParams }>,
//     reply: FastifyReply
// ) => {
//     try {
//         // Extract query parameters with defaults
//         const {
//             customerId,
//             paymentStatus,
//             shipmentStatus,
//             status,
//             sortBy = 'createdAt', // Default sort by createdAt
//             sortOrder = 'desc', // Default descending (most recent first)
//             limit = '10', // Default 10 items per page
//             offset = '0', // Default no offset
//         } = request.query;

//         // Build the where clause for filtering
//         const where: any = {};

//         // Filter by customerId
//         if (customerId) {
//             if (typeof customerId !== 'string' || customerId.length !== 36) {
//                 return reply.status(400).send({ error: 'Invalid customerId. Must be a valid UUID.' });
//             }
//             const customer = await prisma.customer.findUnique({ where: { id: customerId } });
//             if (!customer) {
//                 return reply.status(400).send({ error: 'Customer not found.' });
//             }
//             where.customerId = customerId;
//         }

//         // Filter by paymentStatus
//         if (paymentStatus) {
//             if (!['PENDING', 'PAID', 'FAILED'].includes(paymentStatus)) {
//                 return reply.status(400).send({ error: 'Invalid paymentStatus. Must be PENDING, PAID, or FAILED.' });
//             }
//             where.paymentStatus = paymentStatus;
//         }

//         // Filter by shipmentStatus
//         if (shipmentStatus) {
//             if (!['PENDING', 'SHIPPED', 'DELIVERED'].includes(shipmentStatus)) {
//                 return reply.status(400).send({ error: 'Invalid shipmentStatus. Must be PENDING, SHIPPED, or DELIVERED.' });
//             }
//             where.shipmentStatus = shipmentStatus;
//         }

//         // Filter by status
//         if (status) {
//             if (!['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].includes(status)) {
//                 return reply.status(400).send({ error: 'Invalid status. Must be PENDING, CONFIRMED, CANCELLED, or COMPLETED.' });
//             }
//             where.status = status;
//         }

//         // Build the orderBy clause for sorting
//         const orderBy: any = {};
//         if (sortBy === 'totalPrice' || sortBy === 'createdAt') {
//             orderBy[sortBy] = sortOrder === 'desc' ? 'desc' : 'asc';
//         } else {
//             return reply.status(400).send({ error: 'Invalid sortBy parameter. Use "totalPrice" or "createdAt".' });
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

//         // Fetch bookings with related data
//         const bookings = await prisma.booking.findMany({
//             where,
//             orderBy,
//             take: limitNum,
//             skip: offsetNum,
//             include: {
//                 customer: true,
//                 watches: { include: { watch: true } },
//             },
//         });

//         // Fetch total count for pagination metadata
//         const totalCount = await prisma.booking.count({ where });

//         // Send the response
//         return reply.status(200).send({
//             data: bookings,
//             pagination: {
//                 total: totalCount,
//                 limit: limitNum,
//                 offset: offsetNum,
//                 totalPages: Math.ceil(totalCount / limitNum),
//             },
//         });
//     } catch (error) {
//         request.log.error('Error fetching bookings:', error);
//         return reply.status(500).send({ error: `Failed to fetch bookings: ${(error as Error).message}` });
//     }
// };

// export const getBookingByIdHandler = async (
//     request: FastifyRequest<{ Params: BookingParams }>,
//     reply: FastifyReply
// ) => {
//     try {
//         const { id } = request.params;

//         // Validate UUID format (basic check for 36-character UUID)
//         if (!id || id.length !== 36) {
//             return reply.status(400).send({ error: 'Invalid booking ID. Must be a valid UUID.' });
//         }

//         // Fetch booking with related data
//         const booking = await prisma.booking.findUnique({
//             where: {
//                 id,
//             },
//             include: {
//                 customer: true,
//                 watches: { include: { watch: true } },
//             },
//         });

//         // Check if booking exists
//         if (!booking) {
//             return reply.status(404).send({ error: 'Booking not found.' });
//         }

//         // Send the response
//         return reply.status(200).send({ data: booking });
//     } catch (error) {
//         request.log.error('Error fetching booking by ID:', error);
//         return reply.status(500).send({ error: `Failed to fetch booking: ${(error as Error).message}` });
//     }
// };

export const getAllBookingsHandler = async (
    request: FastifyRequest<{ Querystring: BookingQueryParams }>,
    reply: FastifyReply
) => {
    try {
        // Extract query parameters with defaults
        const {
            customerId,
            paymentStatus,
            shipmentStatus,
            status,
            sortBy = 'createdAt', // Default sort by createdAt
            sortOrder = 'desc', // Default descending (most recent first)
            limit = '10', // Default 10 items per page
            offset = '0', // Default no offset
        } = request.query;

        // Build the where clause for filtering
        const where: any = {};

        // Filter by customerId
        if (customerId) {
            if (typeof customerId !== 'string' || customerId.length !== 36) {
                return reply.status(400).send({ error: 'Invalid customerId. Must be a valid UUID.' });
            }
            const customer = await prisma.customer.findUnique({ where: { id: customerId } });
            if (!customer) {
                return reply.status(400).send({ error: 'Customer not found.' });
            }
            where.customerId = customerId;
        }

        // Filter by paymentStatus
        if (paymentStatus) {
            if (!['PENDING', 'PAID', 'FAILED', 'CONFIRMING'].includes(paymentStatus)) {
                return reply.status(400).send({ error: 'Invalid paymentStatus. Must be PENDING, PAID, FAILED, or CONFIRMING.' });
            }
            where.paymentStatus = paymentStatus;
        }

        // Filter by shipmentStatus
        if (shipmentStatus) {
            if (!['PENDING', 'SHIPPED', 'DELIVERED'].includes(shipmentStatus)) {
                return reply.status(400).send({ error: 'Invalid shipmentStatus. Must be PENDING, SHIPPED, or DELIVERED.' });
            }
            where.shipmentStatus = shipmentStatus;
        }

        // Filter by status
        if (status) {
            if (!['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].includes(status)) {
                return reply.status(400).send({ error: 'Invalid status. Must be PENDING, CONFIRMED, CANCELLED, or COMPLETED.' });
            }
            where.status = status;
        }

        // Build the orderBy clause for sorting
        const orderBy: any = {};
        if (sortBy === 'totalPrice' || sortBy === 'createdAt') {
            orderBy[sortBy] = sortOrder === 'desc' ? 'desc' : 'asc';
        } else {
            return reply.status(400).send({ error: 'Invalid sortBy parameter. Use "totalPrice" or "createdAt".' });
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

        // Fetch bookings with related data
        const bookings = await prisma.booking.findMany({
            where,
            orderBy,
            take: limitNum,
            skip: offsetNum,
            include: {
                customer: true,
                watches: { include: { watch: true } },
                cryptoPayments: true, // Include CryptoPayment relation
            },
        });

        // Fetch total count for pagination metadata
        const totalCount = await prisma.booking.count({ where });

        // Send the response
        return reply.status(200).send({
            data: bookings,
            pagination: {
                total: totalCount,
                limit: limitNum,
                offset: offsetNum,
                totalPages: Math.ceil(totalCount / limitNum),
            },
        });
    } catch (error) {
        request.log.error('Error fetching bookings:', error);
        return reply.status(500).send({ error: `Failed to fetch bookings: ${(error as Error).message}` });
    }
};

export const getBookingByIdHandler = async (
    request: FastifyRequest<{ Params: BookingParams }>,
    reply: FastifyReply
) => {
    try {
        const { id } = request.params;

        // Validate UUID format (basic check for 36-character UUID)
        if (!id || id.length !== 36) {
            return reply.status(400).send({ error: 'Invalid booking ID. Must be a valid UUID.' });
        }

        // Fetch booking with related data
        const booking = await prisma.booking.findUnique({
            where: {
                id,
            },
            include: {
                customer: true,
                watches: { include: { watch: true } },
                cryptoPayments: true, // Include CryptoPayment relation
            },
        });

        // Check if booking exists
        if (!booking) {
            return reply.status(404).send({ error: 'Booking not found.' });
        }

        // Send the response
        return reply.status(200).send({ data: booking });
    } catch (error) {
        request.log.error('Error fetching booking by ID:', error);
        return reply.status(500).send({ error: `Failed to fetch booking: ${(error as Error).message}` });
    }
};

export const postBookingHandler = async (
    request: FastifyRequest<{
        Body: {
            customerId: string;
            watchItems: { id: string; quantity: number; price: number }[];
            discount?: number;
            transactionHash: string;
            paymentType: 'SOL' | 'USDC';
            senderWallet: string;
            receiverWallet: string;
            usdValue: number;
            shipmentAddress?: string;
            paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'CONFIRMING';
            shipmentStatus?: 'PENDING' | 'SHIPPED' | 'DELIVERED';
            status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
        };
    }>,
    reply: FastifyReply
) => {
    // console.log('Incoming body:', request.body);
    try {
        const {
            customerId,
            watchItems,
            discount = 0,
            transactionHash,
            paymentType,
            senderWallet,
            receiverWallet,
            usdValue,
            shipmentAddress,
            paymentStatus = 'PENDING',
            shipmentStatus = 'PENDING',
            status = 'PENDING',
        } = request.body;

        console.log(1)

        // // Validate required fields
        // if (!customerId || typeof customerId !== 'string' || customerId.length !== 36) {
        //     return reply.status(400).send({ error: 'Invalid or missing customerId. Must be a valid UUID.' });
        // }
        if (!customerId || !isValidSolanaWallet(customerId)) {
            return reply.status(400).send({ error: 'Invalid Solana wallet address.' });
        }
        console.log(2)
        if (!watchItems || !Array.isArray(watchItems) || watchItems.length === 0) {
            return reply.status(400).send({ error: 'Invalid or missing watchItems. Must be a non-empty array.' });
        }
        console.log(3)
        if (discount < 0 || discount > 99999999.99) {
            return reply.status(400).send({ error: 'Invalid discount. Must be between 0 and 99999999.99.' });
        }
        console.log(4)
        if (!['SOL', 'USDC'].includes(paymentType)) {
            return reply.status(400).send({ error: 'Invalid paymentType. Must be SOL or USDC.' });
        }
        console.log(5)
        if (!transactionHash || typeof transactionHash !== 'string' || transactionHash.length > 88) {
            return reply.status(400).send({ error: 'Invalid transactionHash. Must be a string up to 88 characters.' });
        }
        console.log(6)
        // if (!senderWallet || typeof senderWallet !== 'string' || senderWallet.length !== 44) {
        //     return reply.status(400).send({ error: 'Invalid senderWallet. Must be a valid Solana wallet address (44 characters).' });
        // }
        console.log(7)

        if (!senderWallet || !isValidSolanaWallet(senderWallet)) {
            return reply.status(400).send({ error: 'Invalid Solana wallet address.' });
        }
        console.log(8)
        // if (!receiverWallet || typeof receiverWallet !== 'string' || receiverWallet.length !== 44) {
        //     return reply.status(400).send({ error: 'Invalid receiverWallet. Must be a valid Solana wallet address (44 characters).' });
        // }
        if (!receiverWallet || !isValidSolanaWallet(receiverWallet)) {
            return reply.status(400).send({ error: 'Invalid Solana wallet address.' });
        }
        console.log(9)

        if (!usdValue || typeof usdValue !== 'number' || usdValue < 0 || usdValue > 99999999.99) {
            return reply.status(400).send({ error: 'Invalid usdValue. Must be a number between 0 and 99999999.99.' });
        }
        console.log(10)
        if (shipmentAddress && (typeof shipmentAddress !== 'string' || shipmentAddress.length > 256)) {
            return reply.status(400).send({ error: 'Invalid shipmentAddress. Must be a string up to 256 characters.' });
        }
        console.log(12)
        if (!['PENDING', 'PAID', 'FAILED', 'CONFIRMING'].includes(paymentStatus)) {
            return reply.status(400).send({ error: 'Invalid paymentStatus. Must be PENDING, PAID, FAILED, or CONFIRMING.' });
        }
        console.log(13)
        if (!['PENDING', 'SHIPPED', 'DELIVERED'].includes(shipmentStatus)) {
            return reply.status(400).send({ error: 'Invalid shipmentStatus. Must be PENDING, SHIPPED, or DELIVERED.' });
        }
        console.log(14)
        if (!['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].includes(status)) {
            return reply.status(400).send({ error: 'Invalid status. Must be PENDING, CONFIRMED, CANCELLED, or COMPLETED.' });
        }
        console.log(15)

        // Validate watchItems
        for (const item of watchItems) {
            console.log(item?.id)
            if (!item.id || typeof item.id !== 'string' || item.id.length !== 36) {
                return reply.status(400).send({ error: 'Invalid watchId in watchItems. Must be a valid UUID.' });
            }
            if (!item.quantity || typeof item.quantity !== 'number' || item.quantity < 1 || !Number.isInteger(item.quantity)) {
                return reply.status(400).send({ error: 'Invalid quantity in watchItems. Must be a positive integer.' });
            }
            if (!item.price || !Number(item.price) || item.price < 0 || item.price > 99999999.99) {
                return reply.status(400).send({ error: 'Invalid Price in watchItems. Must be a number between 0 and 99999999.99.' });
            }
        }

        console.log('After Item listing')

        // Validate customer exists and has a valid wallet address
        // const customer = await prisma.customer.findUnique({ where: { id: customerId } });
        const customer = await prisma.customer.findUnique({ where: { walletAddress: senderWallet } });
        console.log('Gotten Customer')
        if (!customer) {
            return reply.status(400).send({ error: 'Customer not found.' });
        }
        if (!customer.walletAddress || customer.walletAddress !== senderWallet) {
            return reply.status(400).send({ error: 'Invalid senderWallet. Must match customer\'s wallet address.' });
        }
        console.log('After customer ')

        // console.log(customer, 'CUSOTMER');

        // Validate watches exist and are available
        const watchIds = watchItems.map(item => item.id);
        const watches = await prisma.watch.findMany({
            where: {
                id: { in: watchIds },
                isAvailable: true,
                deletedAt: null,
            }
        });
        console.log('watches gotten')
        if (watches.length !== watchItems.length) {
            return reply.status(400).send({ error: 'One or more watches are invalid, unavailable, or deleted.' });
        }

        // console.log(watches, 'WATCHES')

        // Validate stock quantities
        for (const item of watchItems) {
            console.log('In watch items array')
            const watch = watches.find(w => w.id === item.id);
            console.log(watch, item)
            // if (!watch || item.quantity > watch.stockQuantity) {
            if (!watch) {
                return reply.status(400).send({ error: `Insufficient stock for watch ${watch?.name || item.id}. Available: ${watch?.stockQuantity || 0}, Requested: ${item.quantity}.` });
            }
        }

        // Validate unique watchIds in watchItems
        const uniqueWatchIds = new Set(watchItems.map(item => item.id));
        console.log('unique watches')
        if (uniqueWatchIds.size !== watchItems.length) {
            return reply.status(400).send({ error: 'Duplicate watchIds in watchItems are not allowed.' });
        }

        // Calculate totalPrice
        const subtotal = watchItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
        console.log('sub total')
        const totalPrice = Math.max(0, subtotal - discount);

        // Validate crypto payment (mocked for now, replace with actual blockchain validation)
        // const cryptoPaymentResult = await processCryptoPayment({ transactionHash, paymentType, amount: totalPrice, senderWallet, receiverWallet });
        const cryptoPaymentResult = { status: paymentStatus, confirmations: 0, isConfirmed: paymentStatus === 'PAID' || paymentStatus === 'CONFIRMING' };
        console.log('crypto payment', cryptoPaymentResult)

        console.log(cryptoPaymentResult, 'CRYPTO')

        // Create booking and related data in a transaction
        const booking = await prisma.$transaction(async (prisma) => {
            // Create the booking
            const newBooking = await prisma.booking.create({
                data: {
                    // customerId: customer.id,
                    totalPrice,
                    discount,
                    paymentStatus,
                    shipmentStatus,
                    status,
                    shipmentAddress,
                    customer: {
                        connect: { id: customer.id }
                    }
                },
            });

            console.log(1, '1');

            // Create BookingWatch records
            await prisma.bookingWatch.createMany({
                data: watchItems.map(item => ({
                    bookingId: newBooking.id,
                    watchId: item.id,
                    quantity: item.quantity,
                    unitPrice: item.price,
                })),
            });

            console.log(2)

            const exists = await prisma.cryptoPayment.findUnique({
                where: { transactionHash },
            });
            if (exists) {
                // skip creation or return the existing booking
                return reply.code(409).send({ error: 'Transaction already recorded.' });
            }
            console.log(3)
            // Create CryptoPayment record
            await prisma.cryptoPayment.create({
                data: {
                    bookingId: newBooking.id,
                    transactionHash,
                    paymentType,
                    amount: totalPrice,
                    usdValue,
                    senderWallet,
                    receiverWallet,
                    confirmations: cryptoPaymentResult.confirmations,
                    isConfirmed: cryptoPaymentResult.isConfirmed,
                    blockTime: cryptoPaymentResult.isConfirmed ? new Date() : null,
                },
            });

            console.log(4)

            // Update stock quantities
            for (const item of watchItems) {
                await prisma.watch.update({
                    where: { id: item.id },
                    data: { stockQuantity: { decrement: item.quantity } },
                });
            }

            console.log(5)

            // Fetch the created booking with related data
            return prisma.booking.findUnique({
                where: { id: newBooking.id },
                include: {
                    customer: true,
                    watches: { include: { watch: true } },
                    cryptoPayments: true,
                },
            });

            console.log(6)
        });

        // Send the response
        return reply.status(201).send({ data: booking });
    } catch (error) {
        console.log(error, 'ERROR')
        request.log.error('Error creating booking:', error);
        return reply.status(500).send({ error: `Failed to create booking: ${(error as Error).message}` });
    }
};

// Fastify controller to create a booking
// export const postBookingHandler = async (
//     request: FastifyRequest<{ Body: CreateBookingBody }>,
//     reply: FastifyReply
// ) => {
//     try {
//         const {
//             customerId,
//             watchItems,
//             discount = 0,
//             paymentMethodType,
//             shipmentAddress,
//             paymentStatus = 'PENDING',
//             shipmentStatus = 'PENDING',
//             status = 'PENDING',
//         } = request.body;

//         // Validate required fields
//         if (!customerId || typeof customerId !== 'string' || customerId.length !== 36) {
//             return reply.status(400).send({ error: 'Invalid or missing customerId. Must be a valid UUID.' });
//         }
//         if (!watchItems || !Array.isArray(watchItems) || watchItems.length === 0) {
//             return reply.status(400).send({ error: 'Invalid or missing watchItems. Must be a non-empty array.' });
//         }
//         if (discount < 0 || discount > 99999999.99) {
//             return reply.status(400).send({ error: 'Invalid discount. Must be between 0 and 99999999.99.' });
//         }
//         if (paymentMethodType && !['CARD', 'CRYPTO'].includes(paymentMethodType)) {
//             return reply.status(400).send({ error: 'Invalid paymentMethodType. Must be CARD or CRYPTO.' });
//         }
//         if (shipmentAddress && (typeof shipmentAddress !== 'string' || shipmentAddress.length > 256)) {
//             return reply.status(400).send({ error: 'Invalid shipmentAddress. Must be a string up to 256 characters.' });
//         }
//         if (!['PENDING', 'PAID', 'FAILED'].includes(paymentStatus)) {
//             return reply.status(400).send({ error: 'Invalid paymentStatus. Must be PENDING, PAID, or FAILED.' });
//         }
//         if (!['PENDING', 'SHIPPED', 'DELIVERED'].includes(shipmentStatus)) {
//             return reply.status(400).send({ error: 'Invalid shipmentStatus. Must be PENDING, SHIPPED, or DELIVERED.' });
//         }
//         if (!['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].includes(status)) {
//             return reply.status(400).send({ error: 'Invalid status. Must be PENDING, CONFIRMED, CANCELLED, or COMPLETED.' });
//         }

//         // Validate watchItems
//         for (const item of watchItems) {
//             if (!item.watchId || typeof item.watchId !== 'string' || item.watchId.length !== 36) {
//                 return reply.status(400).send({ error: 'Invalid watchId in watchItems. Must be a valid UUID.' });
//             }
//             if (!item.quantity || typeof item.quantity !== 'number' || item.quantity < 1 || !Number.isInteger(item.quantity)) {
//                 return reply.status(400).send({ error: 'Invalid quantity in watchItems. Must be a positive integer.' });
//             }
//             if (!item.unitPrice || typeof item.unitPrice !== 'number' || item.unitPrice < 0 || item.unitPrice > 99999999.99) {
//                 return reply.status(400).send({ error: 'Invalid unitPrice in watchItems. Must be a number between 0 and 99999999.99.' });
//             }
//         }

//         // Validate customer exists
//         const customer = await prisma.customer.findUnique({ where: { id: customerId } });
//         if (!customer) {
//             return reply.status(400).send({ error: 'Customer not found.' });
//         }

//         // Validate watches exist and are available
//         const watchIds = watchItems.map(item => item.watchId);
//         const watches = await prisma.watch.findMany({
//             where: {
//                 id: { in: watchIds },
//                 isAvailable: true,
//                 deletedAt: null,
//             },
//         });
//         if (watches.length !== watchItems.length) {
//             return reply.status(400).send({ error: 'One or more watches are invalid, unavailable, or deleted.' });
//         }

//         // Validate stock quantities
//         for (const item of watchItems) {
//             const watch = watches.find(w => w.id === item.watchId);
//             if (!watch || item.quantity > watch.stockQuantity) {
//                 return reply.status(400).send({ error: `Insufficient stock for watch ${watch?.name || item.watchId}. Available: ${watch?.stockQuantity || 0}, Requested: ${item.quantity}.` });
//             }
//         }

//         // Validate unique watchIds in watchItems
//         const uniqueWatchIds = new Set(watchItems.map(item => item.watchId));
//         if (uniqueWatchIds.size !== watchItems.length) {
//             return reply.status(400).send({ error: 'Duplicate watchIds in watchItems are not allowed.' });
//         }

//         // Calculate totalPrice
//         const subtotal = watchItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
//         const totalPrice = Math.max(0, subtotal - discount);

//         // Process payment if paymentMethodType is provided
//         let paymentMethodId: string | null = null;
//         let finalPaymentStatus = paymentStatus;
//         if (paymentMethodType) {
//             // const paymentResult = paymentMethodType === 'CARD' ? await processCardPayment(totalPrice) : await processCryptoPayment(totalPrice);
//             const paymentResult = 
//             const paymentMethod = await prisma.paymentMethod.create({
//                 data: {
//                     type: paymentMethodType,
//                     gatewayId: paymentResult.id,
//                     customerId,
//                     details: paymentMethodType === 'CARD' ? 'Card ending in 1234' : 'Crypto wallet 0xabc...',
//                 },
//             });
//             paymentMethodId = paymentMethod.id;
//             finalPaymentStatus = paymentResult.status;
//         }
//         // if (paymentMethodType) {
//         //     let paymentResult;
//         //     if (paymentMethodType === 'CARD') {
//         //         paymentResult = await processCardPayment(totalPrice);
//         //     } else if (paymentMethodType === 'CRYPTO') {
//         //         paymentResult = await processCryptoPayment(totalPrice);
//         //     }
//         //     paymentMethodId = paymentResult.id;
//         //     finalPaymentStatus = paymentResult.status;
//         // }

//         // Create booking and related data in a transaction
//         const booking = await prisma.$transaction(async (prisma) => {
//             // Create the booking
//             const newBooking = await prisma.booking.create({
//                 data: {
//                     customerId,
//                     totalPrice,
//                     discount,
//                     paymentMethodId,
//                     paymentStatus: finalPaymentStatus,
//                     shipmentStatus,
//                     status,
//                     shipmentAddress,
//                 },
//             });

//             // Create BookingWatch records
//             await prisma.bookingWatch.createMany({
//                 data: watchItems.map(item => ({
//                     bookingId: newBooking.id,
//                     watchId: item.watchId,
//                     quantity: item.quantity,
//                     unitPrice: item.unitPrice,
//                 })),
//             });

//             // Update stock quantities
//             for (const item of watchItems) {
//                 await prisma.watch.update({
//                     where: { id: item.watchId },
//                     data: { stockQuantity: { decrement: item.quantity } },
//                 });
//             }

//             // Fetch the created booking with related data
//             return prisma.booking.findUnique({
//                 where: { id: newBooking.id },
//                 include: {
//                     customer: true,
//                     watches: { include: { watch: true } },
//                 },
//             });
//         });

//         // Send the response
//         return reply.status(201).send({ data: booking });
//     } catch (error) {
//         request.log.error('Error creating booking:', error);
//         return reply.status(500).send({ error: `Failed to create booking: ${(error as Error).message}` });
//     }
// };