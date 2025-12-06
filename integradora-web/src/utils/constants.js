export const API_BASE_URL = window.location.hostname.includes('railway.app')
  ? 'https://gelatoapp-production.up.railway.app/api'
  : (process.env.REACT_APP_API_URL || 'http://localhost:8000/api');

export const USER_ROLES = {
  SUPERADMIN: 'superadmin',  // ✅ Agregado
  ADMIN: 'admin',
  CLIENT: 'cliente',
  DELIVERY: 'repartidor',     // ✅ Corregido de 'delivery' a 'repartidor'
};

export const ORDER_STATUS = {
  PENDING: 'pendiente',
  PREPARING: 'preparando',
  IN_TRANSIT: 'en_camino',
  DELIVERED: 'entregado',
  CANCELLED: 'cancelado',
};