import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import CartService from '../services/CartService';
import { CartContext } from './CartContext';

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);

    const fetchCart = async () => {
        setLoading(true);
        try {
            const data = await CartService.getCart();
            setCart(data.cart);
            setTotal(data.total);
            setError(null);
        } catch (err) {
            setError('Erreur lors du chargement du panier');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (perfume_id, quantity = 1) => {
        try {
            const data = await CartService.addToCart(perfume_id, quantity);
            setCart(data.cart);
            setTotal(data.total);
            const successMessage = 'Produit ajouté au panier avec succès.';
            setNotification({ type: 'success', text: successMessage });
            window.setTimeout(() => setNotification(null), 4000);
            return { success: true, message: successMessage };
        } catch (err) {
            const message = err.response?.data?.message || 'Erreur lors de l’ajout au panier';
            setNotification({ type: 'error', text: message });
            window.setTimeout(() => setNotification(null), 6000);
            return { success: false, message };
        }
    };

    const updateQuantity = async (cart_item_id, quantity) => {
        try {
            const data = await CartService.updateQuantity(cart_item_id, quantity);
            setCart(data.cart);
            setTotal(data.total);
        } catch (err) {
            console.error(err);
        }
    };

    const removeFromCart = async (cart_item_id) => {
        try {
            const data = await CartService.removeFromCart(cart_item_id);
            setCart(data.cart);
            setTotal(data.total);
        } catch (err) {
            console.error(err);
        }
    };

    const clearCart = async () => {
        try {
            const data = await CartService.clearCart();
            setCart(data.cart);
            setTotal(data.total);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchCart();
        }
    }, []);

    const value = useMemo(() => ({
        cart,
        total,
        loading,
        error,
        notification,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart
    }), [cart, total, loading, error, notification]);

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

CartProvider.propTypes = {
    children: PropTypes.node.isRequired
};
