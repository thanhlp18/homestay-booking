// src/app/hooks/useToast.ts (keep this file)
"use client";

import { App } from "antd";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

export function useToast() {
  const { notification } = App.useApp();

  const success = (message: string, description?: string) => {
    notification.success({
      message,
      description,
      placement: "topRight",
      duration: 3,
      icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      style: {
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      },
    });
  };

  const error = (message: string, description?: string) => {
    notification.error({
      message,
      description,
      placement: "topRight",
      duration: 4,
      icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
      style: {
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      },
    });
  };

  const warning = (message: string, description?: string) => {
    notification.warning({
      message,
      description,
      placement: "topRight",
      duration: 3,
      icon: <ExclamationCircleOutlined style={{ color: "#faad14" }} />,
      style: {
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      },
    });
  };

  const info = (message: string, description?: string) => {
    notification.info({
      message,
      description,
      placement: "topRight",
      duration: 3,
      icon: <InfoCircleOutlined style={{ color: "#1890ff" }} />,
      style: {
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      },
    });
  };

  return { success, error, warning, info };
}
