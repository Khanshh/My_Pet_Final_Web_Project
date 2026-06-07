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
				path: '/bac-si/lich-hen/kham-moi',
				layout: false,
				component: './BacSi/LichHen/KhamMoi',
				wrappers: ['@/wrappers/VetAuth'],
			},
			{
				path: '/bac-si/lich-hen/benh-an',
				layout: false,
				component: './BacSi/LichHen/BenhAn',
				wrappers: ['@/wrappers/VetAuth'],
			},
			{
				path: '/bac-si/thong-bao',
				layout: false,
				component: './BacSi/ThongBao',
				wrappers: ['@/wrappers/VetAuth'],
			},
			{
				path: '/bac-si/tu-van',
				layout: false,
				component: './BacSi/TuVan',
				wrappers: ['@/wrappers/VetAuth'],
			},
			{
				path: '/bac-si/tu-van/phan-hoi',
				layout: false,
				component: './BacSi/TuVan/PhanHoi',
				wrappers: ['@/wrappers/VetAuth'],
			},
			{
				path: '/bac-si/ho-so',
				layout: false,
				component: './BacSi/HoSo',
				wrappers: ['@/wrappers/VetAuth'],
			},
			{
				path: '/bac-si/ho-so/chinh-sua',
				layout: false,
				component: './BacSi/HoSo/Edit',
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
		path: '/quan-ly-dich-vu',
		name: 'Quản lý dịch vụ',
		component: '@/pages/QuanLyDichVu/index',
		icon: 'AppstoreOutlined',
	},
	{
		path: '/quan-ly-thanh-toan',
		name: 'Quản lý thanh toán',
		component: '@/pages/QuanLyThanhToan/index',
		icon: 'CreditCardOutlined',
	},
	{
		path: '/profile',
		name: 'Hồ sơ cá nhân',
		component: './HoSo',
		hideInMenu: true,
	},

	///////////////////////////////////
	// KHÁCH HÀNG — USER PORTAL
	{
		path: '/khach-hang',
		layout: false,
		component: '@/layouts/UserLayout',
		routes: [
			{
				path: '/khach-hang',
				redirect: '/khach-hang/dashboard',
			},
			{
				name: 'Dashboard',
				path: '/khach-hang/dashboard',
				component: './KhachHang/Dashboard',
			},
			{
				name: 'Thú cưng của tôi',
				path: '/khach-hang/thu-cung',
				component: './KhachHang/ThuCung',
			},
			{
				name: 'Lịch hẹn cá nhân',
				path: '/khach-hang/lich-hen',
				component: './KhachHang/LichHen',
			},
			{
				name: 'Hồ sơ bệnh án',
				path: '/khach-hang/benh-an',
				component: './KhachHang/HoSoBenhAn',
			},
			{
				name: 'Tư vấn trực tuyến',
				path: '/khach-hang/tu-van',
				component: '@/pages/KhachHang/TuVan/index',
			},
			{
				name: 'Chi tiết tư vấn',
				path: '/khach-hang/tu-van/phan-hoi',
				component: '@/pages/KhachHang/TuVan/PhanHoi/index',
				hideInMenu: true,
			},
			{
				name: 'Hồ sơ cá nhân',
				path: '/khach-hang/ho-so',
				component: './KhachHang/HoSoCaNhan',
			},
		],
	},

	{
		path: '/',
		layout: false,
		component: './LandingPage',
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
// trigger rebuild

