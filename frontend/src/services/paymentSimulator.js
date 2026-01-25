/**
 * Simulated payment gateway for development
 * Returns success/failure after a delay
 */

export const simulatePayment = async (paymentData) => {
    // Simulate processing time (500ms for faster testing)
    await new Promise(resolve => setTimeout(resolve, 500));

    // 90% success rate for testing
    const success = Math.random() > 0.1;

    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

    if (success) {
        return {
            success: true,
            transaction_id: transactionId,
            message: 'Paiement effectué avec succès',
            gateway_response: {
                status: 'approved',
                timestamp: new Date().toISOString(),
                method: paymentData.payment_method
            }
        };
    } else {
        // Simulate various failure reasons
        const failureReasons = [
            'Fonds insuffisants',
            'Carte expirée',
            'Transaction refusée par la banque',
            'Timeout de la transaction'
        ];

        return {
            success: false,
            message: failureReasons[Math.floor(Math.random() * failureReasons.length)],
            gateway_response: {
                status: 'declined',
                timestamp: new Date().toISOString()
            }
        };
    }
};
