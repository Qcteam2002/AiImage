/**
 * AI Models Configuration
 * Centralized configuration for all AI models used in productOptimize APIs
 * 
 * Để thay đổi model cho bất kỳ API nào, chỉ cần sửa giá trị 'model' tương ứng
 */

export interface AIModelConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  timeout: number; // milliseconds
  description?: string;
}

export const AI_MODELS_CONFIG = {
  /**
   * API: /suggest-data
   * Mục đích: Phân tích sản phẩm và đề xuất keywords, segments, painpoints
   */
  suggestData: {
    model: 'google/gemini-2.5-flash-preview-09-2025',
    temperature: 0.7,
    maxTokens: 4000,
    timeout: 30000,
    description: 'Market analysis and keyword suggestion'
  } as AIModelConfig,

  /**
   * API: /optimize
   * Mục đích: Tối ưu hóa content sản phẩm (title + description) theo keywords
   */
  optimize: {
    model: 'openai/gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 2000,
    timeout: 60000,
    description: 'Content optimization for keywords'
  } as AIModelConfig,

  /**
   * API: /generate-ads
   * Mục đích: Tạo quảng cáo cho Facebook, Instagram, TikTok
   */
  generateAds: {
    model: 'openai/gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 3000,
    timeout: 60000,
    description: 'Generate ads for social media platforms'
  } as AIModelConfig,

  /**
   * API: /optimize-advanced
   * Mục đích: Tối ưu hóa nâng cao với nhiều variants
   */
  optimizeAdvanced: {
    model: 'openai/gpt-4o-mini',
    temperature: 0.95, // High temperature for creativity
    maxTokens: 5000,
    timeout: 60000,
    description: 'Advanced optimization with multiple variants'
  } as AIModelConfig,

  /**
   * API: /generate-landing-page
   * Mục đích: Tạo landing page HTML hoàn chỉnh
   */
  generateLandingPage: {
    model: 'deepseek/deepseek-v3.2-exp', // Default model, có thể override từ request
    temperature: 0.85,
    maxTokens: 8000,
    timeout: 180000, // 3 minutes
    description: 'Generate complete HTML landing page',
    allowOverride: true // Cho phép override từ request body (ai_model parameter)
  } as AIModelConfig & { allowOverride?: boolean },

  /**
   * API: /suggestDataSegmentation
   * Mục đích: Phân tích và tạo 3 segmentation personas chi tiết
   */
  suggestDataSegmentation: {
    model: 'x-ai/grok-4-fast',
    temperature: 0.5,
    maxTokens: 8192,
    timeout: 200000, // 200 seconds for complex prompts
    description: 'Generate 3 detailed customer personas'
  } as AIModelConfig,

  /**
   * API: /generate-content-from-segmentation
   * Mục đích: Tạo content (title + HTML description) dựa trên segmentation
   */
  generateContentFromSegmentation: {
    model: 'x-ai/grok-4-fast',
    temperature: 0.7,
    maxTokens: 4096,
    timeout: 60000,
    description: 'Generate optimized content from segmentation data'
  } as AIModelConfig,

  /**
   * API: /generate-image (Step 1)
   * Mục đích: Phân tích hình ảnh và tạo prompt cho 1 style được chỉ định
   */
  generateImagePrompt: {
    model: 'x-ai/grok-4-fast',
    temperature: 0.7,
    maxTokens: 2048,
    timeout: 60000,
    description: 'Analyze product images and generate prompt for requested style'
  } as AIModelConfig,

  /**
   * API: /generate-image-result (Step 2)
   * Mục đích: Sử dụng prompt để tạo hình ảnh mới
   */
  generateImageResult: {
    model: 'google/gemini-2.5-flash-image',
    temperature: 0.7,
    maxTokens: 4096,
    timeout: 120000, // 2 minutes
    description: 'Generate new product image from prompt'
  } as AIModelConfig,

  /**
   * API: /generate-alt-text
   * Mục đích: Phân tích hình ảnh và tạo alt text cho SEO
   */
  generateAltText: {
    model: 'x-ai/grok-4-fast',
    temperature: 0.7,
    maxTokens: 2000,
    timeout: 120000, // 2 minutes for image analysis
    description: 'Generate SEO-optimized alt text for product images'
  } as AIModelConfig,
} as const;

/**
 * Helper function to get model config with optional overrides
 */
export function getModelConfig(
  apiName: keyof typeof AI_MODELS_CONFIG,
  overrides?: Partial<AIModelConfig>
): AIModelConfig {
  const baseConfig = AI_MODELS_CONFIG[apiName];
  
  if (!baseConfig) {
    throw new Error(`Unknown API name: ${apiName}`);
  }

  return {
    ...baseConfig,
    ...overrides
  };
}

/**
 * List all available models for quick reference
 */
export const AVAILABLE_MODELS = {
  openai: [
    'openai/gpt-4o',
    'openai/gpt-4o-mini',
    'openai/gpt-4-turbo',
  ],
  google: [
    'google/gemini-2.5-flash-preview-09-2025',
    'google/gemini-2.5-flash-image-preview',
    'google/gemini-pro-1.5',
  ],
  xai: [
    'x-ai/grok-4-fast',
    'x-ai/grok-2',
  ],
  deepseek: [
    'deepseek/deepseek-v3.2-exp',
    'deepseek/deepseek-coder',
  ],
  anthropic: [
    'anthropic/claude-3.5-sonnet',
    'anthropic/claude-3-opus',
  ],
} as const;

/**
 * Export type for TypeScript type checking
 */
export type AIModelConfigKey = keyof typeof AI_MODELS_CONFIG;

