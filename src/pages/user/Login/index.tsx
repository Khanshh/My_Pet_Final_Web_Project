import React from 'react';
import LoginWithCredentials from './KeycloakLogin';
import styles from './index.less';

const Login: React.FC = () => {
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
						<p className={styles.subtitle}>Chào mừng bạn quay lại!</p>
						<p className={styles.desc}>Đăng nhập để quản lý thú cưng của bạn</p>
					</div>

					<div className={styles.formArea}>
						<LoginWithCredentials />
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
