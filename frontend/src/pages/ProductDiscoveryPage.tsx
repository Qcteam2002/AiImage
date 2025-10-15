import React, { useState, useEffect } from 'react';
import { Typography } from '../components/design-system/Typography';
import { Button } from '../components/design-system/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/design-system/Table';
import { Sparkles, Search, TestTube, Eye, Calendar, TrendingUp } from 'lucide-react';
import ProductDiscoveryModal from '../components/ProductDiscovery/ProductDiscoveryModal';
import TestModal from '../components/ProductDiscovery/TestModal';
import { useTranslation } from 'react-i18next';

// Mock data for discovered products
const mockProducts = [
  {
    id: '1',
    name: 'Smart Fitness Tracker',
    category: 'Electronics',
    market: 'Vietnam',
    potential: 'High',
    date: '2024-01-15',
    revenue: '$50K-100K',
    competition: 'Medium'
  },
  {
    id: '2', 
    name: 'Organic Skincare Set',
    category: 'Beauty',
    market: 'Vietnam',
    potential: 'Very High',
    date: '2024-01-14',
    revenue: '$100K-200K',
    competition: 'Low'
  },
  {
    id: '3',
    name: 'Portable Air Purifier',
    category: 'Home & Garden',
    market: 'Vietnam',
    potential: 'High',
    date: '2024-01-13',
    revenue: '$30K-80K',
    competition: 'Medium'
  }
];

const ProductDiscoveryPage: React.FC = () => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [products, setProducts] = useState([]);

  // Function to add products from TestModal
  const handleAddProducts = (newProducts: any[]) => {
    // Transform TestModal products to match the expected format
    const transformedProducts = newProducts.map((product, index) => ({
      id: `test-${Date.now()}-${index}`,
      name: product.product_name || product.name || 'Unknown Product',
      category: product.category || 'General',
      market: product.country || 'Vietnam',
      potential: product.metrics?.profit_potential || 'High',
      date: new Date().toISOString().split('T')[0],
      revenue: product.metrics?.revenue_estimate || '$10K-50K',
      competition: product.metrics?.competition_score ? 
        (product.metrics.competition_score > 7 ? 'High' : 
         product.metrics.competition_score > 4 ? 'Medium' : 'Low') : 'Medium'
    }));
    
    setProducts(prevProducts => [...prevProducts, ...transformedProducts]);
  };

  return (
    <div className="min-h-screen bg-[#F6F6F7]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-[#D1D3D4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <Typography.H1 className="text-3xl font-bold text-[#212326]">
                {t('nav.productDiscovery') || 'Product Discovery'}
              </Typography.H1>
              <Typography.Body className="text-[#6D7175] mt-2">
                {t('productDiscovery.subtitle') || 'Discover and analyze potential products with AI'}
              </Typography.Body>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="tertiary"
                size="md"
                onClick={() => setShowTestModal(true)}
              >
                <TestTube className="w-4 h-4 mr-2" />
                {t('productDiscovery.actions.testStructure')}
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => setShowModal(true)}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {t('productDiscovery.actions.startDiscovery')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Description */}
        <div className="mb-8">
          <Typography.Body className="text-lg text-[#6D7175] max-w-4xl">
            {t('productDiscovery.description')}
          </Typography.Body>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm border border-[#D1D3D4]">
          <div className="px-6 py-4 border-b border-[#D1D3D4]">
            <div className="flex justify-between items-center">
              <Typography.H3 className="text-xl font-semibold text-[#212326]">
                {t('productDiscovery.table.title')}
              </Typography.H3>
              <div className="flex items-center space-x-2 text-sm text-[#6D7175]">
                <TrendingUp className="w-4 h-4" />
                <span>{t('productDiscovery.table.showing')} {products.length} {t('productDiscovery.table.results')}</span>
              </div>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('productDiscovery.table.columns.name')}</TableHead>
                <TableHead>{t('productDiscovery.table.columns.category')}</TableHead>
                <TableHead>{t('productDiscovery.table.columns.market')}</TableHead>
                <TableHead>{t('productDiscovery.table.columns.potential')}</TableHead>
                <TableHead>{t('productDiscovery.table.columns.date')}</TableHead>
                <TableHead className="text-right">{t('productDiscovery.table.columns.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {product.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <Typography.Body className="font-medium text-[#212326]">
                            {product.name}
                          </Typography.Body>
                          <Typography.BodySmall className="text-[#6D7175]">
                            Revenue: {product.revenue}
                          </Typography.BodySmall>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E7F3FF] text-[#0969DA]">
                        {product.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="text-sm text-[#212326]">{product.market}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.potential === 'Very High' 
                          ? 'bg-[#E3F2ED] text-[#008060]'
                          : product.potential === 'High'
                          ? 'bg-[#E7F3FF] text-[#0969DA]'
                          : 'bg-[#FEF3E2] text-[#F79009]'
                      }`}>
                        {product.potential}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-[#6D7175]">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(product.date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="plain"
                          size="sm"
                          className="text-[#212326] hover:text-[#1A1C1E]"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {t('productDiscovery.actions.view')}
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                        >
                          {t('productDiscovery.actions.optimize')}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-[#F6F6F7] rounded-full flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 text-[#8C9196]" />
                      </div>
                      <Typography.H4 className="text-lg font-medium text-[#212326] mb-2">
                        {t('productDiscovery.empty.title')}
                      </Typography.H4>
                      <Typography.Body className="text-[#6D7175] mb-4">
                        {t('productDiscovery.empty.description')}
                      </Typography.Body>
                      <Button
                        variant="primary"
                        onClick={() => setShowModal(true)}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {t('productDiscovery.actions.startDiscovery')}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modals */}
      <ProductDiscoveryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
      
      <TestModal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
        onAddProducts={handleAddProducts}
      />
    </div>
  );
};

export default ProductDiscoveryPage;