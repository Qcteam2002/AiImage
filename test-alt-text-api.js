// Test Alt Text API using Node.js built-in fetch (Node 18+)
const testData = {
  productTitle: "Khuyên Tai Ngọc Trai Vỏ Sò Sang Trọng Nhẹ Nhàng Cho Công Việc",
  images: [
    { id: "gid://shopify/ProductImage/41582085079196", url: "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/S0c93103a5e08483d98dddc6682a2e1ced.webp?v=1743750957" },
    { id: "gid://shopify/ProductImage/41582085111964", url: "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/S0c93103a5e08483d98dddc6682a2e1ced.webp?v=1743750957" },
    { id: "gid://shopify/ProductImage/41582085144732", url: "https://cdn.shopify.com/s/files/1/0679/2540/9948/files/S0c93103a5e08483d98dddc6682a2e1ced.webp?v=1743750957" }
  ],
  selectedSegment: {
    name: "Urban Career Woman",
    keywordSuggestions: [
      "elegant freshwater pearl earrings",
      "lightweight shell earrings for work",
      "professional pearl jewelry",
      "business casual earrings",
      "sophisticated workplace accessories"
    ]
  },
  targetMarket: "us",
  tone: "friendly",
  language: "vn" // Test với tiếng Việt
};

async function testAltTextAPI() {
  try {
    console.log('🧪 Testing Alt Text Generation API...\n');
    console.log('📦 Request Data:');
    console.log(`   Product: ${testData.productTitle}`);
    console.log(`   Images: ${testData.images.length}`);
    console.log(`   Target Audience: ${testData.selectedSegment.name}`);
    console.log(`   Keywords: ${testData.selectedSegment.keywordSuggestions.slice(0, 3).join(', ')}`);
    console.log('\n🔄 Sending request to http://localhost:3001/api/product-optimize/generate-alt-text...\n');

    const response = await fetch('http://localhost:3001/api/product-optimize/generate-alt-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    const data = await response.json();

    console.log('✅ Response received!\n');
    console.log('📊 Response Status:', response.status);
    console.log('\n📝 Full Response:');
    console.log(JSON.stringify(data, null, 2));
    
    console.log('\n📋 Alt Texts Summary:');
    if (data.success && data.data && data.data.images) {
      data.data.images.forEach((item, index) => {
        console.log(`   ${index + 1}. [${item.imageId}] ${item.altText}`);
      });
      console.log(`\n✅ Total: ${data.data.count} alt texts generated`);
    } else {
      console.log('❌ Unexpected response structure');
    }

  } catch (error) {
    console.error('\n❌ Error testing API:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Server is not running!');
      console.error('   Please start the server first:');
      console.error('   cd backend && npm run dev');
    }
  }
}

testAltTextAPI();
