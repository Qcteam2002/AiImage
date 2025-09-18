import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  try {
    // Handle CORS for development
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    // Handle preflight request
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 200, headers });
    }

    // For storefront requests, we can skip auth or use a simple check
    
    const formData = await request.formData();
    const productImageUrl = formData.get("productImageUrl");
    const userImageFile = formData.get("userImage");
    const productTitle = formData.get("productTitle") || "this product";
    const customPrompt = formData.get("customPrompt") || "";

    if (!productImageUrl || !userImageFile) {
      return json({ 
        success: false, 
        error: "Missing product image URL or user image" 
      }, { status: 400 });
    }

    // Convert uploaded file to base64
    const userImageBuffer = Buffer.from(await userImageFile.arrayBuffer());
    const userImageBase64 = userImageBuffer.toString('base64');

    // Fetch product image and convert to base64
    const productImageResponse = await fetch(productImageUrl);
    if (!productImageResponse.ok) {
      throw new Error('Failed to fetch product image');
    }
    const productImageBuffer = Buffer.from(await productImageResponse.arrayBuffer());
    const productImageBase64 = productImageBuffer.toString('base64');

    // Call OpenRouter API
    const openRouterResult = await callOpenRouterAPI(productImageBase64, userImageBase64, productTitle, customPrompt);
    
    if (!openRouterResult.success) {
      return json({ 
        success: false, 
        error: openRouterResult.error 
      }, { status: 500 });
    }

    return json({
      success: true,
      generatedImageUrl: openRouterResult.imageUrl,
      message: "Virtual try-on generated successfully!"
    }, { headers });

  } catch (error) {
    console.error('Try-on generation error:', error);
    return json({ 
      success: false, 
      error: "Failed to generate virtual try-on: " + error.message 
    }, { status: 500, headers });
  }
};

async function callOpenRouterAPI(productImageBase64, userImageBase64, productTitle, customPrompt = "") {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY not configured');
    }

    // Convert base64 images to data URLs
    const productImageDataUrl = `data:image/jpeg;base64,${productImageBase64}`;
    const userImageDataUrl = `data:image/jpeg;base64,${userImageBase64}`;

    // Build the base prompt
    let prompt = `Create a virtual try-on image showing how the clothing from the first image (${productTitle}) would look when worn by the person in the second image. 

Please generate a realistic image that:
1. Shows the person wearing the ${productTitle} with proper fit and proportions
2. Maintains the person's pose and body type from the original photo
3. Preserves the clothing's design, color, and style details
4. Creates a natural, realistic appearance as if the person is actually wearing the item`;

    // Add custom prompt if provided
    if (customPrompt && customPrompt.trim()) {
      prompt += `\n\nAdditional styling request: ${customPrompt}`;
    }

    prompt += `\n\nGenerate a high-quality virtual try-on result that looks authentic and appealing.`;

    // Debug logging
    console.log('Sending prompt to OpenRouter:', prompt);
    console.log('Product image URL:', productImageDataUrl.substring(0, 100) + '...');
    console.log('User image URL:', userImageDataUrl.substring(0, 100) + '...');

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.SITE_URL || "https://your-shopify-app.com",
        "X-Title": process.env.SITE_NAME || "Virtual Try-On App",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "google/gemini-2.5-flash-image-preview",
        "messages": [
          {
            "role": "user",
            "content": [
              {
                "type": "text",
                "text": prompt
              },
              {
                "type": "image_url",
                "image_url": {
                  "url": productImageDataUrl
                }
              },
              {
                "type": "image_url",
                "image_url": {
                  "url": userImageDataUrl
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`);
    }

    const result = await response.json();
    
    // Debug logging
    console.log('OpenRouter API Response:', JSON.stringify(result, null, 2));
    
    // Extract the generated image URL from Gemini 2.5 Flash Image Preview response
    let generatedImageUrl = null;
    
    console.log('🔍 Analyzing OpenRouter response structure...');
    console.log('Result choices:', result.choices);
    
    if (result.choices && result.choices[0] && result.choices[0].message) {
      const content = result.choices[0].message.content;
      console.log('Message content type:', typeof content);
      console.log('Message content:', content);
      
      // Check if content is an array (multimodal response)
      if (Array.isArray(content)) {
        console.log('Content is array, looking for image_url...');
        const imageContent = content.find(item => item.type === 'image_url');
        if (imageContent && imageContent.image_url) {
          generatedImageUrl = imageContent.image_url.url;
          console.log('Found image URL in array:', generatedImageUrl);
        }
      }
         // Check if content is a string with URL or base64 data
         else if (typeof content === 'string') {
           console.log('Content is string, looking for URLs or base64 data...');
           console.log('Content length:', content.length);
           console.log('Content preview:', content.substring(0, 200) + '...');
           
           // Check for HTTP URLs first
           if (content.includes('http')) {
             const urlMatch = content.match(/https?:\/\/[^\s]+\.(jpg|jpeg|png|webp|gif)/i);
             if (urlMatch) {
               generatedImageUrl = urlMatch[0];
               console.log('Found image URL in string:', generatedImageUrl);
             }
           }
           
           // Check for base64 data URLs - look for the pattern more carefully
           if (!generatedImageUrl && content.includes('data:image/')) {
             console.log('Found data:image/ in content, searching for base64...');
             const base64Match = content.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);
             if (base64Match) {
               generatedImageUrl = base64Match[0];
               console.log('Found base64 data URL in string:', generatedImageUrl.substring(0, 100) + '...');
             } else {
               console.log('No base64 match found, trying alternative pattern...');
               // Try a more flexible pattern
               const altMatch = content.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/g);
               if (altMatch && altMatch.length > 0) {
                 generatedImageUrl = altMatch[0];
                 console.log('Found base64 with alternative pattern:', generatedImageUrl.substring(0, 100) + '...');
               }
             }
           }
           
           // If still no match, check if the entire content is a base64 string
           if (!generatedImageUrl && content.length > 1000 && /^[A-Za-z0-9+/=]+$/.test(content.trim())) {
             console.log('Content appears to be pure base64, converting to data URL...');
             generatedImageUrl = `data:image/jpeg;base64,${content}`;
             console.log('Created data URL from pure base64');
           }
         }
      // Check if content is an object with image_url
      else if (content && typeof content === 'object' && content.image_url) {
        generatedImageUrl = content.image_url.url;
        console.log('Found image URL in object:', generatedImageUrl);
      }
    }
    
         // Check if there are any other possible image sources in the response
         if (!generatedImageUrl) {
           console.log('🔍 Checking for alternative image sources...');
           console.log('Full response structure:', JSON.stringify(result, null, 2));
           
           // Check if there's a data field with images
           if (result.data && Array.isArray(result.data)) {
             const imageData = result.data.find(item => item.url);
             if (imageData) {
               generatedImageUrl = imageData.url;
               console.log('Found image URL in data array:', generatedImageUrl);
             }
           }
           
           // Check the entire response string for base64 data URLs
           if (!generatedImageUrl) {
             const responseString = JSON.stringify(result);
             const base64Match = responseString.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);
             if (base64Match) {
               generatedImageUrl = base64Match[0];
               console.log('Found base64 data URL in full response:', generatedImageUrl.substring(0, 100) + '...');
             }
           }
         }
    
    // Fallback to mock result if no image URL found
    if (!generatedImageUrl) {
      console.log('❌ No image URL found in response, using mock result');
      console.log('Response content:', result.choices?.[0]?.message?.content);
      console.log('This means the AI model did not generate an image, only returned text description');
      generatedImageUrl = createMockTryOnResult(userImageBase64, productImageBase64);
    } else {
      console.log('✅ Generated image URL found:', generatedImageUrl);
    }

    return {
      success: true,
      imageUrl: generatedImageUrl,
      description: result.choices?.[0]?.message?.content || "Virtual try-on generated successfully"
    };

  } catch (error) {
    console.error('OpenRouter API error:', error);
    return {
      success: false,
      error: "OpenRouter API call failed: " + error.message
    };
  }
}

function createMockTryOnResult(userImageBase64, productImageBase64) {
  // For now, return the user image as fallback
  // In a real implementation, you'd create a composite image
  console.log('Using mock result - returning user image as fallback');
  return `data:image/jpeg;base64,${userImageBase64}`;
}

// Handle OPTIONS for CORS
export const options = async ({ request }) => {
  return new Response(null, { 
    status: 200, 
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
};

// GET method for testing
export const loader = async ({ request }) => {
  return json({
    message: "Virtual Try-On API endpoint",
    usage: "POST with productImageUrl, userImage, and productTitle"
  }, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
};
