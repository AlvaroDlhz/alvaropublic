const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Transaction = require('../models/Transaction');

class PaymentService {
    static async createPaymentIntent(amount, currency = 'cop') {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount * 100, // Stripe usa centavos
                currency: currency
            });

            return {
                clientSecret: paymentIntent.client_secret,
                id: paymentIntent.id
            };
        } catch (error) {
            console.error('Error al crear intento de pago:', error);
            throw new Error('Error al procesar el pago');
        }
    }

    static async processPayment(userId, amount, concepto) {
        try {
            const transaction = new Transaction({
                usuario: userId,
                monto: amount,
                concepto: concepto,
                estado: 'pendiente'
            });

            const paymentIntent = await this.createPaymentIntent(amount);
            transaction.paymentIntentId = paymentIntent.id;
            await transaction.save();

            return {
                transactionId: transaction._id,
                clientSecret: paymentIntent.clientSecret
            };
        } catch (error) {
            console.error('Error al procesar pago:', error);
            throw new Error('Error en el procesamiento del pago');
        }
    }

    static async confirmPayment(paymentIntentId) {
        try {
            const transaction = await Transaction.findOne({ 
                paymentIntentId: paymentIntentId 
            });

            if (!transaction) {
                throw new Error('Transacción no encontrada');
            }

            const paymentIntent = await stripe.paymentIntents.retrieve(
                paymentIntentId
            );

            if (paymentIntent.status === 'succeeded') {
                transaction.estado = 'completado';
                transaction.fechaCompletado = new Date();
                await transaction.save();

                // Actualizar puntos del usuario si aplica
                if (transaction.concepto === 'premium') {
                    await User.findByIdAndUpdate(
                        transaction.usuario,
                        { 
                            $inc: { puntos: 1000 },
                            $set: { isPremium: true }
                        }
                    );
                }

                return transaction;
            } else {
                transaction.estado = 'fallido';
                await transaction.save();
                throw new Error('Pago no completado');
            }
        } catch (error) {
            console.error('Error al confirmar pago:', error);
            throw new Error('Error en la confirmación del pago');
        }
    }
} 