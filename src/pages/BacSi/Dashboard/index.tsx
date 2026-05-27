import { CalendarOutlined, CheckCircleOutlined, InfoCircleOutlined, MessageOutlined, StarOutlined } from '@ant-design/icons';
import { Avatar, Badge, Card, Col, Row, Tag, Typography } from 'antd';
import React from 'react';
import { useModel } from 'umi';
import styles from './index.module.less';

const { Text, Title } = Typography;

const today = new Date();
const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
const todayStr = `Hôm nay là ${dayNames[today.getDay()]}, ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;

const upcomingAppointments = [
  {
    id: 1,
    ownerName: 'Nguyễn Minh D',
    petName: 'Mochi',
    petBreed: 'Golden Retriever',
    reason: 'Khám định kỳ',
    date: '2026-05-15',
    time: '09:00',
    status: 'da-xac-nhan',
  },
  {
    id: 2,
    ownerName: 'Trần Văn K',
    petName: 'Lu',
    petBreed: 'Poodle',
    reason: 'Tiêm phòng đại cho Lu',
    date: '2026-05-15',
    time: '10:30',
    status: 'cho-kham',
  },
];

const systemNotifications = [
  {
    id: 1,
    type: 'success',
    title: 'Cập nhật hệ thống thành công',
    desc: 'Phiên bản 2.4.0 đã được triển khai với các cải thiện về hiệu suất đáng chú ý.',
    time: '10 phút trước',
    icon: <CheckCircleOutlined />,
  },
  {
    id: 2,
    type: 'info',
    title: 'Nhắc nhở lịch họp',
    desc: 'Họp giao ban cuối tuần sẽ diễn ra vào lúc 16:30 chiều nay tại phòng họp B.',
    time: '2 giờ trước',
    icon: <InfoCircleOutlined />,
  },
];

const statusMap: Record<string, { label: string; color: string }> = {
  'da-xac-nhan': { label: 'Đã xác nhận', color: 'green' },
  'cho-kham': { label: 'Chờ khám', color: 'orange' },
  'cap-cuu': { label: 'Cấp cứu', color: 'red' },
};

const VetDashboard: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const doctorName = initialState?.currentUser?.name || 'Bác sĩ';

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <Title level={3} className={styles.greeting}>Xin chào, Bác sĩ!</Title>
          <Text className={styles.dateText}>{todayStr}</Text>
        </div>
        <Badge status="success" text="Hệ thống hoạt động tốt" className={styles.statusBadge} />
      </div>

      {/* Stat Cards */}
      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col xs={12} sm={6}>
          <Card className={`${styles.statCard} ${styles.statBlue}`}>
            <div className={styles.statLabel}>HÔM NAY</div>
            <CalendarOutlined className={styles.statIcon} />
            <div className={styles.statNumber}>0</div>
            <div className={styles.statDesc}>Lịch hẹn hôm nay</div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className={`${styles.statCard} ${styles.statOrange}`}>
            <div className={styles.statLabel}>CHỜ DUYỆT</div>
            <CalendarOutlined className={styles.statIcon} />
            <div className={styles.statNumber}>1</div>
            <div className={styles.statDesc}>Lịch hẹn chờ xác nhận</div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className={`${styles.statCard} ${styles.statGreen}`}>
            <div className={styles.statLabel}>TIN NHẮN</div>
            <MessageOutlined className={styles.statIcon} />
            <div className={styles.statNumber}>0</div>
            <div className={styles.statDesc}>Tư vấn chờ phản hồi</div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className={`${styles.statCard} ${styles.statTeal}`}>
            <div className={styles.statLabel}>RATING</div>
            <StarOutlined className={styles.statIcon} />
            <div className={styles.statNumber}>4.8</div>
            <div className={styles.statDesc}>⭐ Đánh giá trung bình</div>
          </Card>
        </Col>
      </Row>

      {/* Bottom Section */}
      <Row gutter={[16, 16]}>
        {/* Upcoming Appointments */}
        <Col xs={24} lg={14}>
          <Card
            className={styles.sectionCard}
            title={<span className={styles.cardTitle}>Lịch hẹn sắp tới</span>}
            extra={<a href="/bac-si/lich-hen" className={styles.viewAll}>Xem tất cả</a>}
          >
            {upcomingAppointments.map((apt) => (
              <div key={apt.id} className={styles.appointmentItem}>
                <Avatar
                  size={42}
                  src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${apt.ownerName}`}
                  className={styles.appointmentAvatar}
                />
                <div className={styles.appointmentInfo}>
                  <div className={styles.aptOwner}>{apt.ownerName}</div>
                  <div className={styles.aptPet}>
                    Khám định kỳ cho '{apt.petName}' ({apt.petBreed})
                  </div>
                </div>
                <div className={styles.appointmentRight}>
                  <Tag color={statusMap[apt.status]?.color} className={styles.aptTag}>
                    {statusMap[apt.status]?.label}
                  </Tag>
                  <div className={styles.aptTime}>{apt.date} · {apt.time}</div>
                </div>
              </div>
            ))}
          </Card>
        </Col>

        {/* System Notifications */}
        <Col xs={24} lg={10}>
          <Card
            className={styles.sectionCard}
            title={<span className={styles.cardTitle}>Thông báo hệ thống</span>}
          >
            {systemNotifications.map((notif) => (
              <div key={notif.id} className={`${styles.notifItem} ${styles[`notif_${notif.type}`]}`}>
                <div className={styles.notifIcon}>{notif.icon}</div>
                <div className={styles.notifContent}>
                  <div className={styles.notifTitle}>{notif.title}</div>
                  <div className={styles.notifDesc}>{notif.desc}</div>
                  <div className={styles.notifTime}>{notif.time}</div>
                </div>
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default VetDashboard;
