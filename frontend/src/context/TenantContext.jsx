import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const TenantContext = createContext();

export const useTenant = () => {
    const context = useContext(TenantContext);
    if (!context) {
        throw new Error('useTenant must be used within TenantProvider');
    }
    return context;
};

export const TenantProvider = ({ children }) => {
    const { tenant } = useAuth();
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

    // Products
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/perfumes');
            setProducts(response.data.data || []);
        } catch (err) {
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createProduct = useCallback(async (productData) => {
        try {
            const response = await api.post('/perfumes', productData);
            setProducts([...products, response.data.data]);
            return { success: true, data: response.data.data };
        } catch (err) {
            return { success: false, error: err.response?.data?.message };
        }
    }, [products]);

    const updateProduct = useCallback(async (productId, productData) => {
        try {
            const response = await api.put(`/perfumes/${productId}`, productData);
            setProducts(products.map(p => p.id === productId ? response.data.data : p));
            return { success: true, data: response.data.data };
        } catch (err) {
            return { success: false, error: err.response?.data?.message };
        }
    }, [products]);

    const deleteProduct = useCallback(async (productId) => {
        try {
            await api.delete(`/perfumes/${productId}`);
            setProducts(products.filter(p => p.id !== productId));
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.message };
        }
    }, [products]);

    // Orders
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/orders');
            setOrders(response.data.data || []);
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateOrderStatus = useCallback(async (orderId, status) => {
        try {
            const response = await api.put(`/orders/${orderId}/status`, { status });
            setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.message };
        }
    }, [orders]);

    // Users
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data.data || []);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateUserRole = useCallback(async (userId, role) => {
        try {
            const response = await api.patch(`/users/${userId}/role`, { role });
            setUsers(users.map(u => u.id === userId ? { ...u, role } : u));
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.message };
        }
    }, [users]);

    // Promotions
    const fetchPromotions = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/promotions');
            setPromotions(response.data.data || []);
        } catch (err) {
            console.error('Error fetching promotions:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createPromotion = useCallback(async (promotionData) => {
        try {
            const response = await api.post('/admin/promotions', promotionData);
            setPromotions([...promotions, response.data.data]);
            return { success: true, data: response.data.data };
        } catch (err) {
            return { success: false, error: err.response?.data?.message };
        }
    }, [promotions]);

    const updatePromotion = useCallback(async (promotionId, promotionData) => {
        try {
            const response = await api.put(`/admin/promotions/${promotionId}`, promotionData);
            setPromotions(promotions.map(p => p.id === promotionId ? response.data.data : p));
            return { success: true, data: response.data.data };
        } catch (err) {
            return { success: false, error: err.response?.data?.message };
        }
    }, [promotions]);

    const deletePromotion = useCallback(async (promotionId) => {
        try {
            await api.delete(`/admin/promotions/${promotionId}`);
            setPromotions(promotions.filter(p => p.id !== promotionId));
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.message };
        }
    }, [promotions]);

    // Stats
    const fetchStats = useCallback(async () => {
        try {
            const response = await api.get('/admin/stats');
            setStats(response.data);
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    }, []);

    const value = {
        // Products
        products,
        fetchProducts,
        createProduct,
        updateProduct,
        deleteProduct,

        // Orders
        orders,
        fetchOrders,
        updateOrderStatus,

        // Users
        users,
        fetchUsers,
        updateUserRole,

        // Promotions
        promotions,
        fetchPromotions,
        createPromotion,
        updatePromotion,
        deletePromotion,

        // Stats
        stats,
        fetchStats,

        // UI
        loading,
    };

    return (
        <TenantContext.Provider value={value}>
            {children}
        </TenantContext.Provider>
    );
};
