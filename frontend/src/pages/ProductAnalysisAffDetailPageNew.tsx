import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import '../components/ProductAnalysis/mobile-optimizations.css';

// Components
import ProductHeader from '../components/ProductAnalysis/ProductHeader';
import ProductOverview from '../components/ProductAnalysis/ProductOverview';
import ExecutiveSummary from '../components/ProductAnalysis/ExecutiveSummary';
import MarketAnalysis from '../components/ProductAnalysis/MarketAnalysis';
import ProductProblems from '../components/ProductAnalysis/ProductProblems';
import TargetCustomers from '../components/ProductAnalysis/TargetCustomers';
import Conclusion from '../components/ProductAnalysis/Conclusion';
import ProductListingOptimizerModal from '../components/ProductAnalysis/ProductListingOptimizerModal';
import AIAdsGeneratorModal from '../components/ProductAnalysis/AIAdsGeneratorModal';

// Services
import { productAffService } from '../services/productAffService';

interface ProductAff {
  id: string;
  title?: string;
  description?: string;
  image1?: string;
  image2?: string;
  target_market?: string;
  status: 'waiting' | 'processing' | 'done' | 'error';
  analyzed_at?: string;
  analysis_result?: any;
  user?: {
    credits?: number;
  };
}

const ProductAnalysisAffDetailPageNew: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductAff | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOptimizerModal, setShowOptimizerModal] = useState(false);
  const [showAdsGeneratorModal, setShowAdsGeneratorModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productAffService.getProduct(id!);
      console.log('Fetched product:', response);
      
      // Parse analysis_result if it's a string
      if (response.analysis_result && typeof response.analysis_result === 'string') {
        try {
          response.analysis_result = JSON.parse(response.analysis_result);
        } catch (parseErr) {
          console.error('Error parsing analysis_result:', parseErr);
        }
      }
      
      setProduct(response);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product details');
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/product-analysis-aff');
  };

  const handleDownload = async () => {
    if (!product?.analysis_result) {
      toast.error('No analysis data available for download');
      return;
    }

    try {
      const element = document.getElementById('analysis-content');
      if (!element) {
        toast.error('Content not found for download');
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`product-analysis-${product.title || 'untitled'}.pdf`);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error || 'Product not found'}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!product.analysis_result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-yellow-500 text-6xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Analysis Pending</h1>
          <p className="text-gray-600 mb-4">This product is still being analyzed. Please check back later.</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Add error boundary for analysis_result
  if (!product.analysis_result || typeof product.analysis_result !== 'object') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Analysis Data</h1>
          <p className="text-gray-600 mb-4">The analysis data is corrupted or invalid.</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto py-4 sm:py-8 px-2 sm:px-4 lg:px-8 mobile-padding">
        {/* Header */}
        <ProductHeader
          product={product}
          onBack={handleBack}
          onOptimize={() => setShowOptimizerModal(true)}
          onGenerateAds={() => setShowAdsGeneratorModal(true)}
        />

        {/* Analysis Content */}
        <div id="analysis-content">
          {(() => {
            try {
              return (
                <>
                  {/* Product Overview */}
                  <ProductOverview
                    product={product}
                    analysisResult={product.analysis_result}
                  />

                  {/* Executive Summary */}
                  <ExecutiveSummary
                    analysisResult={product.analysis_result}
                  />

                  {/* Market Analysis */}
                  <MarketAnalysis
                    analysisResult={product.analysis_result}
                  />

                  {/* Product Problems */}
                  <ProductProblems
                    analysisResult={product.analysis_result}
                  />

                  {/* Target Customers */}
                  <TargetCustomers
                    analysisResult={product.analysis_result}
                  />

                  {/* Conclusion */}
                  <Conclusion
                    analysisResult={product.analysis_result}
                  />
                </>
              );
            } catch (error) {
              console.error('Error rendering analysis components:', error);
              return (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="text-center">
                    <div className="text-red-500 text-4xl mb-4">⚠️</div>
                    <h3 className="text-lg font-semibold text-red-900 mb-2">Rendering Error</h3>
                    <p className="text-red-700 mb-4">There was an error rendering the analysis components.</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      Reload Page
                    </button>
                  </div>
                </div>
              );
            }
          })()}
        </div>
      </div>

      {/* Product Listing Optimizer Modal */}
      <ProductListingOptimizerModal
        isOpen={showOptimizerModal}
        onClose={() => setShowOptimizerModal(false)}
        analysisResult={product.analysis_result}
        product={product}
        originalTitle={product.title}
        originalDescription={product.description}
        targetMarket={product.target_market}
      />

      {/* AI Ads Generator Modal */}
      <AIAdsGeneratorModal
        isOpen={showAdsGeneratorModal}
        onClose={() => setShowAdsGeneratorModal(false)}
        analysisResult={product.analysis_result}
        product={product}
      />
    </div>
  );
};

export default ProductAnalysisAffDetailPageNew;
