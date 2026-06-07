import React, { useState } from 'react';
import { Card, Form, Input, Button, Row, Col, Avatar, message, Modal, Upload } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, SafetyCertificateOutlined, CameraOutlined, LockOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import { ip3 } from '@/utils/ip';
import styles from './style.less';

const HoSoCaNhan: React.FC = () => {
    const { initialState, setInitialState } = useModel('@@initialState');
    const currentUser = initialState?.currentUser as any;

    const [form] = Form.useForm();
    const [pwdForm] = Form.useForm();

    const [isPwdModalOpen, setIsPwdModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    const rawAvatar = currentUser?.avatar_url || currentUser?.picture || '';
    const avatarUrl = rawAvatar
        ? rawAvatar.startsWith('http')
            ? rawAvatar
            : `${ip3}${rawAvatar.replace(/^\//, '')}`
        : 'https://i.pravatar.cc/150?img=12';

    const handleSave = async (values: any) => {
        try {
            const { updateProfile } = await import('@/services/QuanLyPetStore');
            const success = await updateProfile({
                full_name: values.name,
                email: values.email,
                phone: values.phone
            });
            if (success) {
                message.success('Cập nhật hồ sơ thành công!');
                setInitialState({
                    ...initialState,
                    currentUser: {
                        ...currentUser,
                        ...values,
                        full_name: values.name
                    }
                });
            } else {
                message.error('Cập nhật thất bại!');
            }
        } catch (error) {
            console.error(error);
            message.error('Có lỗi xảy ra khi lưu hồ sơ.');
        }
    };

    const handleChangePassword = async (values: any) => {
        try {
            const { updateProfile } = await import('@/services/QuanLyPetStore');
            const success = await updateProfile({
                password: values.password
            });
            if (success) {
                message.success('Đổi mật khẩu thành công!');
                setIsPwdModalOpen(false);
                pwdForm.resetFields();
            } else {
                message.error('Đổi mật khẩu thất bại!');
            }
        } catch (error) {
            console.error(error);
            message.error('Lỗi khi đổi mật khẩu.');
        }
    };

    return (
        <div className={styles.profilePage}>
            <div className={styles.headerArea}>
                <h1>Hồ sơ của tôi 👤</h1>
                <p>Quản lý thông tin cá nhân và cài đặt tài khoản của bạn.</p>
            </div>

            <Row gutter={32}>
                <Col xs={24} md={8}>
                    <div className={styles.avatarCard}>
                        <div className={styles.avatarWrapper}>
                            <Avatar src={avatarUrl} size={160} icon={<UserOutlined />} />
                            <Upload
                                name="file"
                                showUploadList={false}
                                action={`${ip3}api/v1/upload/avatar`}
                                headers={{ Authorization: `Bearer ${localStorage.getItem('token')}` }}
                                onChange={async (info) => {
                                    if (info.file.status === 'uploading') {
                                        setUploading(true);
                                        return;
                                    }
                                    if (info.file.status === 'done') {
                                        setUploading(false);
                                        const newUrl = info.file.response.url;
                                        const { updateProfile } = await import('@/services/QuanLyPetStore');
                                        await updateProfile({ avatar_url: newUrl });
                                        setInitialState({
                                            ...initialState,
                                            currentUser: { ...currentUser, avatar_url: newUrl }
                                        });
                                        message.success('Tải ảnh lên thành công!');
                                    } else if (info.file.status === 'error') {
                                        setUploading(false);
                                        message.error('Tải ảnh thất bại!');
                                    }
                                }}
                            >
                                <div className={styles.uploadBtn} style={{ cursor: 'pointer' }}>
                                    <CameraOutlined />
                                </div>
                            </Upload>
                        </div>
                        <h2>{currentUser?.full_name || currentUser?.name || 'Người dùng'}</h2>
                        <span className={styles.roleTag}>Thành viên PetCare</span>
                    </div>
                </Col>

                <Col xs={24} md={16}>
                    <div className={styles.infoCard}>
                        <h3 className={styles.sectionTitle}>Thông tin liên hệ</h3>
                        <Form
                            form={form}
                            layout="vertical"
                            initialValues={{
                                name: currentUser?.full_name || currentUser?.name,
                                email: currentUser?.email,
                                phone: currentUser?.phone || 'Chưa cập nhật'
                            }}
                            onFinish={handleSave}
                        >
                            <Row gutter={24}>
                                <Col span={24}>
                                    <Form.Item label="Họ và Tên" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
                                        <Input prefix={<UserOutlined />} size="large" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item label="Email" name="email" rules={[
                                        { required: true, message: 'Vui lòng nhập email!' },
                                        { type: 'email', message: 'Email không hợp lệ!' }
                                    ]}>
                                        <Input prefix={<MailOutlined />} size="large" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item label="Số điện thoại" name="phone">
                                        <Input prefix={<PhoneOutlined />} size="large" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <h3 className={styles.sectionTitle} style={{ marginTop: 24 }}>Bảo mật</h3>
                            <div className={styles.securityBox}>
                                <div>
                                    <h4><SafetyCertificateOutlined /> Mật khẩu</h4>
                                    <p>Thay đổi mật khẩu để bảo mật tài khoản tốt hơn.</p>
                                </div>
                                <Button className={styles.btnOutline} onClick={() => setIsPwdModalOpen(true)}>
                                    Đổi mật khẩu
                                </Button>
                            </div>

                            <div className={styles.actionRow}>
                                <Button type="primary" htmlType="submit" className={styles.btnSave} size="large">
                                    Lưu thay đổi
                                </Button>
                            </div>
                        </Form>
                    </div>
                </Col>
            </Row>

            {/* Modal đổi mật khẩu */}
            <Modal
                title="Đổi mật khẩu"
                visible={isPwdModalOpen}
                onCancel={() => {
                    setIsPwdModalOpen(false);
                    pwdForm.resetFields();
                }}
                onOk={() => pwdForm.submit()}
                okText="Xác nhận"
                cancelText="Hủy"
            >
                <Form form={pwdForm} layout="vertical" onFinish={handleChangePassword}>
                    <Form.Item
                        label="Mật khẩu mới"
                        name="password"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                            { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' },
                            {
                                pattern: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[A-Z]).{8,}$/,
                                message: 'Mật khẩu yêu cầu phải có cả chữ và số, trong đó phải có 1 chữ in hoa!'
                            }
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} size="large" placeholder="Nhập mật khẩu mới" />
                    </Form.Item>
                    <Form.Item
                        label="Xác nhận mật khẩu mới"
                        name="confirmPassword"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} size="large" placeholder="Nhập lại mật khẩu mới" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default HoSoCaNhan;
