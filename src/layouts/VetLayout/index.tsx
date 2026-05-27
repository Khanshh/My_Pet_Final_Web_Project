import {
  CalendarOutlined,
  LogoutOutlined,
  MessageOutlined,
  QuestionCircleOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { Avatar, Input, Badge, Dropdown, Menu } from 'antd';
import { PawPrint } from 'lucide-react';
import React, { useState } from 'react';
import { history, useModel } from 'umi';
import styles from './index.module.less';

const menuItems = [
  { key: '/bac-si/dashboard', label: 'Dashboard', icon: <DashboardOutlined /> },
  { key: '/bac-si/lich-hen',  label: 'Lịch hẹn',  icon: <CalendarOutlined /> },
  { key: '/bac-si/tu-van',    label: 'Tư vấn',    icon: <MessageOutlined /> },
];

interface VetLayoutProps {
  children: React.ReactNode;
  location?: { pathname: string };
}

const VetLayout: React.FC<VetLayoutProps> = ({ children, location }) => {
  const { initialState } = useModel('@@initialState');
  const currentPath = location?.pathname ?? window.location.pathname;
  const [collapsed, setCollapsed] = useState(false);
  const doctorName = initialState?.currentUser?.name || 'BS. Nguyễn Văn A';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    history.replace('/user/login');
  };

  // Antd v4: dùng overlay + <Menu>
  const userMenu = (
    <Menu>
      <Menu.Item key="logout" icon={<LogoutOutlined />} danger onClick={handleLogout}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
        {/* Brand */}
        <div className={styles.brand} onClick={() => setCollapsed(!collapsed)}>
          <div className={styles.brandIcon}>
            <PawPrint size={collapsed ? 22 : 28} strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div className={styles.brandText}>
              <span className={styles.brandName}>PetCare Pro</span>
              <span className={styles.brandRole}>Veterinary Specialist</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className={styles.nav}>
          {menuItems.map((item) => {
            const active = currentPath === item.key;
            return (
              <a
                key={item.key}
                className={`${styles.navItem} ${active ? styles.navActive : ''}`}
                href={item.key}
                onClick={(e) => { e.preventDefault(); history.push(item.key); }}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
              </a>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={styles.sidebarFooter}>
          <a className={styles.footerItem} href="#support">
            <QuestionCircleOutlined />
            {!collapsed && <span>Support</span>}
          </a>
          <div className={styles.footerItem} onClick={handleLogout} style={{ cursor: 'pointer' }}>
            <LogoutOutlined />
            {!collapsed && <span>Logout</span>}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className={styles.main}>
        {/* Top Header */}
        <header className={styles.header}>
          <div className={styles.headerSearch}>
            <Input
              prefix={<span style={{ color: '#B5A898' }}>🔍</span>}
              placeholder="Tìm kiếm bệnh nhân, lịch hẹn..."
              className={styles.searchInput}
              bordered={false}
            />
          </div>
          <div className={styles.headerRight}>
            <Badge count={2} size="small">
              <button className={styles.iconBtn}>🔔</button>
            </Badge>
            <button className={styles.iconBtn}>💬</button>
            <Dropdown overlay={userMenu} placement="bottomRight" trigger={['click']}>
              <div className={styles.userChip}>
                <Avatar
                  size={32}
                  src="https://api.dicebear.com/7.x/adventurer/svg?seed=doctor"
                  className={styles.userAvatar}
                />
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{doctorName}</span>
                  <span className={styles.userRole}>Bác sĩ thú y</span>
                </div>
              </div>
            </Dropdown>
          </div>
        </header>

        {/* Page Content */}
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
};

export default VetLayout;
