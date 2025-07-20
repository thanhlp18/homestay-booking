'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Switch, 
  Typography, 
  message,
  Space,
  Row,
  Col,
  InputNumber
} from 'antd';
import { 
  SaveOutlined, 
  SettingOutlined,
  UserOutlined,
  LockOutlined,
  BellOutlined,
  GlobalOutlined
} from '@ant-design/icons';

const { Title } = Typography;
const { TextArea } = Input;

interface SettingsFormData {
  // General Settings
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  
  // Booking Settings
  maxGuestsPerBooking: number;
  advanceBookingDays: number;
  requireIdCard: boolean;
  requireEmail: boolean;
  
  // Payment Settings
  enableCashPayment: boolean;
  enableTransferPayment: boolean;
  enableCardPayment: boolean;
  autoApproveAfterPayment: boolean;
  
  // Notification Settings
  emailNotifications: boolean;
  smsNotifications: boolean;
  adminEmailNotifications: boolean;
  
  // Discount Settings
  enableDiscounts: boolean;
  maxDiscountPercentage: number;
  guestSurchargeAmount: number;
  guestSurchargeThreshold: number;
}

export default function SettingsPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
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

  const handleSubmit = async (values: SettingsFormData) => {
    try {
      setLoading(true);
      
      // Here you would typically save to your backend
      console.log('Saving settings:', values);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('Đã lưu cài đặt thành công');
    } catch {
      message.error('Đã xảy ra lỗi khi lưu cài đặt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={isMobile ? 3 : 2}>
        <SettingOutlined style={{ marginRight: 8 }} />
        Cài đặt hệ thống
      </Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          siteName: 'TidyToto Homestay',
          siteDescription: 'Hệ thống đặt phòng homestay hiện đại',
          contactEmail: 'info@tidytoto.com',
          contactPhone: '0123456789',
          address: 'Hà Nội, Việt Nam',
          maxGuestsPerBooking: 10,
          advanceBookingDays: 30,
          requireIdCard: true,
          requireEmail: false,
          enableCashPayment: true,
          enableTransferPayment: true,
          enableCardPayment: true,
          autoApproveAfterPayment: false,
          emailNotifications: true,
          smsNotifications: false,
          adminEmailNotifications: true,
          enableDiscounts: true,
          maxDiscountPercentage: 20,
          guestSurchargeAmount: 50000,
          guestSurchargeThreshold: 2,
        }}
      >
        {/* General Settings */}
        <Card 
          title={
            <span>
              <GlobalOutlined style={{ marginRight: 8 }} />
              Cài đặt chung
            </span>
          }
          style={{ marginBottom: 16 }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="siteName"
                label="Tên website"
                rules={[{ required: true, message: 'Vui lòng nhập tên website' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="contactEmail"
                label="Email liên hệ"
                rules={[
                  { required: true, message: 'Vui lòng nhập email liên hệ' },
                  { type: 'email', message: 'Email không hợp lệ' }
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="contactPhone"
                label="Số điện thoại liên hệ"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="address"
                label="Địa chỉ"
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="siteDescription"
            label="Mô tả website"
          >
            <TextArea rows={3} />
          </Form.Item>
        </Card>

        {/* Booking Settings */}
        <Card 
          title={
            <span>
              <UserOutlined style={{ marginRight: 8 }} />
              Cài đặt đặt phòng
            </span>
          }
          style={{ marginBottom: 16 }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="maxGuestsPerBooking"
                label="Số khách tối đa mỗi đặt phòng"
                rules={[{ required: true, message: 'Vui lòng nhập số khách tối đa' }]}
              >
                <InputNumber min={1} max={50} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="advanceBookingDays"
                label="Số ngày đặt trước tối đa"
                rules={[{ required: true, message: 'Vui lòng nhập số ngày đặt trước' }]}
              >
                <InputNumber min={1} max={365} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="requireIdCard"
                label="Yêu cầu CCCD"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="requireEmail"
                label="Yêu cầu email"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Payment Settings */}
        <Card 
          title={
            <span>
              <LockOutlined style={{ marginRight: 8 }} />
              Cài đặt thanh toán
            </span>
          }
          style={{ marginBottom: 16 }}
        >
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="enableCashPayment"
                label="Cho phép thanh toán tiền mặt"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="enableTransferPayment"
                label="Cho phép chuyển khoản"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="enableCardPayment"
                label="Cho phép thanh toán thẻ"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="autoApproveAfterPayment"
            label="Tự động phê duyệt sau khi thanh toán"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Card>

        {/* Notification Settings */}
        <Card 
          title={
            <span>
              <BellOutlined style={{ marginRight: 8 }} />
              Cài đặt thông báo
            </span>
          }
          style={{ marginBottom: 16 }}
        >
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="emailNotifications"
                label="Thông báo qua email"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="smsNotifications"
                label="Thông báo qua SMS"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="adminEmailNotifications"
                label="Thông báo cho admin"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Discount Settings */}
        <Card 
          title={
            <span>
              <SettingOutlined style={{ marginRight: 8 }} />
              Cài đặt khuyến mãi
            </span>
          }
          style={{ marginBottom: 16 }}
        >
          <Form.Item
            name="enableDiscounts"
            label="Bật tính năng khuyến mãi"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="maxDiscountPercentage"
                label="Phần trăm giảm giá tối đa (%)"
                rules={[{ required: true, message: 'Vui lòng nhập phần trăm giảm giá' }]}
              >
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="guestSurchargeAmount"
                label="Phụ phí mỗi khách (VNĐ)"
                rules={[{ required: true, message: 'Vui lòng nhập phụ phí khách' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="guestSurchargeThreshold"
            label="Số khách bắt đầu tính phụ phí"
            rules={[{ required: true, message: 'Vui lòng nhập ngưỡng tính phụ phí' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Card>

        {/* Submit Button */}
        <Card>
          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<SaveOutlined />}
                size="large"
              >
                Lưu cài đặt
              </Button>
              <Button 
                onClick={() => form.resetFields()}
                size="large"
              >
                Đặt lại
              </Button>
            </Space>
          </Form.Item>
        </Card>
      </Form>
    </div>
  );
} 