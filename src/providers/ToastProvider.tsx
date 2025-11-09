// src/app/providers/ToastProvider.tsx
"use client";

import { notification } from "antd";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { ReactNode } from "react";

export interface ToastContextType {
  success: (message: string, description?: string) => void;
  error: (message: string, description?: string) => void;
  warning: (message: string, description?: string) => void;
  info: (message: string, description?: string) => void;
}

notification.config({
  placement: "topRight",
  top: 24,
  duration: 3,
  maxCount: 3,
});

export function useToast(): ToastContextType {
  const success = (message: string, description?: string) => {
    notification.success({
      message,
      description,
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
      icon: <InfoCircleOutlined style={{ color: "#1890ff" }} />,
      style: {
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      },
    });
  };

  return { success, error, warning, info };
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
