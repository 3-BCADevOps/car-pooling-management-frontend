import axios from 'axios';

const normalizeApiBaseUrl = (rawUrl) => {
  if (!rawUrl) {
    return '';
  }

  const trimmedUrl = rawUrl.trim().replace(/\/$/, '');
  if (trimmedUrl.endsWith('/api')) {
    return trimmedUrl;
  }

  return `${trimmedUrl}/api`;
};

const getDefaultApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:8080/api';
    }
    return '/api';
  }
  return '/api';
};

const API_URL = normalizeApiBaseUrl(process.env.REACT_APP_API_URL) || getDefaultApiBaseUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User API calls
export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  getByEmail: (email) => api.get(`/users/email/${email}`),
  create: (user) => api.post('/users', user),
  update: (id, user) => api.put(`/users/${id}`, user),
  delete: (id) => api.delete(`/users/${id}`),
};

// Ride API calls
export const rideAPI = {
  getAll: () => api.get('/rides'),
  getById: (id) => api.get(`/rides/${id}`),
  getByStatus: (status) => api.get(`/rides/status/${status}`),
  search: (startingLocation, destination) =>
    api.get('/rides/search', {
      params: { startingLocation, destination },
    }),
  getByDriver: (driverId) => api.get(`/rides/driver/${driverId}`),
  create: (ride) => api.post('/rides', ride),
  update: (id, ride) => api.put(`/rides/${id}`, ride),
  updateStatus: (id, status) =>
    api.patch(`/rides/${id}/status`, null, {
      params: { status },
    }),
  delete: (id) => api.delete(`/rides/${id}`),
};

// Booking API calls
export const bookingAPI = {
  getAll: () => api.get('/bookings'),
  getById: (id) => api.get(`/bookings/${id}`),
  getByPassenger: (passengerId) => api.get(`/bookings/passenger/${passengerId}`),
  getByRide: (rideId) => api.get(`/bookings/ride/${rideId}`),
  getByStatus: (status) => api.get(`/bookings/status/${status}`),
  create: (booking) => api.post('/bookings', booking),
  update: (id, booking) => api.put(`/bookings/${id}`, booking),
  confirm: (id) => api.patch(`/bookings/${id}/confirm`),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`),
  delete: (id) => api.delete(`/bookings/${id}`),
};

export default api;
