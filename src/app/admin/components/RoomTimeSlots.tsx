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
  name: string;
  price: number;
  isWeekend: boolean;
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
      title: "Tên khung giờ",
      dataIndex: "time",
      key: "time",
    },
    {
      title: "Giá (VNĐ)",
      dataIndex: "price",
      key: "price",
      render: (p: number) => p.toLocaleString("vi-VN") + " ₫",
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (active: boolean) => (
        <Tag color={active ? "green" : "red"}>
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
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          />
          <Popconfirm
            title="Xóa khung giờ này?"
            onConfirm={() => handleDelete(record.id)}
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
          initialValues={{ isActive: true, isWeekend: false }}
        >
          <Form.Item
            name="time"
            label="Tên khung giờ"
            rules={[{ required: true, message: "Vui lòng nhập tên khung giờ" }]}
          >
            <Input placeholder="VD: 2h / Qua đêm (14h–12h)" />
          </Form.Item>

          <Form.Item
            name="price"
            label="Giá (VNĐ)"
            rules={[{ required: true, message: "Nhập giá" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
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
