import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

export default function AdminLoadingSpinner() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <Spin 
          indicator={<LoadingOutlined style={{ fontSize: 48, color: 'white' }} spin />} 
        />
        <div style={{ color: 'white', marginTop: 16, fontSize: 16 }}>
          Đang tải...
        </div>
      </div>
    </div>
  );
} 