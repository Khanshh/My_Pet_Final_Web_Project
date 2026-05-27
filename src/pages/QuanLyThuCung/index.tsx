import React, { useState } from 'react';
import { Search, Plus, PawPrint, Trash2 } from 'lucide-react';
import { Modal, Form, Input, Select, message } from 'antd';
import '../TrangChu/components/style.less';
import HeaderProfile from '@/components/HeaderProfile';
import './style.less';

import { getPets, createPet, getOwners, User, deletePet } from '@/services/QuanLyPetStore';

const FILTER_TABS = ['Tất cả', 'Chó', 'Mèo', 'Khác'] as const;

const QuanLyThuCung: React.FC = () => {
	const [activeFilter, setActiveFilter] = useState<string>('Tất cả');
	const [pets, setPets] = useState<any[]>([]);
	const [owners, setOwners] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [form] = Form.useForm();

	const fetchData = async () => {
		setLoading(true);
		try {
			const [petData, ownerData] = await Promise.all([
				getPets({ species: activeFilter === 'Tất cả' ? undefined : activeFilter }),
				getOwners()
			]);
			setPets(petData);
			setOwners(ownerData);
		} catch (error) {
			message.error('Không thể tải dữ liệu');
		} finally {
			setLoading(false);
		}
	};

	React.useEffect(() => {
		fetchData();
	}, [activeFilter]);

	const handleAddPet = async (values: any) => {
		const success = await createPet({
			...values,
			avatar_url: values.imageUrl || '',
			date_of_birth: new Date(new Date().getFullYear() - (parseInt(values.age) || 0), 0, 1).toISOString().split('T')[0],
		});
		if (success) {
			setIsModalOpen(false);
			form.resetFields();
			fetchData();
		}
	};

	const handleDeletePet = (id: string, e: React.MouseEvent) => {
		e.stopPropagation();
		Modal.confirm({
			title: 'Xác nhận xóa',
			content: 'Bạn có chắc chắn muốn xóa thú cưng này khỏi hệ thống? Thao tác này không thể hoàn tác.',
			okText: 'Xóa',
			okType: 'danger',
			cancelText: 'Hủy',
			onOk: () => deletePet(id).then(fetchData),
		});
	};

	const getHealthBadgeClass = (health: string) => {
		switch (health) {
			case 'Khỏe mạnh': return 'badge-healthy';
			case 'Đến lịch khám': return 'badge-checkup';
			case 'Khẩn cấp': return 'badge-urgent';
			case 'Mới nhập': return 'badge-new';
			default: return 'badge-healthy';
		}
	};

	return (
		<div className="petcare-dashboard">
			{/* ─── Top Header Bar ─── */}
			<div className="pc-header">
				<div className="pc-header-left" />
				<div className="pc-header-center">
					<div className="pc-header-search">
						<Search size={18} strokeWidth={1.75} className="search-icon" />
						<input type="text" placeholder="Tìm kiếm thú cưng..." />
					</div>
				</div>
				<div className="pc-header-actions">
					<HeaderProfile />
				</div>
			</div>

			{/* ─── Page Content ─── */}
			<div className="pet-page-content">
				{/* ─── Page Title + Filter Row ─── */}
				<div className="pet-title-row">
					<div className="pet-title-left">
						<div className="pet-title-icon">
							<PawPrint size={22} strokeWidth={2.5} />
						</div>
						<div>
							<h1>Quản Lý Thú Cưng</h1>
							<p className="pet-subtitle">
								Tra cứu hồ sơ thú cưng, thông tin chủ nuôi và lịch sử bệnh án
							</p>
						</div>
					</div>
					<div className="pet-filter-pills">
						{FILTER_TABS.map((tab) => (
							<button
								key={tab}
								className={`filter-pill ${activeFilter === tab ? 'active' : ''}`}
								onClick={() => setActiveFilter(tab)}
							>
								{tab}
							</button>
						))}
					</div>
				</div>

				{/* ─── Pet Card Grid ─── */}
				<div className="pet-card-grid" style={{ opacity: loading ? 0.6 : 1 }}>
					{pets.map((pet, idx) => (
						<div
							className="pet-card"
							key={pet.id}
							style={{ position: 'relative', animationDelay: `${idx * 0.06}s` }}
						>
							<button
								className="pet-delete-btn"
								onClick={(e) => handleDeletePet(pet.id, e)}
								style={{
									position: 'absolute',
									top: 10,
									right: 10,
									zIndex: 10,
									background: 'rgba(255,255,255,0.8)',
									border: 'none',
									borderRadius: '50%',
									width: 32,
									height: 32,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									color: '#ef4444',
									cursor: 'pointer'
								}}
							>
								<Trash2 size={16} />
							</button>
							{/* Photo */}
							<div className="pet-card-photo">
								<img src={pet.avatar_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400&h=400'} alt={pet.name} />
								<span className={`health-badge ${getHealthBadgeClass('Khỏe mạnh')}`}>
									Khỏe mạnh
								</span>
							</div>

							{/* Info */}
							<div className="pet-card-body">
								<div className="pet-name-row">
									<span className="pet-name">{pet.name}</span>
									<span className={`gender-icon ${pet.gender === 'male' ? 'male' : 'female'}`}>
										{pet.gender === 'male' ? '♂' : '♀'}
									</span>
								</div>
								<span className="pet-breed">{pet.breed || 'Chưa rõ'} • {pet.species}</span>

								{/* Owner */}
								<div className="pet-owner-row">
									<img className="owner-avatar" src={pet.owner?.avatar_url || `https://i.pravatar.cc/150?u=${pet.owner_name}`} alt={pet.owner_name} />
									<div className="owner-text">
										<span className="owner-label">Chủ nuôi</span>
										<span className="owner-name">{pet.owner_name}</span>
									</div>
								</div>
							</div>
						</div>
					))}

					{/* ─── Add New Card ─── */}
					<div className="pet-card-add" onClick={() => setIsModalOpen(true)} style={{ cursor: 'pointer' }}>
						<div className="add-circle">
							<Plus size={28} strokeWidth={2.5} />
						</div>
						<span className="add-title">Thêm Thú Cưng Mới</span>
						<span className="add-desc">Đăng ký thú cưng mới vào cơ sở dữ liệu</span>
					</div>
				</div>
			</div>

			{/* ─── FAB ─── */}
			<button className="pet-fab" aria-label="Thêm thú cưng" onClick={() => setIsModalOpen(true)}>
				<Plus size={26} strokeWidth={3} />
			</button>

			{/* Modal Thêm thú cưng */}
			<Modal
				title={<h3>Đăng ký thú cưng mới 🐶</h3>}
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
				<Form form={form} layout="vertical" onFinish={handleAddPet}>
					<Form.Item
						name="name"
						label="Tên thú cưng"
						rules={[{ required: true, message: 'Vui lòng nhập tên thú cưng!' }]}
					>
						<Input placeholder="Ví dụ: Buddy" />
					</Form.Item>
					<Form.Item
						name="species"
						label="Loài"
						rules={[{ required: true, message: 'Vui lòng chọn loài!' }]}
						initialValue="Chó"
					>
						<Select>
							<Select.Option value="Chó">Chó 🐶</Select.Option>
							<Select.Option value="Mèo">Mèo 🐱</Select.Option>
							<Select.Option value="Khác">Khác 🐾</Select.Option>
						</Select>
					</Form.Item>
					<Form.Item
						name="breed"
						label="Giống"
						rules={[{ required: true, message: 'Vui lòng nhập giống thú cưng!' }]}
					>
						<Input placeholder="Ví dụ: Golden Retriever, Anh lông ngắn" />
					</Form.Item>
					<Form.Item
						name="age"
						label="Tuổi (năm)"
						rules={[{ required: true, message: 'Vui lòng nhập tuổi!' }]}
					>
						<Input type="number" placeholder="Ví dụ: 3" min={0} />
					</Form.Item>
					<Form.Item
						name="gender"
						label="Giới tính"
						rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
						initialValue="male"
					>
						<Select>
							<Select.Option value="male">Đực (♂)</Select.Option>
							<Select.Option value="female">Cái (♀)</Select.Option>
						</Select>
					</Form.Item>
					<Form.Item
						name="owner_id"
						label="Chủ nuôi"
						rules={[{ required: true, message: 'Vui lòng chọn chủ nuôi!' }]}
					>
						<Select placeholder="Chọn chủ sở hữu">
							{owners.map(owner => (
								<Select.Option key={owner.id} value={owner.id}>
									{owner.full_name} ({owner.email})
								</Select.Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item
						name="imageUrl"
						label="Đường dẫn ảnh thú cưng (URL)"
					>
						<Input placeholder="Tùy chọn. Để trống sẽ tự sinh ảnh ngẫu nhiên." />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default QuanLyThuCung;
