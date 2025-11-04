# AI Models Configuration

## 📋 Tổng Quan

File `aiModels.ts` quản lý tập trung tất cả AI models được sử dụng trong các API của `productOptimize.ts`.

## 🎯 Lợi Ích

- **Quản lý tập trung**: Tất cả model configs ở một chỗ
- **Dễ dàng thay đổi**: Chỉ cần sửa một chỗ để thay đổi model cho bất kỳ API nào
- **Rõ ràng**: Mỗi config có description giải thích mục đích
- **Type-safe**: Sử dụng TypeScript interfaces để đảm bảo type safety
- **Consistency**: Đảm bảo tất cả API sử dụng cùng pattern

## 📁 Cấu Trúc

### AIModelConfig Interface

```typescript
interface AIModelConfig {
  model: string;          // Tên model (vd: 'x-ai/grok-4-fast')
  temperature: number;    // Độ sáng tạo (0.0 - 1.0)
  maxTokens: number;      // Số tokens tối đa
  timeout: number;        // Timeout (milliseconds)
  description?: string;   // Mô tả mục đích
}
```

### Danh Sách API Configs

| API Name | Model | Mục Đích |
|----------|-------|----------|
| `suggestData` | gemini-2.5-flash | Phân tích sản phẩm và đề xuất keywords |
| `optimize` | gpt-4o-mini | Tối ưu hóa content theo keywords |
| `generateAds` | gpt-4o-mini | Tạo quảng cáo social media |
| `optimizeAdvanced` | gpt-4o-mini | Tối ưu hóa nâng cao với variants |
| `generateLandingPage` | deepseek-v3.2-exp | Tạo landing page HTML |
| `suggestDataSegmentation` | grok-4-fast | Tạo 3 customer personas |
| `generateContentFromSegmentation` | grok-4-fast | Tạo content từ segmentation |
| `generateImagePrompt` | grok-4-fast | Phân tích ảnh và tạo prompt |
| `generateImageResult` | gemini-2.5-flash-image | Tạo ảnh mới từ prompt |
| `generateAltText` | grok-4-fast | Tạo alt text cho SEO |

## 🔧 Cách Sử Dụng

### 1. Thay Đổi Model Cho Một API

Mở file `backend/src/config/aiModels.ts` và tìm API bạn muốn thay đổi:

```typescript
// Ví dụ: Thay đổi model cho API generate-alt-text
generateAltText: {
  model: 'x-ai/grok-4-fast',  // ← Thay đổi model ở đây
  temperature: 0.7,
  maxTokens: 2000,
  timeout: 120000,
  description: 'Generate SEO-optimized alt text for product images'
}
```

### 2. Thay Đổi Tham Số (Temperature, MaxTokens, Timeout)

```typescript
// Ví dụ: Tăng creativity cho optimize-advanced
optimizeAdvanced: {
  model: 'openai/gpt-4o-mini',
  temperature: 0.95,     // ← Tăng/giảm temperature ở đây
  maxTokens: 5000,       // ← Thay đổi max tokens
  timeout: 60000,        // ← Thay đổi timeout (ms)
  description: 'Advanced optimization with multiple variants'
}
```

### 3. Thêm API Mới

```typescript
export const AI_MODELS_CONFIG = {
  // ... existing configs ...
  
  /**
   * API: /your-new-api
   * Mục đích: Mô tả chức năng của API
   */
  yourNewApi: {
    model: 'x-ai/grok-4-fast',
    temperature: 0.7,
    maxTokens: 2000,
    timeout: 60000,
    description: 'Mô tả API mới'
  } as AIModelConfig,
}
```

Sau đó trong `productOptimize.ts`:

```typescript
router.post('/your-new-api', async (req, res) => {
  // Get model config
  const modelConfig = AI_MODELS_CONFIG.yourNewApi;
  
  // Use config in API call
  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: modelConfig.model,
      temperature: modelConfig.temperature,
      max_tokens: modelConfig.maxTokens,
      // ...
    },
    {
      timeout: modelConfig.timeout
    }
  );
});
```

## 🌟 Models Có Sẵn

File cung cấp danh sách `AVAILABLE_MODELS` để tham khảo:

### OpenAI
- `openai/gpt-4o`
- `openai/gpt-4o-mini`
- `openai/gpt-4-turbo`

### Google
- `google/gemini-2.5-flash-preview-09-2025`
- `google/gemini-2.5-flash-image-preview`
- `google/gemini-pro-1.5`

### xAI (Grok)
- `x-ai/grok-4-fast` ⭐ (Recommended for image analysis & alt text)
- `x-ai/grok-2`

### DeepSeek
- `deepseek/deepseek-v3.2-exp` ⭐ (Recommended for HTML generation)
- `deepseek/deepseek-coder`

### Anthropic (Claude)
- `anthropic/claude-3.5-sonnet`
- `anthropic/claude-3-opus`

## 💡 Best Practices

### 1. Temperature Settings

- **0.0 - 0.3**: Factual, deterministic (cho data extraction, JSON parsing)
- **0.4 - 0.7**: Balanced (cho content generation, SEO)
- **0.8 - 1.0**: Creative (cho ads, landing pages, creative writing)

### 2. MaxTokens

- **500 - 1000**: Ngắn gọn (titles, summaries, keywords)
- **1000 - 3000**: Trung bình (descriptions, ads copy)
- **3000 - 8000**: Dài (landing pages, detailed content)

### 3. Timeout

- **30s (30000ms)**: Simple queries, fast models
- **60s (60000ms)**: Standard content generation
- **120s (120000ms)**: Image analysis, complex prompts
- **180s (180000ms)**: HTML generation, multiple images

### 4. Model Selection

| Task | Recommended Model | Lý Do |
|------|-------------------|-------|
| SEO Content | `grok-4-fast` | Fast, accurate, good at keywords |
| Image Analysis | `grok-4-fast` | Built-in vision capabilities |
| HTML Generation | `deepseek-v3.2-exp` | Excellent at code generation |
| Creative Ads | `gpt-4o-mini` | Creative, engaging copy |
| JSON Data | `gemini-2.5-flash` | Fast, accurate structured output |
| Image Generation | `gemini-2.5-flash-image` | Best image generation quality |

## 🔍 Debugging

### Check Config Loading

```typescript
import { AI_MODELS_CONFIG } from '../config/aiModels';

console.log('🔍 Available configs:', Object.keys(AI_MODELS_CONFIG));
console.log('🔍 Alt text config:', AI_MODELS_CONFIG.generateAltText);
```

### Override Config for Testing

```typescript
const modelConfig = getModelConfig('generateAltText', {
  model: 'openai/gpt-4o',  // Override model for testing
  temperature: 0.5          // Override temperature
});
```

## ⚠️ Lưu Ý

1. **API Keys**: Đảm bảo `OPENROUTER_API_KEY` được set trong `.env`
2. **Rate Limits**: Các model khác nhau có rate limits khác nhau
3. **Cost**: Models khác nhau có giá khác nhau - check OpenRouter pricing
4. **Fallbacks**: Một số API có fallback mechanism nếu image URLs fail

## 📚 Tài Liệu Tham Khảo

- [OpenRouter API Docs](https://openrouter.ai/docs)
- [Model Comparison](https://openrouter.ai/models)
- [Pricing](https://openrouter.ai/docs#models)

## 🚀 Ví Dụ Thực Tế

### Scenario 1: Thay đổi model cho alt text generation

**Mục tiêu**: Test xem Gemini có tốt hơn Grok không

```typescript
// File: backend/src/config/aiModels.ts
generateAltText: {
  model: 'google/gemini-2.5-flash-preview-09-2025', // Changed from grok-4-fast
  temperature: 0.7,
  maxTokens: 2000,
  timeout: 120000,
  description: 'Generate SEO-optimized alt text for product images'
}
```

### Scenario 2: Optimize chi phí

**Mục tiêu**: Giảm chi phí bằng cách dùng model rẻ hơn cho simple tasks

```typescript
// Thay vì dùng gpt-4o-mini, dùng gemini-flash (rẻ hơn)
suggestData: {
  model: 'google/gemini-2.5-flash-preview-09-2025',
  temperature: 0.7,
  maxTokens: 4000,
  timeout: 30000,
  description: 'Market analysis and keyword suggestion'
}
```

### Scenario 3: Tăng quality cho landing page

**Mục tiêu**: Tạo landing page chất lượng cao hơn

```typescript
generateLandingPage: {
  model: 'anthropic/claude-3.5-sonnet', // Upgrade to Claude
  temperature: 0.85,
  maxTokens: 8000,
  timeout: 180000,
  description: 'Generate complete HTML landing page',
  allowOverride: true
}
```

---

**Last Updated**: 2025-01-04  
**Version**: 1.0.0

