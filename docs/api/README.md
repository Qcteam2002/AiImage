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
- **[Content Generation](./content-generation.md)** - AI content creation
- **[Alt Text Generation](./alt-text-generation.md)** - 🆕 AI-powered alt text generation with image analysis

### Segmentation
- **[Segmentation API](./segmentation.md)** - Customer segmentation endpoints

## 🚀 Quick Start

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
- **Alt Text Generation API** - 🆕 NEW: AI-powered alt text generation with direct image analysis
- **Product Optimize** - Enhanced with market-specific features
- **Content Generation** - Added tone and voice guidelines

### November 2025
- **Image Generation API** - Optimized with persona-driven single-style prompts
- **Segmentation API** - Pain points split into primary + secondary

## 📚 Related Docs

- [Quick Start Guide](../guides/quick-start.md)
- [API Integration Fixes](../guides/api-integration-fixes.md)
- [Deployment Guide](../deployment/guide.md)

