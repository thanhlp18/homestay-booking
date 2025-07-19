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
  Upload, 
  message, 
  Popconfirm,
  Tag,
  Typography
} from 'antd';
import { adminApiCall, handleApiResponse } from '@/lib/adminApi';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UploadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';

const { Title } = Typography;
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
  const [fileList, setFileList] = useState<UploadFile[]>([]);

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

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleCreate = () => {
    setEditingBranch(null);
    setModalVisible(true);
    form.resetFields();
    setFileList([]);
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setModalVisible(true);
    form.setFieldsValue({
      ...branch,
      amenities: branch.amenities.join(', '),
    });
    
    // Set file list for existing images
    const files: UploadFile[] = branch.images.map((url, index) => ({
      uid: `-${index}`,
      name: `image-${index}`,
      status: 'done',
      url,
    }));
    setFileList(files);
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
        images: fileList.map(file => file.url || file.response?.url).filter(Boolean),
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
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
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
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>Quản lý chi nhánh</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          Thêm chi nhánh
        </Button>
      </div>

      <Card>
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
        />
      </Card>

      <Modal
        title={editingBranch ? 'Sửa chi nhánh' : 'Thêm chi nhánh mới'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
            >
              {fileList.length >= 8 ? null : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Tải lên</div>
                </div>
              )}
            </Upload>
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