import React, { useState } from 'react';
import { Table, Progress, Modal, Form, Input, Select, message } from 'antd';
import { Search, Plus, ChevronRight, ArrowRight, ShieldCheck, Users } from 'lucide-react';
import '../TrangChu/components/style.less';
import HeaderProfile from '@/components/HeaderProfile';
import './style.less';

import { getOwners, toggleUserStatus, User, createOwner } from '@/services/QuanLyPetStore';

const FILTERS = ['Tất cả', 'Chủ nuôi', 'Bác sĩ thú y', 'Nhân viên', 'Chờ duyệt'];

const UserManagement: React.FC = () => {
	const [activeFilter, setActiveFilter] = useState('Tất cả');
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [form] = Form.useForm();

	const fetchData = async () => {
		setLoading(true);
		try {
			const data = await getOwners();
			setUsers(data);
		} catch (error) {
			message.error('Không thể tải danh sách người dùng');
		} finally {
			setLoading(false);
		}
	};

	React.useEffect(() => {
		fetchData();
	}, []);

	const handleAddUser = async (values: any) => {
		const success = await createOwner({
			...values,
			phone: values.phone || '',
			password: 'Password123@', // Mật khẩu mặc định cho user mới tạo từ admin
		});
		if (success) {
			setIsModalOpen(false);
			form.resetFields();
			fetchData();
		}
	};

	const columns = [
		{
			title: 'Hồ sơ người dùng',
			dataIndex: 'full_name',
			key: 'name',
			render: (_: any, record: User) => (
				<div className="cell-user-profile">
					<div className="avatar">
						{record.avatar_url ? (
							<img src={record.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
						) : (
							record.full_name.split(' ').pop()?.charAt(0).toUpperCase()
						)}
					</div>
					<div className="info">
						<span className="name">{record.full_name}</span>
						<span className="id">ID: {record.id.slice(0, 8)}</span>
					</div>
				</div>
			)
		},
		{
			title: 'Loại tài khoản',
			dataIndex: 'role',
			key: 'type',
			render: (role: string) => {
				let typeClass = 'pet-owner';
				let label = 'Chủ nuôi';
				if (role === 'vet') {
					typeClass = 'veterinarian';
					label = 'Bác sĩ thú y';
				}
				if (role === 'admin') {
					typeClass = 'staff';
					label = 'Quản trị viên';
				}
				return <span className={`cell-user-type ${typeClass}`}>{label}</span>;
			}
		},
		{
			title: 'Thông tin liên hệ',
			key: 'contact',
			render: (_: any, record: User) => (
				<div className="cell-contact">
					<span>{record.email}</span>
					<span>{record.phone || 'N/A'}</span>
				</div>
			)
		},
		{
			title: 'Trạng thái',
			dataIndex: 'is_active',
			key: 'status',
			render: (active: boolean) => {
				const statusClass = active ? 'active' : 'suspended';
				return (
					<div className="cell-status">
						<div className={`dot ${statusClass}`} />
						<span>{active ? 'Hoạt động' : 'Đã khóa'}</span>
					</div>
				);
			}
		},
		{
			title: 'Ngày tham gia',
			dataIndex: 'created_at',
			key: 'joined',
			render: (date: string) => new Date(date).toLocaleDateString('vi-VN')
		},
		{
			title: 'Thao tác',
			key: 'actions',
			width: 80,
			align: 'center' as const,
			render: (_: any, record: User) => (
				<div className="cell-actions" style={{ cursor: 'pointer' }} onClick={() => toggleUserStatus(record.id, !record.is_active).then(fetchData)}>
					<ShieldCheck size={18} color={record.is_active ? '#666' : '#d97706'} />
				</div>
			)
		}
	];

	const displayedUsers = users.filter(user => {
		if (activeFilter === 'Tất cả') return true;
		if (activeFilter === 'Chủ nuôi') return user.role === 'owner';
		if (activeFilter === 'Bác sĩ thú y') return user.role === 'vet';
		if (activeFilter === 'Nhân viên') return user.role === 'admin';
		return true;
	});

	return (
		<div className="user-management-container petcare-dashboard">
			{/* Top Bar */}
			<div className="pc-header">
				<div className="pc-header-left" />
				<div className="pc-header-center">
					<div className="pc-header-search">
						<Search size={18} strokeWidth={1.75} className="search-icon" />
						<input type="text" placeholder="Tìm kiếm người dùng..." />
					</div>
				</div>
				<div className="pc-header-actions">
					<HeaderProfile />
				</div>
			</div>

			<div className="um-page-content">
				{/* Page Header */}
				<div className="um-header-row">
					<div className="um-title-left">
						<div className="um-title-icon">
							<Users size={22} strokeWidth={2.5} />
						</div>
						<div>
							<h1>Quản lý người dùng</h1>
							<p className="um-subtitle">
								Quản lý cộng đồng chủ nuôi, bác sĩ thú y và nhân viên tại một trung tâm duy nhất.
							</p>
						</div>
					</div>
					<div className="um-header-actions">
						<button className="um-add-btn" onClick={() => setIsModalOpen(true)}>
							<Plus size={18} strokeWidth={2.5} /> Thêm người dùng mới
						</button>
					</div>
				</div>

				{/* Filter Pills */}
				<div className="um-filters">
					{FILTERS.map(filter => (
						<div
							key={filter}
							className={`um-filter-pill ${activeFilter === filter ? 'active' : ''}`}
							onClick={() => setActiveFilter(filter)}
						>
							{filter}
						</div>
					))}
				</div>

				{/* Data Table */}
				<div className="um-table-container">
					<Table
						columns={columns}
						dataSource={displayedUsers}
						pagination={false}
						rowKey="id"
						loading={loading}
					/>

					{/* Custom Pagination Footer */}
					<div className="um-pagination">
						<div className="um-pagination-info">
							Hiển thị 1 đến {displayedUsers.length} trong số {users.length} người dùng
						</div>
						<div className="um-pagination-controls">
							<button className="page-btn active">1</button>
							<button className="page-btn">2</button>
							<button className="page-btn">3</button>
							<span style={{ color: '#5A5550', margin: '0 4px' }}>...</span>
							<button className="page-btn">32</button>
							<button className="page-btn">
								<ChevronRight size={16} />
							</button>
						</div>
					</div>
				</div>

				{/* Dashboard Footer */}
				<div className="um-dashboard-footer">
					<div className="um-footer-card um-card-left">
						<div className="um-card-radial">
							<Progress
								type="circle"
								percent={75}
								strokeColor="#A16207" // Dark yellow/olive
								trailColor="#FEF08A"
								format={percent => <span className="radial-text">{percent}%</span>}
								width={100}
								strokeWidth={8}
							/>
							<span className="radial-subtext">ĐÃ XÁC THỰC</span>
						</div>
						<div className="um-card-content">
							<h3>Xu hướng Xác thực Người dùng</h3>
							<p>
								Kể từ khi áp dụng Huy hiệu Chuyên gia PetCare, tỷ lệ xác thực người dùng đã tăng 15.4% trong quý này. Xác thực cao giúp tăng lượng đặt lịch lên 2.4 lần.
							</p>
							<a href="#" className="um-card-link">
								Xem chi tiết phân tích <ArrowRight size={16} />
							</a>
						</div>
					</div>

					<div className="um-footer-card um-card-right">
						<div className="um-card-right-top">
							<div className="shield-icon-wrapper">
								<ShieldCheck size={20} className="shield-icon" strokeWidth={2.5} />
							</div>
							<div className="shield-title-wrapper">
								<h3>Bảo mật Tài khoản</h3>
								<span>Tỷ lệ Áp dụng 2FA</span>
							</div>
						</div>
						<div className="um-card-right-middle">
							<Progress
								percent={62}
								strokeColor="#047857" // Dark green
								trailColor="#A7F3D0" // Light teal trail
								showInfo={false}
								strokeWidth={8}
							/>
						</div>
						<div className="um-card-right-bottom">
							<i>62% người dùng của bạn đã bật bảo mật 2 lớp (2FA) để tăng cường an toàn.</i>
						</div>
					</div>
				</div>
			</div>

			{/* Modal Thêm người dùng mới */}
			<Modal
				title={<h3>Thêm người dùng mới 👤</h3>}
				visible={isModalOpen}
				onCancel={() => {
					setIsModalOpen(false);
					form.resetFields();
				}}
				onOk={() => form.submit()}
				okText="Lưu lại"
				cancelText="Hủy"
				destroyOnClose
			>
				<Form form={form} layout="vertical" onFinish={handleAddUser}>
					<Form.Item
						name="full_name"
						label="Họ và tên"
						rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
					>
						<Input placeholder="Ví dụ: Nguyễn Văn A" />
					</Form.Item>
					<Form.Item
						name="role"
						label="Loại tài khoản"
						rules={[{ required: true, message: 'Vui lòng chọn loại tài khoản!' }]}
						initialValue="owner"
					>
						<Select>
							<Select.Option value="owner">Chủ nuôi</Select.Option>
							<Select.Option value="vet">Bác sĩ thú y</Select.Option>
							<Select.Option value="admin">Nhân viên</Select.Option>
						</Select>
					</Form.Item>
					<Form.Item
						name="email"
						label="Địa chỉ Email"
						rules={[
							{ required: true, message: 'Vui lòng nhập email!' },
							{ type: 'email', message: 'Email không hợp lệ!' }
						]}
					>
						<Input placeholder="email@example.com" />
					</Form.Item>
					<Form.Item
						name="phone"
						label="Số điện thoại"
						rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
					>
						<Input placeholder="Ví dụ: +84 987 654 321" />
					</Form.Item>
					<Form.Item
						name="status"
						label="Trạng thái"
						initialValue="Hoạt động"
					>
						<Select>
							<Select.Option value="Hoạt động">Hoạt động</Select.Option>
							<Select.Option value="Chờ duyệt">Chờ duyệt</Select.Option>
							<Select.Option value="Đình chỉ">Đình chỉ</Select.Option>
						</Select>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default UserManagement;
