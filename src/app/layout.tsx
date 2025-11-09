// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { App, ConfigProvider } from "antd";

export const metadata: Metadata = {
  title: "Homestay check in tự động - Hẹn hò riêng tư không lễ tân",
  description: "Homestay check in tự động - Hẹn hò riêng tư không lễ tân",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <ConfigProvider
          theme={{
            token: {
              fontFamily: 'Bahnschrift, "Segoe UI", Roboto, sans-serif',
            },
          }}
        >
          <App>{children}</App>
        </ConfigProvider>
      </body>
    </html>
  );
}
