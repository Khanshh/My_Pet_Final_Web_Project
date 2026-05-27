import { type Login } from './typing';

export enum EModuleKey {
	CONNECT = 'cong-hoc-vien',
	CONG_CAN_BO = 'cong-can-bo',
	QLDT = 'quan-ly-dao-tao',
	CORE = 'danh-muc-chung',
	TCNS = 'to-chuc-nhan-su',
	CTSV = 'cong-tac-sinh-vien',
	VPS = 'van-phong-so',
	TC = 'tai-chinh',
	QLKH = 'quan-ly-khoa-hoc',
	KT = 'khao-thi',
	CSVC = 'co-so-vat-chat',
}

export const AppModules: Record<EModuleKey, Login.TModule> = {
	[EModuleKey.CONNECT]: {
		title: APP_CONFIG_TITLE_CONNECT,
		clientId: `mypet-connect`,
		url: 'http://localhost:8000',
		icon: EModuleKey.CONNECT + '.svg',
	},
	[EModuleKey.CONG_CAN_BO]: {
		title: APP_CONFIG_TITLE_CAN_BO,
		clientId: `mypet-connect`,
		url: 'http://localhost:8000',
		icon: EModuleKey.CONG_CAN_BO + '.svg',
	},
	[EModuleKey.CORE]: {
		title: 'Base',
		clientId: `mypet-core`,
		url: 'http://localhost:8000',
		icon: EModuleKey.CORE + '.svg',
	},
	[EModuleKey.QLDT]: {
		title: 'Đào tạo',
		clientId: `mypet-qldt`,
		url: 'http://localhost:8000',
		icon: EModuleKey.QLDT + '.svg',
	},
	[EModuleKey.TCNS]: {
		title: 'Nhân sự',
		clientId: `mypet-tcns`,
		url: 'http://localhost:8000',
		icon: EModuleKey.TCNS + '.svg',
	},
	[EModuleKey.CTSV]: {
		title: 'CTSV',
		clientId: `mypet-ctsv`,
		url: 'http://localhost:8000',
		icon: EModuleKey.CTSV + '.svg',
	},
	[EModuleKey.VPS]: {
		title: 'VPS',
		clientId: `mypet-vps`,
		url: 'http://localhost:8000',
		icon: EModuleKey.VPS + '.svg',
	},
	[EModuleKey.QLKH]: {
		title: 'QLKH',
		clientId: `mypet-qlkh`,
		url: 'http://localhost:8000',
		icon: EModuleKey.QLKH + '.svg',
	},
	[EModuleKey.TC]: {
		title: 'Tài chính',
		clientId: `mypet-tc`,
		url: 'http://localhost:8000',
		icon: EModuleKey.TC + '.svg',
	},
	[EModuleKey.KT]: {
		title: 'Khảo thí',
		clientId: `mypet-kt`,
		url: 'http://localhost:8000',
		icon: EModuleKey.KT + '.svg',
	},
	[EModuleKey.CSVC]: {
		title: 'CSVC',
		clientId: `mypet-csvc`,
		url: 'http://localhost:8000',
		icon: EModuleKey.CSVC + '.svg',
	},
};

export const moduleThuVien: Partial<Login.TModule> = {
	title: 'Thư viện',
	url: '#',
	icon: 'thu-vien.svg',
};

export const moduleQuanLyVanBan: Partial<Login.TModule> = {
	title: 'Văn bản',
	url: '#',
	icon: 'quan-ly-van-ban.svg',
};

export const moduleCongThongTin: Partial<Login.TModule> = {
	title: APP_CONFIG_TITLE_LANDING,
	url: APP_CONFIG_URL_LANDING,
	icon: 'cong-thong-tin.svg',
};

/** Đường link landing page */
export const landingUrl = APP_CONFIG_URL_LANDING;

/** Màu sắc chủ đạo */
export const primaryColor = APP_CONFIG_PRIMARY_COLOR;

/** Tên trường Học viện */
export const unitName = APP_CONFIG_TEN_TRUONG;

/** Cơ quan chủ quản của trường */
export const coQuanChuQuan = APP_CONFIG_CO_QUAN_CHU_QUAN;

/** Trường / Học viện */
export const unitPrefix = APP_CONFIG_TIEN_TO_TRUONG;

/** Tên tiếng anh của trường */
export const tenTruongVietTatTiengAnh = APP_CONFIG_TEN_TRUONG_VIET_TAT_TIENG_ANH;

/** Cài đặt hệ thống */
export enum ESettingKey {
	KEY = 'KEY',
}

/** Định dạng file */
export enum EDinhDangFile {
	WORD = 'word',
	EXCEL = 'excel',
	POWERPOINT = 'powerpoint',
	PDF = 'pdf',
	IMAGE = 'image',
	VIDEO = 'video',
	AUDIO = 'audio',
	TEXT = 'text',
	UNKNOWN = 'unknown',
}

export enum EScopeFile {
	PUBLIC = 'Public',
	INTERNAL = 'Internal',
	PRIVATE = 'Private',
}

export enum EStorageFile {
	DATABASE = 'Database',
	S3 = 'S3',
}
