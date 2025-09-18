import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Image } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import ImageUpload from '../components/ImageUpload';

const OptimizePage: React.FC = () => {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [productFile, setProductFile] = useState<File | null>(null);
  const [modelUrl, setModelUrl] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  
  const { t } = useTranslation();
  const { user, updateCredits } = useAuth();

  const handleProcess = async () => {
    // Validate inputs
    const hasFiles = modelFile && productFile;
    const hasUrls = modelUrl && productUrl;
    
    if (!hasFiles && !hasUrls) {
      // Show error toast or validation message
      console.error('Both model and product images are required');
      return;
    }
    
    setProcessing(true);
    
    try {
      let response;
      
      if (hasFiles) {
        // Process with uploaded files
        const formData = new FormData();
        formData.append('images', modelFile!);
        formData.append('images', productFile!);
        if (customPrompt) {
          formData.append('prompt', customPrompt);
        }
        
        response = await fetch('/api/images/process-files', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });
      } else {
        // Process with URLs
        response = await fetch('/api/images/process-urls', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            modelImageUrl: modelUrl,
            productImageUrl: productUrl,
            prompt: customPrompt
          })
        });
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Convert download URL to proper backend proxy URL
        const downloadUrl = data.process.result.downloadUrl.replace('/api/download/', '/api/images/download/');
        setResult(downloadUrl);
        updateCredits(data.process.remainingCredits);
        console.log('✅ Image processing successful!', data);
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
    <div className="min-h-full bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('optimize.title')}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {t('optimize.subtitle')}
          </p>
        </div>

        {/* Credits Check */}
        {user && user.credits <= 0 && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardBody>
              <p className="text-sm text-red-700">
                {t('optimize.insufficientCredits')}
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
                  {/* Model Image */}
                  <ImageUpload
                    label={t('optimize.modelImage')}
                    description={t('optimize.modelImageDesc')}
                    onFileChange={setModelFile}
                    onUrlChange={setModelUrl}
                  />

                  {/* Product Image */}
                  <ImageUpload
                    label={t('optimize.productImage')}
                    description={t('optimize.productImageDesc')}
                    onFileChange={setProductFile}
                    onUrlChange={setProductUrl}
                  />
                </div>

                {/* Custom Prompt */}
                <div>
                  <label className="label">
                    {t('optimize.customPrompt')}
                  </label>
                  <textarea
                    className="input h-24 resize-none"
                    placeholder={t('optimize.promptPlaceholder')}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                  />
                </div>

                {/* Process Button */}
                <Button
                  onClick={handleProcess}
                  loading={processing}
                  disabled={!user || user.credits <= 0 || (!modelFile && !modelUrl) || (!productFile && !productUrl)}
                  className="w-full"
                  size="lg"
                >
                  {processing ? t('optimize.processing') : t('optimize.optimize')}
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
                  <h3 className="text-lg font-medium text-gray-900">✅ Result</h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <div className="w-full rounded-lg overflow-hidden bg-gray-100">
                      <img 
                        src={result}
                        alt="AI Generated Result" 
                        className="w-full h-auto object-contain"
                        onError={(e) => {
                          console.error('Image load error:', e);
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2YjczODAiPkVycm9yIExvYWRpbmcgSW1hZ2U8L3RleHQ+PC9zdmc+';
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        className="flex-1"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = result;
                          link.download = 'ai-generated-image.png';
                          link.click();
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {t('optimize.downloadResult')}
                      </Button>
                      
                      <Button 
                        variant="secondary"
                        onClick={() => setResult(null)}
                      >
                        ✨ Process New
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Tips */}
            <Card className="bg-blue-50 border-blue-200">
              <CardBody>
                <h3 className="text-sm font-medium text-blue-900 mb-2">Tips</h3>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Use high-quality images for best results</li>
                  <li>• Model images should show clear poses</li>
                  <li>• Product images should have good lighting</li>
                  <li>• Custom prompts help get specific results</li>
                </ul>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizePage;
