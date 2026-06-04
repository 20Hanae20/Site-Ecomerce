import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [tenant, setTenant] = useState(null);
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialize auth state from localStorage
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const storedUser = localStorage.getItem('user');
                const storedToken = localStorage.getItem('token');
                const storedTenant = localStorage.getItem('tenant');
                const storedSubscription = localStorage.getItem('subscription');

                if (storedUser && storedToken) {
                    setUser(JSON.parse(storedUser));
                }

                if (storedTenant) {
                    setTenant(JSON.parse(storedTenant));
                }

                if (storedSubscription) {
                    setSubscription(JSON.parse(storedSubscription));
                }

                // Fetch fresh tenant and subscription data
                if (storedToken) {
                    await fetchTenantData();
                    await fetchSubscriptionData();
                }
            } catch (err) {
                console.error('Auth initialization error:', err);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const fetchTenantData = useCallback(async () => {
        try {
            const response = await api.get('/tenant/current');
            const tenantData = response.data;
            setTenant(tenantData);
            localStorage.setItem('tenant', JSON.stringify(tenantData));
        } catch (err) {
            console.error('Error fetching tenant data:', err);
        }
    }, []);

    const fetchSubscriptionData = useCallback(async () => {
        try {
            const response = await api.get('/subscription/current');
            const subscriptionData = response.data;
            setSubscription(subscriptionData);
            localStorage.setItem('subscription', JSON.stringify(subscriptionData));
        } catch (err) {
            console.error('Error fetching subscription data:', err);
        }
    }, []);

    const login = useCallback(async (email, password) => {
        setError(null);
        try {
            const response = await api.post('/login', { email, password });
            const { access_token, user: userData } = response.data;

            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(userData));

            setUser(userData);

            await fetchTenantData();
            await fetchSubscriptionData();

            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Login failed';
            setError(message);
            return { success: false, error: message };
        }
    }, [fetchTenantData, fetchSubscriptionData]);

    const register = useCallback(async (formData) => {
        setError(null);
        try {
            const response = await api.post('/register', formData);
            const { access_token, user: userData } = response.data;

            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(userData));

            setUser(userData);

            await fetchTenantData();
            await fetchSubscriptionData();

            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Registration failed';
            setError(message);
            return { success: false, error: message };
        }
    }, [fetchTenantData, fetchSubscriptionData]);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('tenant');
        localStorage.removeItem('subscription');

        setUser(null);
        setTenant(null);
        setSubscription(null);
        setError(null);
    }, []);

    const hasPermission = useCallback((requiredRoles) => {
        if (!user) return false;
        const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
        return roles.includes(user.role);
    }, [user]);

    const hasFeature = useCallback((feature) => {
        if (!subscription) return false;
        const features = subscription.features || [];
        return features.includes(feature);
    }, [subscription]);

    const updateTenant = useCallback(async (tenantData) => {
        try {
            const response = await api.put('/tenant', tenantData);
            setTenant(response.data.tenant);
            localStorage.setItem('tenant', JSON.stringify(response.data.tenant));
            return { success: true };
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update tenant');
            return { success: false };
        }
    }, []);

    const upgradePlan = useCallback(async (plan) => {
        try {
            const response = await api.put('/subscription/upgrade', { plan });
            setSubscription(response.data.subscription);
            localStorage.setItem('subscription', JSON.stringify(response.data.subscription));
            return { success: true };
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upgrade plan');
            return { success: false };
        }
    }, []);

    const isAuthenticated = !!user && !!localStorage.getItem('token');
    const isAdmin = hasPermission(['admin', 'super_admin']);
    const isOwner = hasPermission('owner');

    const value = {
        // State
        user,
        tenant,
        subscription,
        loading,
        error,

        // Auth methods
        login,
        register,
        logout,

        // Queries
        isAuthenticated,
        isAdmin,
        isOwner,
        hasPermission,
        hasFeature,

        // Updates
        fetchTenantData,
        fetchSubscriptionData,
        updateTenant,
        upgradePlan,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
