import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Link, X, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { cn } from '../utils/cn';

interface ImageUploadProps {
  label: string;
  description?: string;
  onFileChange?: (file: File | null) => void;
  onUrlChange?: (url: string) => void;
  optional?: boolean;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  description,
  onFileChange,
  onUrlChange,
  optional = false,
  className
}) => {
  const { t } = useTranslation();
  const [uploadType, setUploadType] = useState<'file' | 'url'>('file');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedFile(file);
      setUploadType('file');
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      onFileChange?.(file);
      onUrlChange?.(''); // Clear URL when file is uploaded
      setImageUrl('');
    }
  }, [onFileChange, onUrlChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const handleUrlSubmit = () => {
    if (imageUrl.trim()) {
      setUploadedFile(null);
      setPreviewUrl(imageUrl);
      onUrlChange?.(imageUrl);
      onFileChange?.(null); // Clear file when URL is set
    }
  };

  const clearImage = () => {
    setUploadedFile(null);
    setImageUrl('');
    setPreviewUrl('');
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    onFileChange?.(null);
    onUrlChange?.('');
  };

  const hasImage = previewUrl || uploadedFile || imageUrl;

  return (
    <div className={cn('space-y-3', className)}>
      {label && (
        <label className="block text-sm font-medium text-primary-900 mb-2">
          {label}
          {optional && <span className="text-sm text-neutral-500 ml-1">({t('common.optional')})</span>}
        </label>
      )}
      {description && (
        <p className="text-sm text-neutral-600 mb-3">{description}</p>
      )}
      
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed border-neutral-300 rounded-xl p-6 cursor-pointer transition-all duration-200 hover:border-primary-400 hover:bg-primary-50',
          isDragActive && 'border-primary-500 bg-primary-50',
          hasImage && 'border-success-300 bg-success-50'
        )}
      >
        <input {...getInputProps()} />
        
        {previewUrl ? (
          // Preview Image
          <div className="relative">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearImage();
              }}
              className="absolute top-2 right-2 p-1 bg-error-500 text-white rounded-full hover:bg-error-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
              {uploadedFile ? uploadedFile.name : 'From URL'}
            </div>
          </div>
        ) : (
          // Upload Placeholder
          <div className="text-center py-8">
            <ImageIcon className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
            <p className="text-sm text-neutral-600 mb-2">
              {isDragActive 
                ? t('virtualTryOn.dragDrop')
                : t('virtualTryOn.dragDrop')
              }
            </p>
            <p className="text-xs text-neutral-500 mb-4">
              {t('virtualTryOn.fileTypes')}
            </p>
            <p className="text-xs text-neutral-500">
              {t('virtualTryOn.maxSize')}
            </p>
          </div>
        )}
      </div>

      {/* URL Input Section */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className="h-px bg-neutral-300 flex-1" />
          <span className="text-xs text-neutral-500 px-2">OR</span>
          <div className="h-px bg-neutral-300 flex-1" />
        </div>
        
        <div className="flex space-x-2">
          <div className="flex-1">
            <Input
              placeholder={t('virtualTryOn.modelImageUrl')}
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
            />
          </div>
          <Button
            onClick={handleUrlSubmit}
            disabled={!imageUrl.trim()}
            size="md"
            className="px-3"
          >
            <Link className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
