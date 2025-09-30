const API_BASE_URL = '';

export interface ProductAff {
  id: string;
  target_market: string;
  image1: string;
  image2?: string;
  title?: string;
  description?: string;
  status: 'waiting' | 'processing' | 'done' | 'error';
  analysis_result?: string;
  created_at: string;
  updated_at: string;
  analyzed_at?: string;
}

export interface CreateProductAffRequest {
  target_market: string;
  image1: string;
  image2?: string;
  title?: string;
  description?: string;
}

export interface GetProductsAffParams {
  search?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface GetProductsAffResponse {
  products: ProductAff[];
  total: number;
  limit: number;
  offset: number;
}

class ProductAffService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('token');
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('API Request URL:', url);
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('endpoint:', endpoint);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getProducts(params: GetProductsAffParams = {}): Promise<GetProductsAffResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.search) searchParams.append('search', params.search);
    if (params.status) searchParams.append('status', params.status);
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());

    const queryString = searchParams.toString();
    const endpoint = `/api/product-aff${queryString ? `?${queryString}` : ''}`;

    return this.request<GetProductsAffResponse>(endpoint);
  }

  async getProduct(id: string): Promise<ProductAff> {
    return this.request<ProductAff>(`/api/product-aff/${id}`);
  }

  async createProduct(data: CreateProductAffRequest): Promise<ProductAff> {
    return this.request<ProductAff>('/api/product-aff', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async analyzeProduct(id: string): Promise<ProductAff> {
    return this.request<ProductAff>(`/api/product-aff/${id}/analyze`, {
      method: 'POST',
    });
  }

  async deleteProduct(id: string): Promise<void> {
    return this.request<void>(`/api/product-aff/${id}`, {
      method: 'DELETE',
    });
  }
}

export const productAffService = new ProductAffService();
