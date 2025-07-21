// import Stripe from 'stripe';
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

// import Client from '@coinbase/coinbase-commerce-node';
// const { Charge } = Client.resources;
// Client.init(process.env.COINBASE_API_KEY);

// export async function processCardPayment(totalPrice: number): Promise<{ id: string; status: 'PAID' | 'FAILED' }> {
//     try {
//         const paymentIntent = await stripe.paymentIntents.create({
//             amount: Math.round(totalPrice * 100), // Convert to cents
//             currency: 'usd',
//             payment_method_types: ['card'],
//         });
//         // Assume client confirms payment (e.g., via frontend)
//         return { id: paymentIntent.id, status: 'PAID' };
//     } catch (error) {
//         return { id: '', status: 'FAILED' };
//     }
// }

// export async function processCryptoPayment(totalPrice: number): Promise<{ id: string; status: 'PAID' | 'FAILED' }> {
//     try {
//         const charge = await Charge.create({
//             name: 'Watch Store Order',
//             description: 'Payment for watch booking',
//             local_price: { amount: totalPrice.toString(), currency: 'USD' },
//             pricing_type: 'fixed_price',
//             metadata: { bookingId: 'temp' }, // Update with actual booking ID
//         });
//         return { id: charge.id, status: 'PENDING' }; // Status updates via webhook
//     } catch (error) {
//         return { id: '', status: 'FAILED' };
//     }
// }

// paymentService.mock.ts

type CardPaymentResponse = {
    id: string;
    status: 'PAID' | 'FAILED';
};

type CryptoPaymentResponse = {
    id: string;
    status: 'PENDING' | 'PAID' | 'FAILED';
};

// Mock function for card payments
export async function processCardPayment(
    totalPrice: number
): Promise<CardPaymentResponse> {
    // Simulate success
    return {
        id: `pi_mock_${Math.random().toString(36).substr(2, 9)}`,
        status: 'PAID',
    };
}

// Mock function for crypto payments
export async function processCryptoPayment(
    totalPrice: number
): Promise<CryptoPaymentResponse> {
    // Simulate pending (to be confirmed via webhook later)
    return {
        id: `ch_mock_${Math.random().toString(36).substr(2, 9)}`,
        status: 'PENDING',
    };
}