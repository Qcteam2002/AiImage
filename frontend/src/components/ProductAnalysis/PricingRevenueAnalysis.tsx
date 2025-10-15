import React from 'react';
import { Typography } from '../design-system/Typography';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PricingRevenueAnalysisProps {
  analysisResult: any;
}

const PricingRevenueAnalysis: React.FC<PricingRevenueAnalysisProps> = ({ analysisResult }) => {
  const pricingData = analysisResult?.market_and_keywords?.pricing_analysis;
  const revenueData = analysisResult?.market_and_keywords?.revenue_analysis;
  const marketplaceData = analysisResult?.market_and_keywords?.marketplace_data;

  if (!pricingData && !revenueData) {
    return null;
  }

  // Detect market currency based on target market
  const getCurrency = () => {
    const targetMarket = analysisResult?.target_market || '';
    if (targetMarket.toLowerCase().includes('việt nam') || 
        targetMarket.toLowerCase().includes('vietnam') ||
        targetMarket.toLowerCase().includes('vn')) {
      return 'VND';
    }
    return 'USD';
  };

  const formatCurrency = (amount: number) => {
    const currency = getCurrency();
    if (currency === 'VND') {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const getMonthName = (monthNum: number) => {
    const months = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
    return months[monthNum - 1] || `Tháng ${monthNum}`;
  };

  // Calculate actual 12 months based on analysis date
  const getActualMonthLabels = () => {
    // Try to get analysis date from the data, fallback to current date
    const analysisDate = analysisResult?.analysis_date || new Date().toISOString();
    const currentDate = new Date(analysisDate);
    
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthNum = targetDate.getMonth() + 1;
      const year = targetDate.getFullYear();
      months.push(`${getMonthName(monthNum)}/${year}`);
    }
    return months;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-4">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
        <div>
          <Typography.H3 className="text-gray-900">Phân Tích Giá Cả & Doanh Thu</Typography.H3>
          <Typography.BodySmall className="text-gray-600">Thông tin chi tiết về giá cả và doanh thu thị trường</Typography.BodySmall>
        </div>
      </div>

      {/* 4 Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Doanh Thu 12 Tháng */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="text-green-600 text-xs font-medium">12 THÁNG</div>
          </div>
          <Typography.Caption className="text-green-700 mb-1">Doanh Thu 12 Tháng</Typography.Caption>
          <Typography.H4 className="text-green-900">
            {revenueData?.market_revenue_12m_usd ? formatCurrency(revenueData.market_revenue_12m_usd) : 'N/A'}
          </Typography.H4>
        </div>

        {/* Khả Năng Bán Ra */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="text-orange-600 text-xs font-medium">THÁNG</div>
          </div>
          <Typography.Caption className="text-orange-700 mb-1">Khả Năng Bán Ra</Typography.Caption>
          <Typography.H4 className="text-orange-900">
            {revenueData?.sales_velocity_estimate || 'N/A'}
          </Typography.H4>
        </div>

        {/* Giá Gốc (Cost Price) */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-blue-600 text-xs font-medium">COST</div>
          </div>
          <Typography.Caption className="text-blue-700 mb-1">Giá Gốc (Cost Price)</Typography.Caption>
          <Typography.H4 className="text-blue-900">
            {pricingData?.cost_price_usd ? formatCurrency(pricingData.cost_price_usd) : 'N/A'}
          </Typography.H4>
        </div>

        {/* Khoảng Giá Bán */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <div className="text-purple-600 text-xs font-medium">RANGE</div>
          </div>
          <Typography.Caption className="text-purple-700 mb-1">Khoảng Giá Bán</Typography.Caption>
          <Typography.H4 className="text-purple-900">
            {pricingData?.price_range_usd?.min && pricingData?.price_range_usd?.max 
              ? `${formatCurrency(pricingData.price_range_usd.min)} - ${formatCurrency(pricingData.price_range_usd.max)}`
              : 'N/A'}
          </Typography.H4>
        </div>
      </div>

      {/* Monthly Revenue Chart - Full Width */}
      {revenueData?.monthly_revenue_breakdown && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <Typography.H4 className="text-gray-900">Doanh Thu Theo Tháng (12 Tháng Gần Nhất)</Typography.H4>
              <Typography.BodySmall className="text-gray-600">Xu hướng doanh thu theo thời gian</Typography.BodySmall>
            </div>
          </div>
          
          {/* Chart */}
          <div className="h-80">
            {(() => {
              // Get actual month labels based on analysis date
              const actualMonthLabels = getActualMonthLabels();
              
              // Map the revenue data to actual months
              const monthlyData = Object.entries(revenueData.monthly_revenue_breakdown)
                .sort(([a], [b]) => parseInt(a.replace('month_', '')) - parseInt(b.replace('month_', '')))
                .map(([key, value], index) => ({
                  month: actualMonthLabels[index] || `Tháng ${parseInt(key.replace('month_', ''))}`,
                  value: typeof value === 'number' ? value : 0
                }));

              const chartData = {
                labels: monthlyData.map(d => d.month),
                datasets: [
                  {
                    label: 'Doanh Thu',
                    data: monthlyData.map(d => d.value),
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgb(34, 197, 94)',
                    pointBorderColor: 'rgb(34, 197, 94)',
                    pointRadius: 6,
                    pointHoverRadius: 10,
                  },
                ],
              };

              const chartOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    borderColor: 'rgb(34, 197, 94)',
                    borderWidth: 1,
                    callbacks: {
                      label: function(context: any) {
                        return `Doanh thu: ${formatCurrency(context.parsed.y)}`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)',
                    },
                    ticks: {
                      callback: function(value: any) {
                        return formatCurrency(value);
                      }
                    }
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                    ticks: {
                      maxRotation: 45,
                      minRotation: 45
                    }
                  }
                },
              };

              return <Line data={chartData} options={chartOptions} />;
            })()}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
            {(() => {
              const values = Object.values(revenueData.monthly_revenue_breakdown)
                .filter(v => typeof v === 'number') as number[];
              const max = Math.max(...values);
              const min = Math.min(...values);
              const avg = values.reduce((a, b) => a + b, 0) / values.length;
              
              return (
                <>
                  <div className="text-center">
                    <div className="text-gray-600 text-sm mb-1">Cao nhất</div>
                    <div className="font-bold text-lg text-green-600">{formatCurrency(max)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600 text-sm mb-1">Trung bình</div>
                    <div className="font-bold text-lg text-blue-600">{formatCurrency(avg)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600 text-sm mb-1">Thấp nhất</div>
                    <div className="font-bold text-lg text-red-600">{formatCurrency(min)}</div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Competitive Pricing Analysis */}
      {pricingData?.competitive_pricing_analysis && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <Typography.H4 className="text-blue-900">Phân Tích Giá Cạnh Tranh</Typography.H4>
          </div>
          <Typography.Body className="text-blue-800 leading-relaxed">
            {pricingData.competitive_pricing_analysis}
          </Typography.Body>
        </div>
      )}
    </div>
  );
};

export default PricingRevenueAnalysis;
