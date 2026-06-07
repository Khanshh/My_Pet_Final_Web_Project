import { User, Mail, Lock } from 'lucide-react';
import { Button, Form, Input, message } from 'antd';
import React, { useState } from 'react';
import { history } from 'umi';
import { registerUser } from '@/services/base/api';

const RegisterForm: React.FC = () => {
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

    const handleSubmit = async (values: any) => {
        setSubmitting(true);
        try {
            const response = await registerUser({
                full_name: values.username,
                email: values.email,
                password: values.password,
                role: 'owner'
            });

            if (response.status === 200 || response.status === 201) {
                message.success('Đăng ký thành công! Vui lòng đăng nhập.');
                history.push('/user/login');
            } else {
                message.error('Đăng ký thất bại!');
            }
        } catch (error: any) {
            console.error('Register error:', error);
            const errorMsg = error?.response?.data?.detail || 'Đăng ký thất bại, vui lòng thử lại!';
            message.error(errorMsg);
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
                    prefix={<User size={18} style={{ opacity: 0.5, marginRight: 8 }} />}
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
                    prefix={<Mail size={18} style={{ opacity: 0.5, marginRight: 8 }} />}
                    placeholder="Email"
                    size="large"
                />
            </Form.Item>

            <Form.Item
                name="password"
                rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu!' },
                    { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' },
                    { 
                        pattern: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[A-Z]).{8,}$/, 
                        message: 'Mật khẩu yêu cầu phải có cả chữ và số, trong đó phải có 1 chữ in hoa!' 
                    }
                ]}
            >
                <Input.Password
                    prefix={<Lock size={18} style={{ opacity: 0.5, marginRight: 8 }} />}
                    placeholder="Mật khẩu"
                    size="large"
                />
            </Form.Item>

            <Form.Item
                name="confirm"
                dependencies={['password']}
                rules={[
                    { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                    { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' },
                    { 
                        pattern: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[A-Z]).{8,}$/, 
                        message: 'Mật khẩu yêu cầu phải có cả chữ và số, trong đó phải có 1 chữ in hoa!' 
                    },
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
                    prefix={<Lock size={18} style={{ opacity: 0.5, marginRight: 8 }} />}
                    placeholder="Xác nhận mật khẩu"
                    size="large"
                />
            </Form.Item>

            <Button type="primary" htmlType="submit" block size="large" loading={submitting}>
                Tạo tài khoản ngay
            </Button>
        </Form>
    );
};

export default RegisterForm;
