// Demo script để test tính năng Product Analysis
// Chạy: node test-product-analysis.js

const API_BASE = 'http://localhost:3001/api';

// Mock user data (cần đăng nhập thực tế để lấy token)
const MOCK_TOKEN = 'your-jwt-token-here';

async function testProductAnalysis() {
  console.log('🧪 Testing Product Analysis API...\n');

  try {
    // 1. Test tạo sản phẩm mới
    console.log('1. Creating new product...');
    const createResponse = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MOCK_TOKEN}`
      },
      body: JSON.stringify({
        name: 'Xiaomi A98 Wireless Earbuds',
        description: 'Tai nghe không dây với pin 60h và độ trễ thấp 4ms',
        image_url: 'https://via.placeholder.com/400x300',
        product_url: 'https://shopee.vn/xiaomi-a98-wireless-earbuds'
      })
    });

    if (!createResponse.ok) {
      throw new Error(`Create failed: ${createResponse.status}`);
    }

    const product = await createResponse.json();
    console.log('✅ Product created:', product.id);
    console.log('   Name:', product.name);
    console.log('   Status:', product.status);

    // 2. Test phân tích sản phẩm
    console.log('\n2. Starting product analysis...');
    const analyzeResponse = await fetch(`${API_BASE}/products/${product.id}/analyze`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MOCK_TOKEN}`
      }
    });

    if (!analyzeResponse.ok) {
      throw new Error(`Analysis failed: ${analyzeResponse.status}`);
    }

    const analysisResult = await analyzeResponse.json();
    console.log('✅ Analysis started:', analysisResult.message);

    // 3. Test lấy danh sách sản phẩm
    console.log('\n3. Fetching products list...');
    const listResponse = await fetch(`${API_BASE}/products`, {
      headers: {
        'Authorization': `Bearer ${MOCK_TOKEN}`
      }
    });

    if (!listResponse.ok) {
      throw new Error(`List failed: ${listResponse.status}`);
    }

    const productsList = await listResponse.json();
    console.log('✅ Products list fetched:');
    console.log('   Total products:', productsList.pagination.total);
    console.log('   Products:', productsList.products.map(p => ({
      id: p.id,
      name: p.name,
      status: p.status
    })));

    // 4. Test lấy chi tiết sản phẩm
    console.log('\n4. Fetching product details...');
    const detailResponse = await fetch(`${API_BASE}/products/${product.id}`, {
      headers: {
        'Authorization': `Bearer ${MOCK_TOKEN}`
      }
    });

    if (!detailResponse.ok) {
      throw new Error(`Detail failed: ${detailResponse.status}`);
    }

    const productDetail = await detailResponse.json();
    console.log('✅ Product details fetched:');
    console.log('   Name:', productDetail.name);
    console.log('   Status:', productDetail.status);
    console.log('   Has analysis result:', !!productDetail.analysis_result);

    console.log('\n🎉 All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('401')) {
      console.log('\n💡 Tip: Cần đăng nhập để lấy JWT token thực tế');
      console.log('   1. Chạy frontend: npm run dev');
      console.log('   2. Đăng nhập và lấy token từ localStorage');
      console.log('   3. Cập nhật MOCK_TOKEN trong script này');
    }
  }
}

// Chạy test
testProductAnalysis();
