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
  
  approveProperty: (id: string) => api.put(`/admin/properties/${id}/approve`),
  
  rejectProperty: (id: string, reason?: string) => {
    const config = reason ? { data: reason, headers: { 'Content-Type': 'text/plain' } } : {};
    return api.put(`/admin/properties/${id}/reject`, reason, config);
  },
  
  // Property Media
  getPropertyImages: (id: string) => api.get(`/admin/properties/${id}/images`),
  
  getPropertyDocuments: (id: string) => api.get(`/admin/properties/${id}/documents`),
  
  // Revenue Reports
  getRevenueReport: () => api.get('/admin/revenue-report'),
  
  // Guest Pass Management
  getAllGuestPasses: (params?: {
    page?: number;
    size?: number;
    status?: string;
  }) => api.get('/admin/guest-passes', { params }),
};

// Enhanced Owner API with new property management
export const ownerAPI = {
  // Dashboard & Stats
  getDashboard: () => api.get('/owner/dashboard'),
  getDashboardStats: () => api.get('/owner/dashboard'),
  
  // Property Management - New Structure
  getProperties: () => api.get('/owner/property'),
  getProperty: (id: string) => api.get(`/owner/property/${id}`),
  createProperty: (propertyData: any, images: File[] = [], documents: any[] = []) => {
    const formData = new FormData();
    
    // Add property data as JSON string
    formData.append('property', JSON.stringify(propertyData));
    
    // Add images
    images.forEach((file) => {
      formData.append('images', file);
    });
    
    // Add documents and document types separately
    documents.forEach((doc) => {
      formData.append('documentFiles', doc.file);
      formData.append('documentTypes', doc.documentType);
    });
    
    return api.post('/owner/property', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  submitPropertyForVerification: (id: string) => api.post(`/owner/property/${id}/submit`),
  
  // Property Images Management (Cloudinary Uploads)
  uploadPropertyImages: (propertyId: string, files: File[]) => {
    return fileUploadAPI.uploadPropertyImages(files, propertyId);
  },
  uploadSinglePropertyImage: (propertyId: string, file: File) => {
    return fileUploadAPI.uploadPropertyImages([file], propertyId);
  },
  addPropertyImage: (propertyId: string, imageData: any) => 
    api.post(`/properties/${propertyId}/images`, imageData),
  getPropertyImages: (propertyId: string) => {
    console.log('=== API CALL: getPropertyImages ===');
    console.log('Property ID:', propertyId);
    console.log('Authorization token:', localStorage.getItem('token'));
    console.log('Full URL:', `/owner/property/${propertyId}/images`);
    
    return api.get(`/owner/property/${propertyId}/images`);
  },
  
  updatePropertyImage: (imageId: string, imageData: any) => 
    api.put(`/properties/images/${imageId}`, imageData),
  deletePropertyImage: (imageId: string) => 
    api.delete(`/properties/images/${imageId}`),
  addPropertyDocument: (propertyId: string, documentData: any) => 
    api.post(`/properties/${propertyId}/documents`, documentData),
  
  getPropertyDocuments: (propertyId: string) => {
    console.log('=== API CALL: getPropertyDocuments ===');
    console.log('Property ID:', propertyId);
    console.log('Authorization token:', localStorage.getItem('token'));
    console.log('Full URL:', `/owner/property/${propertyId}/documents`);
    
    return api.get(`/owner/property/${propertyId}/documents`);
  },
  deletePropertyDocument: (documentId: string) => 
    api.delete(`/properties/documents/${documentId}`),

  // PG Room Management
  addPGRoom: (propertyId: string, data: any) => api.post(`/owner/property/${propertyId}/rooms`, data),
  deletePGRoom: (propertyId: string, roomId: string) => api.delete(`/owner/property/${propertyId}/rooms/${roomId}`),
  
  // Legacy Property Management (for backward compatibility)
  getMyProperties: (params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }) => api.get('/owner/property', { params }),
  
  updateProperty: (id: string, data: any) => api.put(`/owner/properties/${id}`, data),
  deleteProperty: (id: string) => api.delete(`/owner/properties/${id}`),
  
  // Property Reviews
  getPropertyReviews: (propertyId: string) => api.get(`/owner/properties/${propertyId}/reviews`),
  
  // Tenant Management
  getTenants: () => api.get('/owner/tenants'),
  getMyTenants: (params?: {
    page?: number;
    size?: number;
  }) => api.get('/owner/tenants', { params }),
  getPendingCashPayments: () => api.get('/owner/tenants/pending-cash-payments'),
  
  confirmCashPayment: (tenantId: string) => api.post(`/owner/tenants/${tenantId}/confirm-cash-payment`),
  rejectCashPayment: (tenantId: string) => api.post(`/owner/tenants/${tenantId}/reject-cash-payment`),
  markTenantVacated: (tenantId: string) => api.post(`/owner/tenants/${tenantId}/mark-vacated`),
  
  // Revenue Reports
  getRevenueReport: () => api.get('/owner/revenue-report'),
  
  // Profile Management
  getProfile: () => api.get('/owner/profile'),
  updateProfile: (profileData: any) => api.put('/owner/profile', profileData),
  updateProfileWithUrls: (formData: FormData) => {
    return api.post('/owner/profile/with-urls', formData);
  },

  uploadProfileImage: (file: File) => {
    return fileUploadAPI.uploadProfileImage(file);
  },
  uploadDocument: (file: File, documentType: string) => {
    return fileUploadAPI.uploadOwnerDocument(file as any, documentType as 'aadhar' | 'pan');
  },
  
  // Authentication Test
  testAuth: () => api.get('/owner/test-auth'),

  // Payment Onboarding
  onboardPayments: (accountHolderName: string, accountNumber: string, ifsc: string) =>
    api.post('/owner/razorpay/onboard', {
      accountHolderName,
      accountNumber,
      ifsc
    }),
  
  getPaymentStatus: () => api.get('/owner/razorpay/status'),
  
  testAuthentication: () => api.get('/owner/razorpay/test-auth'),
};

// Watchman API
export const watchmanAPI = {
  getDashboard: () => api.get('/watchman/dashboard'),
  
  scanQR: (passId: string) => api.post(`/watchman/scan/${passId}`),
  
  getActivePasses: () => api.get('/watchman/active-passes'),
  
  recordExit: (passId: string) => api.post(`/watchman/exit/${passId}`),
};

// Enhanced Admin API with owner verification and property management
export const enhancedAdminAPI = {
  ...adminAPI,
  
  // Property Management
  getAllProperties: () => api.get('/admin/properties'),
  getPendingProperties: () => api.get('/admin/properties/pending'),
  getPropertyById: (id: string) => api.get(`/admin/properties/${id}`),
  approveProperty: (id: string) => api.put(`/admin/properties/${id}/approve`),
  rejectProperty: (id: string, reason?: string) => {
    const params = reason ? `?reason=${encodeURIComponent(reason)}` : '';
    return api.put(`/admin/properties/${id}/reject${params}`);
  },
  
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

// Unified File Upload API (Cloudinary)
export const fileUploadAPI = {
  // Profile image upload for all user types
  uploadProfileImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Owner document upload
  uploadOwnerDocument: (file: File, documentType: 'aadhar' | 'pan') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    return api.post('/upload/owner/document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Property images upload
  uploadPropertyImages: (files: File[], propertyId: string) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('propertyId', propertyId);
    return api.post('/upload/property/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Property documents upload
  uploadPropertyDocuments: (files: File[], propertyId: string) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('propertyId', propertyId);
    return api.post('/upload/property/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Tenant document upload
  uploadTenantDocument: (file: File, documentType: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    return api.post('/upload/tenant/document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Get file validation info
  getValidationInfo: () => api.get('/upload/validation-info'),

  // Get Cloudinary configuration
  getCloudinaryConfig: () => api.get('/files/cloudinary-config'),
};

// Cloudinary File Access API
export const cloudinaryAPI = {
  // Test Cloudinary file controller
  test: () => api.get('/files/test'),
  
  // Get file validation info
  getValidationInfo: () => api.get('/files/validation-info'),
  
  // Get Cloudinary configuration
  getConfig: () => api.get('/files/cloudinary-config'),
};

// Helper function to check if URL is Cloudinary URL
export const isCloudinaryUrl = (url: string): boolean => {
  return url && url.includes('res.cloudinary.com');
};

// Helper function to get Cloudinary public ID from URL
export const getCloudinaryPublicId = (url: string): string | null => {
  if (!isCloudinaryUrl(url)) return null;
  
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const uploadIndex = pathParts.indexOf('upload');
    if (uploadIndex !== -1 && uploadIndex + 1 < pathParts.length) {
      return pathParts.slice(uploadIndex + 1).join('/');
    }
  } catch (error) {
    console.error('Error parsing Cloudinary URL:', error);
  }
  
  return null;
};

// Helper function to create optimized Cloudinary URL
export const createOptimizedCloudinaryUrl = (url: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
} = {}): string => {
  if (!isCloudinaryUrl(url)) return url;
  
  const { width, height, quality = 80, format = 'auto' } = options;
  
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const uploadIndex = pathParts.indexOf('upload');
    
    if (uploadIndex !== -1) {
      const transformations = [];
      if (width) transformations.push(`w_${width}`);
      if (height) transformations.push(`h_${height}`);
      transformations.push(`q_${quality}`);
      transformations.push(`f_${format}`);
      
      pathParts.splice(uploadIndex + 1, 0, transformations.join(','));
      urlObj.pathname = pathParts.join('/');
      
      return urlObj.toString();
    }
  } catch (error) {
    console.error('Error creating optimized Cloudinary URL:', error);
  }
  
  return url;
};

// Tenant Property API
export const tenantAPI = {
  // Dashboard
  getDashboard: () => api.get('/tenant/dashboard/data'),
  
  // Property Browsing
  getAllProperties: () => api.get('/tenant/properties'),
  
  getProperties: (params?: {
    city?: string;
    propertyType?: string;
    minDeposit?: number;
    maxDeposit?: number;
    search?: string;
  }) => api.get('/tenant/properties', { params }),
  
  getPropertyById: (id: string) => api.get(`/tenant/properties/${id}`),
  
  // Current Properties & Complaints
  getCurrentProperties: () => api.get('/tenant/properties/current'),
  getComplaints: () => api.get('/tenant/complaints'),
  createComplaint: (data: {
    title: string;
    description: string;
    category: string;
    priority: string;
    selectedPropertyId: number;
    currentProperties?: any[];
    images: File[];
  }) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('category', data.category);
    formData.append('priority', data.priority);
    formData.append('propertyId', data.selectedPropertyId.toString());
    
    // Add flatDetailsId and pgBedId if available
    const selectedProperty = data.currentProperties?.find((p: any) => p.propertyId === data.selectedPropertyId);
    if (selectedProperty) {
      if (selectedProperty.propertyType === 'FLAT' && selectedProperty.flatDetailsId) {
        formData.append('flatDetailsId', selectedProperty.flatDetailsId.toString());
      } else if (selectedProperty.propertyType === 'PG' && selectedProperty.pgBedId) {
        formData.append('pgBedId', selectedProperty.pgBedId.toString());
      }
    }
    
    data.images.forEach((image) => {
      formData.append('images', image);
    });

    return api.post('/tenant/complaints', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // Property Media
  getPropertyImages: (id: string) => api.get(`/tenant/properties/${id}/images`),
  
  getPropertyDocuments: (id: string) => api.get(`/tenant/properties/${id}/documents`),
  
  // PG Availability
  getPGAvailability: (propertyId: string) => api.get(`/tenant/pg/${propertyId}/availability`),
  
  // Booking
  bookFlat: (propertyId: string, moveInDate?: string) => {
    const params: any = {};
    if (moveInDate) {
      params.moveInDate = moveInDate;
    }
    return api.post(`/tenant/book/flat/${propertyId}`, null, { params });
  },
  bookBed: (propertyId: string, roomId: string, bedId: string) => 
    api.post(`/tenant/book/bed/${propertyId}/${roomId}/${bedId}`),
  getBookingDetails: (bookingId: string) => api.get(`/tenant/book/bookings/${bookingId}`),
  getMyBookings: () => api.get('/tenant/book/my-bookings'),
  cancelBooking: (bookingId: string) => api.post(`/tenant/book/cancel/${bookingId}`),

  // Payment APIs
  createPaymentOrder: (bookingId: string) => 
    api.post(`/tenant/payment/online/${bookingId}`),
  verifyPayment: (razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string, bookingId: string) =>
    api.post('/tenant/payment/verify', { razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId }),
  handlePaymentFailure: (razorpayOrderId: string, bookingId: string, failureReason?: string) =>
    api.post('/tenant/payment/failure', { razorpayOrderId, bookingId, failureReason }),
  initiateCashPayment: (bookingId: string) =>
    api.post(`/tenant/payment/cash/${bookingId}`),
  getPaymentStatus: (bookingId: string) => 
    api.get(`/tenant/payment/status/${bookingId}`),
};

// Owner Complaint API
export const ownerComplaintAPI = {
  // Get all complaints for owner
  getComplaints: () => api.get('/owner/complaints'),
  
  // Get complaint by ID
  getComplaintById: (id: string) => api.get(`/owner/complaints/${id}`),
  
  // Update complaint status
  updateStatus: (id: string, status: string) => 
    api.put(`/owner/complaints/${id}/status`, { status }),
  
  // Respond to complaint
  respondToComplaint: (id: string, responseMessage: string) => 
    api.put(`/owner/complaints/${id}/respond`, { responseMessage }),
  
  // Get complaint categories, priorities, statuses
  getCategories: () => api.get('/owner/complaints/categories'),
  getPriorities: () => api.get('/owner/complaints/priorities'),
  getStatuses: () => api.get('/owner/complaints/statuses'),
};

// Rating API
export const ratingAPI = {
  // Create rating
  createRating: (propertyId: string, data: { rating: number; review?: string }) =>
    api.post(`/ratings/property/${propertyId}`, data),
  
  // Get ratings
  getPropertyRatings: (propertyId: string) => api.get(`/ratings/property/${propertyId}`),
  getAverageRating: (propertyId: string) => api.get(`/ratings/property/${propertyId}/average`),
  getTotalRatings: (propertyId: string) => api.get(`/ratings/property/${propertyId}/total`),
  
  // Manage own ratings
  updateRating: (ratingId: string, data: { rating: number; review?: string }) =>
    api.put(`/ratings/${ratingId}`, data),
  deleteRating: (ratingId: string) => api.delete(`/ratings/${ratingId}`),
};

export default api;
