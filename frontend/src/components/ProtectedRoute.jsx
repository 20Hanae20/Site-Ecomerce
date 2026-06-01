import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ component, requiredRole = null, ...rest }) => {
    const Comp = component;
    const token = localStorage.getItem('token');
    let user = {};
    try {
        user = JSON.parse(localStorage.getItem('user') || '{}');
    } catch (e) {
        console.error('Failed to parse user from localStorage', e);
        localStorage.removeItem('user');
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole) {
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        if (!roles.includes(user.role)) {
            return <Navigate to="/" replace />;
        }
    }

    return <Comp {...rest} />;
};

export default ProtectedRoute;
