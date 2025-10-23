'use client';

import { useState, useEffect } from 'react';
import { Upload, message, Progress } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';

interface S3ImageUploadProps {
  value?: string[];
  onChange?: (urls: string[]) => void;
  maxCount?: number;
  folder?: string;
  disabled?: boolean;
}

interface UploadResponse {
  success: boolean;
  message: string;
  data?: {
    url: string;
    key: string;
    originalName: string;
    size: number;
    type: string;
  };
}

export default function S3ImageUpload({
  value = [],
  onChange,
  maxCount = 10,
  folder = 'uploads',
  disabled = false,
}: S3ImageUploadProps) {
  const [fileList, setFileList] = useState<UploadFile[]>(() => {
    return value.map((url, index) => ({
      uid: `-${index}`,
      name: `image-${index}`,
      status: 'done' as const,
      url,
    }));
  });
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  // Update fileList when value prop changes (for editing existing items)
  useEffect(() => {
    const newFileList = value.map((url, index) => ({
      uid: `-${index}`,
      name: `image-${index}`,
      status: 'done' as const,
      url,
    }));
    setFileList(newFileList);
  }, [value]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCustomUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    
    try {
      setUploading(true);
      setUploadProgress(prev => ({ ...prev, [file.uid]: 0 }));

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[file.uid] || 0;
          if (current < 90) {
            return { ...prev, [file.uid]: current + 10 };
          }
          return prev;
        });
      }, 200);

      // Upload to S3 via our API
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result: UploadResponse = await response.json();

      if (result.success && result.data) {
        setUploadProgress(prev => ({ ...prev, [file.uid]: 100 }));
        
        // Update file list with the uploaded URL
        const newFileList = [...fileList];
        const fileIndex = newFileList.findIndex(f => f.uid === file.uid);
        
        if (fileIndex >= 0) {
          newFileList[fileIndex] = {
            ...newFileList[fileIndex],
            status: 'done',
            url: result.data.url,
            response: result.data,
          };
        } else {
          newFileList.push({
            uid: file.uid,
            name: file.name,
            status: 'done',
            url: result.data.url,
            response: result.data,
          });
        }
        
        setFileList(newFileList);
        
        // Update parent component
        const urls = newFileList
          .filter(f => f.status === 'done' && f.url)
          .map(f => f.url!);
        onChange?.(urls);
        
        onSuccess(result.data);
        message.success(`${file.name} uploaded successfully`);
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      onError(error);
      message.error(`Failed to upload ${file.name}`);
      
      // Remove failed file from list
      setFileList(prev => prev.filter(f => f.uid !== file.uid));
    } finally {
      setUploading(false);
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[file.uid];
        return newProgress;
      });
    }
  };

  const handleChange: UploadProps['onChange'] = (info) => {
    let newFileList = [...info.fileList];

    // Limit the number of uploaded files
    newFileList = newFileList.slice(-maxCount);

    // Only update fileList and onChange for removals, not for upload completions
    // (upload completions are handled by handleCustomUpload)
    if (info.file.status === 'removed') {
      setFileList(newFileList);
      
      const urls = newFileList
        .filter(f => f.status === 'done' && f.url)
        .map(f => f.url!);
      onChange?.(urls);
    } else if (info.file.status === 'uploading') {
      // Update fileList to show uploading state, but don't call onChange
      setFileList(newFileList);
    }
    // For 'done' status, let handleCustomUpload handle it to avoid conflicts
  };

  const handleRemove = (file: UploadFile) => {
    const newFileList = fileList.filter(f => f.uid !== file.uid);
    setFileList(newFileList);
    
    const urls = newFileList
      .filter(f => f.status === 'done' && f.url)
      .map(f => f.url!);
    onChange?.(urls);
    
    return true;
  };

  const beforeUpload = (file: File) => {
    // Check file type
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return false;
    }

    // Check file size (20MB)
    const isLt20M = file.size / 1024 / 1024 < 20;
    if (!isLt20M) {
      message.error('Image must be smaller than 20MB!');
      return false;
    }

    return true;
  };

  const uploadProps: UploadProps = {
    customRequest: handleCustomUpload,
    onChange: handleChange,
    onRemove: handleRemove,
    beforeUpload,
    fileList,
    listType: 'picture-card',
    disabled: disabled || uploading,
    multiple: true,
    accept: 'image/*',
  };

  return (
    <div>
      <Upload {...uploadProps}>
        {fileList.length >= maxCount ? null : (
          <div>
            <UploadOutlined />
            <div style={{ marginTop: 8 }}>
              {uploading ? 'Uploading...' : 'Upload'}
            </div>
          </div>
        )}
      </Upload>
      
      {/* Show upload progress */}
      {Object.entries(uploadProgress).map(([uid, progress]) => (
        <div key={uid} style={{ marginTop: 8 }}>
          <Progress percent={progress} size="small" />
        </div>
      ))}
      
      {fileList.length > 0 && (
        <div style={{ marginTop: 8, color: '#666', fontSize: '12px' }}>
          {fileList.length} / {maxCount} images uploaded
        </div>
      )}
    </div>
  );
} 