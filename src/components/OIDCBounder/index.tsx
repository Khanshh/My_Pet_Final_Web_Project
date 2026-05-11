import { primaryColor } from '@/services/base/constant';
import { ConfigProvider } from 'antd';
import { type FC, useEffect } from 'react';
import { history, useModel } from 'umi';
import { unAuthPaths } from './constant';

/**
 * OIDCBounder — Phiên bản MyPet (không dùng Keycloak/OIDC)
 * Thay thế bằng kiểm tra token từ localStorage.
 * TODO: Khi backend FastAPI sẵn sàng, thay phần kiểm tra token bằng API call xác thực.
 */
const OIDCBounder: FC & { getActions: () => null } = ({ children }) => {
	const { initialState, setInitialState } = useModel('@@initialState');

	useEffect(() => {
		// Đồng bộ màu sắc chủ đạo
		ConfigProvider.config({ theme: { primaryColor } });
	}, []);

	useEffect(() => {
		const isUnauth = unAuthPaths.some((path) => window.location.pathname.includes(path));
		if (isUnauth) return;

		const token = localStorage.getItem('token');

		if (!token) {
			// Chưa đăng nhập → chuyển về trang login
			history.replace('/user/login');
			return;
		}

		// Nếu đã có token nhưng chưa có currentUser trong state → restore từ localStorage
		if (token && !initialState?.currentUser) {
			try {
				const savedUser = localStorage.getItem('currentUser');
				if (savedUser) {
					const parsedUser = JSON.parse(savedUser);
					setInitialState({
						...initialState,
						currentUser: parsedUser,
						permissionLoading: false,
					});
				} else {
					// Token tồn tại nhưng không có user data → xóa token lỗi và về login
					localStorage.removeItem('token');
					history.replace('/user/login');
				}
			} catch {
				localStorage.removeItem('token');
				localStorage.removeItem('currentUser');
				history.replace('/user/login');
			}
		}
	}, [initialState?.currentUser]);

	return <>{children}</>;
};

OIDCBounder.getActions = () => null;

export { OIDCBounder };
