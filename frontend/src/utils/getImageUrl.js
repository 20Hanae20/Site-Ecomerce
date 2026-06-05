import { API_HOST } from '../services/api';

export const getImageUrl = (uri) => {
  if (!uri) return null;
  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    return uri;
  }

  const apiHost = (import.meta.env.VITE_API_URL || API_HOST || 'http://127.0.0.1:8000').replace(/\/api\/?$/, '');
  const path = uri.startsWith('/') ? uri : `/${uri}`;
  return `${apiHost}${path}`;
};
