import api from './api';

export interface ProductAIFlow {
  id: string;
  title: string;
  image_url: string;
  status: 'waiting' | 'processing' | 'done' | 'error';
  ai_result?: AIResult;
  error_message?: string;
  created_at: string;
  generated_at?: string;
}

export interface Painpoint {
  name: string;
  description: string;
  solution: string;
  image_url: string;
}

export interface AIResult {
  painpoints: Painpoint[];
}

export interface ProductAIFlowListResponse {
  success: boolean;
  data: ProductAIFlow[];
}

export interface ProductAIFlowResponse {
  success: boolean;
  data: ProductAIFlow;
}

export const productAIFlowService = {
  // Get all AI flows
  getAIFlows: async (): Promise<ProductAIFlowListResponse> => {
    const response = await api.get('/product-ai-flows');
    return response.data;
  },

  // Get specific AI flow
  getAIFlow: async (id: string): Promise<ProductAIFlowResponse> => {
    const response = await api.get(`/product-ai-flows/${id}`);
    return response.data;
  },

  // Create AI flow with URL
  createAIFlow: async (title: string, imageUrl: string): Promise<ProductAIFlowResponse> => {
    const response = await api.post('/product-ai-flows', {
      title,
      image_url: imageUrl
    });
    return response.data;
  },

  // Create AI flow with file upload
  createAIFlowWithUpload: async (title: string, imageFile: File): Promise<ProductAIFlowResponse> => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('image', imageFile);

    const response = await api.post('/product-ai-flows/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Generate AI flow
  generateAIFlow: async (id: string): Promise<{ success: boolean; message: string; data: any }> => {
    const response = await api.post(`/product-ai-flows/${id}/generate`);
    return response.data;
  },

  // Delete AI flow
  deleteAIFlow: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/product-ai-flows/${id}`);
    return response.data;
  }
};





