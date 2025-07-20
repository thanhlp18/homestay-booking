'use client';

import { Card, Typography, Tag } from 'antd';

const { Text } = Typography;

interface ImageUrlDebuggerProps {
  imageUrls: string[];
  label?: string;
}

export default function ImageUrlDebugger({ 
  imageUrls, 
  label = 'Image URLs' 
}: ImageUrlDebuggerProps) {
  return (
    <Card 
      size="small" 
      title={`🐛 Debug: ${label}`}
      style={{ 
        marginBottom: 12, 
        border: '2px dashed #722ed1',
        backgroundColor: '#f9f0ff' 
      }}
    >
      <div style={{ marginBottom: 8 }}>
        <Text strong>Count: </Text>
        <Tag color="purple">{imageUrls.length}</Tag>
      </div>
      
      {imageUrls.length > 0 ? (
        <div>
          <Text strong>URLs:</Text>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            {imageUrls.map((url, index) => (
              <li key={index} style={{ marginBottom: 4 }}>
                <Text 
                  style={{ 
                    fontSize: '11px', 
                    fontFamily: 'monospace',
                    wordBreak: 'break-all'
                  }}
                >
                  {url}
                </Text>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <Text style={{ color: '#999', fontStyle: 'italic' }}>
          No images
        </Text>
      )}
    </Card>
  );
} 