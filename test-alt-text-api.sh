#!/bin/bash

# Test data for Alt Text API
curl -X POST http://localhost:3001/api/product-optimize/generate-alt-text \
  -H "Content-Type: application/json" \
  -d '{
    "productTitle": "Khuyên Tai Ngọc Trai Vỏ Sò Sang Trọng Nhẹ Nhàng Cho Công Việc",
    "images": [
      {"id": "gid://shopify/ProductImage/41582085079196"},
      {"id": "gid://shopify/ProductImage/41582085111964"},
      {"id": "gid://shopify/ProductImage/41582085144732"},
      {"id": "gid://shopify/ProductImage/41582085177500"},
      {"id": "gid://shopify/ProductImage/41582085210268"},
      {"id": "gid://shopify/ProductImage/41582085243036"},
      {"id": "gid://shopify/ProductImage/41582085275804"}
    ],
    "selectedSegment": {
      "name": "Urban Career Woman",
      "keywordSuggestions": [
        "elegant freshwater pearl earrings",
        "lightweight shell earrings for work",
        "professional pearl jewelry",
        "business casual earrings",
        "sophisticated workplace accessories"
      ]
    },
    "targetMarket": "us",
    "tone": "friendly"
  }' | jq '.'

echo ""
echo "✅ Test completed!"

