# 🔌 API Documentation

Complete API reference for all AIImage services.

## 📑 Available APIs

### Core APIs
- **[Complete API Reference](./complete-api.md)** - Full API documentation
- **[Product Optimize API](./product-optimize.md)** - Product optimization endpoints
- **[Product Optimize Reference](./product-optimize-reference.md)** - Detailed reference

### AI & Generation
- **[Image Generation - Basic](./image-generation-basic.md)** - Basic image generation
- **[Image Generation - Optimized](./image-generation-optimized.md)** - ⭐ NEW: Persona-driven prompts
- **[Image Generation - Complete](./image-generation-complete.md)** - Full workflow guide
- **[Image Prompt Generation](./image-prompt-generation.md)** - 🆕 NEW: Generate image prompts from product images, title, description and style
- **[Content Generation](./content-generation.md)** - AI content creation
- **[Content Generation Retry](./content-generation-retry.md)** - 🔄 NEW: Retry/Optimize content generation
- **[Content Generation Retry (Quick)](./content-generation-retry-quick.md)** - Quick reference for retry feature
- **[Feature Highlights API](./feature-highlights-api.md)** - 🆕 NEW: Generate feature highlights with images
- **[Feature Highlights API (Quick)](./feature-highlights-api-quick.md)** - Quick reference for feature highlights
- **[Alt Text Generation](./alt-text-generation.md)** - 🆕 AI-powered alt text generation with image analysis

### Segmentation
- **[Segmentation API](./segmentation.md)** - Customer segmentation endpoints

## 🚀 Quick Start

### Image Prompt Generation

```javascript
// Example: Generate image prompt for a product
const response = await fetch('http://localhost:3001/api/product-optimize/generate-image-prompt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productImages: ["https://example.com/product1.jpg", "https://example.com/product2.jpg"],
    productTitle: "Premium Leather Backpack",
    productDescription: "High-quality leather backpack for travelers",
    requestedStyle: "lifestyle"
  })
});

const data = await response.json();
// data.data.prompt contains the generated prompt
// data.data.aspectRatio contains recommended aspect ratio
```

### Segmentation API

```javascript
// Example: Call segmentation API
const response = await fetch('http://localhost:3001/api/product-optimize/suggestDataSegmentation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: "Product Name",
    description: "Product description",
    images: ["url1.jpg", "url2.jpg"],
    targetMarket: "us",
    language: "en-US"
  })
});

const data = await response.json();
// data.segmentations contains customer personas
```

## 🔄 Latest Updates

### January 2025
- **Image Prompt Generation API** - 🆕 NEW: Generate optimized image prompts based on product images, title, description and 8 different styles (studio, lifestyle, UGC, meta ugly ad, luxury, sale banner, futuristic, infographic)
- **Feature Highlights API** - 🆕 NEW: Generate feature highlights (title, description, image) for products
- **Content Generation Retry** - 🔄 NEW: Retry/Optimize feature to generate improved content versions
- **Alt Text Generation API** - 🆕 AI-powered alt text generation with direct image analysis
- **Product Optimize** - Enhanced with market-specific features
- **Content Generation** - Added tone and voice guidelines

### November 2025
- **Image Generation API** - Optimized with persona-driven single-style prompts
- **Segmentation API** - Pain points split into primary + secondary

## 📚 Related Docs

- [Quick Start Guide](../guides/quick-start.md)
- [API Integration Fixes](../guides/api-integration-fixes.md)
- [Deployment Guide](../deployment/guide.md)

