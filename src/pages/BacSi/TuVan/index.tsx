import { MessageOutlined } from '@ant-design/icons';
import { Button, Space, Tag, Tabs, Typography } from 'antd';
import React, { useState } from 'react';
import styles from './index.module.less';

const { Title, Text } = Typography;

type ConsultStatus = 'cho-phan-hoi' | 'da-phan-hoi';

interface Consultation {
  id: number;
  title: string;
  ownerName: string;
  petName: string;
  petType: string;
  content: string;
  status: ConsultStatus;
  isUrgent?: boolean;
  time: string;
  reply?: string;
  replyTime?: string;
}

const mockConsultations: Consultation[] = [
  {
    id: 1,
    title: 'Luna hay gãi tai',
    ownerName: 'Phạm Thu E',
    petName: 'Luna',
    petType: 'Mèo',
    content: '"Mèo Luna của em hay gãi tai, tai có mủi hôi. Em nên làm gì ạ?"',
    status: 'cho-phan-hoi',
    time: '12/05/2026 21:00',
  },
  {
    id: 2,
    title: 'Mimi không chịu ăn',
    ownerName: 'Nguyễn Minh D',
    petName: 'Mimi',
    petType: 'Mèo',
    content: '"Mimi bỏ ăn từ sáng nay, nằm lờ đờ không muốn vận động."',
    status: 'da-phan-hoi',
    time: '11/05/2026 23:00',
    reply: '"Chào bạn, tình trạng lờ đờ bỏ ăn ở mèo có thể là dấu hiệu sốt hoặc nhiễm trùng. Bạn nên đưa Mimi đến phòng khám sớm để xét nghiệm máu..."',
    replyTime: '12/05/2026 08:30',
  },
  {
    id: 3,
    title: 'Chó bị nôn mửa liên tục',
    ownerName: 'Trần Hoàng L',
    petName: 'Bắp',
    petType: 'Chó Poodle',
    content: '"Bắp bị nôn ra dịch vàng từ 3h sáng đến giờ đã 5 lần rồi bác sĩ ơi. Giờ bé mệt lắm."',
    status: 'cho-phan-hoi',
    isUrgent: true,
    time: '13/05/2026 08:15',
  },
];

const TuVan: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('tat-ca');

  const filtered = mockConsultations.filter((c) => {
    if (activeTab === 'cho-phan-hoi') return c.status === 'cho-phan-hoi';
    if (activeTab === 'da-phan-hoi') return c.status === 'da-phan-hoi';
    return true;
  });

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <Title level={3} className={styles.title}>Xin chào, Bác sĩ</Title>
          <Text className={styles.subtitle}>
            Hôm nay bạn có <strong>3 yêu cầu tư vấn mới</strong> đang chờ phản hồi.
          </Text>
        </div>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className={styles.filterTabs}
          items={[
            { key: 'tat-ca', label: 'Tất cả' },
            { key: 'cho-phan-hoi', label: 'Chờ phản hồi' },
            { key: 'da-phan-hoi', label: 'Đã phản hồi' },
          ]}
        />
      </div>

      {/* Consultation cards */}
      <div className={styles.cardList}>
        {filtered.map((consult) => (
          <div
            key={consult.id}
            className={`${styles.consultCard} ${consult.isUrgent ? styles.cardUrgent : ''} ${consult.status === 'da-phan-hoi' ? styles.cardReplied : ''}`}
          >
            {/* Card header */}
            <div className={styles.cardHeader}>
              <div className={styles.cardLeft}>
                <div className={styles.petIconBg}>🐾</div>
                <div>
                  <div className={styles.consultTitle}>{consult.title}</div>
                  <div className={styles.consultMeta}>
                    <span>👤 Chủ nuôi: {consult.ownerName}</span>
                    <span>🐾 Thú cưng: {consult.petName} ({consult.petType})</span>
                  </div>
                </div>
              </div>
              <div className={styles.cardRight}>
                <div className={styles.badgeGroup}>
                  <Tag
                    className={`${styles.statusTag} ${consult.status === 'cho-phan-hoi' ? styles.tagPending : styles.tagDone}`}
                  >
                    {consult.status === 'cho-phan-hoi' ? 'Chờ phản hồi' : 'Đã phản hồi'}
                  </Tag>
                  {consult.isUrgent && <Tag className={styles.tagUrgent}>Khẩn cấp</Tag>}
                </div>
                <div className={styles.timeText}>THỜI GIAN GỬI<br />{consult.time}</div>
              </div>
            </div>

            {/* Content */}
            <div className={styles.contentBox}>
              <div className={styles.contentLabel}>Nội dung:</div>
              <div className={styles.contentText}>{consult.content}</div>
            </div>

            {/* Reply (if replied) */}
            {consult.reply && (
              <div className={styles.replyBox}>
                <div className={styles.replyLabel}>
                  ✅ Phản hồi của bạn ({consult.replyTime}):
                </div>
                <div className={styles.replyText}>{consult.reply}</div>
              </div>
            )}

            {/* Actions */}
            <div className={styles.cardActions}>
              {consult.status === 'cho-phan-hoi' ? (
                <>
                  <Button variant="outlined" size="small" className={styles.btnViewRecord}>Xem hồ sơ bệnh án</Button>
                  <Button type="primary" size="small" icon={<MessageOutlined />} className={styles.btnReply}>
                    Phản hồi
                  </Button>
                </>
              ) : null}
            </div>

            {/* Urgent floating button */}
            {consult.isUrgent && (
              <div className={styles.urgentAction}>
                <Button type="primary" danger size="middle" icon={<MessageOutlined />} className={styles.btnReplyNow}>
                  ↑ Phản hồi ngay
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TuVan;
