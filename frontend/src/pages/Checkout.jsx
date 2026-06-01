import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { CreditCard, Wallet, Truck, ShieldCheck, ChevronRight, Check } from 'lucide-react';
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
    }, [orderId, navigate, fetchOrder]);

    const fetchOrder = useCallback(async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/orders/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrder(response.data);
        } catch {
            setError('Impossible de charger la commande');
        }
    }, [orderId]);

    const handlePayment = async () => {
        setIsProcessing(true);
        setError('');
        const token = localStorage.getItem('token');

        try {
            if (paymentMethod === 'cod') {
                await axios.post('http://127.0.0.1:8000/api/payments/initiate',
                    { order_id: orderId, payment_method: 'cod' },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                navigate('/payment/confirmation', {
                    state: { success: true, orderId: orderId, isCod: true }
                });
                return;
            }

            const initiateResponse = await axios.post('http://127.0.0.1:8000/api/payments/initiate',
                { order_id: orderId, payment_method: paymentMethod },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const payment = initiateResponse.data.payment;

            const gatewayResult = await simulatePayment({
                payment_method: paymentMethod,
                amount: order.total
            });

            if (gatewayResult.success) {
                await axios.post(`http://127.0.0.1:8000/api/payments/${payment.id}/validate`,
                    { transaction_id: gatewayResult.transaction_id, gateway_response: gatewayResult.gateway_response },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                navigate('/payment/confirmation', {
                    state: { success: true, orderId: orderId, transactionId: gatewayResult.transaction_id }
                });
            } else {
                await axios.post(`http://127.0.0.1:8000/api/payments/${payment.id}/fail`,
                    { failure_reason: gatewayResult.message },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                navigate('/payment/confirmation', {
                    state: { success: false, orderId: orderId, failureReason: gatewayResult.message }
                });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du paiement');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!order) return (
        <div className="loader-container-premium">
            <div className="premium-loader"></div>
        </div>
    );

    return (
        <div className="container-premium checkout-page-luxury animate-fade-in">
            <header className="checkout-header-luxury">
                <nav className="breadcrumb-luxury">
                    <Link to="/cart">PANIER</Link>
                    <ChevronRight size={14} />
                    <span className="gradient-text-gold">FINALISATION</span>
                </nav>
                <h1 className="font-serif">Finaliser <span className="gradient-text-gold">l'Expédition</span></h1>
            </header>

            <div className="checkout-layout-luxury">
                <main className="payment-column-luxury">
                    <section className="payment-selection-luxury">
                        <div className="section-label-luxury">
                            <h5>MODE DE RÈGLEMENT</h5>
                            <div className="label-line"></div>
                        </div>

                        <div className="methods-grid-luxury">
                            <label className={`method-card-luxury glass-premium ${paymentMethod === 'card' ? 'active' : ''}`}>
                                <input type="radio" value="card" checked={paymentMethod === 'card'} onChange={(e) => setPaymentMethod(e.target.value)} />
                                <div className="method-content">
                                    <div className="method-icon-luxury"><CreditCard size={24} /></div>
                                    <div className="method-text">
                                        <h6>CARTE BANCAIRE</h6>
                                        <p>Transaction sécurisée</p>
                                    </div>
                                    <div className="method-check"><Check size={16} /></div>
                                </div>
                            </label>

                            <label className={`method-card-luxury glass-premium ${paymentMethod === 'paypal' ? 'active' : ''}`}>
                                <input type="radio" value="paypal" checked={paymentMethod === 'paypal'} onChange={(e) => setPaymentMethod(e.target.value)} />
                                <div className="method-content">
                                    <div className="method-icon-luxury"><Wallet size={24} /></div>
                                    <div className="method-text">
                                        <h6>PAYPAL / WALLET</h6>
                                        <p>Paiement en un clic</p>
                                    </div>
                                    <div className="method-check"><Check size={16} /></div>
                                </div>
                            </label>

                            <label className={`method-card-luxury glass-premium ${paymentMethod === 'cod' ? 'active' : ''}`}>
                                <input type="radio" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} />
                                <div className="method-content">
                                    <div className="method-icon-luxury"><Truck size={24} /></div>
                                    <div className="method-text">
                                        <h6>À LA LIVRAISON</h6>
                                        <p>Paiement physique</p>
                                    </div>
                                    <div className="method-check"><Check size={16} /></div>
                                </div>
                            </label>
                        </div>

                        {error && <div className="premium-alert error m-t-2">{error}</div>}

                        <div className="payment-actions-luxury">
                            <p className="payment-secure-hint">
                                <ShieldCheck size={14} /> Vos données sont cryptées par notre protocole Sillage-Secure.
                            </p>
                            <button className="btn-premium btn-pay-luxury" onClick={handlePayment} disabled={isProcessing}>
                                {isProcessing ? 'TRAITEMENT EN COURS...' :
                                    paymentMethod === 'cod' ? `CONFIRMER LA COMMANDE (${order.total} €)` : `RÉGLER ${order.total} €`}
                            </button>
                        </div>
                    </section>
                </main>

                <aside className="summary-column-luxury">
                    <div className="summary-card-luxury glass-premium">
                        <h3 className="font-serif">RÉCAPITULATIF</h3>
                        <div className="summary-divider-luxury"></div>

                        <div className="order-meta-luxury">
                            <label>COMMANDE</label>
                            <span>#{order.order_number}</span>
                        </div>

                        <div className="items-mini-list-luxury">
                            {order.items?.map(item => (
                                <div key={item.id} className="mini-item-row">
                                    <span className="mini-item-name">{item.perfume.name} <small>x{item.quantity}</small></span>
                                    <span className="mini-item-price">{(item.price_at_order * item.quantity).toFixed(2)} €</span>
                                </div>
                            ))}
                        </div>

                        <div className="summary-details-luxury">
                            <div className="detail-row-luxury">
                                <span>SOUS-TOTAL</span>
                                <span>{order.subtotal} €</span>
                            </div>
                            {order.shipping_cost > 0 && (
                                <div className="detail-row-luxury">
                                    <span>LIVRAISON</span>
                                    <span>{order.shipping_cost} €</span>
                                </div>
                            )}
                            <div className="total-row-luxury">
                                <label>TOTAL</label>
                                <span>{order.total} €</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            <style>{`
                .checkout-page-luxury { padding-top: 4rem; padding-bottom: 8rem; }
                .checkout-header-luxury { text-align: center; margin-bottom: 6rem; }
                .checkout-header-luxury h1 { font-size: 3.5rem; margin-top: 1rem; }
                
                .breadcrumb-luxury { display: flex; align-items: center; justify-content: center; gap: 1rem; font-size: 0.7rem; letter-spacing: 2px; opacity: 0.5; }

                .checkout-layout-luxury {
                    display: grid;
                    grid-template-columns: 1fr 400px;
                    gap: 6rem;
                }

                .section-label-luxury { display: flex; align-items: center; gap: 2rem; margin-bottom: 3rem; }
                .section-label-luxury h5 { font-size: 0.75rem; letter-spacing: 3px; color: var(--primary); white-space: nowrap; }
                .label-line { height: 1px; background: var(--glass-border); width: 100%; }

                .methods-grid-luxury { display: flex; flex-direction: column; gap: 1rem; }
                
                .method-card-luxury {
                    position: relative;
                    cursor: pointer;
                    display: block;
                    padding: 0;
                    border-radius: 15px;
                    overflow: hidden;
                    transition: 0.3s;
                }
                .method-card-luxury input { position: absolute; opacity: 0; }
                
                .method-content {
                    padding: 2rem;
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .method-icon-luxury { width: 48px; height: 48px; border-radius: 12px; background: var(--glass-hover); display: flex; align-items: center; justify-content: center; color: var(--primary); }
                .method-text { flex: 1; }
                .method-text h6 { font-size: 1rem; letter-spacing: 2px; margin-bottom: 0.2rem; }
                .method-text p { font-size: 0.75rem; opacity: 0.5; }

                .method-check { opacity: 0; width: 24px; height: 24px; border-radius: 50%; background: var(--primary); color: #000; display: flex; align-items: center; justify-content: center; transition: 0.3s; }
                .method-card-luxury.active { border-color: var(--primary); }
                .method-card-luxury.active .method-check { opacity: 1; }

                .payment-actions-luxury { margin-top: 4rem; text-align: center; }
                .payment-secure-hint { display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-size: 0.75rem; opacity: 0.5; margin-bottom: 2rem; }
                .btn-pay-luxury { width: 100%; padding: 1.5rem; font-size: 1rem; font-weight: 700; letter-spacing: 2px; }

                .summary-card-luxury { padding: 3rem; border-radius: 24px; position: sticky; top: 100px; }
                .summary-card-luxury h3 { font-size: 1.5rem; letter-spacing: 3px; margin-bottom: 2.5rem; text-align: center; }
                .summary-divider-luxury { height: 1px; background: var(--glass-border); margin-bottom: 2rem; }

                .order-meta-luxury { display: flex; justify-content: space-between; margin-bottom: 2.5rem; }
                .order-meta-luxury label { font-size: 0.65rem; letter-spacing: 2px; opacity: 0.5; font-weight: 700; }
                .order-meta-luxury span { font-weight: 700; }

                .items-mini-list-luxury { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2.5rem; }
                .mini-item-row { display: flex; justify-content: space-between; font-size: 0.85rem; }
                .mini-item-name { opacity: 0.7; }
                .mini-item-name small { margin-left: 0.5rem; color: var(--primary); }

                .summary-details-luxury { border-top: 1px solid var(--glass-border); padding-top: 2rem; }
                .detail-row-luxury { display: flex; justify-content: space-between; margin-bottom: 1rem; font-size: 0.8rem; opacity: 0.6; }
                
                .total-row-luxury { display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; }
                .total-row-luxury label { font-weight: 800; letter-spacing: 2px; font-size: 0.9rem; }
                .total-row-luxury span { font-size: 1.8rem; font-weight: 800; color: var(--primary); }

                .m-t-2 { margin-top: 2rem; }

                @media (max-width: 1024px) {
                    .checkout-layout-luxury { grid-template-columns: 1fr; }
                    .summary-column-luxury { order: -1; }
                    .summary-card-luxury { position: static; }
                }
            `}</style>
        </div>
    );
};

export default Checkout;
