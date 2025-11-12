import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // For FormData uploads, remove Content-Type to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (identifier: string, password: string) =>
    api.post('/auth/login', { identifier, password }),
  
  registerTenant: (data: any) =>
    api.post('/auth/register/tenant', data),
  
  registerOwner: (data: any) =>
    api.post('/auth/register/owner', data),
  
  registerAdmin: (data: any) =>
    api.post('/auth/register/admin', data),
  
  registerWatchman: (data: any) =>
    api.post('/auth/register/watchman', data),
};

// Property API
export const propertyAPI = {
  getAll: () => api.get('/properties'),
  
  getById: (id: string) => api.get(`/properties/${id}`),
  
  search: (params: {
    location?: string;
    minRent?: number;
    maxRent?: number;
    minRating?: number;
    bedrooms?: number;
    bathrooms?: number;
    minArea?: number;
    maxArea?: number;
    amenities?: string;
    sortBy?: string;
    sortDir?: string;
  }) => api.get('/properties/search', { params }),
  
  getMyProperties: () => api.get('/properties/my-properties'),
  
  create: (data: any) => api.post('/properties', data),
  
  update: (id: string, data: any) => api.put(`/properties/${id}`, data),
  
  delete: (id: string) => api.delete(`/properties/${id}`),
};

// Review API
export const reviewAPI = {
  getByProperty: (propertyId: string) =>
    api.get(`/reviews/property/${propertyId}`),
  
  getMyReviews: () => api.get('/reviews/my-reviews'),
  
  create: (data: any) => api.post('/reviews', data),
  
  update: (id: string, data: any) => api.put(`/reviews/${id}`, data),
  
  delete: (id: string) => api.delete(`/reviews/${id}`),
};

// Guest Pass API
export const guestPassAPI = {
  getMyPasses: () => api.get('/guest-passes/my-passes'),
  
  getByPassId: (passId: string) => api.get(`/guest-passes/${passId}`),
  
  create: (data: any) => api.post('/guest-passes', data),
  
  verify: (passId: string) => api.post(`/guest-passes/${passId}/verify`),
  
  recordExit: (passId: string) => api.post(`/guest-passes/${passId}/exit`),
  
  cancel: (id: string) => api.delete(`/guest-passes/${id}`),
  
  getActive: () => api.get('/guest-passes/active'),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  
  // User Management
  getAllUsers: (params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }) => api.get('/admin/users', { params }),
  
  getUsersByRole: (role: string, params?: {
    page?: number;
    size?: number;
  }) => api.get(`/admin/users/role/${role}`, { params }),
  
  getUserById: (id: string) => api.get(`/admin/users/${id}`),
  
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  
  // Property Management
  getAllProperties: (params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }) => api.get('/admin/properties', { params }),
  
  deleteProperty: (id: string) => api.delete(`/admin/properties/${id}`),
  
  approveProperty: (id: string) => api.put(`/admin/properties/${id}/approve`),
  
  rejectProperty: (id: string) => api.put(`/admin/properties/${id}/reject`),
  
  // Revenue Reports
  getRevenueReport: () => api.get('/admin/revenue-report'),
  
  // Guest Pass Management
  getAllGuestPasses: (params?: {
    page?: number;
    size?: number;
    status?: string;
  }) => api.get('/admin/guest-passes', { params }),
};

// Comprehensive Owner API - All owner-related operations
export const ownerAPI = {
  // Dashboard & Stats
  getDashboard: () => api.get('/owner/dashboard'),
  getDashboardStats: () => api.get('/owner/dashboard'),
  
  // Property Management
  getProperties: () => api.get('/owner/properties'),
  getMyProperties: (params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }) => api.get('/owner/properties', { params }),
  
  createProperty: (data: any) => api.post('/owner/properties', data),
  createPropertyWithImages: (propertyData: any) => {
    const formData = new FormData();
    Object.keys(propertyData).forEach(key => {
      if (key === 'images' && Array.isArray(propertyData[key])) {
        propertyData[key].forEach((file: File) => formData.append('images', file));
      } else if (propertyData[key] !== null && propertyData[key] !== undefined) {
        formData.append(key, propertyData[key]);
      }
    });
    return api.post('/owner/properties/with-images', formData);
  },
  
  updateProperty: (id: string, data: any) => api.put(`/owner/properties/${id}`, data),
  deleteProperty: (id: string) => api.delete(`/owner/properties/${id}`),
  getProperty: (id: string) => api.get(`/owner/properties/${id}`),
  
  // Property Reviews
  getPropertyReviews: (propertyId: string) => api.get(`/owner/properties/${propertyId}/reviews`),
  
  // Tenant Management
  getTenants: () => api.get('/owner/tenants'),
  getMyTenants: (params?: {
    page?: number;
    size?: number;
  }) => api.get('/owner/tenants', { params }),
  
  // Revenue Reports
  getRevenueReport: () => api.get('/owner/revenue-report'),
  
  // Profile Management
  getProfile: () => api.get('/owner/profile'),
  updateProfile: (profileData: any) => api.put('/owner/profile', profileData),
  updateProfileWithUrls: (formData: FormData) => {
    return api.post('/owner/profile/with-urls', formData);
  },
  
  // Authentication Test
  testAuth: () => api.get('/owner/test-auth'),
  
  // File Upload Operations
  uploadProfileImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/owner/upload/profile-image', formData);
  },
  
  uploadDocument: (file: File, documentType: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    return api.post('/owner/upload/document', formData);
  },
  
  uploadPropertyImages: (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return api.post('/owner/upload/property-images', formData);
  },
  
  deleteFile: (filePath: string) => 
    api.delete(`/owner/upload/file?filePath=${encodeURIComponent(filePath)}`),
};

// Watchman API
export const watchmanAPI = {
  getDashboard: () => api.get('/watchman/dashboard'),
  
  scanQR: (passId: string) => api.post(`/watchman/scan/${passId}`),
  
  getActivePasses: () => api.get('/watchman/active-passes'),
  
  recordExit: (passId: string) => api.post(`/watchman/exit/${passId}`),
};

// Enhanced Admin API with owner verification
export const enhancedAdminAPI = {
  ...adminAPI,
  
  // Owner Management
  getAllOwners: (params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }) => api.get('/admin/owners', { params }),
  
  getPendingOwnerVerifications: () => api.get('/admin/owners/pending-verification'),
  
  getOwnerDetails: (ownerId: number) => api.get(`/admin/owners/${ownerId}`),
  
  verifyOwner: (ownerId: number) => api.put(`/admin/owners/${ownerId}/verify`),
  
  rejectOwnerVerification: (ownerId: number, reason?: string) => {
    const params = reason ? `?reason=${encodeURIComponent(reason)}` : '';
    return api.put(`/admin/owners/${ownerId}/reject${params}`);
  },
};

export default api;
