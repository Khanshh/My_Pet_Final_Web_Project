import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { Avatar, Badge, Button, Col, Pagination, Row, Space, Tag, Tooltip, Typography } from 'antd';
import React, { useState } from 'react';
import styles from './index.module.less';

const { Title, Text } = Typography;

type AppointmentStatus = 'hoan-thanh' | 'xac-nhan' | 'tu-choi' | 'cap-cuu' | 'cho';

interface Appointment {
  id: number;
  date: string;
  time: string;
  petName: string;
  petType: string;
  petAge: string;
  ownerName: string;
  ownerPhone: string;
  reason: string;
  note: string;
  status: AppointmentStatus;
  petIcon: string;
}

const mockAppointments: Appointment[] = [
  {
    id: 1, date: '2026-05-15', time: '09:00',
    petName: 'Bobby', petType: 'Chó', petAge: '3 tuổi',
    ownerName: 'Nguyễn Minh D', ownerPhone: '0987654321',
    reason: 'Khám định kỳ',
    note: 'Kiểm tra sức khỏe tổng quát định kỳ...',
    status: 'hoan-thanh', petIcon: '🐶',
  },
  {
    id: 2, date: '2026-05-15', time: '14:00',
    petName: 'Mimi', petType: 'Mèo', petAge: '2 tuổi',
    ownerName: 'Nguyễn Minh D', ownerPhone: '0987654321',
    reason: 'Tiêm phòng',
    note: 'Tiêm vaccine 5 trong 1 và nhắc lại hà...',
    status: 'hoan-thanh', petIcon: '🐱',
  },
  {
    id: 3, date: '2026-05-15', time: '10:30',
    petName: 'Lu', petType: 'Chó', petAge: '1 tuổi',
    ownerName: 'Trần Thị B', ownerPhone: '0912345678',
    reason: 'Cấp cứu',
    note: 'Nuốt phải dị vật, khó thở nhẹ',
    status: 'xac-nhan', petIcon: '🐕',
  },
];

const statusConfig: Record<AppointmentStatus, { label: string; color: string }> = {
  'hoan-thanh': { label: 'Hoàn thành', color: '#52C41A' },
  'xac-nhan':   { label: 'Xác nhận',  color: '#1890FF' },
  'tu-choi':    { label: 'Từ chối',   color: '#FF4D4F' },
  'cap-cuu':    { label: 'Cấp cứu',   color: '#FF4D4F' },
  'cho':        { label: 'Chờ',       color: '#FA8C16' },
};

const LichHen: React.FC = () => {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const total = 12;

  const stats = [
    { label: 'TỔNG LỊCH', value: 48, icon: '📅', color: '#8B7355' },
    { label: 'LỊCH KHÁM HÔM NAY', value: '04', icon: '🩺', color: '#FF4D4F', highlight: true },
    { label: 'ĐANG CHỜ', value: 12, icon: '⏰', color: '#FA8C16' },
    { label: 'ĐÃ KHÁM', value: 32, icon: '✅', color: '#52C41A' },
  ];

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <Title level={3} className={styles.title}>Quản lý lịch hẹn</Title>
          <Text className={styles.subtitle}>Chào mừng trở lại! Bạn có {total} lịch hẹn cho hôm nay.</Text>
        </div>
        <Space>
          <Button icon={<FilterOutlined />} className={styles.btnFilter}>Lọc kết quả</Button>
          <Button icon={<DownloadOutlined />} type="primary" className={styles.btnExport}>Xuất báo cáo</Button>
        </Space>
      </div>

      {/* Stats */}
      <Row gutter={[12, 12]} className={styles.statsRow}>
        {stats.map((s) => (
          <Col xs={12} sm={6} key={s.label}>
            <div className={`${styles.statBox} ${s.highlight ? styles.statHighlight : ''}`}>
              <div className={styles.statLabel}>{s.label}</div>
              <div className={styles.statValue} style={{ color: s.color }}>{s.value}</div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Table */}
      <div className={styles.tableWrapper}>
        {/* Header row */}
        <div className={styles.tableHead}>
          <div className={styles.colDate}>NGÀY</div>
          <div className={styles.colTime}>GIỜ</div>
          <div className={styles.colPet}>THÚ CƯNG & CHỦ NUÔI</div>
          <div className={styles.colReason}>LÝ DO</div>
          <div className={styles.colNote}>GHI CHÚ</div>
          <div className={styles.colAction}>HÀNH ĐỘNG</div>
        </div>

        {/* Data rows */}
        {mockAppointments.map((apt) => (
          <div key={apt.id} className={`${styles.tableRow} ${apt.reason === 'Cấp cứu' ? styles.rowUrgent : ''}`}>
            <div className={styles.colDate}>
              <span className={styles.dateChip}>{apt.date}</span>
            </div>
            <div className={styles.colTime}>
              <span className={styles.timeText}>{apt.time}</span>
            </div>
            <div className={styles.colPet}>
              <div className={styles.petCell}>
                <Avatar size={32} className={styles.petAvatar}>{apt.petIcon}</Avatar>
                <div>
                  <div className={styles.petName}>{apt.petName}</div>
                  <div className={styles.petMeta}>{apt.petType} • {apt.petAge}</div>
                  <div className={styles.ownerName}>{apt.ownerName}</div>
                  <div className={styles.ownerPhone}>{apt.ownerPhone}</div>
                </div>
              </div>
            </div>
            <div className={styles.colReason}>
              <Tag
                color={apt.reason === 'Cấp cứu' ? 'red' : apt.reason === 'Tiêm phòng' ? 'blue' : 'default'}
                className={styles.reasonTag}
              >
                {apt.reason}
              </Tag>
            </div>
            <div className={styles.colNote}>
              <Tooltip title={apt.note}>
                <span className={styles.noteText}>{apt.note}</span>
              </Tooltip>
            </div>
            <div className={styles.colAction}>
              {apt.status === 'hoan-thanh' ? (
                <Button size="small" type="primary" icon={<CheckCircleOutlined />} className={styles.btnDone}>
                  Hoàn thành
                </Button>
              ) : (
                <Space size={4}>
                  <Button size="small" type="primary" className={styles.btnConfirm}>Xác nhận</Button>
                  <Button size="small" danger icon={<CloseCircleOutlined />} className={styles.btnReject}>Từ chối</Button>
                </Space>
              )}
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className={styles.tableFooter}>
          <Text className={styles.showingText}>Hiển thị 1 - 3 của {total} lịch hẹn</Text>
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            onChange={setPage}
            size="small"
            className={styles.pagination}
          />
        </div>
      </div>
    </div>
  );
};

export default LichHen;
