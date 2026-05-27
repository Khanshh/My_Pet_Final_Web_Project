import RightContent from '@/components/RightContent';
import { notification } from 'antd';
import 'moment/locale/vi';
import type { RequestConfig, RunTimeLayoutConfig } from 'umi';
import { getIntl, getLocale, history } from 'umi';
import type { RequestOptionsInit, ResponseError } from 'umi-request';
import ErrorBoundary from './components/ErrorBoundary';
import { OIDCBounder } from './components/OIDCBounder';
import NotAccessible from './pages/exception/403';
import NotFoundContent from './pages/exception/404';
import type { IInitialState } from './services/base/typing';
import './styles/global.less';
import { LayoutDashboard, Users, Stethoscope, Cat, CalendarDays, PawPrint } from 'lucide-react';
// currentRole đã được loại bỏ cùng với Keycloak auth
import axios from '@/utils/axios';
import { ip3 } from '@/utils/ip';

/**  loading */
export const initialStateConfig = {
	loading: <></>,
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * // Tobe removed
 * */
export async function getInitialState(): Promise<IInitialState> {
	const fetchUserInfo = async () => {
		try {
			const token = localStorage.getItem('token');
			if (!token) return undefined;

			const res = await axios.get(`${ip3}api/v1/auth/me`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			return res.data;
		} catch (error) {
			return undefined;
		}
	};

	const currentUser = await fetchUserInfo();
	return {
		permissionLoading: false,
		currentUser: currentUser,
	};
}

// Tobe removed
const authHeaderInterceptor = (url: string, options: RequestOptionsInit) => ({});

/**
 * @see https://beta-pro.ant.design/docs/request-cn
 */
export const request: RequestConfig = {
	errorHandler: (error: ResponseError) => {
		const { messages } = getIntl(getLocale());
		const { response } = error;

		if (response && response.status) {
			const { status, statusText, url } = response;
			const requestErrorMessage = messages['app.request.error'];
			const errorMessage = `${requestErrorMessage} ${status}: ${url}`;
			const errorDescription = messages[`app.request.${status}`] || statusText;
			notification.error({
				message: errorMessage,
				description: errorDescription,
			});
		}

		if (!response) {
			notification.error({
				description: 'Yêu cầu gặp lỗi',
				message: 'Bạn hãy thử lại sau',
			});
		}
		throw error;
	},
	requestInterceptors: [authHeaderInterceptor],
};

// ProLayout  https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState }) => {
	return {
		unAccessible: (
			<OIDCBounder>
				<NotAccessible />
			</OIDCBounder>
		),
		noFound: <NotFoundContent />,
		rightContentRender: () => <RightContent />,
		disableContentMargin: false,

		onPageChange: () => {
			// Redirect / về /dashboard nếu đã đăng nhập
			if (initialState?.currentUser) {
				const { location } = history;
				if (location.pathname === '/') {
					history.replace('/dashboard');
				}
			}
		},

		menuItemRender: (item, dom) => {
			const active = history.location.pathname === item.path;
			const getLucideIcon = (path: string) => {
				switch (path) {
					case '/dashboard': return <LayoutDashboard size={18} strokeWidth={1.75} />;
					case '/quan-ly-nguoi-dung': return <Users size={18} strokeWidth={1.75} />;
					case '/quan-ly-bac-si': return <Stethoscope size={18} strokeWidth={1.75} />;
					case '/quan-ly-thu-cung': return <Cat size={18} strokeWidth={1.75} />;
					case '/appointments': return <CalendarDays size={18} strokeWidth={1.75} />;
					default: return null;
				}
			};

			return (
				<a
					className={`pc-menu-item ${active ? 'active' : ''}`}
					key={item?.path}
					href={item?.path}
					onClick={(e) => {
						e.preventDefault();
						history.push(item?.path ?? '/');
					}}
				>
					{getLucideIcon(item.path || '')}
					<span className="pc-menu-title">{item.name}</span>
				</a>
			);
		},

		childrenRender: (dom) => (
			<OIDCBounder>
				<ErrorBoundary>
					{dom}
				</ErrorBoundary>
			</OIDCBounder>
		),
		menuHeaderRender: (logo, title, props: any) => (
			<div className={`pc-sidebar-brand ${props?.collapsed ? 'collapsed' : ''}`}>
				<div className="brand-icon-wrapper">
					<PawPrint size={props?.collapsed ? 24 : 36} strokeWidth={2.5} />
				</div>
				{!props?.collapsed && (
					<div className="brand-text-wrapper">
						<h1>PetCare</h1>
						<span>Admin Suite</span>
					</div>
				)}
			</div>
		),
		menuFooterRender: (props) => {
			if (props?.collapsed) return undefined;
			return (
				<div style={{ padding: '0 16px 16px' }}>

				</div>
			);
		},
		...initialState?.settings,
	};
};
