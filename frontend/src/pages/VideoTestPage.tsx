import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Upload, Play, Download, Image as ImageIcon, Video, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Textarea } from '../components/ui/Textarea';
import { videoAPI } from '../services/api';

interface VideoTestForm {
  prompt: string;
  image?: FileList;
}

const VideoTestPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [videoResult, setVideoResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<VideoTestForm>();

  const imageFiles = watch('image');

  // Handle image preview
  React.useEffect(() => {
    if (imageFiles && imageFiles.length > 0) {
      const file = imageFiles[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [imageFiles]);

  const onSubmit = async (data: VideoTestForm) => {
    if (!selectedImage || (!data.image || data.image.length === 0)) {
      setError('Please select an image');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      setVideoResult(null);

      const formData = new FormData();
      // Use file from form or from drag & drop
      const file = data.image && data.image.length > 0 ? data.image[0] : null;
      if (!file) {
        setError('Please select an image');
        return;
      }
      formData.append('image', file);
      formData.append('prompt', data.prompt);

      const response = await videoAPI.createVideo(formData);
      
      if (response.data.success) {
        setVideoResult(response.data.videoUrl);
      } else {
        setError(response.data.message || 'Failed to create video');
      }
    } catch (error: any) {
      console.error('Video creation error:', error);
      setError(error.response?.data?.error || 'Failed to create video');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        // Create a FileList-like object for the form
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        
        // Update the form input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
          fileInput.files = dataTransfer.files;
          // Trigger change event
          const event = new Event('change', { bubbles: true });
          fileInput.dispatchEvent(event);
        }
        
        // Update preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setSelectedImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleImageDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Video Test
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Upload an image and create a video using AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">
                Upload Image
              </h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Image Upload */}
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
                  onDrop={handleImageDrop}
                  onDragOver={handleImageDragOver}
                >
                  {selectedImage ? (
                    <div className="space-y-4">
                      <img
                        src={selectedImage}
                        alt="Preview"
                        className="mx-auto h-48 w-48 object-cover rounded-lg"
                      />
                      <p className="text-sm text-gray-600">Image selected</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">
                          Drag and drop an image here, or click to browse
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Supported formats: JPG, PNG, WebP, GIF (max 10MB)
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    {...register('image', {
                      required: 'Please select an image',
                      validate: (files) => {
                        if (files && files.length > 0) {
                          const file = files[0];
                          if (file.size > 10 * 1024 * 1024) {
                            return 'File size must be less than 10MB';
                          }
                          if (!file.type.startsWith('image/')) {
                            return 'Please select an image file';
                          }
                        }
                        return true;
                      }
                    })}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const file = e.target.files[0];
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          setSelectedImage(e.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
                    className="mt-4"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Select Image
                  </Button>
                </div>

                {errors.image && (
                  <p className="text-sm text-red-600">{errors.image.message}</p>
                )}

                {/* Prompt Input */}
                <div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Video Prompt
                    </label>
                    <Textarea
                      placeholder="Describe what you want to happen in the video (e.g., 'The cat starts to dance', 'The person waves hello')"
                      rows={4}
                      {...register('prompt', {
                        required: 'Please enter a video prompt',
                        minLength: {
                          value: 10,
                          message: 'Prompt must be at least 10 characters'
                        }
                      })}
                    />
                    {errors.prompt && (
                      <p className="text-sm text-red-600 mt-1">{errors.prompt.message}</p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  loading={isProcessing}
                  disabled={!selectedImage || isProcessing}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Video...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Create Video
                    </>
                  )}
                </Button>
              </form>
            </CardBody>
          </Card>

          {/* Result Section */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">
                Video Result
              </h2>
            </CardHeader>
            <CardBody>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {isProcessing && (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600 mb-4" />
                  <p className="text-sm text-gray-600">Creating your video...</p>
                  <p className="text-xs text-gray-500 mt-2">
                    This may take a few minutes
                  </p>
                </div>
              )}

              {videoResult && !isProcessing && (
                <div className="space-y-4">
                  <video
                    src={videoResult}
                    controls
                    className="w-full rounded-lg"
                    poster={selectedImage || undefined}
                  >
                    Your browser does not support the video tag.
                  </video>
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = videoResult;
                        link.download = 'generated-video.mp4';
                        link.click();
                      }}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Video
                    </Button>
                  </div>
                </div>
              )}

              {!videoResult && !isProcessing && !error && (
                <div className="text-center py-12 text-gray-500">
                  <Video className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">Your video will appear here</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Tips Section */}
        <Card className="mt-8">
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">Tips for Better Results</h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Image Quality</h4>
                <ul className="space-y-1">
                  <li>• Use clear, high-resolution images</li>
                  <li>• Good lighting works better</li>
                  <li>• Single subject images work best</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Prompt Writing</h4>
                <ul className="space-y-1">
                  <li>• Be specific about the action</li>
                  <li>• Use present tense ("dances" not "danced")</li>
                  <li>• Keep it simple and clear</li>
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default VideoTestPage;
