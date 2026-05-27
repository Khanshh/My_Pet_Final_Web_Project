import { LockOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Form, Input, message } from 'antd';
import React, { useState } from 'react';
import { history } from 'umi';

const RegisterForm: React.FC = () => {
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

    const handleSubmit = async (values: any) => {
        setSubmitting(true);
        try {
            // Giả lập API register
            console.log('Register values:', values);
            await new Promise((resolve) => setTimeout(resolve, 1000));

            message.success('Đăng ký thành công! Vui lòng đăng nhập.');
            history.push('/user/login');
        } catch (error) {
            message.error('Đăng ký thất bại!');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Form.Item
                name="username"
                rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
            >
                <Input
                    prefix={<UserOutlined />}
                    placeholder="Họ và tên"
                    size="large"
                />
            </Form.Item>

            <Form.Item
                name="email"
                rules={[
                    { required: true, message: 'Vui lòng nhập email!' },
                    { type: 'email', message: 'Email không hợp lệ!' },
                ]}
            >
                <Input
                    prefix={<MailOutlined />}
                    placeholder="Email"
                    size="large"
                />
            </Form.Item>

            <Form.Item
                name="password"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
                <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Mật khẩu"
                    size="large"
                />
            </Form.Item>

            <Form.Item
                name="confirm"
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
                <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Xác nhận mật khẩu"
                    size="large"
                />
            </Form.Item>

            <Button type="primary" htmlType="submit" block size="large" loading={submitting}>
                Đăng ký
            </Button>
        </Form>
    );
};

export default RegisterForm;
