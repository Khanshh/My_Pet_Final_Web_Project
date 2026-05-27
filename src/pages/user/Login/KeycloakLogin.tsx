import { adminlogin, getUserInfo } from '@/services/base/api';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, message } from 'antd';
import React, { useState } from 'react';
import { history, useModel } from 'umi';

const LoginWithCredentials: React.FC = () => {
	const [submitting, setSubmitting] = useState(false);
	const { initialState, setInitialState } = useModel('@@initialState');
	const [form] = Form.useForm();

	const handleSubmit = async (values: { email: string; password: string }) => {
		setSubmitting(true);
		try {
			// Gọi API login thực tế
			const res = await adminlogin(values);

			if (res.status === 200 && res.data?.access_token) {
				// Lưu token vào localStorage
				localStorage.setItem('token', res.data.access_token);
				localStorage.setItem('refreshToken', res.data.refresh_token);

				// Lấy thông tin user hiện tại từ API /me
				const info = await getUserInfo();
				const userData = info?.data;

				setInitialState({
					...initialState,
					currentUser: userData,
				});

				message.success('Đăng nhập thành công!');
				history.push('/dashboard');
			} else {
				message.error('Email hoặc mật khẩu không đúng!');
			}
		} catch (error: any) {
			console.error('Login error:', error);
			const errorMsg = error?.response?.data?.detail || 'Đăng nhập thất bại, vui lòng thử lại!';
			message.error(errorMsg);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Form form={form} onFinish={handleSubmit} layout="vertical">
			<Form.Item
				name="email"
				rules={[
					{ required: true, message: 'Vui lòng nhập email!' },
					{ type: 'email', message: 'Email không hợp lệ!' },
				]}
			>
				<Input
					prefix={<UserOutlined />}
					placeholder="Nhập email (admin@gmail.com)"
					size="large"
				/>
			</Form.Item>

			<Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
				<Input.Password
					prefix={<LockOutlined />}
					placeholder="Nhập mật khẩu (123456)"
					size="large"
				/>
			</Form.Item>

			<Button type="primary" htmlType="submit" block size="large" loading={submitting}>
				Đăng nhập
			</Button>

			<Button
				type="default"
				block
				size="large"
				style={{ marginTop: 12, borderRadius: 12 }}
				onClick={() => {
					localStorage.setItem('token', 'mock-token-for-dev');
					localStorage.setItem('currentUser', JSON.stringify({
						name: 'Admin Mock',
						email: 'admin@gmail.com',
						realm_access: { roles: ['admin'] }
					}));
					message.success('Đã bypass đăng nhập (Chế độ Dev)');
					window.location.href = '/dashboard';
				}}
			>
				Bypass Login (Dành cho Dev)
			</Button>
		</Form>
	);
};

export default LoginWithCredentials;
