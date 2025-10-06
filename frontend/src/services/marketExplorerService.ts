import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create axios instance with auth header
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/market-explorer`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface MarketExplorer {
  id: string;
  target_country: string;
  business_model: string;
  industry_category?: string;
  product_features?: string;
  business_goals: string;
  language: string;
  status: 'waiting' | 'processing' | 'done' | 'error';
  analysis_result?: string;
  error_message?: string;
  analyzed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMarketExplorerData {
  target_country: string;
  business_model: string;
  industry_category?: string;
  product_features?: string;
  business_goals: string;
  language?: string;
}

export interface MarketExplorersResponse {
  marketExplorers: MarketExplorer[];
  total: number;
  limit: number;
  offset: number;
}

export interface GetMarketExplorersParams {
  search?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export const marketExplorerService = {
  // Get all market explorers
  getMarketExplorers: async (params: GetMarketExplorersParams = {}): Promise<MarketExplorersResponse> => {
    const response = await apiClient.get('/', { params });
    return response.data;
  },

  // Get single market explorer
  getMarketExplorer: async (id: string): Promise<MarketExplorer> => {
    const response = await apiClient.get(`/${id}`);
    return response.data;
  },

  // Create new market explorer
  createMarketExplorer: async (data: CreateMarketExplorerData): Promise<MarketExplorer> => {
    const response = await apiClient.post('/', data);
    return response.data;
  },

  // Analyze market explorer
  analyzeMarketExplorer: async (id: string): Promise<{ message: string; status: string; id: string }> => {
    const response = await apiClient.post(`/${id}/analyze`);
    return response.data;
  },

  // Delete market explorer
  deleteMarketExplorer: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/${id}`);
    return response.data;
  },
};

export default marketExplorerService;
