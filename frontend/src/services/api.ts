import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors
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

// Types
export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  credits: number;
  is_verified: boolean;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface ProcessImageRequest {
  modelImageUrl?: string;
  productImageUrl?: string;
  prompt?: string;
}

export interface ProcessProductImageRequest {
  productImageUrl: string;
  backgroundImageUrl?: string;
  prompt?: string;
}

export interface ProcessResponse {
  success: boolean;
  message: string;
  process: {
    id: string;
    status: string;
    result?: {
      downloadUrl: string;
      fileName: string;
    };
    remainingCredits: number;
  };
}

export interface ImageProcess {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  model_image_url: string;
  product_image_url: string;
  result_image_url?: string;
  error_message?: string;
  metadata?: any;
  created_at: string;
}

export interface ProcessingStats {
  stats: {
    totalProcessed: number;
    successful: number;
    failed: number;
    remainingCredits: number;
  };
}

// API endpoints
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AxiosResponse<{
    message: string;
    token: string;
    user: User;
  }>> => {
    return api.post('/auth/login', credentials);
  },

  register: async (credentials: RegisterCredentials): Promise<AxiosResponse<{
    message: string;
    emailSent: boolean;
    user: Omit<User, 'credits'>;
  }>> => {
    return api.post('/auth/register', credentials);
  },

  verifyEmail: async (token: string): Promise<AxiosResponse<{
    message: string;
  }>> => {
    return api.get(`/auth/verify-email/${token}`);
  },

  getProfile: async (): Promise<AxiosResponse<{ user: User }>> => {
    return api.get('/auth/profile');
  },

  refreshToken: async (): Promise<AxiosResponse<{ token: string }>> => {
    return api.post('/auth/refresh');
  },
};

export const imageAPI = {
  processWithFiles: async (formData: FormData): Promise<AxiosResponse<ProcessResponse>> => {
    return api.post('/images/process-files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // 2 minutes for image processing
    });
  },

  processWithUrls: async (data: ProcessImageRequest): Promise<AxiosResponse<ProcessResponse>> => {
    return api.post('/images/process-urls', data, {
      timeout: 120000, // 2 minutes for image processing
    });
  },

  // Product Image Tools APIs
  processProductImage: async (formData: FormData): Promise<AxiosResponse<ProcessResponse>> => {
    return api.post('/images/process-product-files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // 2 minutes for image processing
    });
  },

  processProductImageUrls: async (data: ProcessProductImageRequest): Promise<AxiosResponse<ProcessResponse>> => {
    return api.post('/images/process-product-urls', data, {
      timeout: 120000, // 2 minutes for image processing
    });
  },

  getHistory: async (limit?: number): Promise<AxiosResponse<{ processes: ImageProcess[] }>> => {
    return api.get('/images/history', {
      params: { limit },
    });
  },

  getStats: async (): Promise<AxiosResponse<ProcessingStats>> => {
    return api.get('/images/stats');
  },

  downloadImage: (filename: string): string => {
    const token = localStorage.getItem('token');
    return `${API_BASE_URL}/images/download/${filename}?token=${token}`;
  },
};

export default api;
