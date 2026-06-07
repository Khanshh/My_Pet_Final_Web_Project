import { message } from 'antd';

// =============================================================================
//  SECTION 1 — INTERFACES & TYPES (Aligned with schema.sql)
// =============================================================================

export interface User {
	id: string;
	full_name: string;
	email: string;
	phone?: string;
	role: 'owner' | 'vet' | 'admin';
	is_active: boolean;
	avatar_url?: string;
	created_at: string;
	last_login_at?: string;
}

export interface Pet {
	id: string;
	owner_id: string;
	name: string;
	species: string; // Chó, Mèo, ...
	breed?: string;
	date_of_birth?: string;
	gender: 'male' | 'female' | 'unknown';
	avatar_url?: string;
	created_at: string;
}

export interface Veterinarian {
	id: string;
	user_id: string;
	specialization: string;
	bio?: string;
	certificate_url?: string;
	is_active: boolean;
}

export interface Appointment {
	id: string;
	owner_id: string;
	pet_id: string;
	vet_id: string; // references veterinarians.id
	service_id: string;
	scheduled_at: string;
	status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
	notes?: string;
	created_at: string;
}

export interface MedicalRecord {
	id: string;
	appointment_id: string;
	pet_id: string;
	vet_id: string; // references veterinarians.id
	diagnosis: string;
	treatment: string;
	prescription?: string;
	notes?: string;
	recorded_at: string;
}

export interface Payment {
	id: string;
	appointment_id: string;
	owner_id: string;
	amount: number;
	method: 'cash' | 'card' | 'online';
	status: 'pending' | 'paid' | 'refunded';
	transaction_id?: string;
	paid_at?: string;
}

export interface Service {
	id: string;
	name: string;
	description?: string;
	price: number;
	duration_minutes: number;
	is_active: boolean;
}

// =============================================================================
//  SECTION 4 — EXPORTED SERVICE FUNCTIONS (Promise-based for Easy API Swapping)
// =============================================================================

// =============================================================================
//  SECTION 4 — EXPORTED SERVICE FUNCTIONS (Promise-based for Easy API Swapping)
// =============================================================================

import axios from '@/utils/axios';
import { ip3 } from '@/utils/ip';

// ... (giữ lại các interfaces)

// --- DASHBOARD SERVICES ---

export const getDashboardStats = async (): Promise<any> => {
	const res = await axios.get(`${ip3}api/v1/admin/dashboard/stats`);
	return res.data;
};

export const exportReportAPI = async (params: { report_type: string, start_date?: string, end_date?: string, group_by: string }): Promise<any> => {
	const res = await axios.get(`${ip3}api/v1/admin/reports/export`, { params });
	return res.data;
};

// --- USER (OWNER) SERVICES ---

export const getOwners = async (role?: string): Promise<User[]> => {
	// Gọi API lấy danh sách user filter theo role
	const res = await axios.get(`${ip3}api/v1/admin/users`, {
		params: { role: role === 'Tất cả' ? undefined : role, limit: 100 }
	});
	return res.data.items;
};

export const toggleUserStatus = async (id: string, active: boolean): Promise<boolean> => {
	const endpoint = active ? 'unlock' : 'lock';
	try {
		await axios.patch(`${ip3}api/v1/admin/users/${id}/${endpoint}`);
		message.success(active ? 'Đã mở khóa tài khoản thành công!' : 'Đã khóa tài khoản thành công!');
		return true;
	} catch (error) {
		message.error('Thực hiện thao tác thất bại!');
		return false;
	}
};

export const getOwnerDetails = async (ownerId: string): Promise<{
	user: User | null;
	pets: Pet[];
	appointments: (Appointment & { pet_name: string; service_name: string; vet_name: string })[];
	payments: (Payment & { service_name: string })[];
}> => {
	try {
		const [userRes, petsRes, appointmentsRes, paymentsRes] = await Promise.all([
			axios.get(`${ip3}api/v1/admin/users/${ownerId}`),
			axios.get(`${ip3}api/v1/admin/users/${ownerId}/pets`),
			axios.get(`${ip3}api/v1/admin/appointments`, { params: { owner_id: ownerId, limit: 100 } }),
			axios.get(`${ip3}api/v1/admin/payments`, { params: { owner_id: ownerId, limit: 100 } }),
		]);

		const user = userRes.data;
		const pets = petsRes.data;
		const appointments = appointmentsRes.data.items.map((app: any) => ({
			...app,
			pet_name: app.pet?.name || 'Không rõ',
			service_name: app.service?.name || 'Dịch vụ lẻ',
			vet_name: app.vet?.user?.full_name || 'Bác sĩ trực ban',
		}));
		const payments = paymentsRes.data.items.map((pay: any) => ({
			...pay,
			service_name: pay.appointment?.service?.name || 'Thanh toán dịch vụ',
		}));

		return {
			user,
			pets,
			appointments,
			payments,
		};
	} catch (error) {
		console.error('Error fetching owner details:', error);
		return {
			user: null,
			pets: [],
			appointments: [],
			payments: [],
		};
	}
};

export const getAppointments = async (params?: {
	status?: string;
	owner_id?: string;
	search?: string;
	page?: number;
	limit?: number
}): Promise<any> => {
	const res = await axios.get(`${ip3}api/v1/admin/appointments`, { params });
	return res.data;
};

export const updateAppointmentStatus = async (id: string, status: string): Promise<boolean> => {
	try {
		await axios.patch(`${ip3}api/v1/admin/appointments/${id}/status`, { status });
		message.success('Cập nhật trạng thái lịch hẹn thành công!');
		return true;
	} catch (error) {
		return false;
	}
};

// --- PAYMENT SERVICES ---

export const getPayments = async (params?: {
	status?: string;
	owner_id?: string;
	page?: number;
	limit?: number
}): Promise<any> => {
	const res = await axios.get(`${ip3}api/v1/admin/payments`, { params });
	return res.data;
};

export const updatePaymentStatus = async (id: string, status: string, transactionId?: string): Promise<boolean> => {
	try {
		await axios.patch(`${ip3}api/v1/admin/payments/${id}/status`, { status, transaction_id: transactionId });
		message.success('Cập nhật trạng thái thanh toán thành công!');
		return true;
	} catch (error) {
		message.error('Cập nhật thanh toán thất bại!');
		return false;
	}
};

export const getServices = async (): Promise<Service[]> => {
	const res = await axios.get(`${ip3}api/v1/admin/services`, { params: { limit: 100 } });
	return res.data.items;
};

export const createService = async (data: any): Promise<boolean> => {
	try {
		await axios.post(`${ip3}api/v1/admin/services`, data);
		message.success('Thêm dịch vụ mới thành công!');
		return true;
	} catch (error) {
		message.error('Thêm dịch vụ thất bại!');
		return false;
	}
};

export const updateService = async (id: string, data: any): Promise<boolean> => {
	try {
		await axios.put(`${ip3}api/v1/admin/services/${id}`, data);
		message.success('Cập nhật dịch vụ thành công!');
		return true;
	} catch (error) {
		message.error('Cập nhật dịch vụ thất bại!');
		return false;
	}
};

export const deleteService = async (id: string): Promise<boolean> => {
	try {
		await axios.delete(`${ip3}api/v1/admin/services/${id}`);
		message.success('Xoá dịch vụ thành công!');
		return true;
	} catch (error) {
		message.error('Xoá dịch vụ thất bại!');
		return false;
	}
};

export const createOwner = async (data: any): Promise<boolean> => {
	try {
		await axios.post(`${ip3}api/v1/admin/users`, {
			...data,
		});
		message.success('Thêm người dùng mới thành công!');
		return true;
	} catch (error) {
		return false;
	}
};

// --- PET (VETERINARY MEDICAL PROFILE) SERVICES ---

export const getPets = async (filters?: { searchPet?: string; species?: string }): Promise<any[]> => {
	const res = await axios.get(`${ip3}api/v1/admin/pets`, {
		params: {
			search: filters?.searchPet,
			species: filters?.species === 'ALL' ? undefined : filters?.species,
			limit: 100
		}
	});

	// Backend trả về items có sẵn object owner
	return res.data.items.map((p: any) => ({
		...p,
		owner_name: p.owner?.full_name || 'Không rõ',
		owner_email: p.owner?.email || '',
		owner_phone: p.owner?.phone || '',
	}));
};

export const createPet = async (data: any): Promise<boolean> => {
	try {
		await axios.post(`${ip3}api/v1/admin/pets`, data);
		message.success('Thêm thú cưng mới thành công!');
		return true;
	} catch (error) {
		return false;
	}
};

export const deletePet = async (id: string): Promise<boolean> => {
	try {
		await axios.delete(`${ip3}api/v1/admin/pets/${id}`);
		message.success('Xoá thú cưng thành công!');
		return true;
	} catch (error) {
		return false;
	}
};

export const getPetMedicalRecords = async (petId: string): Promise<any> => {
	// Hiện tại mới chỉ có API xem chi tiết Pet, chưa có API xem hồ sơ bệnh án riêng.
	const res = await axios.get(`${ip3}api/v1/admin/pets/${petId}`);
	return {
		pet: res.data,
		owner: res.data.owner,
		records: []
	};
};

export const createAppointment = async (data: any): Promise<boolean> => {
	try {
		await axios.post(`${ip3}api/v1/admin/appointments`, data);
		message.success('Đặt lịch hẹn thành công!');
		return true;
	} catch (error) {
		return false;
	}
};

export const deleteAppointment = async (id: string): Promise<boolean> => {
	try {
		await axios.delete(`${ip3}api/v1/admin/appointments/${id}`);
		message.success('Xoá lịch hẹn thành công!');
		return true;
	} catch (error) {
		return false;
	}
};

// --- VET / DOCTOR SERVICES ---

export const getDoctors = async (): Promise<any[]> => {
	const res = await axios.get(`${ip3}api/v1/admin/vets`, { params: { limit: 100 } });
	return res.data.items.map((v: any) => ({
		...v.user,
		vet_id: v.id,
		specialization: v.specialization,
		bio: v.bio,
		certificate_url: v.certificate_url,
		is_active: v.is_active
	}));
};

export const createDoctor = async (data: any): Promise<boolean> => {
	try {
		await axios.post(`${ip3}api/v1/admin/vets`, data);
		message.success('Thêm bác sĩ thú y mới thành công!');
		return true;
	} catch (error) {
		return false;
	}
};

export const updateDoctor = async (vetId: string, data: any): Promise<boolean> => {
	try {
		await axios.put(`${ip3}api/v1/admin/vets/${vetId}`, data);
		message.success('Cập nhật thông tin bác sĩ thành công!');
		return true;
	} catch (error) {
		return false;
	}
};

export const deleteDoctor = async (vetId: string): Promise<boolean> => {
	try {
		await axios.delete(`${ip3}api/v1/admin/vets/${vetId}`);
		message.success('Đã xóa bác sĩ khỏi hệ thống!');
		return true;
	} catch (error) {
		return false;
	}
};

export const toggleDoctorStatus = async (vetId: string): Promise<boolean> => {
	try {
		await axios.patch(`${ip3}api/v1/admin/vets/${vetId}/toggle`);
		message.success('Đã thay đổi trạng thái hoạt động của bác sĩ!');
		return true;
	} catch (error) {
		return false;
	}
};

// --- AUTH / PROFILE SERVICES ---

export const getCurrentProfile = async (): Promise<User | null> => {
	try {
		const res = await axios.get(`${ip3}api/v1/auth/me`);
		return res.data;
	} catch (error) {
		return null;
	}
};

export const updateProfile = async (data: { full_name?: string; email?: string; phone?: string; password?: string; avatar_url?: string }): Promise<boolean> => {
	try {
		await axios.patch(`${ip3}api/v1/auth/me`, data);
		message.success('Cập nhật hồ sơ thành công!');
		return true;
	} catch (error) {
		message.error('Cập nhật hồ sơ thất bại!');
		return false;
	}
};

// --- OWNER PORTAL SERVICES ---

export const getMyPets = async (): Promise<Pet[]> => {
	const res = await axios.get(`${ip3}api/v1/owner/pets`);
	return res.data;
};

export const createMyPet = async (data: any): Promise<boolean> => {
	try {
		await axios.post(`${ip3}api/v1/owner/pets`, data);
		message.success('Đăng ký thú cưng thành công! 🐾');
		return true;
	} catch (error) {
		return false;
	}
};

export const updateMyPet = async (id: string, data: any): Promise<boolean> => {
	try {
		await axios.put(`${ip3}api/v1/owner/pets/${id}`, data);
		message.success('Cập nhật thông tin bé thành công! ✨');
		return true;
	} catch (error) {
		message.error('Cập nhật thất bại!');
		return false;
	}
};

export const deleteMyPet = async (id: string): Promise<boolean> => {
	try {
		await axios.delete(`${ip3}api/v1/owner/pets/${id}`);
		message.success('Đã xóa hồ sơ bé khỏi hệ thống! 👋');
		return true;
	} catch (error) {
		message.error('Xoá thất bại!');
		return false;
	}
};

export const getMyAppointments = async (): Promise<Appointment[]> => {
	const res = await axios.get(`${ip3}api/v1/owner/appointments`);
	return res.data;
};

export const cancelMyAppointment = async (id: string): Promise<boolean> => {
	try {
		await axios.delete(`${ip3}api/v1/owner/appointments/${id}`);
		message.success('Đã hủy lịch hẹn thành công!');
		return true;
	} catch (error) {
		message.error('Hủy lịch hẹn thất bại!');
		return false;
	}
};

export const bookAppointment = async (data: any): Promise<boolean> => {
	try {
		await axios.post(`${ip3}api/v1/owner/appointments`, data);
		message.success('Đặt lịch hẹn thành công! 📅');
		return true;
	} catch (error) {
		return false;
	}
};

export const getMyMedicalRecords = async (): Promise<any[]> => {
	const res = await axios.get(`${ip3}api/v1/owner/medical-records`);
	return res.data;
};

export const getMyPayments = async (): Promise<Payment[]> => {
	const res = await axios.get(`${ip3}api/v1/owner/payments`);
	return res.data;
};

export const getOwnerServices = async (): Promise<Service[]> => {
	const res = await axios.get(`${ip3}api/v1/owner/services`, { params: { limit: 100 } });
	return res.data.items;
};

export const getOwnerVets = async (): Promise<any[]> => {
	const res = await axios.get(`${ip3}api/v1/owner/vets`, { params: { limit: 100 } });
	return res.data.items.map((v: any) => ({
		...v.user,
		vet_id: v.id,
		specialization: v.specialization,
		bio: v.bio,
		certificate_url: v.certificate_url,
		is_active: v.is_active
	}));
};

export const uploadFile = async (file: File): Promise<string | null> => {
	const formData = new FormData();
	formData.append('file', file);
	try {
		const res = await axios.post(`${ip3}api/v1/upload/file`, formData, {
			headers: { 'Content-Type': 'multipart/form-data' }
		});
		return res.data.data.url;
	} catch (error) {
		message.error('Tải ảnh lên thất bại!');
		return null;
	}
};
