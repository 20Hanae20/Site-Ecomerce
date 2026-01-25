import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Cart = () => {
    const { cart, total, loading, error, updateQuantity, removeFromCart, clearCart } = useCart();
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState('');
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const navigate = useNavigate();

    // Helper function to get proper image URL
    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return 'https://placehold.co/300x400?text=No+Image';
        if (imageUrl.startsWith('http')) return imageUrl;
        return `http://localhost:8000${imageUrl}`;
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const response = await api.get('/addresses');
            setAddresses(response.data);
            if (response.data.length > 0) {
                setSelectedAddress(response.data[0].id);
            }
        } catch (err) {
            console.error('Fetch addresses error:', err);
        }
    };

    const handleCheckout = async () => {
        if (!selectedAddress) {
            alert('Veuillez sélectionner une adresse de livraison');
            return;
        }

        setIsCheckingOut(true);
        try {
            // Create order first
            const response = await api.post('/orders', {
                shipping_address_id: selectedAddress,
            });

            // Redirect to checkout/payment page
            navigate('/checkout', {
                state: { orderId: response.data.order.id }
            });
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur lors de la création de la commande');
        } finally {
            setIsCheckingOut(false);
        }
    };


    if (loading) return <div className="cart-page"><div className="loading">Chargement du panier...</div></div>;
    if (error) return <div className="cart-page"><div className="error">{error}</div></div>;

    if (!cart || cart.items.length === 0) {
        return (
            <div className="cart-page empty-cart">
                <h2>Votre panier est vide</h2>
                <p>Découvrez nos parfums d'exception et trouvez votre bonheur.</p>
                <Link to="/catalogue" className="btn-primary">Voir le catalogue</Link>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <h1>Votre Panier</h1>
            <div className="cart-container">
                <div className="cart-items">
                    {cart.items.map((item) => (
                        <div key={item.id} className="cart-item">
                            <div className="item-image">
                                <img src={getImageUrl(item.perfume.image_url)} alt={item.perfume.name} />
                            </div>
                            <div className="item-details">
                                <h3>{item.perfume.name}</h3>
                                <p className="item-price">{item.perfume.price} €</p>
                            </div>
                            <div className="item-actions">
                                <div className="quantity-controls">
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        disabled={item.quantity <= 1}
                                    >-</button>
                                    <span>{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        disabled={item.quantity >= item.perfume.stock}
                                    >+</button>
                                </div>
                                <button
                                    className="remove-btn"
                                    onClick={() => removeFromCart(item.id)}
                                >
                                    Supprimer
                                </button>
                            </div>
                            <div className="item-total">
                                {(item.perfume.price * item.quantity).toFixed(2)} €
                            </div>
                        </div>
                    ))}
                </div>

                <div className="cart-summary">
                    <h2>Résumé</h2>
                    <div className="summary-row">
                        <span>Sous-total</span>
                        <span>{total.toFixed(2)} €</span>
                    </div>
                    <div className="summary-row total">
                        <span>Total</span>
                        <span>{total.toFixed(2)} €</span>
                    </div>

                    {addresses.length > 0 ? (
                        <>
                            <div className="address-selection">
                                <label>Adresse de livraison</label>
                                <select
                                    value={selectedAddress}
                                    onChange={(e) => setSelectedAddress(e.target.value)}
                                >
                                    {addresses.map(addr => (
                                        <option key={addr.id} value={addr.id}>
                                            {addr.street}, {addr.city}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button
                                className="btn-checkout"
                                onClick={handleCheckout}
                                disabled={isCheckingOut}
                            >
                                {isCheckingOut ? 'Traitement...' : 'Passer à la caisse'}
                            </button>
                        </>
                    ) : (
                        <div className="no-address-warning">
                            <p>Vous devez ajouter une adresse de livraison</p>
                            <Link to="/profile" className="btn-checkout">Ajouter une adresse</Link>
                        </div>
                    )}

                    <button className="btn-clear" onClick={clearCart}>Vider le panier</button>
                </div>
            </div>
        </div>
    );
};

export default Cart;

