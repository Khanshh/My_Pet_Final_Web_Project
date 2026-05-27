import axios from '@/utils/axios';
import {
	ip3,
	ipNotif,
	keycloakTokenEndpoint,
	keycloakUserInfoEndpoint,
} from '@/utils/ip';
import type { ESettingKey } from './constant';
import type { ISetting } from './typing';

export async function getUserInfo() {
	return axios.get(keycloakUserInfoEndpoint);
}

export async function adminlogin(payload: { email?: string; password?: string }) {
	// Xoá dấu gạch chéo thừa nếu có ở đầu endpoint
	return axios.post(`${ip3}api/v1/auth/login`.replace(/([^:]\/)\/+/g, "$1"), payload);
}

export async function refreshAccesssToken(payload: { refreshToken: string }) {
	return axios.post(keycloakTokenEndpoint, { refresh_token: payload.refreshToken });
}

export async function getPermission() {
	// Hệ thống mới dùng RBAC trực tiếp từ JWT
	return [];
}

export async function initOneSignal(payload: { playerId: string }) {
	return axios.put(`${ipNotif}/one-signal/user`, payload);
}

export async function deleteOneSignal(data: { playerId: any }) {
	return axios.delete(`${ipNotif}/one-signal/user`, { data });
}

// Cài đặt

export async function getSettingByKey(key: ESettingKey, ip?: string) {
	return axios.get(`${ip ?? ip3}/setting/${key}/value`);
}

export async function putSetting(data: ISetting, ip?: string) {
	return axios.put(`${ip ?? ip3}/setting/value`, data);
}

export async function getByKey(key: ESettingKey, ip?: string) {
	return axios.get(`${ip ?? ip3}/setting/one`, { params: { condition: { key: key } } });
}

export async function updateSetting(id: string, payload: { key: ESettingKey; value: any }, ip?: string) {
	return axios.put(`${ip ?? ip3}/setting/${id}`, payload);
}

export async function createSetting(payload: { key: ESettingKey; value: any }, ip?: string) {
	return axios.post(`${ip ?? ip3}/setting`, payload);
}
