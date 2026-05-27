import React from 'react';
import { useModel } from 'umi';
import AvatarDropdown from './AvatarDropdown';
import styles from './index.less';
import { SearchOutlined, BellOutlined } from '@ant-design/icons';

export type SiderTheme = 'light' | 'dark';

const GlobalHeaderRight: React.FC = () => {
	const { initialState } = useModel('@@initialState');

	if (!initialState || !initialState.currentUser) {
		return null;
	}

	return (
		<div className={styles.right}>
			<div className={styles.headerSearch}>
				<SearchOutlined className={styles.searchIcon} />
				<input type="text" placeholder="Tìm kiếm thú cưng, khách hàng..." />
			</div>
			
			<button className={styles.notificationBtn} type="button">
				<BellOutlined />
				<span className={styles.notifDot} />
			</button>

			<AvatarDropdown menu />
		</div>
	);
};

export default GlobalHeaderRight;
