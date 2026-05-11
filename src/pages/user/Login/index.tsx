import Footer from '@/components/Footer';
import React from 'react';
import LoginWithCredentials from './KeycloakLogin';
import styles from './index.less';

const Login: React.FC = () => {
	return (
		<div className={styles.container}>
			{/* Background chuyển động hiện đại */}
			<div className={styles.backgroundShapes}>
				<div className={styles.shape1} />
				<div className={styles.shape2} />
				<div className={styles.shape3} />
			</div>

			<div className={styles.content}>
				<div className={styles.top}>
					<div className={styles.header}>
						<div className={styles.logoContainer}>
							<span className={styles.logoIcon}>🐾</span>
							<span className={styles.logoText}>MyPet</span>
						</div>
						<p className={styles.subtitle}>Chào mừng bạn quay lại với hệ thống quản lý thú cưng!</p>
					</div>
				</div>

				<div className={styles.main}>
					<LoginWithCredentials />
				</div>
			</div>

			<div className={styles.loginFooter}>
				<Footer />
			</div>
		</div>
	);
};

export default Login;
