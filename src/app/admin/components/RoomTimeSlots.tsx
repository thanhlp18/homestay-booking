"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Space,
  Popconfirm,
  Tag,
  message,
  Empty,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { adminApiCall, handleApiResponse } from "@/lib/adminApi";

interface TimeSlot {
  id: string;
  time: string;
  price: number;
  duration: number | null;
  isOvernight: boolean;
  weekendSurcharge: number;
  isActive: boolean;
  roomId: string;
}

interface Props {
  roomId?: string;
}

export default function RoomTimeSlots({ roomId }: Props) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [form] = Form.useForm();

  const fetchSlots = async () => {
    if (!roomId) return;
    try {
      setLoading(true);
      const res = await adminApiCall(`/api/admin/timeslots?roomId=${roomId}`);
      const data = await handleApiResponse(res);
      setSlots(data.data || []);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải khung giờ phòng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [roomId]);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const url = editingSlot
        ? `/api/admin/timeslots/${editingSlot.id}`
        : `/api/admin/timeslots`;
      const method = editingSlot ? "PUT" : "POST";

      const body = { ...values, roomId };
      const res = await adminApiCall(url, {
        method,
        body: JSON.stringify(body),
      });
      await handleApiResponse(res);

      message.success(
        editingSlot ? "Đã cập nhật khung giờ" : "Đã thêm khung giờ"
      );
      setModalVisible(false);
      fetchSlots();
    } catch (err) {
      message.error("Lỗi khi lưu khung giờ");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await adminApiCall(`/api/admin/timeslots/${id}`, {
        method: "DELETE",
      });
      await handleApiResponse(res);
      message.success("Đã xóa khung giờ");
      fetchSlots();
    } catch {
      message.error("Lỗi khi xóa khung giờ");
    }
  };

  const columns = [
    {
      title: "Khung giờ",
      dataIndex: "time",
      key: "time",
      render: (text: string, record: TimeSlot) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>{text}</div>
          {record.isOvernight ? (
            <Tag color="#83311b" style={{ color: "#fff" }}>🌙 Qua đêm</Tag>
          ) : record.duration ? (
            <Tag color="#605f3a" style={{ color: "#fff" }}>⏰ {record.duration} giờ</Tag>
          ) : null}
        </div>
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (p: number, record: TimeSlot) => (
        <div>
          <div style={{ fontWeight: 'bold', color: '#605f3a' }}>
            {p.toLocaleString("vi-VN")} ₫
          </div>
          {record.weekendSurcharge > 0 && (
            <div style={{ fontSize: 12, color: '#bd8049', marginTop: 4 }}>
              Cuối tuần: +{record.weekendSurcharge.toLocaleString("vi-VN")} ₫
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (active: boolean) => (
        <Tag color={active ? "#605f3a" : "#83311b"} style={{ color: "#fff" }}>
          {active ? "Hoạt động" : "Tạm ngưng"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: any, record: TimeSlot) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingSlot(record);
              form.setFieldsValue({
                ...record,
                weekendSurcharge: record.weekendSurcharge || 0,
              });
              setModalVisible(true);
            }}
          />
          <Popconfirm
            title="Xóa khung giờ này?"
            description="Hành động này không thể hoàn tác"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ marginTop: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 12,
          width: "100%",
        }}
      >
        <Space size="middle">
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchSlots}
            loading={loading}
            size="small"
          >
            Tải lại
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="small"
            onClick={() => {
              setEditingSlot(null);
              form.resetFields();
              setModalVisible(true);
            }}
            disabled={!roomId}
          >
            Thêm khung giờ
          </Button>
        </Space>
      </div>

      <Table
        size="small"
        columns={columns}
        dataSource={slots}
        rowKey="id"
        loading={loading}
        locale={{ emptyText: <Empty description="Chưa có khung giờ" /> }}
        pagination={false}
        bordered
      />

      <Modal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        title={editingSlot ? "Sửa khung giờ" : "Thêm khung giờ"}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ isActive: true, isOvernight: false, weekendSurcharge: 0 }}
        >
          <Form.Item
            name="time"
            label="Tên khung giờ"
            rules={[
              { required: true, message: "Vui lòng nhập tên khung giờ" },
              { min: 2, message: "Tên khung giờ phải có ít nhất 2 ký tự" },
            ]}
            extra="Tên này sẽ hiển thị cho khách hàng khi đặt phòng"
          >
            <Input placeholder="VD: 2 giờ, Qua đêm (14h–12h)" />
          </Form.Item>

          <div style={{ 
            background: '#ffefd9', 
            padding: 12, 
            borderRadius: 8,
            marginBottom: 16,
            border: '1px solid #fbe0a2'
          }}>
            <Form.Item
              name="isOvernight"
              label={<strong style={{ color: '#83311b' }}>Loại gói</strong>}
              valuePropName="checked"
              style={{ marginBottom: 8 }}
            >
              <Switch 
                checkedChildren={<span>🌙 Qua đêm</span>}
                unCheckedChildren={<span>⏰ Theo giờ</span>}
                onChange={(checked) => {
                  if (checked) {
                    form.setFieldsValue({ duration: null });
                  } else {
                    form.setFieldsValue({ duration: 2 });
                  }
                }}
              />
            </Form.Item>

            <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => 
              prevValues.isOvernight !== currentValues.isOvernight
            }>
              {({ getFieldValue }) => {
                const isOvernight = getFieldValue('isOvernight');
                return !isOvernight ? (
                  <Form.Item
                    name="duration"
                    label="Thời lượng"
                    rules={[
                      { required: true, message: "Vui lòng nhập thời lượng" },
                      { type: "number", min: 1, max: 12, message: "Thời lượng từ 1-12 giờ" },
                    ]}
                  >
                    <InputNumber
                      min={1}
                      max={12}
                      style={{ width: "100%" }}
                      placeholder="Nhập số giờ"
                      addonAfter="giờ"
                    />
                  </Form.Item>
                ) : (
                  <div style={{ 
                    padding: 8, 
                    background: '#fff', 
                    borderRadius: 4,
                    fontSize: 13,
                    color: '#605f3a',
                    border: '1px solid #fbe0a2'
                  }}>
                    ℹ️ Gói qua đêm không giới hạn thời gian
                  </div>
                );
              }}
            </Form.Item>
          </div>

          <Form.Item
            name="price"
            label={<strong>Giá cơ bản</strong>}
            rules={[
              { required: true, message: "Vui lòng nhập giá" },
              {
                type: "number",
                min: 1000,
                message: "Giá phải lớn hơn 1,000 VNĐ",
              },
            ]}
            extra="Giá áp dụng cho ngày thường (T2-T6)"
          >
            <InputNumber
              min={1000}
              step={10000}
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => Number(value!.replace(/,/g, "")) as any}
              placeholder="VD: 200,000"
              addonAfter="VNĐ"
            />
          </Form.Item>

          <Form.Item
            name="weekendSurcharge"
            label="Phụ phí cuối tuần"
            rules={[
              { required: true, message: "Vui lòng nhập phụ phí cuối tuần" },
              { type: "number", min: 0, message: "Phụ phí phải lớn hơn hoặc bằng 0" },
            ]}
            extra="Nhập 0 nếu giá cuối tuần giống ngày thường"
          >
            <InputNumber
              min={0}
              step={10000}
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => Number(value!.replace(/,/g, "")) as any}
              placeholder="VD: 50,000 hoặc 0"
              addonAfter="VNĐ"
            />
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => 
            prevValues.price !== currentValues.price || 
            prevValues.weekendSurcharge !== currentValues.weekendSurcharge
          }>
            {({ getFieldValue }) => {
              const price = getFieldValue('price') || 0;
              const surcharge = getFieldValue('weekendSurcharge') || 0;
              const weekendPrice = price + surcharge;
              
              return surcharge > 0 ? (
                <div style={{ 
                  padding: 10, 
                  background: '#ffefd9', 
                  borderRadius: 6,
                  marginBottom: 12,
                  border: '1px solid #fbe0a2',
                  fontSize: 13,
                  color: '#83311b'
                }}>
                  📅 <strong>Giá cuối tuần:</strong> {weekendPrice.toLocaleString("vi-VN")} ₫
                </div>
              ) : null;
            }}
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Trạng thái"
            valuePropName="checked"
            tooltip="Bật/tắt để cho phép khách hàng đặt khung giờ này"
          >
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
          </Form.Item>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              marginTop: 12,
            }}
          >
            <Button
              onClick={() => setModalVisible(false)}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              disabled={submitting}
            >
              {editingSlot ? "Cập nhật" : "Thêm mới"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
