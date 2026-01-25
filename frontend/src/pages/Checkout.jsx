import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { simulatePayment } from '../services/paymentSimulator';

const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { orderId } = location.state || {};

    const [order, setOrder] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!orderId) {
            navigate('/cart');
            return;
        }
        fetchOrder();
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            const response = await api.get(`/orders/${orderId}`);
            setOrder(response.data);
        } catch (err) {
            setError('Impossible de charger la commande');
        }
    };

    const handlePayment = async () => {
        setIsProcessing(true);
        setError('');

        try {
            if (paymentMethod === 'cod') {
                // For COD, we just notify the server and redirect
                await api.post('/payments/initiate', {
                    order_id: orderId,
                    payment_method: 'cod'
                });

                navigate('/payment/confirmation', {
                    state: {
                        success: true,
                        orderId: orderId,
                        isCod: true
                    }
                });
                return;
            }

            // Step 1: Initiate payment (Stripe/PayPal)
            const initiateResponse = await api.post('/payments/initiate', {
                order_id: orderId,
                payment_method: paymentMethod
            });

            const payment = initiateResponse.data.payment;

            // Step 2: Simulate payment gateway processing
            const gatewayResult = await simulatePayment({
                payment_method: paymentMethod,
                amount: order.total
            });

            if (gatewayResult.success) {
                // Step 3: Validate payment
                await api.post(`/payments/${payment.id}/validate`, {
                    transaction_id: gatewayResult.transaction_id,
                    gateway_response: gatewayResult.gateway_response
                });

                // Redirect to confirmation
                navigate('/payment/confirmation', {
                    state: {
                        success: true,
                        orderId: orderId,
                        transactionId: gatewayResult.transaction_id
                    }
                });
            } else {
                // Mark payment as failed
                await api.post(`/payments/${payment.id}/fail`, {
                    failure_reason: gatewayResult.message
                });

                navigate('/payment/confirmation', {
                    state: {
                        success: false,
                        orderId: orderId,
                        failureReason: gatewayResult.message
                    }
                });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du paiement');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!order) {
        return <div className="loader">Chargement...</div>;
    }

    return (
        <div className="page-container checkout-page">
            <h1>Paiement</h1>

            <div className="checkout-layout">
                <div className="payment-section">
                    <h2>Méthode de paiement</h2>

                    <div className="payment-methods">
                        <label className={`payment-method ${paymentMethod === 'card' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="payment_method"
                                value="card"
                                checked={paymentMethod === 'card'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <div className="method-info">
                                <span className="method-icon">💳</span>
                                <span className="method-name">Carte bancaire</span>
                            </div>
                        </label>

                        <label className={`payment-method ${paymentMethod === 'paypal' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="payment_method"
                                value="paypal"
                                checked={paymentMethod === 'paypal'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <div className="method-info">
                                <span className="method-icon">🅿️</span>
                                <span className="method-name">PayPal</span>
                            </div>
                        </label>

                        <label className={`payment-method ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="payment_method"
                                value="cod"
                                checked={paymentMethod === 'cod'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <div className="method-info">
                                <span className="method-icon">💵</span>
                                <span className="method-name">Paiement à la livraison (COD)</span>
                            </div>
                        </label>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button
                        className="submit-btn"
                        onClick={handlePayment}
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'Traitement en cours...' :
                            paymentMethod === 'cod' ? `Confirmer la commande (${order.total} €)` : `Payer ${order.total} €`}
                    </button>
                </div>

                <div className="order-summary-section">
                    <h2>Récapitulatif</h2>
                    <div className="summary-card">
                        <div className="summary-row">
                            <span>Commande</span>
                            <span>{order.order_number}</span>
                        </div>
                        <div className="summary-row">
                            <span>Articles</span>
                            <span>{order.items?.length || 0}</span>
                        </div>
                        <div className="summary-row">
                            <span>Sous-total</span>
                            <span>{order.subtotal} €</span>
                        </div>
                        {order.shipping_cost > 0 && (
                            <div className="summary-row">
                                <span>Livraison</span>
                                <span>{order.shipping_cost} €</span>
                            </div>
                        )}
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>{order.total} €</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
