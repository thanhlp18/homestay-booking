'use client';

import { useEffect, useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Switch, 
  message, 
  Popconfirm,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  Avatar
} from 'antd';
import { adminApiCall, handleApiResponse } from '@/lib/adminApi';
import S3ImageUpload from '../components/S3ImageUpload';
import { ImageGallery } from '../components/ImageDisplay';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Branch {
  id: string;
  name: string;
  slug: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  amenities: string[];
  images: string[];
  latitude?: number;
  longitude?: number;
  googleMapUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    rooms: number;
  };
}

interface BranchFormData {
  name: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  amenities: string;
  images: string[];
  latitude?: number;
  longitude?: number;
  googleMapUrl?: string;
  isActive: boolean;
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [form] = Form.useForm();
  const [isMobile, setIsMobile] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    fetchBranches();
    checkMobile();
    
    const handleResize = () => {
      checkMobile();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const checkMobile = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await adminApiCall('/api/admin/branches');
      const data = await handleApiResponse(response);
      setBranches(data.data || []);
    } catch (error) {
      message.error('Không thể tải danh sách chi nhánh');
      console.error('Error fetching branches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingBranch(null);
    setModalVisible(true);
    form.resetFields();
    setImageUrls([]);
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setModalVisible(true);
    form.setFieldsValue({
      ...branch,
      amenities: branch.amenities.join(', '),
    });
    
    // Set existing images
    setImageUrls(branch.images || []);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await adminApiCall(`/api/admin/branches/${id}`, {
        method: 'DELETE',
      });

      await handleApiResponse(response);
      message.success('Đã xóa chi nhánh thành công');
      fetchBranches();
    } catch (error) {
      message.error('Không thể xóa chi nhánh');
      console.error('Error deleting branch:', error);
    }
  };

  const handleSubmit = async (values: BranchFormData) => {
    try {
      const formData = {
        ...values,
        amenities: values.amenities.split(',').map(item => item.trim()).filter(Boolean),
                images: imageUrls,
      };

      const url = editingBranch 
        ? `/api/admin/branches/${editingBranch.id}`
        : '/api/admin/branches';
      
      const method = editingBranch ? 'PUT' : 'POST';

      const response = await adminApiCall(url, {
        method,
        body: JSON.stringify(formData),
      });

      await handleApiResponse(response);
      message.success(
        editingBranch 
          ? 'Đã cập nhật chi nhánh thành công'
          : 'Đã tạo chi nhánh thành công'
      );
      setModalVisible(false);
      fetchBranches();
    } catch (error) {
      message.error('Đã xảy ra lỗi khi lưu chi nhánh');
      console.error('Error saving branch:', error);
    }
  };

  const columns: ColumnsType<Branch> = [
    {
      title: 'Tên chi nhánh',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.location}</div>
        </div>
      ),
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      render: (_, record) => (
        <div>
          <div>{record.phone}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
        </div>
      ),
    },
    {
      title: 'Số phòng',
      dataIndex: '_count',
      key: 'rooms',
      render: (count) => count?.rooms || 0,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space direction={isMobile ? 'vertical' : 'horizontal'} size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
            style={{ width: isMobile ? '100%' : 'auto' }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa chi nhánh này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
              style={{ width: isMobile ? '100%' : 'auto' }}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderMobileBranchCard = (branch: Branch) => (
    <Card 
      key={branch.id} 
      style={{ 
        marginBottom: 16,
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        border: '1px solid #f0f0f0'
      }}
      bodyStyle={{ padding: 16 }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 12 }}>
        <Avatar 
          icon={<HomeOutlined />} 
          size={48}
          style={{ 
            marginRight: 12, 
            backgroundColor: branch.isActive ? '#52c41a' : '#ff4d4f',
            flexShrink: 0
          }} 
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ 
            fontWeight: 'bold', 
            fontSize: '16px', 
            marginBottom: 4,
            wordBreak: 'break-word'
          }}>
            {branch.name}
          </div>
          <div style={{ 
            color: '#666', 
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            marginBottom: 4
          }}>
            <EnvironmentOutlined style={{ marginRight: 4, flexShrink: 0 }} />
            <span style={{ wordBreak: 'break-word' }}>{branch.location}</span>
          </div>
          <Tag 
            color={branch.isActive ? 'green' : 'red'}
            style={{ margin: 0 }}
          >
            {branch.isActive ? 'Hoạt động' : 'Không hoạt động'}
          </Tag>
        </div>
      </div>

      <div style={{ marginBottom: 16, background: '#fafafa', padding: 12, borderRadius: 8 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 8 }}>
          <EnvironmentOutlined style={{ marginRight: 8, color: '#1890ff', marginTop: 2, flexShrink: 0 }} />
          <Text style={{ wordBreak: 'break-word', fontSize: '14px' }}>{branch.address}</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <PhoneOutlined style={{ marginRight: 8, color: '#52c41a', flexShrink: 0 }} />
          <Text style={{ fontSize: '14px' }}>{branch.phone}</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <MailOutlined style={{ marginRight: 8, color: '#faad14', flexShrink: 0 }} />
          <Text style={{ fontSize: '14px', wordBreak: 'break-all' }}>{branch.email}</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <HomeOutlined style={{ marginRight: 8, color: '#722ed1', flexShrink: 0 }} />
          <Text style={{ fontSize: '14px', fontWeight: 'bold' }}>{branch._count?.rooms || 0} phòng</Text>
        </div>
        
        {/* Display images if available */}
        {branch.images && branch.images.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <Text style={{ fontSize: '12px', color: '#666', marginBottom: 8, display: 'block' }}>
              Hình ảnh ({branch.images.length})
            </Text>
            <ImageGallery 
              images={branch.images}
              size="small"
              maxDisplay={3}
            />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <Button
          type="primary"
          size="middle"
          icon={<EditOutlined />}
          onClick={() => handleEdit(branch)}
          style={{ 
            flex: 1, 
            height: 44,
            fontSize: '14px',
            fontWeight: 'bold',
            borderRadius: 8
          }}
        >
          Sửa
        </Button>
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa chi nhánh này?"
          onConfirm={() => handleDelete(branch.id)}
          okText="Có"
          cancelText="Không"
          placement="topRight"
        >
          <Button
            danger
            size="middle"
            icon={<DeleteOutlined />}
            style={{ 
              flex: 1, 
              height: 44,
              fontSize: '14px',
              fontWeight: 'bold',
              borderRadius: 8
            }}
          >
            Xóa
          </Button>
        </Popconfirm>
      </div>
    </Card>
  );

  const stats = {
    total: branches.length,
    active: branches.filter(b => b.isActive).length,
    inactive: branches.filter(b => !b.isActive).length,
    totalRooms: branches.reduce((sum, b) => sum + (b._count?.rooms || 0), 0),
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? 16 : 24 }}>
        <Title level={isMobile ? 3 : 2}>Quản lý chi nhánh</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          size={isMobile ? 'small' : 'middle'}
        >
          Thêm chi nhánh
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: isMobile ? 16 : 24 }}>
        <Col xs={12} sm={12} lg={6}>
          <Card bodyStyle={{ padding: isMobile ? 12 : 24 }}>
            <Statistic
              title={<span style={{ fontSize: isMobile ? '12px' : '14px' }}>Tổng chi nhánh</span>}
              value={stats.total}
              prefix={<HomeOutlined />}
              valueStyle={{ fontSize: isMobile ? '20px' : '24px' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card bodyStyle={{ padding: isMobile ? 12 : 24 }}>
            <Statistic
              title={<span style={{ fontSize: isMobile ? '12px' : '14px' }}>Đang hoạt động</span>}
              value={stats.active}
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#52c41a', fontSize: isMobile ? '20px' : '24px' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card bodyStyle={{ padding: isMobile ? 12 : 24 }}>
            <Statistic
              title={<span style={{ fontSize: isMobile ? '12px' : '14px' }}>Không hoạt động</span>}
              value={stats.inactive}
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#ff4d4f', fontSize: isMobile ? '20px' : '24px' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card bodyStyle={{ padding: isMobile ? 12 : 24 }}>
            <Statistic
              title={<span style={{ fontSize: isMobile ? '12px' : '14px' }}>Tổng phòng</span>}
              value={stats.totalRooms}
              prefix={<HomeOutlined />}
              valueStyle={{ fontSize: isMobile ? '20px' : '24px' }}
            />
          </Card>
        </Col>
      </Row>

      <Card bodyStyle={{ padding: isMobile ? 0 : 24 }}>
        {isMobile ? (
          <div style={{ padding: isMobile ? 16 : 0 }}>
            {branches.map(renderMobileBranchCard)}
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={branches}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} của ${total} chi nhánh`,
            }}
            scroll={{ x: 800 }}
          />
        )}
      </Card>

      <Modal
        title={editingBranch ? 'Sửa chi nhánh' : 'Thêm chi nhánh mới'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={isMobile ? '95%' : 800}
        bodyStyle={{ maxHeight: '70vh', overflow: 'auto' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="name"
              label="Tên chi nhánh"
              rules={[{ required: true, message: 'Vui lòng nhập tên chi nhánh' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="location"
              label="Vị trí"
              rules={[{ required: true, message: 'Vui lòng nhập vị trí' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' }
              ]}
            >
              <Input />
            </Form.Item>
          </div>

          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
          >
            <TextArea rows={2} />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="amenities"
            label="Tiện ích (phân cách bằng dấu phẩy)"
          >
            <Input placeholder="WiFi, Tủ lạnh, Điều hòa, ..." />
          </Form.Item>

          <Form.Item
            name="googleMapUrl"
            label="Link Google Maps"
          >
            <Input placeholder="https://maps.google.com/..." />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Trạng thái"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>

          <Form.Item label="Hình ảnh">
            <S3ImageUpload
              value={imageUrls}
              onChange={setImageUrls}
              maxCount={10}
              folder="branches"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingBranch ? 'Cập nhật' : 'Tạo mới'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 