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

const buildApiBaseUrlCandidates = () => {
  const envUrl = normalizeApiBaseUrl(process.env.REACT_APP_API_URL);
  const primaryAzureUrl = normalizeApiBaseUrl(
    'https://carpool-management-frontend-dkerctcsfydydbgh.southeastasia-01.azurewebsites.net'
  );
  const previousCloudUrl = normalizeApiBaseUrl('https://car-pooling-management-backend.onrender.com');
  const localhostUrl = normalizeApiBaseUrl('http://localhost:8080');

  if (typeof window !== 'undefined') {
    const localHostnames = ['localhost', '127.0.0.1', '::1'];
    if (localHostnames.includes(window.location.hostname)) {
      return [envUrl, localhostUrl, primaryAzureUrl, previousCloudUrl].filter(Boolean);
    }
  }

  return [envUrl, primaryAzureUrl, previousCloudUrl].filter(Boolean);
};
const API_BASE_URLS = [...new Set(buildApiBaseUrlCandidates())];
const API_URL = API_BASE_URLS[0];

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const requestConfig = error?.config;
    if (!requestConfig) {
      return Promise.reject(error);
    }

    const currentBaseUrl = normalizeApiBaseUrl(requestConfig.baseURL || api.defaults.baseURL);
    const currentIndex = API_BASE_URLS.indexOf(currentBaseUrl);
    const nextIndex = currentIndex + 1;

    // Retry only for network-level failures and only when another fallback URL exists.
    if (error.response || nextIndex >= API_BASE_URLS.length || requestConfig.__fallbackAttempted) {
      return Promise.reject(error);
    }

    requestConfig.__fallbackAttempted = true;
    requestConfig.baseURL = API_BASE_URLS[nextIndex];
    api.defaults.baseURL = API_BASE_URLS[nextIndex];

    return api(requestConfig);
  }
);

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
