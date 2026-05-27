import React, { useState } from 'react';
import { Search, Filter, Plus, Calendar as CalendarIcon, Clock, CheckCircle } from 'lucide-react';
import { Modal, Form, Input, Select, message, Button, DatePicker, Descriptions, Tag } from 'antd';
import '../TrangChu/components/style.less'; // Inherit base dashboard layout
import HeaderProfile from '@/components/HeaderProfile';
import './style.less';

import { getAppointments, updateAppointmentStatus, getPets, getDoctors, getServices, createAppointment } from '@/services/QuanLyPetStore';

const QuanLyLichHen: React.FC = () => {
	const [activeTab, setActiveTab] = useState('Tất cả');
	const [appointments, setAppointments] = useState<any[]>([]);
	const [pets, setPets] = useState<any[]>([]);
	const [vets, setVets] = useState<any[]>([]);
	const [services, setServices] = useState<any[]>([]);
	const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
	const [loading, setLoading] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
	const [detailModalOpen, setDetailModalOpen] = useState(false);
	const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
	const [form] = Form.useForm();
	const [filterForm] = Form.useForm();

	const today = new Date();
	const [currentYear, setCurrentYear] = useState(today.getFullYear());
	const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
	const [selectedDay, setSelectedDay] = useState<number | null>(null);

	// Các filter state
	const [searchText, setSearchText] = useState('');
	const [statusFilter, setStatusFilter] = useState('Tất cả');
	const [serviceFilter, setServiceFilter] = useState('Tất cả');
	const [vetFilter, setVetFilter] = useState('Tất cả');

	const fetchData = async () => {
		setLoading(true);
		try {
			const [appRes, petRes, vetRes, svcRes] = await Promise.all([
				getAppointments({
					status: statusFilter === 'Tất cả' ? undefined : statusFilter,
					search: searchText || undefined,
					limit: 100
				}),
				getPets(),
				getDoctors(),
				getServices()
			]);

			setAppointments(appRes.items);
			setPets(petRes);
			setVets(vetRes);
			setServices(svcRes);

			setStats({
				total: appRes.total,
				pending: appRes.items.filter((a: any) => a.status === 'pending').length,
				completed: appRes.items.filter((a: any) => a.status === 'completed' || a.status === 'confirmed').length,
			});
		} catch (error) {
			message.error('Không thể tải dữ liệu lịch hẹn');
		} finally {
			setLoading(false);
		}
	};

	React.useEffect(() => {
		fetchData();
	}, [statusFilter, searchText]);

	const handleAddAppointment = async (values: any) => {
		const selectedPet = pets.find(p => p.id === values.pet_id);
		const success = await createAppointment({
			...values,
			owner_id: selectedPet?.owner_id,
			scheduled_at: values.scheduled_at ? values.scheduled_at.toISOString() : new Date().toISOString(),
			status: 'pending'
		});
		if (success) {
			setIsModalOpen(false);
			form.resetFields();
			fetchData();
		}
	};

	const handleConfirmAppointment = (id: string) => {
		updateAppointmentStatus(id, 'confirmed').then(() => {
			message.success('Xác nhận lịch hẹn thành công!');
			fetchData();
		});
	};

	const handleCancelAppointment = (id: string) => {
		updateAppointmentStatus(id, 'cancelled').then(() => {
			message.success('Đã hủy lịch hẹn!');
			fetchData();
		});
	};

	const handlePlaceholder = (featureName: string) => {
		message.info(`Chức năng "${featureName}" đang được phát triển.`);
	};

	const handleApplyFilters = (values: any) => {
		setStatusFilter(values.status || 'Tất cả');
		setServiceFilter(values.service || 'Tất cả');
		setVetFilter(values.vetName || 'Tất cả');
		setIsFilterModalOpen(false);
	};

	const handleResetFilters = () => {
		filterForm.resetFields();
		setStatusFilter('Tất cả');
		setServiceFilter('Tất cả');
		setVetFilter('Tất cả');
		setIsFilterModalOpen(false);
	};

	const getStatusBadge = (status: string, text: string) => {
		switch (status) {
			case 'confirmed': return <span className="status-badge badge-confirmed">{text}</span>;
			case 'pending': return <span className="status-badge badge-pending">{text}</span>;
			case 'completed': return <span className="status-badge badge-completed">{text}</span>;
			case 'cancelled': return <span className="status-badge badge-cancelled">{text}</span>;
			default: return <span className="status-badge badge-cancelled">{text}</span>;
		}
	};

	const TABS = ['Tất cả', 'Sáng', 'Chiều'];

	const displayedAppointments = appointments.filter(app => {
		// 1. Filter by Active Tab
		if (activeTab !== 'Tất cả') {
			const hour = new Date(app.scheduled_at).getHours();
			if (activeTab === 'Sáng' && hour >= 12) return false;
			if (activeTab === 'Chiều' && hour < 12) return false;
		}

		// 2. Filter by Date
		if (selectedDay !== null) {
			const appDate = new Date(app.scheduled_at);
			if (
				appDate.getFullYear() !== currentYear ||
				(appDate.getMonth() + 1) !== currentMonth ||
				appDate.getDate() !== selectedDay
			) {
				return false;
			}
		}
		
		return true;
	});

	const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
	const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
	const emptyDaysCount = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

	return (
		<div className="petcare-dashboard appointment-dashboard">
			{/* Top Bar matching dashboard */}
			<div className="pc-header">
				<div className="pc-header-left"></div>
				<div className="pc-header-center">
					<div className="pc-header-search">
						<Search size={18} strokeWidth={1.75} className="search-icon" />
						<input
							type="text"
							placeholder="Tìm kiếm lịch hẹn..."
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
						/>
					</div>
				</div>
				<div className="pc-header-actions">
					<HeaderProfile />
				</div>
			</div>

			<div className="appointment-content">
				{/* Header Section */}
				<div className="ap-header-row">
					<div className="ap-title-area">
						<h1>Lịch hẹn chăm sóc</h1>
						<p>Theo dõi và điều phối các lượt thăm khám trong ngày hôm nay.</p>
					</div>
					<div className="ap-action-area">
						<button
							className={`btn-outline ${(statusFilter !== 'Tất cả' || serviceFilter !== 'Tất cả' || vetFilter !== 'Tất cả') ? 'active-filter' : ''}`}
							onClick={() => setIsFilterModalOpen(true)}
						>
							<Filter size={16} />
							Lọc lịch hẹn {(statusFilter !== 'Tất cả' || serviceFilter !== 'Tất cả' || vetFilter !== 'Tất cả') && '•'}
						</button>
						<button className="btn-primary" onClick={() => setIsModalOpen(true)}>
							<Plus size={16} />
							Thêm lịch hẹn mới
						</button>
					</div>
				</div>

				{/* Stat Cards */}
				<div className="ap-stats-row">
					<div className="stat-card">
						<div className="stat-icon icon-yellow">
							<CalendarIcon size={24} />
						</div>
						<div className="stat-info">
							<span className="stat-label">TỔNG LỊCH HẸN HÔM NAY</span>
							<span className="stat-value">{stats.total}</span>
						</div>
					</div>
					<div className="stat-card">
						<div className="stat-icon icon-teal">
							<Clock size={24} />
						</div>
						<div className="stat-info">
							<span className="stat-label">ĐANG CHỜ</span>
							<span className="stat-value">{stats.pending}</span>
						</div>
					</div>
					<div className="stat-card">
						<div className="stat-icon icon-pink">
							<CheckCircle size={24} />
						</div>
						<div className="stat-info">
							<span className="stat-label">ĐÃ HOÀN THÀNH</span>
							<span className="stat-value">{stats.completed}</span>
						</div>
					</div>
				</div>

				{/* Layout 2 Columns */}
				<div className="ap-layout">
					{/* Left Column (70%) */}
					<div className="ap-col-left">
						<div className="table-card">
							<div className="table-tabs">
								{TABS.map(tab => (
									<button
										key={tab}
										className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
										onClick={() => setActiveTab(tab)}
									>
										{tab}
									</button>
								))}
							</div>

							<div className="table-wrapper">
								<div style={{ display: loading ? 'block' : 'none', textAlign: 'center', padding: '20px' }}>Đang tải...</div>
								<table className="ap-table" style={{ opacity: loading ? 0.5 : 1 }}>
									<thead>
										<tr>
											<th>THÚ CƯNG</th>
											<th>CHỦ SỞ HỮU</th>
											<th>BÁC SĨ</th>
											<th>DỊCH VỤ / GIỜ</th>
											<th>TRẠNG THÁI</th>
											<th>THAO TÁC</th>
										</tr>
									</thead>
									<tbody>
										{displayedAppointments.length > 0 ? displayedAppointments.map(item => (
											<tr key={item.id}>
												<td>
													<div className="cell-pet">
														<img src={item.pet?.avatar_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=150'} alt={item.pet?.name} />
														<div>
															<div className="pet-name">{item.pet?.name || 'Không rõ'}</div>
															<div className="pet-breed">{item.pet?.breed || 'Chưa rõ'}</div>
														</div>
													</div>
												</td>
												<td>
													<span className="cell-text">{item.owner?.full_name}</span>
												</td>
												<td>
													<span className="cell-text">{item.vet?.user?.full_name}</span>
												</td>
												<td>
													<div className="cell-service">
														<div className="service-name">{item.service?.name}</div>
														<div className="service-time">{new Date(item.scheduled_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
													</div>
												</td>
												<td>
													<div className="cell-status">
														{getStatusBadge(item.status, item.status === 'confirmed' ? 'Đã xác nhận' : item.status === 'pending' ? 'Chờ xác nhận' : item.status === 'completed' ? 'Hoàn thành' : 'Đã hủy')}
													</div>
												</td>
												<td>
													<div className="cell-actions">
														{item.status === 'pending' ? (
															<>
																<button className="btn-action btn-confirm" onClick={() => handleConfirmAppointment(item.id)}>Xác nhận</button>
																<button className="btn-action btn-text" onClick={() => handlePlaceholder('Sửa lịch hẹn')}>Sửa</button>
																<button className="btn-action btn-text" style={{ color: '#E11D48' }} onClick={() => handleCancelAppointment(item.id)}>Hủy</button>
															</>
														) : (
															<>
																<button className="btn-action btn-text" onClick={() => { setSelectedAppointment(item); setDetailModalOpen(true); }}>Chi tiết</button>
																{item.status === 'confirmed' && (
																	<button className="btn-action btn-text" style={{ color: '#E11D48' }} onClick={() => handleCancelAppointment(item.id)}>Hủy</button>
																)}
															</>
														)}
													</div>
												</td>
											</tr>
										)) : (
											<tr>
												<td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>Không có lịch hẹn nào.</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
						</div>
					</div>

					{/* Right Column (30%) */}
					<div className="ap-col-right">
						{/* Widget 1: Mini Calendar */}
						<div className="widget-card">
							<div className="calendar-header">
								<h3>Tháng {currentMonth}, {currentYear}</h3>
								<div className="calendar-nav">
									<button onClick={() => {
										if (currentMonth === 1) {
											setCurrentMonth(12);
											setCurrentYear(currentYear - 1);
										} else {
											setCurrentMonth(currentMonth - 1);
										}
										setSelectedDay(null);
									}}>&lt;</button>
									<button onClick={() => {
										if (currentMonth === 12) {
											setCurrentMonth(1);
											setCurrentYear(currentYear + 1);
										} else {
											setCurrentMonth(currentMonth + 1);
										}
										setSelectedDay(null);
									}}>&gt;</button>
								</div>
							</div>
							<div className="calendar-grid">
								<div className="cal-day-header">T2</div>
								<div className="cal-day-header">T3</div>
								<div className="cal-day-header">T4</div>
								<div className="cal-day-header">T5</div>
								<div className="cal-day-header">T6</div>
								<div className="cal-day-header">T7</div>
								<div className="cal-day-header">CN</div>

								{/* Dynamic days */}
								{Array(emptyDaysCount).fill(null).map((_, i) => (
									<div key={`empty-${i}`} className="cal-day empty"></div>
								))}
								{Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
									<div 
										key={day} 
										className={`cal-day ${selectedDay === day ? 'active' : ''}`}
										onClick={() => { 
											setSelectedDay(selectedDay === day ? null : day); 
										}}
										title={selectedDay === day ? "Bấm để bỏ chọn ngày" : `Xem lịch hẹn ngày ${day}`}
									>
										{day}
									</div>
								))}
							</div>
						</div>

						{/* Widget 2: Tip of the day */}
						<div className="widget-card tip-card">
							<h3>Mẹo hôm nay 🐾</h3>
							<p>
								"Sắp xếp lịch tiêm chủng vào buổi sáng giúp bác sĩ có nhiều
								thời gian theo dõi phản ứng sau tiêm hơn."
							</p>
							<a href="#">Xem thêm gợi ý &rarr;</a>
						</div>
					</div>
				</div>
			</div>

			{/* Modal Thêm lịch hẹn mới */}
			<Modal
				title={<h3>Thêm lịch hẹn mới 📅</h3>}
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
				<Form form={form} layout="vertical" onFinish={handleAddAppointment}>
					<Form.Item
						name="pet_id"
						label="Thú cưng"
						rules={[{ required: true, message: 'Vui lòng chọn thú cưng!' }]}
					>
						<Select placeholder="Chọn thú cưng">
							{pets.map(pet => (
								<Select.Option key={pet.id} value={pet.id}>
									{pet.name} ({pet.owner_name})
								</Select.Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item
						name="vet_id"
						label="Bác sĩ phụ trách"
						rules={[{ required: true, message: 'Vui lòng chọn bác sĩ!' }]}
					>
						<Select placeholder="Chọn bác sĩ">
							{vets.map(vet => (
								<Select.Option key={vet.vet_id} value={vet.vet_id}>
									{vet.full_name} - {vet.specialization}
								</Select.Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item
						name="service_id"
						label="Dịch vụ"
						rules={[{ required: true, message: 'Vui lòng chọn dịch vụ!' }]}
					>
						<Select placeholder="Chọn dịch vụ">
							{services.map(svc => (
								<Select.Option key={svc.id} value={svc.id}>
									{svc.name} - {svc.price.toLocaleString()}đ
								</Select.Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item
						name="scheduled_at"
						label="Ngày giờ hẹn"
						rules={[{ required: true, message: 'Vui lòng chọn ngày giờ!' }]}
					>
						<DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} placeholder="Chọn ngày và giờ" />
					</Form.Item>
					<Form.Item
						name="notes"
						label="Ghi chú thêm"
					>
						<Input.TextArea placeholder="Ví dụ: Thú cưng bị ho, cần kiểm tra kỹ..." />
					</Form.Item>
				</Form>
			</Modal>

			{/* Modal Lọc lịch hẹn */}
			<Modal
				title={<h3>Bộ lọc lịch hẹn 🔍</h3>}
				visible={isFilterModalOpen}
				onCancel={() => setIsFilterModalOpen(false)}
				footer={[
					<Button key="reset" onClick={handleResetFilters}>
						Xóa bộ lọc
					</Button>,
					<Button key="submit" type="primary" onClick={() => filterForm.submit()}>
						Áp dụng
					</Button>
				]}
				destroyOnClose
			>
				<Form
					form={filterForm}
					layout="vertical"
					onFinish={handleApplyFilters}
					initialValues={{
						status: statusFilter,
						service: serviceFilter,
						vetName: vetFilter
					}}
				>
					<Form.Item name="status" label="Trạng thái lịch hẹn">
						<Select>
							<Select.Option value="Tất cả">Tất cả</Select.Option>
							<Select.Option value="pending">Chờ xác nhận (Pending)</Select.Option>
							<Select.Option value="confirmed">Đã xác nhận (Confirmed)</Select.Option>
							<Select.Option value="completed">Hoàn thành (Completed)</Select.Option>
							<Select.Option value="cancelled">Đã hủy (Cancelled)</Select.Option>
						</Select>
					</Form.Item>
					<Form.Item name="service" label="Loại dịch vụ">
						<Select>
							<Select.Option value="Tất cả">Tất cả</Select.Option>
							<Select.Option value="Checkup">Khám tổng quát (Checkup)</Select.Option>
							<Select.Option value="Grooming">Làm đẹp (Grooming)</Select.Option>
							<Select.Option value="Vaccination">Tiêm phòng (Vaccination)</Select.Option>
						</Select>
					</Form.Item>
					<Form.Item name="vetName" label="Bác sĩ phụ trách">
						<Select>
							<Select.Option value="Tất cả">Tất cả</Select.Option>
							{vets.map(v => (
								<Select.Option key={v.vet_id} value={v.full_name}>{v.full_name}</Select.Option>
							))}
						</Select>
					</Form.Item>
				</Form>
			</Modal>

			{/* Modal Chi Tiết Lịch Hẹn */}
			<Modal
				title={<h3>Chi tiết lịch hẹn 📋</h3>}
				visible={detailModalOpen}
				onCancel={() => setDetailModalOpen(false)}
				footer={[
					<Button key="close" onClick={() => setDetailModalOpen(false)}>
						Đóng
					</Button>
				]}
				width={600}
				destroyOnClose
			>
				{selectedAppointment && (
					<Descriptions bordered column={1} labelStyle={{ width: '160px', fontWeight: 600 }}>
						<Descriptions.Item label="Mã lịch hẹn">
							{selectedAppointment.id.substring(0, 8).toUpperCase()}
						</Descriptions.Item>
						<Descriptions.Item label="Trạng thái">
							{getStatusBadge(selectedAppointment.status, 
								selectedAppointment.status === 'confirmed' ? 'Đã xác nhận' : 
								selectedAppointment.status === 'pending' ? 'Chờ xác nhận' : 
								selectedAppointment.status === 'completed' ? 'Hoàn thành' : 'Đã hủy')}
						</Descriptions.Item>
						<Descriptions.Item label="Thời gian">
							{new Date(selectedAppointment.scheduled_at).toLocaleString('vi-VN')}
						</Descriptions.Item>
						<Descriptions.Item label="Thú cưng">
							<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
								<img src={selectedAppointment.pet?.avatar_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=150'} alt="pet" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }} />
								<strong>{selectedAppointment.pet?.name}</strong> ({selectedAppointment.pet?.breed})
							</div>
						</Descriptions.Item>
						<Descriptions.Item label="Chủ sở hữu">
							{selectedAppointment.owner?.full_name} ({selectedAppointment.owner?.phone})
						</Descriptions.Item>
						<Descriptions.Item label="Bác sĩ phụ trách">
							{selectedAppointment.vet?.user?.full_name} - {selectedAppointment.vet?.specialization}
						</Descriptions.Item>
						<Descriptions.Item label="Dịch vụ">
							{selectedAppointment.service?.name} <Tag color="gold" style={{ marginLeft: 8 }}>{selectedAppointment.service?.price?.toLocaleString()}đ</Tag>
						</Descriptions.Item>
						<Descriptions.Item label="Ghi chú">
							{selectedAppointment.notes || 'Không có ghi chú'}
						</Descriptions.Item>
					</Descriptions>
				)}
			</Modal>
		</div>
	);
};

export default QuanLyLichHen;
