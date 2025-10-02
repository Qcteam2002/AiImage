import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Lightbulb, AlertTriangle, BarChart3, Image as ImageIcon, Download, Share2, Zap, Coins, TrendingUp, Search, Clock, Target, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import AnimatedLoadingSpinners from '../components/ui/AnimatedLoadingSpinners';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import NotFoundState from '../components/ui/NotFoundState';
import { productAffService, ProductAff } from '../services/productAffService';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

interface AnalysisResult {
  executive_summary: {
    recommendation: string;
    key_points: string[];
    biggest_opportunity: string;
    biggest_risk: string;
  };
  market_and_keywords: {
    sales_potential: string;
    market_size_usd: number;
    cagr_percent: number;
    google_trends_change_percent: number;
    marketplace_data: {
      aliexpress: { listings: number; sales_per_month: number; growth_percent: number | null };
      etsy: { listings: number; sales_per_month: number; growth_percent: number | null };
      amazon: { listings: number; sales_per_month: number; growth_percent: number | null };
      shopee: { listings: number; sales_per_month: number; growth_percent: number | null };
    };
    keywords: {
      informational: Array<{ keyword: string; volume: number; cpc: number; competition: string }>;
      transactional: Array<{ keyword: string; volume: number; cpc: number; competition: string }>;
      comparative: Array<{ keyword: string; volume: number; cpc: number; competition: string }>;
      painpoint_related: Array<{ keyword: string; volume: number; cpc: number; competition: string }>;
    };
    sources: string[];
  };
  product_problems: {
    resolved: Array<{ problem: string; satisfaction_percent: number }>;
    unresolved: Array<{ problem: string; unsatisfied_percent: number; example_feedback: string }>;
  };
  target_customers: Array<{
    name: string;
    market_share_percent: number;
    gender_ratio: { male: number; female: number };
    age_range: string;
    occupations: string[];
    locations: string[];
    purchase_frequency: string;
    average_budget_usd: number;
    buying_behavior: string;
    usage_context: string;
    emotional_motivations: string;
    common_painpoints: string[];
    main_channels: string[];
    repurchase_or_upsell: { exists: boolean; estimated_percent: number };
    painpoint_levels: {
      high: { percent: number; description: string };
      medium: { percent: number; description: string };
      low: { percent: number; description: string };
    };
    solutions_and_content: Array<{
      pain_point: string;
      percent_of_customers: number;
      usp: string;
      content_hook: string;
      ad_visual_idea: string;
    }>;
  }>;
  conclusion: {
    focus_group_priority: string;
    best_content_angle: string;
    upsell_combo_suggestions: string;
    risks_to_consider: string;
  };
}

const ProductAnalysisAffDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<ProductAff | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const analysisResult: AnalysisResult | null = product?.analysis_result ? JSON.parse(product.analysis_result) : null;

  const loadProduct = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const productData = await productAffService.getProduct(id);
      setProduct(productData);
      setError(null);
    } catch (err) {
      console.error('Error loading product:', err);
      setError('Không thể tải thông tin sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!analysisResult) {
      toast.error('Không có dữ liệu để tải xuống');
      return;
    }

    try {
      toast.loading('Đang tạo báo cáo PDF...', { duration: 2000 });
      
      // Tạo PDF mới
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('BÁO CÁO PHÂN TÍCH SẢN PHẨM AFFILIATE', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Thông tin sản phẩm
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('THÔNG TIN SẢN PHẨM', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Tên sản phẩm: ${product?.title || 'N/A'}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Thị trường: ${product?.target_market || 'N/A'}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Ngày phân tích: ${new Date().toLocaleDateString('vi-VN')}`, 20, yPosition);
      yPosition += 15;

      // Executive Summary
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('EXECUTIVE SUMMARY', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Đề xuất: ${analysisResult.executive_summary.recommendation}`, 20, yPosition);
      yPosition += 6;

      pdf.text('Điểm chính:', 20, yPosition);
      yPosition += 6;
      analysisResult.executive_summary.key_points.forEach((point, index) => {
        const lines = pdf.splitTextToSize(`${index + 1}. ${point}`, pageWidth - 40);
        lines.forEach((line: string) => {
          pdf.text(line, 25, yPosition);
          yPosition += 5;
        });
      });

      pdf.text(`Cơ hội lớn nhất: ${analysisResult.executive_summary.biggest_opportunity}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Rủi ro lớn nhất: ${analysisResult.executive_summary.biggest_risk}`, 20, yPosition);
      yPosition += 15;

      // Market Analysis
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PHÂN TÍCH THỊ TRƯỜNG', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Khả năng bán hàng: ${analysisResult.market_and_keywords.sales_potential}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Quy mô thị trường: $${analysisResult.market_and_keywords.market_size_usd.toLocaleString()}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`CAGR: ${analysisResult.market_and_keywords.cagr_percent}%`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Google Trends: ${analysisResult.market_and_keywords.google_trends_change_percent}%`, 20, yPosition);
      yPosition += 10;

      // Marketplace Data
      pdf.text('Dữ liệu Marketplace:', 20, yPosition);
      yPosition += 6;
      pdf.text(`• AliExpress: ${analysisResult.market_and_keywords.marketplace_data.aliexpress.listings} listings`, 25, yPosition);
      yPosition += 5;
      pdf.text(`• Etsy: ${analysisResult.market_and_keywords.marketplace_data.etsy.listings} listings`, 25, yPosition);
      yPosition += 5;
      pdf.text(`• Amazon: ${analysisResult.market_and_keywords.marketplace_data.amazon.listings} listings`, 25, yPosition);
      yPosition += 5;
      pdf.text(`• Shopee: ${analysisResult.market_and_keywords.marketplace_data.shopee.listings} listings`, 25, yPosition);
      yPosition += 15;

      // Target Customers
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('KHÁCH HÀNG MỤC TIÊU', 20, yPosition);
      yPosition += 10;

      analysisResult.target_customers.forEach((customer, index) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Nhóm ${index + 1}: ${customer.name}`, 20, yPosition);
        yPosition += 8;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`• Thị phần: ${customer.market_share_percent}%`, 25, yPosition);
        yPosition += 5;
        pdf.text(`• Độ tuổi: ${customer.age_range}`, 25, yPosition);
        yPosition += 5;
        pdf.text(`• Ngân sách: $${customer.average_budget_usd}`, 25, yPosition);
        yPosition += 5;
        pdf.text(`• Kênh chính: ${customer.main_channels?.join(', ') || 'N/A'}`, 25, yPosition);
        yPosition += 10;
      });

      // Conclusion
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('KẾT LUẬN', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Nhóm ưu tiên: ${analysisResult.conclusion.focus_group_priority}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Angle tốt nhất: ${analysisResult.conclusion.best_content_angle}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Upsell suggestions: ${analysisResult.conclusion.upsell_combo_suggestions}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Rủi ro cần lưu ý: ${analysisResult.conclusion.risks_to_consider}`, 20, yPosition);

      // Footer
      pdf.setFontSize(8);
      pdf.text('Báo cáo được tạo bởi AI Product Analysis System', pageWidth / 2, pageHeight - 10, { align: 'center' });

      // Tải xuống
      const fileName = `product-analysis-${product?.title?.replace(/[^a-zA-Z0-9]/g, '-') || 'report'}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast.success('Báo cáo PDF đã được tải xuống thành công!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Không thể tạo báo cáo PDF');
    }
  };

  const handleDownloadWithCharts = async () => {
    if (!analysisResult) {
      toast.error('Không có dữ liệu để tải xuống');
      return;
    }

    try {
      toast.loading('Đang tạo báo cáo PDF với biểu đồ...', { duration: 3000 });
      
      // Tạo PDF mới
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Header với màu sắc
      pdf.setFillColor(59, 130, 246); // Blue
      pdf.rect(0, 0, pageWidth, 25, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('BÁO CÁO PHÂN TÍCH SẢN PHẨM AFFILIATE', pageWidth / 2, 15, { align: 'center' });
      
      pdf.setTextColor(0, 0, 0);
      yPosition = 35;

      // Thông tin sản phẩm với box
      pdf.setFillColor(243, 244, 246); // Gray-100
      pdf.rect(15, yPosition - 5, pageWidth - 30, 25, 'F');
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('THÔNG TIN SẢN PHẨM', 20, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Tên sản phẩm: ${product?.title || 'N/A'}`, 20, yPosition);
      yPosition += 5;
      pdf.text(`Thị trường: ${product?.target_market || 'N/A'}`, 20, yPosition);
      yPosition += 5;
      pdf.text(`Ngày phân tích: ${new Date().toLocaleDateString('vi-VN')}`, 20, yPosition);
      yPosition += 20;

      // Executive Summary với highlight
      pdf.setFillColor(34, 197, 94); // Green
      pdf.rect(15, yPosition - 5, pageWidth - 30, 8, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('EXECUTIVE SUMMARY', 20, yPosition);
      
      pdf.setTextColor(0, 0, 0);
      yPosition += 15;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Đề xuất: ${analysisResult.executive_summary.recommendation}`, 20, yPosition);
      yPosition += 8;

      pdf.text('Điểm chính:', 20, yPosition);
      yPosition += 6;
      analysisResult.executive_summary.key_points.forEach((point, index) => {
        const lines = pdf.splitTextToSize(`${index + 1}. ${point}`, pageWidth - 40);
        lines.forEach((line: string) => {
          pdf.text(line, 25, yPosition);
          yPosition += 5;
        });
      });

      pdf.text(`Cơ hội lớn nhất: ${analysisResult.executive_summary.biggest_opportunity}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Rủi ro lớn nhất: ${analysisResult.executive_summary.biggest_risk}`, 20, yPosition);
      yPosition += 20;

      // Market Analysis với metrics boxes
      pdf.setFillColor(168, 85, 247); // Purple
      pdf.rect(15, yPosition - 5, pageWidth - 30, 8, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PHÂN TÍCH THỊ TRƯỜNG', 20, yPosition);
      
      pdf.setTextColor(0, 0, 0);
      yPosition += 15;

      // Tạo metrics boxes
      const metrics = [
        { label: 'Khả năng bán hàng', value: analysisResult.market_and_keywords.sales_potential },
        { label: 'Quy mô thị trường', value: `$${analysisResult.market_and_keywords.market_size_usd.toLocaleString()}` },
        { label: 'CAGR', value: `${analysisResult.market_and_keywords.cagr_percent}%` },
        { label: 'Google Trends', value: `${analysisResult.market_and_keywords.google_trends_change_percent}%` }
      ];

      metrics.forEach((metric, index) => {
        const x = 20 + (index % 2) * 85;
        const y = yPosition + Math.floor(index / 2) * 20;
        
        pdf.setFillColor(249, 250, 251); // Gray-50
        pdf.rect(x, y, 80, 15, 'F');
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(metric.label, x + 5, y + 5);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text(metric.value, x + 5, y + 12);
      });

      yPosition += 50;

      // Marketplace Data với table
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Dữ liệu Marketplace:', 20, yPosition);
      yPosition += 10;

      const marketplaceData = [
        ['Platform', 'Listings', 'Sales/tháng'],
        ['AliExpress', analysisResult.market_and_keywords.marketplace_data.aliexpress.listings.toString(), analysisResult.market_and_keywords.marketplace_data.aliexpress.sales_per_month.toString()],
        ['Etsy', analysisResult.market_and_keywords.marketplace_data.etsy.listings.toString(), analysisResult.market_and_keywords.marketplace_data.etsy.sales_per_month.toString()],
        ['Amazon', analysisResult.market_and_keywords.marketplace_data.amazon.listings.toString(), analysisResult.market_and_keywords.marketplace_data.amazon.sales_per_month.toString()],
        ['Shopee', analysisResult.market_and_keywords.marketplace_data.shopee.listings.toString(), analysisResult.market_and_keywords.marketplace_data.shopee.sales_per_month.toString()]
      ];

      // Vẽ table
      const tableWidth = pageWidth - 40;
      const colWidth = tableWidth / 3;
      const rowHeight = 8;

      marketplaceData.forEach((row, rowIndex) => {
        const y = yPosition + rowIndex * rowHeight;
        
        // Header row
        if (rowIndex === 0) {
          pdf.setFillColor(59, 130, 246);
          pdf.rect(20, y, tableWidth, rowHeight, 'F');
          pdf.setTextColor(255, 255, 255);
        } else {
          if (rowIndex % 2 === 0) {
            pdf.setFillColor(249, 250, 251);
          } else {
            pdf.setFillColor(255, 255, 255);
          }
          pdf.rect(20, y, tableWidth, rowHeight, 'F');
          pdf.setTextColor(0, 0, 0);
        }

        row.forEach((cell, colIndex) => {
          const x = 20 + colIndex * colWidth;
          pdf.setFontSize(8);
          pdf.setFont('helvetica', rowIndex === 0 ? 'bold' : 'normal');
          pdf.text(cell, x + 2, y + 5);
        });
      });

      yPosition += marketplaceData.length * rowHeight + 20;

      // Target Customers
      pdf.setFillColor(245, 158, 11); // Orange
      pdf.rect(15, yPosition - 5, pageWidth - 30, 8, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('KHÁCH HÀNG MỤC TIÊU', 20, yPosition);
      
      pdf.setTextColor(0, 0, 0);
      yPosition += 15;

      analysisResult.target_customers.forEach((customer, index) => {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = 20;
        }

        // Customer box
        pdf.setFillColor(254, 243, 199); // Yellow-100
        pdf.rect(15, yPosition - 5, pageWidth - 30, 25, 'F');
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Nhóm ${index + 1}: ${customer.name}`, 20, yPosition);
        yPosition += 8;

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`• Thị phần: ${customer.market_share_percent}%`, 20, yPosition);
        pdf.text(`• Độ tuổi: ${customer.age_range}`, 110, yPosition);
        yPosition += 5;
        pdf.text(`• Ngân sách: $${customer.average_budget_usd}`, 20, yPosition);
        pdf.text(`• Kênh: ${customer.main_channels?.join(', ') || 'N/A'}`, 110, yPosition);
        yPosition += 15;
      });

      // Conclusion
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFillColor(239, 68, 68); // Red
      pdf.rect(15, yPosition - 5, pageWidth - 30, 8, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('KẾT LUẬN', 20, yPosition);
      
      pdf.setTextColor(0, 0, 0);
      yPosition += 15;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Nhóm ưu tiên: ${analysisResult.conclusion.focus_group_priority}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Angle tốt nhất: ${analysisResult.conclusion.best_content_angle}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Upsell suggestions: ${analysisResult.conclusion.upsell_combo_suggestions}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Rủi ro cần lưu ý: ${analysisResult.conclusion.risks_to_consider}`, 20, yPosition);

      // Footer với gradient effect
      pdf.setFillColor(31, 41, 55); // Gray-800
      pdf.rect(0, pageHeight - 15, pageWidth, 15, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.text('Báo cáo được tạo bởi AI Product Analysis System', pageWidth / 2, pageHeight - 8, { align: 'center' });

      // Tải xuống
      const fileName = `product-analysis-${product?.title?.replace(/[^a-zA-Z0-9]/g, '-') || 'report'}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast.success('Báo cáo PDF đẹp đã được tải xuống thành công!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Không thể tạo báo cáo PDF');
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  const handleAnalyze = async () => {
    if (!product) return;
    
    try {
      await productAffService.analyzeProduct(product.id);
      toast.success('Đã bắt đầu phân tích sản phẩm');
      loadProduct();
    } catch (error: any) {
      console.error('Error analyzing product:', error);
      
      // Check if it's a credit error
      if (error.message && error.message.includes('Insufficient credits')) {
        toast.error('Không đủ credit để phân tích sản phẩm. Vui lòng mua thêm credit.');
      } else {
        toast.error('Không thể bắt đầu phân tích sản phẩm');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <AnimatedLoadingSpinners
          spinners={[
            { size: 'lg', color: 'text-blue-600', text: 'Đang tải dữ liệu sản phẩm...', delay: 0 }
          ]}
        />
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Lỗi" subtitle={error} icon={AlertTriangle} onRetry={loadProduct} />;
  }

  if (!product) {
    return <NotFoundState title="Không tìm thấy" subtitle="Sản phẩm không tồn tại" icon={Search} />;
  }

  if (product.status === 'error') {
    return <ErrorState title="Lỗi phân tích" subtitle="Có lỗi xảy ra khi phân tích sản phẩm" icon={AlertTriangle} onRetry={loadProduct} />;
  }

  if (product.status === 'waiting' || product.status === 'processing') {
    return <LoadingState title="Đang phân tích" subtitle="Vui lòng chờ trong giây lát..." icon={Clock} />;
  }

  if (!analysisResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Sản phẩm chưa được phân tích
            </h1>
            <p className="text-gray-600 mb-4">
              Hãy bấm nút bên dưới để bắt đầu phân tích sản phẩm
            </p>
            <div className="mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg">
                  <Coins className="w-5 h-5 mr-2" />
                  <span className="font-semibold">Bạn có {user?.credits || 0} credits</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 text-center mb-4">
                Phân tích sản phẩm sẽ tốn 1 credit
              </p>
            </div>
            <Button 
              onClick={handleAnalyze} 
              className="flex items-center mx-auto"
              disabled={!user || (user.credits || 0) < 1}
            >
              <Zap className="w-4 h-4 mr-2" />
              Phân tích sản phẩm (1 credit)
            </Button>
            {(!user || (user.credits || 0) < 1) && (
              <p className="text-red-500 text-sm text-center mt-2">
                Không đủ credit để phân tích sản phẩm
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const targetCustomersData = analysisResult.target_customers.map((customer, index) => ({
    name: customer.name,
    value: customer.market_share_percent,
    color: COLORS[index % COLORS.length]
  }));

  const keywordData = [
    ...analysisResult.market_and_keywords.keywords.informational.map(k => ({ ...k, category: 'Thông tin' })),
    ...analysisResult.market_and_keywords.keywords.transactional.map(k => ({ ...k, category: 'Mua hàng' })),
    ...analysisResult.market_and_keywords.keywords.comparative.map(k => ({ ...k, category: 'So sánh' })),
    ...analysisResult.market_and_keywords.keywords.painpoint_related.map(k => ({ ...k, category: 'Vấn đề' }))
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="secondary"
                onClick={() => navigate('/product-analysis-aff')}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Coins className="w-8 h-8 mr-3 text-yellow-600" />
                  {product.title || 'Sản phẩm không có tiêu đề'}
                </h1>
                <p className="text-gray-600 mt-2">
                  Target Market: {product.target_market} • 
                  Phân tích: {product.analyzed_at ? new Date(product.analyzed_at).toLocaleDateString('vi-VN') : 'Chưa có'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Credit Display */}
              <div className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg">
                <Coins className="w-4 h-4 mr-2" />
                <span className="font-semibold">{user?.credits || 0} Credits</span>
              </div>
              
              <div className="flex space-x-3">
                <Button variant="secondary" className="flex items-center" onClick={handleDownloadWithCharts}>
                  <Download className="w-4 h-4 mr-2" />
                  Tải xuống PDF
                </Button>
                <Button variant="secondary" className="flex items-center">
                  <Share2 className="w-4 h-4 mr-2" />
                  Chia sẻ
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Images */}
        <div className="mb-8">
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <ImageIcon className="w-6 h-6 mr-2 text-blue-600" />
              Hình ảnh sản phẩm
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Hình ảnh 1</h3>
                <img 
                  src={product.image1} 
                  alt="Product 1" 
                  className="w-full h-64 object-cover rounded-lg border"
                />
              </div>
              {product.image2 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Hình ảnh 2</h3>
                  <img 
                    src={product.image2} 
                    alt="Product 2" 
                    className="w-full h-64 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Executive Summary */}
        <Card className="mb-8">
          <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <BarChart3 className="w-8 h-8 mr-3 text-blue-600" />
              Tóm tắt lãnh đạo
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Đề xuất</h3>
                  <p className="text-lg text-gray-700">{analysisResult.executive_summary.recommendation}</p>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Cơ hội lớn nhất</h3>
                  <p className="text-lg text-gray-700">{analysisResult.executive_summary.biggest_opportunity}</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-red-50 to-rose-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Rủi ro lớn nhất</h3>
                  <p className="text-lg text-gray-700">{analysisResult.executive_summary.biggest_risk}</p>
                </div>
                
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Luận điểm then chốt</h3>
                  <ul className="space-y-2">
                    {analysisResult.executive_summary.key_points.map((point, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-gray-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Market Analysis */}
        <Card className="mb-8">
          <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="w-8 h-8 mr-3 text-green-600" />
              Phân tích thị trường
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Tiềm năng bán hàng</h3>
                <p className="text-2xl font-bold text-green-600 mb-2">{analysisResult.market_and_keywords.sales_potential}</p>
                <p className="text-gray-600">Quy mô: ${analysisResult.market_and_keywords.market_size_usd.toLocaleString()}</p>
                <p className="text-gray-600">CAGR: {analysisResult.market_and_keywords.cagr_percent}%</p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Xu hướng Google</h3>
                <p className="text-2xl font-bold text-blue-600 mb-2">
                  {analysisResult.market_and_keywords.google_trends_change_percent > 0 ? '+' : ''}
                  {analysisResult.market_and_keywords.google_trends_change_percent}%
                </p>
                <p className="text-gray-600">Thay đổi 12 tháng</p>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Nguồn tham khảo</h3>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.market_and_keywords.sources.map((source, index) => (
                    <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      {source}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Marketplace Data */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Dữ liệu Marketplace</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">AliExpress</h4>
                  <p className="text-2xl font-bold text-purple-600 mb-1">{analysisResult.market_and_keywords.marketplace_data.aliexpress.listings.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Listings</p>
                  <p className="text-sm text-gray-600">{analysisResult.market_and_keywords.marketplace_data.aliexpress.sales_per_month} sales/tháng</p>
                </div>
                
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Etsy</h4>
                  <p className="text-2xl font-bold text-orange-600 mb-1">{analysisResult.market_and_keywords.marketplace_data.etsy.listings.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Listings</p>
                  <p className="text-sm text-gray-600">{analysisResult.market_and_keywords.marketplace_data.etsy.sales_per_month} sales/tháng</p>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Amazon</h4>
                  <p className="text-2xl font-bold text-blue-600 mb-1">{analysisResult.market_and_keywords.marketplace_data.amazon.listings.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Listings</p>
                  <p className="text-sm text-gray-600">{analysisResult.market_and_keywords.marketplace_data.amazon.sales_per_month} sales/tháng</p>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Shopee</h4>
                  <p className="text-2xl font-bold text-green-600 mb-1">{analysisResult.market_and_keywords.marketplace_data.shopee.listings.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Listings</p>
                  <p className="text-sm text-gray-600">{analysisResult.market_and_keywords.marketplace_data.shopee.sales_per_month} sales/tháng</p>
                </div>
              </div>
            </div>

            {/* Keywords Chart */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Từ khóa hiệu quả</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={keywordData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="keyword" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="volume" fill="#8884d8" name="Search Volume" />
                    <Bar dataKey="cpc" fill="#82ca9d" name="CPC" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </Card>

        {/* Product Problems */}
        <Card className="mb-8">
          <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <Target className="w-8 h-8 mr-3 text-red-600" />
              Vấn đề sản phẩm
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <ThumbsUp className="w-5 h-5 mr-2 text-green-600" />
                  Đã giải quyết tốt
                </h3>
                <div className="space-y-3">
                  {analysisResult.product_problems.resolved.map((problem, index) => (
                    <div key={index} className="bg-green-50 p-4 rounded-lg">
                      <p className="text-gray-800 font-medium">{problem.problem}</p>
                      <p className="text-green-600 font-semibold">{problem.satisfaction_percent}% hài lòng</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <ThumbsDown className="w-5 h-5 mr-2 text-red-600" />
                  Chưa giải quyết tốt
                </h3>
                <div className="space-y-3">
                  {analysisResult.product_problems.unresolved.map((problem, index) => (
                    <div key={index} className="bg-red-50 p-4 rounded-lg">
                      <p className="text-gray-800 font-medium">{problem.problem}</p>
                      <p className="text-red-600 font-semibold">{problem.unsatisfied_percent}% chưa hài lòng</p>
                      {problem.example_feedback && (
                        <p className="text-gray-600 text-sm mt-2 italic">"{problem.example_feedback}"</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Target Customers */}
        <Card className="mb-8">
          <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <Users className="w-8 h-8 mr-3 text-purple-600" />
              Phân tích khách hàng mục tiêu
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Phân bổ thị phần</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={targetCustomersData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {targetCustomersData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="space-y-4">
                {analysisResult.target_customers.map((customer, index) => (
                  <div key={index} className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">{customer.name}</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Thị phần: {customer.market_share_percent}%</p>
                        <p className="text-gray-600">Độ tuổi: {customer.age_range}</p>
                        <p className="text-gray-600">Ngân sách: ${customer.average_budget_usd}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Nam: {customer.gender_ratio?.male || 0}%</p>
                        <p className="text-gray-600">Nữ: {customer.gender_ratio?.female || 0}%</p>
                        <p className="text-gray-600">Tần suất: {customer.purchase_frequency}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Detailed Customer Analysis */}
        {analysisResult.target_customers.map((customer, index) => (
          <Card key={index} className="mb-8">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Users className="w-6 h-6 mr-3 text-purple-600" />
                {customer.name}
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Thông tin cơ bản</h3>
                  <p className="text-sm text-gray-600">Thị phần: {customer.market_share_percent}%</p>
                  <p className="text-sm text-gray-600">Độ tuổi: {customer.age_range}</p>
                  <p className="text-sm text-gray-600">Nghề nghiệp: {customer.occupations?.join(', ') || 'N/A'}</p>
                  <p className="text-sm text-gray-600">Vị trí: {customer.locations?.join(', ') || 'N/A'}</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Hành vi mua hàng</h3>
                  <p className="text-sm text-gray-600">Tần suất: {customer.purchase_frequency}</p>
                  <p className="text-sm text-gray-600">Ngân sách: ${customer.average_budget_usd}</p>
                  <p className="text-sm text-gray-600">Kênh: {customer.main_channels?.join(', ') || 'N/A'}</p>
                  <p className="text-sm text-gray-600">Tái mua: {customer.repurchase_or_upsell?.estimated_percent || 0}%</p>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Động lực & Ngữ cảnh</h3>
                  <p className="text-sm text-gray-600">{customer.emotional_motivations}</p>
                  <p className="text-sm text-gray-600">{customer.usage_context}</p>
                </div>
              </div>

              {/* Pain Points */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Pain Points & Giải pháp</h3>
                <div className="space-y-4">
                  {(customer.solutions_and_content || []).map((solution, solIndex) => (
                    <div key={solIndex} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-800">{solution.pain_point}</h4>
                        <span className="text-sm text-blue-600 font-semibold">{solution.percent_of_customers}% khách hàng</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2"><strong>USP:</strong> {solution.usp}</p>
                      <p className="text-sm text-gray-600 mb-2"><strong>Content Hook:</strong> {solution.content_hook}</p>
                      <p className="text-sm text-gray-600"><strong>Visual Idea:</strong> {solution.ad_visual_idea}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}

        {/* Conclusion */}
        <Card className="mb-8">
          <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <Lightbulb className="w-8 h-8 mr-3 text-yellow-600" />
              Kết luận & Khuyến nghị
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Nhóm ưu tiên</h3>
                  <p className="text-lg text-gray-700">{analysisResult.conclusion.focus_group_priority}</p>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Angle nội dung tốt nhất</h3>
                  <p className="text-lg text-gray-700">{analysisResult.conclusion.best_content_angle}</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Gợi ý Upsell/Combo</h3>
                  <p className="text-lg text-gray-700">{analysisResult.conclusion.upsell_combo_suggestions}</p>
                </div>
                
                <div className="bg-gradient-to-r from-red-50 to-rose-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Rủi ro cần lưu ý</h3>
                  <p className="text-lg text-gray-700">{analysisResult.conclusion.risks_to_consider}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProductAnalysisAffDetailPage;