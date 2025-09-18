(function() {
  'use strict';

  if (window.VirtualTryOnWidgetLoaded) return;
  window.VirtualTryOnWidgetLoaded = true;

  // Global variables
  let uploadedImageFile = null;
  let currentConfig = {};
  let selectedProductImageUrl = null;

  // Initialize widget
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWidget);
  } else {
    initializeWidget();
  }

  function initializeWidget() {
    const widgets = document.querySelectorAll('.virtual-tryon-widget');
    
    widgets.forEach(widget => {
      const blockId = widget.dataset.blockId;
      const config = window.TryOnWidgetConfig?.[blockId];
      
      if (config && config.enabled) {
        renderWidget(widget, config);
      }
    });
  }

  function renderWidget(container, config) {
    const button = document.createElement('button');
    button.className = 'virtual-tryon-button';
    button.textContent = config.buttonText || '👗 Virtual Try-On';
    button.style.backgroundColor = config.buttonColor || '#3B82F6';
    
    button.addEventListener('click', () => openTryOnPopup(config));
    
    container.innerHTML = '';
    container.appendChild(button);
  }

  function openTryOnPopup(config) {
    currentConfig = config;
    const overlay = document.createElement('div');
    overlay.className = 'tryon-popup-overlay';
    overlay.innerHTML = createPopupHTML();
    
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('active'), 10);
    
    setupPopupEvents(overlay);
    loadProductImages(overlay);
  }

  function createPopupHTML() {
    return `
      <div class="tryon-popup">
        <div class="tryon-popup-header">
          <h3>✨ Virtual Try-On</h3>
          <button class="tryon-popup-close">&times;</button>
        </div>
        <div class="tryon-popup-body">
          <!-- Upload Step -->
          <div id="upload-step" class="popup-step">
            <div style="display: flex; gap: 20px; min-height: 400px;">
              <!-- Left: Product Images -->
              <div style="flex: 1; border-right: 1px solid #eee; padding-right: 20px;">
                <h4 style="margin-bottom: 15px;">📸 Choose Product Image</h4>
                <div id="product-images-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 10px; max-height: 300px; overflow-y: auto;">
                  <!-- Product images will be loaded here -->
                </div>
              </div>
              
              <!-- Right: User Upload -->
              <div style="flex: 1; padding-left: 20px;">
                <h4 style="margin-bottom: 15px;">👤 Upload Your Photo</h4>
                <p style="color: #666; margin-bottom: 20px; font-size: 14px;">
                  For best results, use a clear full-body photo with good lighting
                </p>
                <div class="upload-area" id="upload-area">
                  <div class="upload-icon">📷</div>
                  <p>Drag & drop your photo here or click to browse</p>
                  <button class="upload-button">Choose Photo</button>
                </div>
                <input type="file" id="file-input" accept="image/*" style="display: none;">
                <div id="preview-area" style="display: none;">
                  <img id="preview-image" style="max-width: 100%; max-height: 200px; border-radius: 8px; margin-bottom: 15px;">
                  
                  <!-- Custom Prompt Section -->
                  <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; font-size: 14px;">
                      ✨ Custom Prompt (Optional)
                    </label>
                    <textarea 
                      id="custom-prompt" 
                      placeholder="Describe how you want the virtual try-on to look (e.g., 'wearing it casually', 'in a professional setting', 'with elegant styling')"
                      style="
                        width: 100%; 
                        height: 60px; 
                        padding: 8px; 
                        border: 1px solid #ddd; 
                        border-radius: 4px; 
                        font-size: 13px; 
                        resize: vertical;
                        font-family: inherit;
                      "
                    ></textarea>
                    <p style="color: #666; font-size: 12px; margin-top: 4px;">
                      Leave empty to use default prompt
                    </p>
                  </div>
                  
                  <div style="text-align: center;">
                    <button class="upload-button" id="process-button" style="background: #007cba; margin-right: 10px;">
                      🪄 Try On Selected Product
                    </button>
                    <button class="upload-button" id="change-photo-button" style="background: #666;">
                      📷 Change Photo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Processing Step -->
          <div id="processing-step" class="popup-step" style="display: none;">
            <div class="processing-area" style="text-align: center; padding: 40px 20px;">
              <div class="spinner"></div>
              <p><strong>AI is creating your virtual try-on...</strong></p>
              <p style="color: #666; margin-bottom: 20px;">This may take 10-30 seconds</p>
              <div style="background: #f0f8ff; padding: 15px; border-radius: 8px;">
                <p style="font-size: 14px; color: #0066cc; margin: 0;">
                  🤖 Using advanced AI to fit the product perfectly on your body
                </p>
              </div>
            </div>
          </div>
          
          <!-- Result Step -->
          <div id="result-step" class="popup-step" style="display: none;">
            <div class="result-area">
              <p><strong>✨ Your Virtual Try-On Result</strong></p>
              <div id="result-container" style="text-align: center; margin: 20px 0;">
                <!-- AI generated image will be inserted here -->
              </div>
              <div style="text-align: center;">
                <button class="upload-button" id="add-to-cart-button" style="background: #28a745; margin-right: 10px;">
                  🛒 Add to Cart
                </button>
                <button class="upload-button" id="try-another-button" style="background: #666; margin-right: 10px;">
                  📷 Try Another Photo
                </button>
                <button class="upload-button" id="share-button" style="background: #1da1f2;">
                  📱 Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function setupPopupEvents(overlay) {
    const closeBtn = overlay.querySelector('.tryon-popup-close');
    const uploadArea = overlay.querySelector('#upload-area');
    const fileInput = overlay.querySelector('#file-input');
    const previewArea = overlay.querySelector('#preview-area');
    const previewImage = overlay.querySelector('#preview-image');
    const processButton = overlay.querySelector('#process-button');
    const changePhotoButton = overlay.querySelector('#change-photo-button');

    // Close events
    closeBtn.addEventListener('click', closePopup);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closePopup();
    });

    // Upload events
    uploadArea.addEventListener('click', () => fileInput.click());
    
    // Drag & drop events
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = '#007cba';
      uploadArea.style.backgroundColor = '#f0f8ff';
    });
    
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.style.borderColor = '#ddd';
      uploadArea.style.backgroundColor = 'transparent';
    });
    
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = '#ddd';
      uploadArea.style.backgroundColor = 'transparent';
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileUpload(files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files[0]) {
        handleFileUpload(e.target.files[0]);
      }
    });

    // Process button
    processButton.addEventListener('click', processTryOn);
    
    // Change photo button
    changePhotoButton.addEventListener('click', () => {
      uploadedImageFile = null;
      previewArea.style.display = 'none';
      uploadArea.style.display = 'block';
    });

    function closePopup() {
      overlay.classList.remove('active');
      setTimeout(() => document.body.removeChild(overlay), 300);
    }

    function handleFileUpload(file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('File size too large. Please select an image under 10MB.');
        return;
      }

      uploadedImageFile = file;
      
      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImage.src = e.target.result;
        uploadArea.style.display = 'none';
        previewArea.style.display = 'block';
      };
      reader.readAsDataURL(file);

      // Track upload event
      console.log('Photo uploaded:', file.name, file.size);
    }

    async function processTryOn() {
      if (!uploadedImageFile) {
        alert('Please upload a photo first.');
        return;
      }

      if (!selectedProductImageUrl) {
        alert('Please select a product image first.');
        return;
      }

      // Show processing step
      overlay.querySelector('#upload-step').style.display = 'none';
      overlay.querySelector('#processing-step').style.display = 'block';

      try {
        // Get product information
        const productTitle = getProductTitle();

        // Get custom prompt
        const customPrompt = overlay.querySelector('#custom-prompt').value.trim();
        
        // Prepare form data
        const formData = new FormData();
        formData.append('productImageUrl', selectedProductImageUrl);
        formData.append('userImage', uploadedImageFile);
        formData.append('productTitle', productTitle);
        formData.append('customPrompt', customPrompt);

        // Call API - Use the correct app server URL
        const appServerUrl = window.location.origin.includes('myshopify.com') 
          ? 'http://localhost:57904' // Development - update port
          : window.location.origin; // Production
        
        const response = await fetch(`${appServerUrl}/api/tryon-generate`, {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        console.log('API Response:', result);

        if (result.success) {
          console.log('Generated Image URL:', result.generatedImageUrl);
          showResult(result.generatedImageUrl);
        } else {
          throw new Error(result.error || 'Failed to generate virtual try-on');
        }

      } catch (error) {
        console.error('Processing error:', error);
        alert('Sorry, there was an error processing your image. Please try again.');
        
        // Back to upload step
        overlay.querySelector('#processing-step').style.display = 'none';
        overlay.querySelector('#upload-step').style.display = 'block';
      }
    }

    function showResult(generatedImageUrl) {
      overlay.querySelector('#processing-step').style.display = 'none';
      overlay.querySelector('#result-step').style.display = 'block';
      
      // Display generated image
      const resultContainer = overlay.querySelector('#result-container');
      resultContainer.innerHTML = `
        <img src="${generatedImageUrl}" 
             style="max-width: 100%; max-height: 400px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" 
             alt="Virtual Try-On Result">
        <p style="font-size: 14px; color: #666; margin-top: 10px;">
          ✨ AI-generated virtual try-on result
        </p>
      `;

      // Setup result buttons
      overlay.querySelector('#add-to-cart-button').addEventListener('click', () => {
        // Find and click add to cart button
        const addToCartButton = document.querySelector('button[name="add"], button[type="submit"][name="add"], .btn-product-add, .product-form__cart-submit, [data-add-to-cart]');
        if (addToCartButton) {
          addToCartButton.click();
        }
        closePopup();
      });

      overlay.querySelector('#try-another-button').addEventListener('click', () => {
        // Reset to upload step
        overlay.querySelector('#result-step').style.display = 'none';
        overlay.querySelector('#upload-step').style.display = 'block';
        uploadedImageFile = null;
        previewArea.style.display = 'none';
        uploadArea.style.display = 'block';
      });

      overlay.querySelector('#share-button').addEventListener('click', () => {
        // Share functionality
        if (navigator.share) {
          navigator.share({
            title: 'Check out my virtual try-on!',
            text: 'See how this product looks on me with AI virtual try-on',
            url: window.location.href
          });
    } else {
          // Fallback: copy to clipboard
          navigator.clipboard.writeText(window.location.href);
          alert('Link copied to clipboard!');
        }
      });
    }
  }

  // Helper functions
  function getProductImageUrl() {
    // Try to find product image from various selectors
    const selectors = [
      '.product__media img',
      '.product-single__media img', 
      '.featured-image img',
      '.product-image img',
      '.product-photo img',
      'img[data-product-image]',
      '.product__image img'
    ];

    for (const selector of selectors) {
      const img = document.querySelector(selector);
      if (img && img.src) {
        return img.src;
      }
    }

    // Fallback: get first image on page
    const firstImg = document.querySelector('img[src*="cdn.shopify.com"]');
    return firstImg?.src || null;
  }

  function getProductTitle() {
    const selectors = [
      '.product__title',
      '.product-single__title', 
      '.product-title',
      '.product__name',
      'h1.product',
      '[data-product-title]'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element.textContent.trim();
      }
    }

    return document.title || 'this product';
  }

  function loadProductImages(overlay) {
    const container = overlay.querySelector('#product-images-container');
    if (!container) return;

    // Get images directly from DOM (more reliable for password-protected stores)
    const images = getAllProductImages();
    
    if (images.length === 0) {
      container.innerHTML = '<p style="color: #666; text-align: center;">No product images found</p>';
      return;
    }

    // Create image thumbnails
    images.forEach((imageUrl, index) => {
      const imgContainer = document.createElement('div');
      imgContainer.className = 'product-image-thumbnail';
      imgContainer.style.cssText = `
        width: 80px;
        height: 80px;
        border: 2px solid #ddd;
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
      `;

      const img = document.createElement('img');
      img.src = imageUrl;
      img.alt = 'Product image';
      img.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
      `;

      imgContainer.appendChild(img);
      container.appendChild(imgContainer);

      // Add click handler
      imgContainer.addEventListener('click', () => {
        // Remove previous selection
        container.querySelectorAll('.product-image-thumbnail').forEach(thumb => {
          thumb.style.borderColor = '#ddd';
          thumb.style.backgroundColor = 'transparent';
        });

        // Select this image
        imgContainer.style.borderColor = '#007cba';
        imgContainer.style.backgroundColor = '#f0f8ff';
        selectedProductImageUrl = imageUrl;
        
        console.log('Selected product image:', imageUrl);
      });

      // Select first image by default
      if (index === 0) {
        imgContainer.click();
      }
    });
  }

  function getAllProductImages() {
    const images = [];
    
    // Try to find product images from various selectors - expanded list
    const selectors = [
      // Shopify theme selectors
      '.product__media img',
      '.product-single__media img', 
      '.featured-image img',
      '.product-image img',
      '.product-photo img',
      'img[data-product-image]',
      '.product__image img',
      '.product-gallery img',
      '.product-images img',
      '.product-media img',
      '.product-photos img',
      '.product-thumbnails img',
      '.product-slider img',
      '.product-carousel img',
      
      // Generic selectors
      '.media img',
      '.gallery img',
      '.thumbnails img',
      '.slider img',
      '.carousel img',
      
      // Dawn theme specific
      '.product__media-wrapper img',
      '.product__media-item img',
      '.product__media-list img',
      '.product__media-slider img',
      
      // Other common selectors
      '[data-product-media] img',
      '[data-media-id] img',
      '.product__main img',
      '.product__content img'
    ];

    selectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(img => {
          if (img.src && 
              (img.src.includes('cdn.shopify.com') || img.src.includes('shopify')) && 
              !images.includes(img.src) &&
              img.src !== 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4=') {
            images.push(img.src);
          }
        });
      } catch (e) {
        console.log('Error with selector:', selector, e);
      }
    });

    // If still no images, try to get any images on the page
    if (images.length === 0) {
      const allImages = document.querySelectorAll('img');
      allImages.forEach(img => {
        if (img.src && 
            (img.src.includes('cdn.shopify.com') || img.src.includes('shopify')) && 
            !images.includes(img.src) &&
            img.src !== 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4=') {
          images.push(img.src);
        }
      });
    }

    console.log('Found product images:', images);
    return images.slice(0, 15); // Increased limit to 15 images
  }

})();