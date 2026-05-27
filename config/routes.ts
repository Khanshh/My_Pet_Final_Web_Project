export default [
	{
		path: '/user',
		layout: false,
		routes: [
			{
				path: '/user/login',
				layout: false,
				name: 'login',
				component: './user/Login',
			},
			{
				path: '/user/register',
				layout: false,
				name: 'register',
				component: './user/Login',
			},
			{
				path: '/user',
				redirect: '/user/login',
			},
		],
	},

	///////////////////////////////////
	// BÁC SĨ THÚ Y — CMS RIÊNG
	{
		path: '/bac-si',
		layout: false,
		routes: [
			{
				path: '/bac-si/dashboard',
				layout: false,
				component: './BacSi/Dashboard',
				wrappers: ['@/wrappers/VetAuth'],
			},
			{
				path: '/bac-si/lich-hen',
				layout: false,
				component: './BacSi/LichHen',
				wrappers: ['@/wrappers/VetAuth'],
			},
			{
				path: '/bac-si/tu-van',
				layout: false,
				component: './BacSi/TuVan',
				wrappers: ['@/wrappers/VetAuth'],
			},
			{
				path: '/bac-si',
				redirect: '/bac-si/dashboard',
			},
		],
	},
	{
		path: '/dashboard',
		name: 'Tổng quan',
		component: './TrangChu',
		icon: 'DashboardOutlined',
	},
	{
		path: '/quan-ly-nguoi-dung',
		name: 'Quản lý người dùng',
		component: './QuanLyNguoiDung',
		icon: 'TeamOutlined',
	},
	{
		path: '/quan-ly-bac-si',
		name: 'Quản lý bác sĩ',
		component: './QuanLyBacSi',
		icon: 'MedicineBoxOutlined',
	},
	{
		path: '/quan-ly-thu-cung',
		name: 'Quản lý thú cưng',
		component: './QuanLyThuCung',
		icon: 'HeartOutlined',
	},
	{
		path: '/appointments',
		name: 'Quản lý lịch hẹn',
		component: './QuanLyLichHen',
		icon: 'CalendarOutlined',
	},
	{
		path: '/profile',
		name: 'Hồ sơ cá nhân',
		component: './HoSo',
		hideInMenu: true,
	},

	{
		path: '/',
		redirect: '/dashboard',
	},
	{
		path: '/403',
		component: './exception/403/403Page',
		layout: false,
	},
	{
		path: '/hold-on',
		component: './exception/DangCapNhat',
		layout: false,
	},
	{
		component: './exception/404',
	},
];
