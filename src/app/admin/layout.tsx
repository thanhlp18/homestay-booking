'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Layout, Menu, Button, Avatar, Dropdown, theme, Drawer, Badge } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  BookOutlined,
  HomeOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
  BellOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import AdminAuthProvider, { useAdminAuth } from './components/AdminAuthProvider';

const { Header, Sider, Content } = Layout;

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

function AdminLayoutContent({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAdminAuth();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    fetchAdminUser();
    checkMobile();
    
    const handleResize = () => {
      checkMobile();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const checkMobile = () => {
    const isMobileDevice = window.innerWidth <= 768;
    setIsMobile(isMobileDevice);
    if (isMobileDevice) {
      setCollapsed(true);
      setMobileDrawerVisible(false); // Close drawer on resize
    }
  };

  const fetchAdminUser = async () => {
    try {
      const response = await fetch('/api/admin/auth/verify', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setAdminUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching admin user:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleMenuClick = (path: string) => {
    router.push(path);
    if (isMobile) {
      setMobileDrawerVisible(false);
    }
  };

  const getSelectedKey = () => {
    if (pathname === '/admin') return 'dashboard';
    if (pathname.startsWith('/admin/bookings')) return 'bookings';
    if (pathname.startsWith('/admin/branches')) return 'branches';
    if (pathname.startsWith('/admin/rooms')) return 'rooms';
    if (pathname.startsWith('/admin/settings')) return 'settings';
    return 'dashboard';
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => handleMenuClick('/admin'),
    },
    {
      key: 'bookings',
      icon: <BookOutlined />,
      label: 'Quản lý đặt phòng',
      onClick: () => handleMenuClick('/admin/bookings'),
    },
    {
      key: 'branches',
      icon: <HomeOutlined />,
      label: 'Quản lý chi nhánh',
      onClick: () => handleMenuClick('/admin/branches'),
    },
    {
      key: 'rooms',
      icon: <HomeOutlined />,
      label: 'Quản lý phòng',
      onClick: () => handleMenuClick('/admin/rooms'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
      onClick: () => handleMenuClick('/admin/settings'),
    },
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Hồ sơ',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ];

  const renderSidebar = () => (
    <>
      <div style={{ 
        height: isMobile ? 48 : 32, 
        margin: isMobile ? 8 : 16, 
        background: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: isMobile ? '14px' : '16px'
      }}>
        {collapsed && !isMobile ? 'TT' : 'O Ni Homestay Admin'}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        items={menuItems}
        style={{ 
          borderRight: 0,
          fontSize: isMobile ? '14px' : '16px'
        }}
      />
    </>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed}
          width={256}
          collapsedWidth={80}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 1000,
          }}
        >
          {renderSidebar()}
        </Sider>
      )}

      {/* Mobile Drawer */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ 
              width: 24, 
              height: 24, 
              background: 'white', 
              borderRadius: 4, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#001529'
            }}>
              TT
            </div>
            O Ni Homestay Admin
          </div>
        }
        placement="left"
        onClose={() => setMobileDrawerVisible(false)}
        open={mobileDrawerVisible}
        width={280}
        bodyStyle={{ padding: 0, background: '#001529' }}
        headerStyle={{ 
          background: '#001529', 
          color: 'white',
          borderBottom: '1px solid #303030',
          height: 56
        }}
        maskClosable={true}
        keyboard={true}
      >
        {renderSidebar()}
      </Drawer>

      <Layout style={{ marginLeft: isMobile ? 0 : (collapsed ? 80 : 256) }}>
        <Header style={{ 
          padding: isMobile ? '0 8px' : '0 24px', 
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 999,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          height: isMobile ? 56 : 64,
          borderBottom: '1px solid #f0f0f0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {isMobile ? (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setMobileDrawerVisible(true)}
                style={{
                  fontSize: '18px',
                  width: 40,
                  height: 40,
                  marginRight: 12,
                }}
              />
            ) : (
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: '16px',
                  width: 64,
                  height: 64,
                }}
              />
            )}
            
            {isMobile && (
              <div style={{ 
                fontSize: '18px', 
                fontWeight: 'bold',
                color: '#1890ff'
              }}>
                O Ni Homestay Admin
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isMobile && (
              <Badge count={0} size="small">
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  style={{ width: 40, height: 40 }}
                />
              </Badge>
            )}
            
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                padding: isMobile ? '6px 8px' : '8px 12px',
                borderRadius: 6,
                transition: 'background-color 0.3s',
                minWidth: isMobile ? 'auto' : 120,
              }}>
                <Avatar 
                  icon={<UserOutlined />} 
                  size={isMobile ? 32 : 32}
                  style={{ marginRight: isMobile ? 0 : 8 }} 
                />
                {!isMobile && (
                  <span style={{ fontSize: '14px' }}>
                    {adminUser?.name || 'Admin'}
                  </span>
                )}
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content
          style={{
            margin: isMobile ? '8px' : '24px 16px',
            padding: isMobile ? 16 : 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: 'auto',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminAuthProvider>
      <AdminLayoutContent>
        {children}
      </AdminLayoutContent>
    </AdminAuthProvider>
  );
} 