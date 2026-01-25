import api from './api';

const CartService = {
    getCart: async () => {
        const response = await api.get('/cart');
        return response.data;
    },

    addToCart: async (perfume_id, quantity = 1) => {
        const response = await api.post('/cart', { perfume_id, quantity });
        return response.data;
    },

    updateQuantity: async (cart_item_id, quantity) => {
        const response = await api.put(`/cart/${cart_item_id}`, { quantity });
        return response.data;
    },

    removeFromCart: async (cart_item_id) => {
        const response = await api.delete(`/cart/${cart_item_id}`);
        return response.data;
    },

    clearCart: async () => {
        const response = await api.post('/cart/clear');
        return response.data;
    }
};

export default CartService;
