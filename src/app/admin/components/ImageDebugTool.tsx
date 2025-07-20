'use client';

import { useState } from 'react';
import { Card, Input, Button, Space, message, Typography, Tag, Alert } from 'antd';
import { CheckOutlined, CloseOutlined, ReloadOutlined } from '@ant-design/icons';
import ImageDisplay from './ImageDisplay';

const { Text } = Typography;

export default function ImageDebugTool() {
  const [testUrl, setTestUrl] = useState('');
  const [testResult, setTestResult] = useState<{
    status: 'success' | 'error' | 'testing' | null;
    message: string;
  }>({ status: null, message: '' });

  const testImageUrl = async () => {
    if (!testUrl.trim()) {
      message.warning('Please enter an image URL to test');
      return;
    }

    setTestResult({ status: 'testing', message: 'Testing image accessibility...' });

    try {
      // Test if the image can be loaded
      const img = new Image();
      
      const testPromise = new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Image failed to load'));
        img.src = testUrl;
      });

      // Add timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Image load timeout (10s)')), 10000);
      });

      await Promise.race([testPromise, timeoutPromise]);

      setTestResult({
        status: 'success',
        message: 'Image is publicly accessible and loads correctly!'
      });
    } catch (error) {
      setTestResult({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to load image'
      });
    }
  };

  const getStatusIcon = () => {
    switch (testResult.status) {
      case 'success':
        return <CheckOutlined style={{ color: '#52c41a' }} />;
      case 'error':
        return <CloseOutlined style={{ color: '#ff4d4f' }} />;
      case 'testing':
        return <ReloadOutlined spin style={{ color: '#1890ff' }} />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (testResult.status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'testing':
        return 'processing';
      default:
        return 'default';
    }
  };

  return (
    <Card 
      title={
        <span>
          🔧 Image URL Debug Tool
        </span>
      }
      size="small"
      style={{ marginTop: 16 }}
    >
      <Alert
        message="Debug Tool"
        description="Use this tool to test if your S3 image URLs are publicly accessible. Paste an image URL and click 'Test Access' to verify it loads correctly."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
        <Input
          placeholder="https://your-bucket.s3.amazonaws.com/branches/image.jpg"
          value={testUrl}
          onChange={(e) => setTestUrl(e.target.value)}
          onPressEnter={testImageUrl}
        />
        <Button 
          type="primary" 
          onClick={testImageUrl}
          loading={testResult.status === 'testing'}
        >
          Test Access
        </Button>
      </Space.Compact>

      {testResult.status && (
        <div style={{ marginBottom: 16 }}>
          <Tag 
            icon={getStatusIcon()} 
            color={getStatusColor()}
            style={{ marginBottom: 8 }}
          >
            {testResult.message}
          </Tag>
          
          {testResult.status === 'success' && testUrl && (
            <div style={{ marginTop: 12 }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                Preview:
              </Text>
              <ImageDisplay
                src={testUrl}
                alt="Test image"
                width={150}
                height={100}
                style={{ border: '1px solid #d9d9d9', borderRadius: 6 }}
              />
            </div>
          )}
          
          {testResult.status === 'error' && (
            <div style={{ marginTop: 12 }}>
              <Alert
                message="Troubleshooting Tips"
                description={
                  <ul style={{ margin: 0, paddingLeft: 16 }}>
                    <li>Check your S3 bucket public access settings</li>
                    <li>Verify your bucket policy allows GetObject for all users</li>
                    <li>Make sure the URL is correct and the file exists</li>
                    <li>Check if the image was uploaded successfully to S3</li>
                  </ul>
                }
                type="warning"
                showIcon
              />
            </div>
          )}
        </div>
      )}

      <div style={{ fontSize: '12px', color: '#666' }}>
        <Text strong>Quick Test URLs:</Text>
        <div style={{ marginTop: 4 }}>
          <Button 
            type="link" 
            size="small" 
            onClick={() => setTestUrl('https://via.placeholder.com/300x200.jpg')}
            style={{ padding: 0, height: 'auto' }}
          >
            Test with placeholder image
          </Button>
        </div>
      </div>
    </Card>
  );
} 