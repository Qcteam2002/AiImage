import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Package, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import ImageUpload from '../components/ImageUpload';
import { imageAPI } from '../services/api';

const ProductImageToolsPage: React.FC = () => {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [productFile, setProductFile] = useState<File | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [productUrl, setProductUrl] = useState('');
  const [backgroundUrl, setBackgroundUrl] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  
  const { t } = useTranslation();
  const { user, updateCredits } = useAuth();

  const handleProcess = async () => {
    // Validate inputs - only product image is required
    const hasProductFile = productFile;
    const hasProductUrl = productUrl;
    
    if (!hasProductFile && !hasProductUrl) {
      console.error('Product image is required');
      return;
    }

    if (!user || user.credits < 1) {
      console.error('Insufficient credits');
      return;
    }
    
    setProcessing(true);
    
    try {
      let response;
      
      if (hasProductFile) {
        // Process with uploaded files
        const formData = new FormData();
        formData.append('productImage', productFile!);
        if (backgroundFile) {
          formData.append('backgroundImage', backgroundFile);
        }
        if (customPrompt) {
          formData.append('prompt', customPrompt);
        }
        
        response = await imageAPI.processProductImage(formData);
      } else {
        // Process with URLs
        const requestData = {
          productImageUrl: productUrl,
          backgroundImageUrl: backgroundUrl || undefined,
          prompt: customPrompt || undefined
        };
        
        response = await imageAPI.processProductImageUrls(requestData);
      }

      const data = response.data;

      if (data.success) {
        // Convert download URL to proper backend proxy URL
        const downloadUrl = data.process.result.downloadUrl.replace('/api/download/', '/api/images/download/');
        setResult(downloadUrl);
        updateCredits(data.process.remainingCredits);
        console.log('✅ Product image processing successful!', data);
        console.log('🖼️ Result URL:', downloadUrl);
      } else {
        console.error('❌ Processing failed:', data.error);
      }
    } catch (error) {
      console.error('❌ Network error:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-full bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{t('productImageTools.title')}</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('productImageTools.subtitle')}
          </p>
        </div>

        <div className="space-y-8">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-primary-600" />
                Upload Images
              </h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Product Image Upload */}
                <div>
                  <ImageUpload
                    label={t('productImageTools.productImage')}
                    description={t('productImageTools.productImageDesc')}
                    onFileChange={setProductFile}
                    onUrlChange={setProductUrl}
                  />
                </div>

                {/* Background Image Upload */}
                <div>
                  <ImageUpload
                    label={t('productImageTools.backgroundImage')}
                    description={t('productImageTools.backgroundImageDesc')}
                    onFileChange={setBackgroundFile}
                    onUrlChange={setBackgroundUrl}
                    optional
                  />
                </div>
              </div>

              {/* Custom Prompt */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t('productImageTools.customPrompt')}
                </label>
                <div className="space-y-2">
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder={t('productImageTools.promptPlaceholder')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 resize-none"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500">
                    {t('productImageTools.examples')}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Process Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleProcess}
              disabled={processing || !user || user.credits < 1}
              className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 px-8 py-3 text-lg font-semibold"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                  {t('productImageTools.processing')}
                </>
              ) : (
                <>
                  <Package className="w-5 h-5 mr-3" />
                  {t('productImageTools.optimizeProduct')}
                </>
              )}
            </Button>
          </div>

          {/* Credits Info */}
          {user && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-900">
                      {t('dashboard.creditsLeft', { count: user.credits })}
                    </p>
                    <p className="text-sm text-blue-700">
                      Each optimization costs 1 credit
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Result Section */}
          {result && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900">✅ {t('common.success')}</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="w-full rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={result}
                      alt="AI Optimized Product"
                      className="w-full h-auto object-contain max-h-96"
                      onError={(e) => {
                        console.error('Image load error:', e);
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2YjczODAiPkVycm9yIExvYWRpbmcgSW1hZ2U8L3RleHQ+PC9zdmc+';
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      className="flex-1"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = result;
                        link.download = 'ai-optimized-product.png';
                        link.click();
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {t('productImageTools.downloadResult')}
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={() => setResult(null)}
                      className="flex-1"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      {t('productImageTools.processNew')}
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductImageToolsPage;

