import React from 'react';
import { useTranslation } from 'react-i18next';
import { History, Download, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';

const HistoryPage: React.FC = () => {
  const { t } = useTranslation();

  // Mock data - in real app, this would come from API
  const mockHistory = [
    {
      id: '1',
      status: 'completed',
      created_at: '2024-01-15T10:30:00Z',
      result_image_url: '/api/download/result1.png',
    },
    {
      id: '2',
      status: 'processing',
      created_at: '2024-01-15T09:15:00Z',
    },
    {
      id: '3',
      status: 'failed',
      created_at: '2024-01-14T16:45:00Z',
      error_message: 'Invalid image format',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    return t(`history.status.${status}`);
  };

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('history.title')}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {t('history.subtitle')}
          </p>
        </div>

        {/* History List */}
        <div className="space-y-4">
          {mockHistory.length === 0 ? (
            <Card>
              <CardBody className="text-center py-12">
                <History className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('history.noHistory')}
                </h3>
                <p className="text-gray-500">
                  Start by optimizing your first images.
                </p>
              </CardBody>
            </Card>
          ) : (
            mockHistory.map((item) => (
              <Card key={item.id}>
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(item.status)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">
                            Process #{item.id}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === 'completed' ? 'bg-green-100 text-green-800' :
                            item.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {getStatusText(item.status)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {t('history.processedAt')} {new Date(item.created_at).toLocaleString()}
                        </p>
                        {item.error_message && (
                          <p className="text-sm text-red-600 mt-1">
                            {item.error_message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {item.status === 'completed' && item.result_image_url && (
                        <Button size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          {t('history.download')}
                        </Button>
                      )}
                      {item.status === 'failed' && (
                        <Button size="sm" variant="secondary">
                          {t('history.retry')}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
