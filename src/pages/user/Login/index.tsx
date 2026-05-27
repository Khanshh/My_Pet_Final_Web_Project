import { Tabs } from 'antd';
import React from 'react';
import { history, useLocation } from 'umi';
import LoginWithCredentials from './KeycloakLogin';
import RegisterForm from './RegisterForm';
import styles from './index.less';

const Login: React.FC = () => {
	const location = useLocation();
	const activeKey = location.pathname === '/user/register' ? 'register' : 'login';

	const handleTabChange = (key: string) => {
		history.push(`/user/${key}`);
	};

	return (
		<div className={styles.container}>
			{/* Background shapes */}
			<div className={styles.backgroundShapes}>
				<div className={styles.shape1} />
				<div className={styles.shape2} />
				<div className={styles.shape3} />
			</div>

			{/* Centered Card */}
			<div className={styles.cardWrapper}>
				<div className={styles.card}>
					<div className={styles.header}>
						<div className={styles.logoContainer}>
							<span className={styles.logoIcon}>🐾</span>
							<span className={styles.logoText}>MyPet</span>
						</div>
						<p className={styles.subtitle}>
							{activeKey === 'login' ? 'Chào mừng bạn quay lại!' : 'Tham gia cùng MyPet!'}
						</p>
						<p className={styles.desc}>
							{activeKey === 'login'
								? 'Đăng nhập để quản lý thú cưng của bạn'
								: 'Đăng ký tài khoản mới để bắt đầu chăm sóc thú cưng'}
						</p>
					</div>

					<div className={styles.formArea}>
						<Tabs
							activeKey={activeKey}
							onChange={handleTabChange}
							centered
							className={styles.tabs}
						>
							<Tabs.TabPane tab="Đăng nhập" key="login">
								<LoginWithCredentials />
							</Tabs.TabPane>
							<Tabs.TabPane tab="Đăng ký" key="register">
								<RegisterForm />
							</Tabs.TabPane>
						</Tabs>
					</div>

					<div className={styles.cardFooter}>
						<span>© 2025 MyPet Shop — Yêu thương thú cưng 🐶🐱</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Login;

