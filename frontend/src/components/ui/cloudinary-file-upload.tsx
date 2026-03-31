import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Upload, X, FileImage, FileText } from 'lucide-react';
import { fileUploadAPI } from '@/lib/api';

interface CloudinaryFileUploadProps {
  onUploadSuccess: (url: string) => void;
  onUploadError?: (error: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  multiple?: boolean;
  maxFiles?: number;
  className?: string;
  disabled?: boolean;
  uploadType?: 'profile' | 'owner-document' | 'property-images' | 'property-documents' | 'tenant-document';
  propertyId?: string;
  documentType?: 'aadhar' | 'pan' | string;
  children?: React.ReactNode;
}

const CloudinaryFileUpload: React.FC<CloudinaryFileUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  accept = 'image/*,.pdf',
  maxSize = 5,
  multiple = false,
  maxFiles = 1,
  className = '',
  disabled = false,
  uploadType = 'profile',
  propertyId,
  documentType,
  children,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File size exceeds ${maxSize}MB limit: ${file.name}`);
      return false;
    }

    // Check file type
    const allowedTypes = accept.split(',').map(type => type.trim());
    const fileTypeValid = allowedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      if (type.includes('/*')) {
        return file.type.startsWith(type.replace('/*', ''));
      }
      return file.type === type;
    });

    if (!fileTypeValid) {
      toast.error(`Invalid file type: ${file.name}. Allowed types: ${accept}`);
      return false;
    }

    return true;
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || disabled) return;

    const fileArray = Array.from(files);
    
    if (multiple) {
      if (maxFiles && selectedFiles.length + fileArray.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`);
        return;
      }
      
      const validFiles = fileArray.filter(validateFile);
      setSelectedFiles(prev => [...prev, ...validFiles]);
    } else {
      if (fileArray.length > 0 && validateFile(fileArray[0])) {
        setSelectedFiles([fileArray[0]]);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      let uploadPromise;

      switch (uploadType) {
        case 'profile':
          uploadPromise = fileUploadAPI.uploadProfileImage(selectedFiles[0]);
          break;
        case 'owner-document':
          if (!documentType || !['aadhar', 'pan'].includes(documentType)) {
            throw new Error('Valid document type (aadhar or pan) is required');
          }
          uploadPromise = fileUploadAPI.uploadOwnerDocument(selectedFiles[0], documentType as 'aadhar' | 'pan');
          break;
        case 'property-images':
          if (!propertyId) {
            throw new Error('Property ID is required for property image upload');
          }
          uploadPromise = fileUploadAPI.uploadPropertyImages(selectedFiles, propertyId);
          break;
        case 'property-documents':
          if (!propertyId) {
            throw new Error('Property ID is required for property document upload');
          }
          uploadPromise = fileUploadAPI.uploadPropertyDocuments(selectedFiles, propertyId);
          break;
        case 'tenant-document':
          if (!documentType) {
            throw new Error('Document type is required for tenant document upload');
          }
          uploadPromise = fileUploadAPI.uploadTenantDocument(selectedFiles[0], documentType);
          break;
        default:
          throw new Error('Invalid upload type');
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await uploadPromise;
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.data.success) {
        if (multiple && uploadType.includes('property')) {
          // Handle multiple files for property uploads
          const urls = response.data.imageUrls || response.data.documentUrls || [];
          urls.forEach((url: string) => onUploadSuccess(url));
          toast.success(`${urls.length} files uploaded successfully to Cloudinary`);
        } else {
          // Handle single file upload
          const url = response.data.imageUrl || response.data.documentUrl;
          onUploadSuccess(url);
          toast.success('File uploaded successfully to Cloudinary');
        }
        
        setSelectedFiles([]);
      } else {
        throw new Error(response.data.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Upload failed';
      toast.error(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <FileImage className="w-4 h-4" />;
    } else if (file.type === 'application/pdf') {
      return <FileText className="w-4 h-4" />;
    }
    return <Upload className="w-4 h-4" />;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
        
        {children || (
          <div className="space-y-2">
            <Upload className="w-12 h-12 mx-auto text-gray-400" />
            <div>
              <p className="text-lg font-medium text-gray-900">
                Drop files here or click to browse
              </p>
              <p className="text-sm text-gray-500">
                {accept} • Max size: {maxSize}MB
                {multiple && maxFiles && ` • Max files: ${maxFiles}`}
              </p>
            </div>
          </div>
        )}
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">
            Selected Files ({selectedFiles.length})
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <div className="flex items-center space-x-2">
                  {getFileIcon(file)}
                  <span className="text-sm text-gray-700 truncate">
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading to Cloudinary...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      {selectedFiles.length > 0 && !uploading && (
        <Button
          onClick={uploadFiles}
          disabled={disabled}
          className="w-full"
        >
          Upload to Cloudinary
        </Button>
      )}
    </div>
  );
};

export default CloudinaryFileUpload;
