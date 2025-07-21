import { FastifyReply, FastifyRequest } from "fastify";

export const paymentWebhookHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const { paymentMethodId, status } = request.body; // Adjust based on webhook payload
        await prisma.booking.update({
            where: { paymentMethodId },
            data: { paymentStatus: status === 'succeeded' ? 'PAID' : 'FAILED' },
        });
        return reply.status(200).send({ received: true });
    } catch (error) {
        request.log.error('Error processing webhook:', error);
        return reply.status(500).send({ error: 'Webhook processing failed' });
    }
};