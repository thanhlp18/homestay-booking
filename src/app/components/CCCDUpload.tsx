// src/app/components/CCCDImageUpload.tsx
"use client";

import PublicImageUpload from "./PublicImageUpload";

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
  // Convert single string to array for PublicImageUpload
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
      <PublicImageUpload
        value={value ? [value] : []}
        onChange={handleChange}
        maxCount={1}
        folder="cccd"
        disabled={disabled}
      />
      <p style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
        Chấp nhận: JPG, PNG, JPEG. Tối đa 10MB
      </p>
    </div>
  );
}
