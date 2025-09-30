import api from './api';

export interface ProductImageGenerator {
  id: string;
  user_id: string;
  title: string;
  image_url: string;
  status: 'waiting' | 'processing' | 'done' | 'error';
  generation_result: string | null;
  error_message: string | null;
  created_at: string;
  generated_at: string | null;
  updated_at: string;
}

export interface ProductImageGeneratorListResponse {
  data: ProductImageGenerator[];
  total: number;
  page: number;
  limit: number;
}

export interface Painpoint {
  name: string;
  painpoint: string;
  solution: string;
  prompt: string;
}

export interface GenerationResult {
  product_title: string;
  image_reference: string;
  market: string;
  painpoints: Painpoint[];
}

export const productImageGeneratorService = {
  // Get all product image generators
  getGenerators: async (search?: string, status?: string): Promise<ProductImageGenerator[]> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    
    const response = await api.get(`/product-image-generators?${params.toString()}`);
    return response.data;
  },

  // Get single product image generator
  getGenerator: async (id: string): Promise<ProductImageGenerator> => {
    const response = await api.get(`/product-image-generators/${id}`);
    return response.data;
  },

  // Create new product image generator
  createGenerator: async (title: string, image_url: string): Promise<ProductImageGenerator> => {
    const response = await api.post('/product-image-generators', {
      title,
      image_url
    });
    return response.data;
  },

  // Generate image prompts
  generatePrompts: async (id: string): Promise<{ message: string; generator: ProductImageGenerator }> => {
    const response = await api.post(`/product-image-generators/${id}/generate`);
    return response.data;
  },

  // Generate image from prompt
  generateImage: async (id: string, prompt: string, painpointIndex: number): Promise<{ success: boolean; generatedImageUrl: string; prompt: string; painpointIndex: number }> => {
    const response = await api.post(`/product-image-generators/${id}/generate-image`, {
      prompt,
      painpointIndex
    });
    return response.data;
  },

  // Delete product image generator
  deleteGenerator: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/product-image-generators/${id}`);
    return response.data;
  }
};
