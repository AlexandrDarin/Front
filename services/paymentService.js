const YooKassa = require('yookassa');
const crypto = require('crypto');

const yookassa = new YooKassa({
    shopId: process.env.YOOKASSA_SHOP_ID || '123456',
    secretKey: process.env.YOOKASSA_SECRET_KEY || 'test_secret_key'
});

class PaymentService {
    /**
     * Создание платежа
     */
    async createPayment(order, user, returnUrl) {
        const idempotenceKey = crypto.randomBytes(16).toString('hex');
        
        const payment = await yookassa.createPayment({
            amount: {
                value: (order.total_amount / 100).toFixed(2),
                currency: 'RUB'
            },
            capture: true,
            confirmation: {
                type: 'redirect',
                return_url: returnUrl
            },
            description: `Оплата заказа #${order.id}`,
            metadata: {
                order_id: order.id,
                user_id: user.id
            }
        }, idempotenceKey);

        return {
            id: payment.id,
            confirmationUrl: payment.confirmation.confirmation_url,
            status: payment.status
        };
    }

    /**
     * Проверка статуса платежа
     */
    async getPaymentStatus(paymentId) {
        const payment = await yookassa.getPayment(paymentId);
        return payment;
    }

    /**
     * Обработка webhook от YooKassa
     */
    async handleWebhook(event) {
        const { event: eventType, object: payment } = event;
        
        if (eventType === 'payment.succeeded') {
            const { order_id } = payment.metadata;
            
            return {
                success: true,
                orderId: order_id,
                paymentId: payment.id,
                status: 'succeeded'
            };
        }
        
        if (eventType === 'payment.canceled') {
            const { order_id } = payment.metadata;
            
            return {
                success: false,
                orderId: order_id,
                paymentId: payment.id,
                status: 'canceled'
            };
        }
        
        return null;
    }

    /**
     * Генерация чека
     */
    async createReceipt(paymentId, items, email) {
        const receipt = {
            customer: { email },
            items: items.map(item => ({
                description: item.product_title,
                quantity: item.quantity,
                amount: {
                    value: (item.price_at_time / 100).toFixed(2),
                    currency: 'RUB'
                },
                vat_code: 1
            }))
        };
        
        return await yookassa.createReceipt(receipt);
    }
}

module.exports = new PaymentService();