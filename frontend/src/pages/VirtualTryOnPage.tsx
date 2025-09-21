import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Download, 
  Share2, 
  ShoppingCart, 
  X, 
  Sparkles,
  Target,
  Camera,
  Shirt,
  Wand2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Coins,
  Zap,
  Star,
  Lightbulb,
  Image as ImageIcon
} from 'lucide-react';
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
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  
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
      alert(t('virtualTryOn.insufficientCredits'));
      return;
    }
    
    // Show processing modal
    setShowProcessingModal(true);
    setProcessingStep(0);
    setProcessing(true);
    
    try {
      // Step 1: Preparing images
      setProcessingStep(1);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const formData = new FormData();
      
      if (hasFiles) {
        // Process with uploaded files
        formData.append('userImage', userFile!);
        formData.append('productImage', productFile!);
      } else {
        // Step 2: Converting URLs to files
        setProcessingStep(2);
        await new Promise(resolve => setTimeout(resolve, 500));
        
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
      
      // Step 3: Processing with AI
      setProcessingStep(3);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get auth token
      const token = localStorage.getItem('token');
      
      // Call the unified backend API
      const response = await fetch('/api/images/tryon', {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Step 4: Finalizing
        setProcessingStep(4);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setResult(data.generatedImageUrl);
        
        // Update credits with value from backend
        if (data.creditsRemaining !== null && updateCredits) {
          updateCredits(data.creditsRemaining);
          console.log(`✅ Credits updated: ${data.creditsRemaining}`);
        }
        
        console.log('✅ Virtual try-on successful!', data);
        
        // Close processing modal and show result
        setShowProcessingModal(false);
        setShowModal(true);
      } else {
        console.error('❌ Virtual try-on failed:', data.error);
        setShowProcessingModal(false);
        alert(data.error || t('virtualTryOn.processingError'));
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      setShowProcessingModal(false);
      alert(t('errors.network'));
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
          title: t('virtualTryOn.shareTitle'),
          text: t('virtualTryOn.shareText'),
          files: [file]
        });
      } catch (error) {
        console.log('Share cancelled or failed');
        // Fallback to URL sharing
        await navigator.share({
          title: t('virtualTryOn.shareTitle'),
          text: t('virtualTryOn.shareText'),
          url: window.location.href
        });
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert(t('virtualTryOn.linkCopied'));
      } catch (error) {
        console.error('Failed to copy to clipboard');
      }
    }
  };


  const closeModal = () => {
    setShowModal(false);
  };

  const resetProcess = () => {
    setResult(null);
    setUserFile(null);
    setProductFile(null);
    setUserUrl('');
    setProductUrl('');
    setCustomPrompt('');
  };

  const isReadyToProcess = () => {
    const hasFiles = userFile && productFile;
    const hasUrls = userUrl && productUrl;
    return (hasFiles || hasUrls) && user && user.credits > 0;
  };

  const tips = [
    {
      icon: Camera,
      title: t('virtualTryOn.tips.quality.title'),
      description: t('virtualTryOn.tips.quality.description')
    },
    {
      icon: Target,
      title: t('virtualTryOn.tips.fullbody.title'),
      description: t('virtualTryOn.tips.fullbody.description')
    },
    {
      icon: Sparkles,
      title: t('virtualTryOn.tips.prompt.title'),
      description: t('virtualTryOn.tips.prompt.description')
    }
  ];

  return (
    <div className="min-h-full bg-white">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Target className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-primary-900 mb-3">
            {t('virtualTryOn.title')}
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            {t('virtualTryOn.subtitle')}
          </p>
        </div>

        {/* Credits Check */}
        {user && user.credits <= 0 && (
          <Card className="mb-8 border-error-200 bg-error-50">
            <CardBody className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-error-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-error-800">{t('virtualTryOn.lowCreditsTitle')}</h3>
                <p className="text-sm text-error-700">
                  {t('virtualTryOn.insufficientCredits')}
                </p>
              </div>
            </CardBody>
          </Card>
        )}


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Upload Section */}
            <Card className="border border-neutral-200 shadow-sm">
              <CardHeader>
                <h2 className="text-xl font-semibold text-primary-900 flex items-center gap-3">
                  <ImageIcon className="w-6 h-6 text-primary-600" />
                  {t('virtualTryOn.uploadImages')}
                </h2>
                <p className="text-neutral-600">{t('virtualTryOn.uploadImagesDesc')}</p>
              </CardHeader>
              <CardBody className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* User Photo */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Camera className="w-5 h-5 text-secondary-600" />
                      <h3 className="font-semibold text-primary-900">{t('virtualTryOn.modelImage')}</h3>
                    </div>
                    <ImageUpload
                      label=""
                      description={t('virtualTryOn.modelImageDesc')}
                      onFileChange={setUserFile}
                      onUrlChange={setUserUrl}
                    />
                  </div>

                  {/* Product Image */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Shirt className="w-5 h-5 text-accent-600" />
                      <h3 className="font-semibold text-primary-900">{t('virtualTryOn.productImage')}</h3>
                    </div>
                    <ImageUpload
                      label=""
                      description={t('virtualTryOn.productImageDesc')}
                      onFileChange={setProductFile}
                      onUrlChange={setProductUrl}
                    />
                  </div>
                </div>

                {/* Custom Prompt */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Wand2 className="w-5 h-5 text-accent-600" />
                    <h3 className="font-semibold text-primary-900">{t('virtualTryOn.customPrompt')}</h3>
                    <span className="text-xs text-neutral-500">({t('common.optional')})</span>
                  </div>
                  <textarea
                    className="w-full p-4 border border-neutral-200 rounded-xl resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    rows={3}
                    placeholder={t('virtualTryOn.promptPlaceholder')}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                  />
                </div>

                {/* Process Button */}
                <Button
                  onClick={handleTryOn}
                  loading={processing}
                  disabled={!isReadyToProcess()}
                  className="w-full bg-gradient-to-r from-secondary-500 to-accent-500 hover:from-secondary-600 hover:to-accent-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                >
                  {processing ? (
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>{t('virtualTryOn.processing')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5" />
                      <span>{t('virtualTryOn.tryOn')}</span>
                    </div>
                  )}
                </Button>
              </CardBody>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Credits Info */}
            {user && (
              <Card className="border border-neutral-200 shadow-sm">
                <CardBody className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-800 to-primary-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Coins className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary-900 mb-1">{user.credits}</h3>
                  <p className="text-sm text-neutral-600">
                    {t('dashboard.creditsLeft', { count: user.credits })}
                  </p>
                  {user.credits < 5 && (
                    <p className="text-xs text-warning-600 mt-2 font-medium">
                      ⚠️ {t('virtualTryOn.lowCreditsWarning')}
                    </p>
                  )}
                </CardBody>
              </Card>
            )}

            {/* Tips */}
            <Card className="border border-neutral-200 shadow-sm">
              <CardHeader>
                <h3 className="text-lg font-semibold text-primary-900 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-warning-500" />
                  {t('virtualTryOn.tipsTitle')}
                </h3>
              </CardHeader>
              <CardBody className="space-y-4">
                {tips.map((tip, index) => {
                  const Icon = tip.icon;
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <Icon className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-primary-900 text-sm">{tip.title}</h4>
                        <p className="text-xs text-neutral-600 mt-1">{tip.description}</p>
                      </div>
                    </div>
                  );
                })}
              </CardBody>
            </Card>

            {/* Features */}
            <Card className="border border-neutral-200 shadow-sm bg-gradient-to-br from-primary-50 to-secondary-50">
              <CardHeader>
                <h3 className="text-lg font-semibold text-primary-900 flex items-center gap-2">
                  <Star className="w-5 h-5 text-secondary-500" />
                  {t('virtualTryOn.featuresTitle')}
                </h3>
              </CardHeader>
              <CardBody className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Zap className="w-5 h-5 text-accent-600" />
                  <span className="text-sm text-primary-800">{t('virtualTryOn.features.fast')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-secondary-600" />
                  <span className="text-sm text-primary-800">{t('virtualTryOn.features.accurate')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Sparkles className="w-5 h-5 text-accent-600" />
                  <span className="text-sm text-primary-800">{t('virtualTryOn.features.customizable')}</span>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* Processing Modal */}
      {showProcessingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
          <div className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center">
              {/* Animated Icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Sparkles className="w-10 h-10 text-white animate-spin" />
              </div>
              
              {/* Title */}
              <h3 className="text-2xl font-bold text-primary-900 mb-2">
                {t('virtualTryOn.processingTitle')}
              </h3>
              
              {/* Progress Steps */}
              <div className="space-y-4 mb-8">
                {[
                  { step: 1, text: t('virtualTryOn.steps.preparing'), icon: Camera },
                  { step: 2, text: t('virtualTryOn.steps.converting'), icon: RefreshCw },
                  { step: 3, text: t('virtualTryOn.steps.processing'), icon: Wand2 },
                  { step: 4, text: t('virtualTryOn.steps.finalizing'), icon: CheckCircle }
                ].map(({ step, text, icon: Icon }) => {
                  const isActive = processingStep >= step;
                  const isCompleted = processingStep > step;
                  
                  return (
                    <div key={step} className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                      isActive ? 'bg-primary-50 border border-primary-200' : 'bg-neutral-50'
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isCompleted 
                          ? 'bg-success-500 text-white' 
                          : isActive 
                            ? 'bg-primary-500 text-white' 
                            : 'bg-neutral-300 text-neutral-500'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Icon className={`w-4 h-4 ${isActive ? 'animate-spin' : ''}`} />
                        )}
                      </div>
                      <span className={`font-medium ${
                        isActive ? 'text-primary-900' : 'text-neutral-600'
                      }`}>
                        {text}
                      </span>
                    </div>
                  );
                })}
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-neutral-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-gradient-to-r from-secondary-500 to-accent-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(processingStep / 4) * 100}%` }}
                />
              </div>
              
              {/* Status Text */}
              <p className="text-sm text-neutral-600">
                {t('virtualTryOn.processingDesc')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showModal && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75" onClick={closeModal}>
          <div className="relative max-w-4xl max-h-[90vh] w-full bg-white rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <h3 className="text-xl font-semibold text-primary-900 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-success-600" />
                {t('virtualTryOn.resultTitle')}
              </h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetProcess}
                  className="text-neutral-600 hover:text-primary-600"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t('virtualTryOn.tryAnother')}
                </Button>
                <button
                  onClick={closeModal}
                  className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="w-full rounded-xl overflow-hidden bg-neutral-100 mb-6">
                <img 
                  src={result}
                  alt={t('virtualTryOn.resultAlt')} 
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
                  className="flex-1 bg-primary-800 hover:bg-primary-900 text-white"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t('virtualTryOn.downloadResult')}
                </Button>
                
                <Button 
                  variant="secondary"
                  className="flex-1"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  {t('virtualTryOn.share')}
                </Button>
                
                <Button 
                  variant="secondary"
                  className="flex-1"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {t('virtualTryOn.addToCart')}
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