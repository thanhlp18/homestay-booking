// src/app/components/CCCDImageUpload.tsx
"use client";

import S3ImageUpload from "../admin/components/S3ImageUpload";

interface CCCDImageUploadProps {
  label: string;
  value?: string;
  onChange?: (url: string | undefined) => void;
  disabled?: boolean;
}

export default function CCCDImageUpload({
  label,
  value,
  onChange,
  disabled = false,
}: CCCDImageUploadProps) {
  // Convert single string to array for S3ImageUpload
  const handleChange = (urls: string[]) => {
    onChange?.(urls[0]); // Take first URL or undefined
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          display: "block",
          marginBottom: 8,
          fontWeight: 600,
          color: "#333",
        }}
      >
        {label}
      </label>
      <S3ImageUpload
        value={value ? [value] : []}
        onChange={handleChange}
        maxCount={1}
        folder="cccd"
        disabled={disabled}
      />
      <p style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
        Chấp nhận: JPG, PNG, JPEG. Tối đa 20MB
      </p>
    </div>
  );
}
