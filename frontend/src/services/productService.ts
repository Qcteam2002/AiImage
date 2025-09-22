import api from './api';

export interface Product {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  product_url?: string;
  status: 'waiting' | 'processing' | 'done' | 'error';
  analysis_result?: any;
  error_message?: string;
  created_at: string;
  analyzed_at?: string;
  updated_at: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  image_url?: string;
  product_url?: string;
}

export interface ProductListResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ProductListParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export const productService = {
  // Get all products
  async getProducts(params: ProductListParams = {}): Promise<ProductListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.status) searchParams.append('status', params.status);
    if (params.search) searchParams.append('search', params.search);
    
    const response = await api.get(`/products?${searchParams.toString()}`);
    return response.data;
  },

  // Get single product
  async getProduct(id: string): Promise<Product> {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Create new product
  async createProduct(data: CreateProductRequest): Promise<Product> {
    const response = await api.post('/products', data);
    return response.data;
  },

  // Analyze product
  async analyzeProduct(id: string): Promise<{ message: string; product: Product }> {
    const response = await api.post(`/products/${id}/analyze`);
    return response.data;
  },

  // Delete product
  async deleteProduct(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
};
