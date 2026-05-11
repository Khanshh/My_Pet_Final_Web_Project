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
				path: '/user',
				redirect: '/user/login',
			},
		],
	},

	///////////////////////////////////
	// DEFAULT MENU
	{
		path: '/dashboard',
		name: 'Trang Chủ',
		component: './TrangChu',
		icon: 'HomeOutlined',
	},

	// TODO: Sau này team tạo module nào thì cứ add thêm vào bên dưới
	// {
	// 	path: '/thu-cung',
	// 	name: 'Quản Lý Thú Cưng',
	// 	component: './ThuCung',
	// 	icon: 'GitlabOutlined',
	// },

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
