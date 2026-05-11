import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, message } from 'antd';
import React, { useState } from 'react';
import { history, useModel } from 'umi';

// Thông tin đăng nhập tạm thời (hardcode) — thay bằng API khi backend sẵn sàng
const MOCK_EMAIL = 'admin@gmail.com';
const MOCK_PASSWORD = '123456';

const LoginWithCredentials: React.FC = () => {
	const [submitting, setSubmitting] = useState(false);
	const { initialState, setInitialState } = useModel('@@initialState');
	const [form] = Form.useForm();

	const handleSubmit = async (values: { email: string; password: string }) => {
		setSubmitting(true);
		try {
			// TODO: Thay đoạn này bằng API call tới FastAPI khi backend sẵn sàng
			// const response = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify(values) });
			if (values.email === MOCK_EMAIL && values.password === MOCK_PASSWORD) {
				// Lưu token tạm, thay bằng token thật từ backend sau
				localStorage.setItem('token', 'mock-token-mypet');
				localStorage.setItem(
					'currentUser',
					JSON.stringify({
						email: MOCK_EMAIL,
						name: 'Admin',
						preferred_username: 'admin',
					}),
				);
				setInitialState({
					...initialState,
					currentUser: {
						email: MOCK_EMAIL,
						name: 'Admin',
						preferred_username: 'admin',
						sub: 'mock-id',
						ssoId: 'mock-id',
						email_verified: true,
						realm_access: { roles: ['admin'] },
						given_name: 'Admin',
						family_name: '',
						picture: '',
					},
					permissionLoading: false,
				});
				message.success('Đăng nhập thành công!');
				history.push('/dashboard');
			} else {
				message.error('Email hoặc mật khẩu không đúng!');
			}
		} catch {
			message.error('Đã có lỗi xảy ra, vui lòng thử lại!');
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
		</Form>
	);
};

export default LoginWithCredentials;
