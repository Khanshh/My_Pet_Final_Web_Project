import { adminlogin, getUserInfo } from '@/services/base/api';
import { Mail, Lock } from 'lucide-react';
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
			const res = await adminlogin(values);

			if (res.status === 200 && res.data?.access_token) {
				localStorage.setItem('token', res.data.access_token);
				localStorage.setItem('refreshToken', res.data.refresh_token);

				const info = await getUserInfo();
				const userData = info?.data;

				setInitialState({
					...initialState,
					currentUser: userData,
				});

				message.success('Đăng nhập thành công! 🐾');

				if (userData?.role === 'vet') {
					history.push('/bac-si/dashboard');
				} else if (userData?.role === 'owner') {
					history.push('/khach-hang/dashboard');
				} else {
					history.push('/dashboard');
				}
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
					prefix={<Mail size={18} style={{ opacity: 0.5, marginRight: 8 }} />}
					placeholder="Nhập email"
					size="large"
				/>
			</Form.Item>

			<Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
				<Input.Password
					prefix={<Lock size={18} style={{ opacity: 0.5, marginRight: 8 }} />}
					placeholder="Nhập mật khẩu"
					size="large"
				/>
			</Form.Item>

			<Button type="primary" htmlType="submit" block size="large" loading={submitting}>
				Tiếp tục trải nghiệm
			</Button>


		</Form>
	);
};

export default LoginWithCredentials;
