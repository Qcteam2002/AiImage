import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Image, Share2, ShoppingCart, X, Maximize2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import ImageUpload from '../components/ImageUpload';

const VirtualTryOnPage: React.FC = () => {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [userFile, setUserFile] = useState<File | null>(null);
  const [productFile, setProductFile] = useState<File | null>(null);
  const [userUrl, setUserUrl] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  const { t } = useTranslation();
  const { user, updateCredits } = useAuth();

  const handleTryOn = async () => {
    // Validate inputs
    const hasFiles = userFile && productFile;
    const hasUrls = userUrl && productUrl;
    
    if (!hasFiles && !hasUrls) {
      console.error('Both user photo and product image are required');
      return;
    }
    
    if (!user || user.credits <= 0) {
      console.error('Insufficient credits');
      return;
    }
    
    setProcessing(true);
    
    try {
      const formData = new FormData();
      
      if (hasFiles) {
        // Process with uploaded files
        formData.append('userImage', userFile!);
        formData.append('productImage', productFile!);
      } else {
        // Process with URLs - convert URLs to files
        const userResponse = await fetch(userUrl);
        const userBlob = await userResponse.blob();
        const userFileFromUrl = new File([userBlob], 'user.jpg', { type: 'image/jpeg' });
        
        const productResponse = await fetch(productUrl);
        const productBlob = await productResponse.blob();
        const productFileFromUrl = new File([productBlob], 'product.jpg', { type: 'image/jpeg' });
        
        formData.append('userImage', userFileFromUrl);
        formData.append('productImage', productFileFromUrl);
      }
      
      if (customPrompt) {
        formData.append('customPrompt', customPrompt);
      }
      
      // Call backend API to handle credit deduction
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/images/virtual-tryon', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult(data.generatedImageUrl);
        // Update credits in context
        if (updateCredits) {
          updateCredits(user.credits - 1);
        }
        console.log('✅ Virtual try-on successful!', data);
      } else {
        console.error('❌ Virtual try-on failed:', data.error);
        alert(data.error || 'Failed to create virtual try-on');
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      alert('Network error. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleAddToCart = () => {
    // Find and click add to cart button on the page
    const addToCartButton = document.querySelector('button[name="add"], button[type="submit"][name="add"], .btn-product-add, .product-form__cart-submit, [data-add-to-cart]');
    if (addToCartButton) {
      (addToCartButton as HTMLButtonElement).click();
    }
  };

  const handleDownload = () => {
    if (!result) return;
    
    const link = document.createElement('a');
    link.href = result;
    link.download = `virtual-tryon-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!result) return;
    
    if (navigator.share) {
      try {
        // Convert base64 to blob for sharing
        const response = await fetch(result);
        const blob = await response.blob();
        const file = new File([blob], 'virtual-tryon.png', { type: 'image/png' });
        
        await navigator.share({
          title: 'Check out my virtual try-on!',
          text: 'See how this product looks on me with AI virtual try-on',
          files: [file]
        });
      } catch (error) {
        console.log('Share cancelled or failed');
        // Fallback to URL sharing
        await navigator.share({
          title: 'Check out my virtual try-on!',
          text: 'See how this product looks on me with AI virtual try-on',
          url: window.location.href
        });
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy to clipboard');
      }
    }
  };

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('virtualTryOn.title')}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {t('virtualTryOn.subtitle')}
          </p>
        </div>

        {/* Credits Check */}
        {user && user.credits <= 0 && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardBody>
              <p className="text-sm text-red-700">
                {t('virtualTryOn.insufficientCredits')}
              </p>
            </CardBody>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Upload Section */}
            <Card>
              <CardBody className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* User Photo */}
                  <ImageUpload
                    label={t('virtualTryOn.modelImage')}
                    description={t('virtualTryOn.modelImageDesc')}
                    onFileChange={setUserFile}
                    onUrlChange={setUserUrl}
                  />

                  {/* Product Image */}
                  <ImageUpload
                    label={t('virtualTryOn.productImage')}
                    description={t('virtualTryOn.productImageDesc')}
                    onFileChange={setProductFile}
                    onUrlChange={setProductUrl}
                  />
                </div>

                {/* Custom Prompt */}
                <div>
                  <label className="label">
                    {t('virtualTryOn.customPrompt')}
                  </label>
                  <textarea
                    className="input h-24 resize-none"
                    placeholder={t('virtualTryOn.promptPlaceholder')}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                  />
                </div>

                {/* Try On Button */}
                <Button
                  onClick={handleTryOn}
                  loading={processing}
                  disabled={!user || user.credits <= 0 || (!userFile && !userUrl) || (!productFile && !productUrl)}
                  className="w-full"
                  size="lg"
                >
                  {processing ? t('virtualTryOn.processing') : t('virtualTryOn.tryOn')}
                </Button>
              </CardBody>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Credits Info */}
            {user && (
              <Card>
                <CardBody className="text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg font-bold text-primary-600">
                      {user.credits}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {t('dashboard.creditsLeft', { count: user.credits })}
                  </p>
                </CardBody>
              </Card>
            )}

            {/* Result */}
            {result && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium text-gray-900">✨ {t('virtualTryOn.processingSuccess')}</h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <div className="relative w-full rounded-lg overflow-hidden bg-gray-100 group cursor-pointer" onClick={openModal}>
                      <img 
                        src={result}
                        alt="Virtual Try-On Result" 
                        className="w-full h-auto object-contain transition-transform group-hover:scale-105"
                        onError={(e) => {
                          console.error('Image load error:', e);
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2YjczODAiPkVycm9yIExvYWRpbmcgSW1hZ2U8L3RleHQ+PC9zdmc+';
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white bg-opacity-90 rounded-full p-2">
                          <Maximize2 className="w-6 h-6 text-gray-700" />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <Button 
                        className="w-full"
                        onClick={handleDownload}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {t('virtualTryOn.downloadResult')}
                      </Button>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="secondary"
                          size="sm"
                          onClick={handleAddToCart}
                        >
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          {t('virtualTryOn.addToCart')}
                        </Button>
                        
                        <Button 
                          variant="secondary"
                          size="sm"
                          onClick={handleShare}
                        >
                          <Share2 className="w-4 h-4 mr-1" />
                          {t('virtualTryOn.share')}
                        </Button>
                      </div>
                      
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => setResult(null)}
                        className="w-full"
                      >
                        {t('virtualTryOn.tryAnother')}
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Tips */}
            <Card className="bg-blue-50 border-blue-200">
              <CardBody>
                <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Tips for Best Results</h3>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Use clear, well-lit photos of yourself</li>
                  <li>• Full-body photos work better than close-ups</li>
                  <li>• Good lighting helps AI see details clearly</li>
                  <li>• Try different poses for variety</li>
                  <li>• Custom prompts can change the style</li>
                </ul>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal Popup */}
      {showModal && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75" onClick={closeModal}>
          <div className="relative max-w-4xl max-h-[90vh] w-full bg-white rounded-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">✨ Virtual Try-On Result</h3>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4">
              <div className="w-full rounded-lg overflow-hidden bg-gray-100 mb-4">
                <img 
                  src={result}
                  alt="Virtual Try-On Result" 
                  className="w-full h-auto max-h-[60vh] object-contain mx-auto"
                  onError={(e) => {
                    console.error('Image load error:', e);
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2YjczODAiPkVycm9yIExvYWRpbmcgSW1hZ2U8L3RleHQ+PC9zdmc+';
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  className="flex-1"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Image
                </Button>
                
                <Button 
                  variant="secondary"
                  className="flex-1"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                
                <Button 
                  variant="secondary"
                  className="flex-1"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualTryOnPage;
