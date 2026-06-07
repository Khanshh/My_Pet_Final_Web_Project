import React, { useState, useEffect } from 'react';
import { Row, Col, Avatar, Button, message, Input, Select, Empty } from 'antd';
import {
    ClipboardList,
    Search,
    Activity,
    Stethoscope,
    FileText,
    Calendar,
    HeartPulse,
    MessageCircle
} from 'lucide-react';
import { getMyMedicalRecords, Pet, getMyPets } from '@/services/QuanLyPetStore';
import { history } from 'umi';
import { ip3 } from '@/utils/ip';
import styles from './style.less';

const UserHoSoBenhAn: React.FC = () => {
    const [records, setRecords] = useState<any[]>([]);
    const [pets, setPets] = useState<Pet[]>([]);
    const [selectedPet, setSelectedPet] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [visibleCount, setVisibleCount] = useState(5);

    const fetchData = async () => {
        try {
            const [recordsData, petsData] = await Promise.all([
                getMyMedicalRecords(),
                getMyPets()
            ]);
            setRecords(recordsData);
            setPets(petsData);
        } catch (error) {
            message.error('Không thể tải hồ sơ bệnh án');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredRecords = records.filter(r => {
        if (selectedPet && r.pet_id !== selectedPet) return false;
        if (searchQuery && !r.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    return (
        <div className={styles.hoSoPage}>
            <header className={styles.pageHeader}>
                <div className={styles.titleArea}>
                    <h1><ClipboardList size={28} /> Hồ sơ sức khỏe</h1>
                    <p>Lịch sử y khoa và chẩn đoán chi tiết từ các chuyên gia.</p>
                </div>
                <div className={styles.filterArea}>
                    <Select
                        placeholder="Chọn thú cưng"
                        allowClear
                        className={styles.petSelect}
                        onChange={setSelectedPet}
                    >
                        {pets.map(pet => (
                            <Select.Option key={pet.id} value={pet.id}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Avatar size="small" src={pet.avatar_url ? (pet.avatar_url.startsWith('http') ? pet.avatar_url : `${ip3}${pet.avatar_url.startsWith('/') ? pet.avatar_url.slice(1) : pet.avatar_url}`) : undefined} /> {pet.name}
                                </div>
                            </Select.Option>
                        ))}
                    </Select>
                    <Input
                        placeholder="Tìm kiếm bệnh án..."
                        prefix={<Search size={16} />}
                        className={styles.searchBar}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </header>

            <Row gutter={[24, 24]}>
                <Col xs={{ span: 24, order: 1 }} lg={{ span: 16, order: 1 }}>
                    <div className={styles.recordList}>
                        {filteredRecords.length > 0 ? (
                            <>
                                {filteredRecords.slice(0, visibleCount).map(record => (
                                    <div key={record.id} className={styles.recordCard}>
                                        <div className={styles.cardHeader}>
                                            <div className={styles.datePill}>
                                                <Calendar size={12} />
                                                <span>{new Date(record.recorded_at).toLocaleDateString('vi-VN')} {new Date(record.recorded_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <Activity size={16} className={styles.examIcon} />
                                        </div>
                                        <h3 className={styles.diagnosisTitle}>{record.diagnosis}</h3>
                                        
                                        <div className={styles.inlineInfo}>
                                            <div className={styles.infoItem}>
                                                <Stethoscope size={14} />
                                                <span>BS. {record.vet?.user?.full_name || 'Hệ thống'}</span>
                                            </div>
                                            <div className={styles.infoItem}>
                                                <FileText size={14} />
                                                <span>{record.treatment}</span>
                                            </div>
                                        </div>

                                        {record.notes && (
                                            <div className={styles.notesText}>
                                                {record.notes.replace(/https?:\/\/[^\s]+/g, '[Ảnh đính kèm]')}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {visibleCount < filteredRecords.length && (
                                    <div className={styles.loadMoreWrap}>
                                        <a className={styles.linkLoadMore} onClick={() => setVisibleCount(prev => prev + 5)}>Xem thêm</a>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className={styles.emptyState}>
                                <Empty
                                    image={<ClipboardList size={48} style={{ color: '#d1c7bd' }} />}
                                    description="Chưa có dữ liệu y khoa nào được ghi nhận."
                                />
                            </div>
                        )}
                    </div>
                </Col>

                <Col xs={{ span: 24, order: 2 }} lg={{ span: 8, order: 2 }}>
                    <div className={styles.sidebar}>
                        <div className={styles.summaryHeader}>
                            <HeartPulse size={20} />
                            <h3>Chỉ số tổng quát</h3>
                        </div>
                        <div className={styles.metricRow}>
                            <div className={styles.metricItem}>
                                <span className={styles.metricLabel}>Số lần khám</span>
                                <span className={styles.metricValue}>{filteredRecords.length}</span>
                            </div>
                            <div className={styles.metricItem}>
                                <span className={styles.metricLabel}>Lần cuối</span>
                                <span className={styles.metricValue}>{filteredRecords[0] ? new Date(filteredRecords[0].recorded_at).toLocaleDateString('vi-VN') : 'N/A'}</span>
                            </div>
                        </div>
                        
                        <Button block className={styles.btnChat} onClick={() => history.push(`/khach-hang/tu-van`)}>
                            <MessageCircle size={18} /> Trò chuyện với bác sĩ
                        </Button>

                        <div className={styles.infoBox}>
                            <h4>Lưu ý sức khỏe</h4>
                            <ul>
                                <li>Theo dõi sát sao cân nặng và chế độ dinh dưỡng sau khi điều trị.</li>
                                <li>Đảm bảo thú cưng uống đủ nước mỗi ngày.</li>
                            </ul>
                        </div>
                    </div>
                </Col>
            </Row>

        </div>
    );
};

export default UserHoSoBenhAn;
