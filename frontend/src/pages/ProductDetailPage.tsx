import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Target, Lightbulb, AlertTriangle, BarChart3, Image as ImageIcon, Download, Share2, Eye, PieChart, Activity, Zap, CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import AnimatedProgressBars from '../components/ui/AnimatedProgressBars';
import AnimatedChartLegends from '../components/ui/AnimatedChartLegends';
import AnimatedTooltips from '../components/ui/AnimatedTooltips';
import AnimatedLoadingSpinners from '../components/ui/AnimatedLoadingSpinners';
import AnimatedMetricCards from '../components/ui/AnimatedMetricCards';
import AnimatedChartContainers from '../components/ui/AnimatedChartContainers';
import AnimatedSummaryCards from '../components/ui/AnimatedSummaryCards';
import AnimatedDetailedSections from '../components/ui/AnimatedDetailedSections';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import NotFoundState from '../components/ui/NotFoundState';
import { productService, Product } from '../services/productService';
import toast from 'react-hot-toast';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface TargetUser {
  group_name: string;
  percent: string;
  profile: string;
  needs: string[];
  buying_behavior: string[];
  sale_point: string;
}

interface ImagePrompt {
  input: string;
  output: string;
  overlay_text: string;
  tone: string;
}

interface PainpointSolution {
  painpoint: string;
  serve_percent: string;
  painpoint_detail: string;
  solution: string;
  how_to_solve: string;
  image_prompt: ImagePrompt;
}

interface KeyPainpoint {
  name: string;
  market_issue: string;
  opportunity: string;
}

interface AnalysisResult {
  product_name: string;
  target_users: TargetUser[];
  painpoints_and_solutions: PainpointSolution[];
  key_painpoints: KeyPainpoint[];
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const productData = await productService.getProduct(id!);
      setProduct(productData);
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Không thể tải thông tin sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <AnimatedLoadingSpinners
          spinners={[
            {
              size: "xl",
              color: "text-blue-600",
              text: "Đang tải dữ liệu...",
              delay: 0
            }
          ]}
        />
      </div>
    );
  }

  if (!product) {
    return (
      <NotFoundState
        title="Không tìm thấy sản phẩm"
        subtitle="Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."
        icon={AlertTriangle}
        iconColor="text-gray-600"
        iconBg="bg-gray-100"
        onBack={() => navigate('/product-analysis')}
      />
    );
  }

  if (product.status === 'waiting' || product.status === 'processing') {
    return (
      <LoadingState
        title={product.status === 'waiting' ? 'Đang chờ phân tích' : 'Đang phân tích'}
        subtitle={product.status === 'waiting' 
          ? 'Sản phẩm đang trong hàng đợi để được phân tích bởi AI.'
          : 'AI đang phân tích sản phẩm của bạn. Vui lòng chờ trong giây lát.'
        }
        icon={AlertTriangle}
        iconColor="text-yellow-600"
        iconBg="bg-yellow-100"
        onRefresh={loadProduct}
      />
    );
  }

  if (product.status === 'error') {
    return (
      <ErrorState
        title="Lỗi phân tích"
        subtitle={product.error_message || 'Có lỗi xảy ra trong quá trình phân tích sản phẩm.'}
        icon={AlertTriangle}
        iconColor="text-red-600"
        iconBg="bg-red-100"
        onRetry={loadProduct}
      />
    );
  }

  // Parse analysis result
  let analysis_result: AnalysisResult;
  try {
    analysis_result = JSON.parse(product.analysis_result || '{}') as AnalysisResult;
  } catch (error) {
    console.error('Error parsing analysis result:', error);
    return (
      <ErrorState
        title="Lỗi hiển thị kết quả"
        subtitle="Không thể phân tích kết quả từ AI. Vui lòng thử lại sau."
        icon={AlertTriangle}
        iconColor="text-red-600"
        iconBg="bg-red-100"
        onRetry={() => navigate('/product-analysis')}
      />
    );
  }

  // Prepare data for charts
  const targetUsersData = analysis_result.target_users?.map((user, index) => ({
    name: user.group_name,
    value: parseInt(user.percent.replace('%', '')),
    color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]
  })) || [];

  const painpointsData = analysis_result.painpoints_and_solutions?.map((item, index) => ({
    name: item.painpoint,
    servePercent: parseInt(item.serve_percent.replace('%', '')),
    color: ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#06B6D4'][index % 5]
  })) || [];

  const handleDownloadReport = () => {
    // Create a simple text report
    const reportContent = `
BÁO CÁO PHÂN TÍCH SẢN PHẨM
============================

Tên sản phẩm: ${analysis_result.product_name || product.name}
Ngày phân tích: ${product.analyzed_at ? new Date(product.analyzed_at).toLocaleDateString('vi-VN') : 'Chưa có'}

TẬP NGƯỜI DÙNG MỤC TIÊU
=======================
${analysis_result.target_users?.map((user, index) => `
${index + 1}. ${user.group_name} (${user.percent})
   - Chân dung: ${user.profile}
   - Nhu cầu: ${user.needs?.join(', ')}
   - Hành vi mua: ${user.buying_behavior?.join(', ')}
   - Điểm chốt sale: ${user.sale_point}
`).join('')}

PAINPOINTS & GIẢI PHÁP
=====================
${analysis_result.painpoints_and_solutions?.map((item, index) => `
${index + 1}. ${item.painpoint} (Serve ${item.serve_percent})
   - Chi tiết: ${item.painpoint_detail}
   - Giải pháp: ${item.solution}
   - Cách giải quyết: ${item.how_to_solve}
`).join('')}

KEY PAINPOINTS
==============
${analysis_result.key_painpoints?.map((painpoint, index) => `
${index + 1}. ${painpoint.name}
   - Vấn đề thị trường: ${painpoint.market_issue}
   - Cơ hội: ${painpoint.opportunity}
`).join('')}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `product-analysis-${product.name}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="secondary"
                onClick={() => navigate('/product-analysis')}
                className="flex items-center gap-2 hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{analysis_result.product_name || product.name}</h1>
                <p className="text-gray-600 text-lg">Báo cáo phân tích chi tiết sản phẩm</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleDownloadReport}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="w-4 h-4" />
                Tải báo cáo
              </Button>
              <Button
                variant="secondary"
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Chia sẻ
              </Button>
            </div>
          </div>
          
          <AnimatedMetricCards
            data={[
              {
                title: "Tập khách hàng",
                value: analysis_result.target_users?.length || 0,
                subtitle: "Nhóm mục tiêu",
                icon: Users,
                gradient: "from-blue-500 to-blue-600"
              },
              {
                title: "Painpoints",
                value: analysis_result.painpoints_and_solutions?.length || 0,
                subtitle: "Vấn đề đã phân tích",
                icon: AlertTriangle,
                gradient: "from-red-500 to-red-600"
              },
              {
                title: "Cơ hội",
                value: analysis_result.key_painpoints?.length || 0,
                subtitle: "Key painpoints",
                icon: Target,
                gradient: "from-green-500 to-green-600"
              }
            ]}
            delay={0}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2">
            <AnimatedChartContainers
              charts={[
                {
                  title: "Phân bố khách hàng mục tiêu",
                  icon: PieChart,
                  iconColor: "text-blue-600",
                  iconBg: "bg-blue-100",
                  delay: 100,
                  children: (
                    <>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={targetUsersData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {targetUsersData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip content={<AnimatedTooltips tooltips={[{ active: true, payload: [], label: '' }]} />} />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-4">
                        <AnimatedChartLegends
                          legends={targetUsersData.map((item, index) => ({
                            color: COLORS[index % COLORS.length],
                            label: item.name,
                            value: item.value.toString(),
                            delay: index * 100
                          }))}
                        />
                      </div>
                    </>
                  )
                },
                {
                  title: "Tỷ lệ serve của từng painpoint",
                  icon: BarChart3,
                  iconColor: "text-red-600",
                  iconBg: "bg-red-100",
                  delay: 200,
                  children: (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={painpointsData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                          <YAxis />
                            <Tooltip content={<AnimatedTooltips tooltips={[{ active: true, payload: [], label: '' }]} />} />
                          <Bar dataKey="servePercent" fill="#EF4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )
                }
              ]}
            />

            {/* Target Users Details */}
            <Card className="shadow-xl border-0">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Chi tiết khách hàng mục tiêu</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {analysis_result.target_users?.map((user, index) => (
                    <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-bold text-gray-900">{user.group_name}</h4>
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-600 text-white text-sm px-4 py-2 rounded-full font-bold">
                            {user.percent}
                          </span>
                          <AnimatedProgressBars
                            bars={[
                              {
                                label: "Tỷ lệ",
                                value: parseInt(user.percent.replace('%', '')),
                                color: "bg-blue-600",
                                delay: 300
                              }
                            ]}
                            className="w-32"
                          />
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            Chân dung khách hàng
                          </h5>
                          <p className="text-gray-600 text-sm leading-relaxed">{user.profile}</p>
                        </div>
                        
                        <div>
                          <h5 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            Điểm chốt sale
                          </h5>
                          <p className="text-gray-600 text-sm bg-yellow-100 p-3 rounded-lg font-medium">{user.sale_point}</p>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-6 mt-4">
                        <div>
                          <h5 className="font-semibold text-gray-700 mb-2">Nhu cầu chính</h5>
                          <div className="space-y-1">
                            {user.needs?.map((need, needIndex) => (
                              <div key={needIndex} className="flex items-center gap-2 text-sm text-gray-600">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                {need}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-semibold text-gray-700 mb-2">Hành vi mua sắm</h5>
                          <div className="space-y-1">
                            {user.buying_behavior?.map((behavior, behaviorIndex) => (
                              <div key={behaviorIndex} className="flex items-center gap-2 text-sm text-gray-600">
                                <Activity className="w-3 h-3 text-blue-500" />
                                {behavior}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Summary & Details */}
          <div>
            <AnimatedSummaryCards
              cards={[
                {
                  title: "Thông tin sản phẩm",
                  icon: ImageIcon,
                  iconColor: "text-gray-600",
                  iconBg: "bg-gray-100",
                  delay: 300,
                  children: (
                    <>
                      {product.image_url && (
                        <div className="mb-4">
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="w-full h-48 object-cover rounded-xl border border-gray-200"
                          />
                        </div>
                      )}
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-1">Mô tả</h4>
                          <p className="text-gray-600 text-sm">{product.description || 'Không có mô tả'}</p>
                        </div>
                        
                        {product.product_url && (
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-1">URL sản phẩm</h4>
                            <a 
                              href={product.product_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm break-all flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Xem sản phẩm
                            </a>
                          </div>
                        )}
                        
                        <div className="pt-4 border-t border-gray-200">
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>Ngày tạo:</span>
                            <span>{new Date(product.created_at).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-500 mt-1">
                            <span>Phân tích:</span>
                            <span>{product.analyzed_at ? new Date(product.analyzed_at).toLocaleDateString('vi-VN') : 'Chưa có'}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )
                },
                {
                  title: "Tóm tắt Painpoints",
                  icon: AlertTriangle,
                  iconColor: "text-red-600",
                  iconBg: "bg-red-100",
                  delay: 400,
                  children: (
                    <div className="space-y-4">
                      {analysis_result.painpoints_and_solutions?.map((item, index) => (
                        <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900 text-sm">{item.painpoint}</h4>
                            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                              {item.serve_percent}
                            </span>
                          </div>
                          <p className="text-gray-600 text-xs leading-relaxed">{item.painpoint_detail}</p>
                          <div className="mt-2">
                      <AnimatedProgressBars
                        bars={[
                          {
                            label: "Serve",
                            value: parseInt(item.serve_percent.replace('%', '')),
                            color: "bg-red-600",
                            delay: 400
                          }
                        ]}
                      />
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                },
                {
                  title: "Key Painpoints",
                  icon: Target,
                  iconColor: "text-orange-600",
                  iconBg: "bg-orange-100",
                  delay: 500,
                  children: (
                    <div className="space-y-4">
                      {analysis_result.key_painpoints?.map((painpoint, index) => (
                        <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 text-sm mb-2">{painpoint.name}</h4>
                          <div className="space-y-2">
                            <div>
                              <h5 className="font-medium text-gray-700 text-xs mb-1">Vấn đề thị trường:</h5>
                              <p className="text-gray-600 text-xs">{painpoint.market_issue}</p>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-700 text-xs mb-1">Cơ hội:</h5>
                              <p className="text-gray-600 text-xs bg-green-100 p-2 rounded">{painpoint.opportunity}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                }
              ]}
            />
          </div>
        </div>

        {/* Detailed Painpoints Section */}
        <AnimatedDetailedSections
          sections={[
            {
              title: "Chi tiết Painpoints & Giải pháp",
              icon: Lightbulb,
              iconColor: "text-red-600",
              iconBg: "bg-red-100",
              delay: 600,
              children: (
                <div className="space-y-8">
                  {analysis_result.painpoints_and_solutions?.map((item, index) => (
                    <div key={index} className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 border border-red-200">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-xl font-bold text-gray-900">{item.painpoint}</h4>
                        <div className="flex items-center gap-3">
                          <span className="bg-red-600 text-white text-sm px-4 py-2 rounded-full font-bold">
                            Serve {item.serve_percent}
                          </span>
                    <AnimatedProgressBars
                      bars={[
                        {
                          label: "Serve",
                          value: parseInt(item.serve_percent.replace('%', '')),
                          color: "bg-red-600",
                          delay: 600
                        }
                      ]}
                      className="w-32"
                    />
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-white p-4 rounded-xl border border-red-200">
                          <h5 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            Chi tiết Painpoint
                          </h5>
                          <p className="text-gray-600 text-sm leading-relaxed">{item.painpoint_detail}</p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-xl border border-green-200">
                          <h5 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            Giải pháp sản phẩm
                          </h5>
                          <p className="text-gray-600 text-sm leading-relaxed">{item.solution}</p>
                        </div>
                      </div>
                      
                      <div className="bg-white p-4 rounded-xl border border-blue-200 mb-4">
                        <h5 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-blue-500" />
                          Cách giải quyết cụ thể
                        </h5>
                        <p className="text-gray-600 text-sm leading-relaxed">{item.how_to_solve}</p>
                      </div>
                      
                      {item.image_prompt && (
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-200">
                          <h5 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-purple-500" />
                            Prompt tạo hình ảnh
                          </h5>
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-semibold text-gray-600">Input:</span>
                              <p className="text-gray-600 mt-1">{item.image_prompt.input}</p>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-600">Output:</span>
                              <p className="text-gray-600 mt-1">{item.image_prompt.output}</p>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-600">Overlay text:</span>
                              <p className="text-gray-600 mt-1">{item.image_prompt.overlay_text}</p>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-600">Tone:</span>
                              <p className="text-gray-600 mt-1">{item.image_prompt.tone}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            }
          ]}
        />
      </div>
    </div>
  );
};

export default ProductDetailPage;