import { AppModules, EModuleKey } from '@/services/base/constant';

const ipRoot = APP_CONFIG_IP_ROOT; // http://localhost:8080/ (từ .env)

// Ip Chính
const ip3 = ipRoot;

// Endpoints cho FastAPI Auth
const keycloakAuthority = '';
const keycloakUserInfoEndpoint = ipRoot + 'api/v1/auth/me';
const keycloakTokenEndpoint = ipRoot + 'api/v1/auth/refresh';

// Các cấu hình khác
const ipNotif = ipRoot + 'api/v1/notification';
const ipSlink = ipRoot + 'api/v1';
const currentRole = EModuleKey.CONNECT;
const oneSignalRole = EModuleKey.CONNECT;

export {
	ip3,
	ipNotif,
	ipSlink,
	currentRole,
	oneSignalRole,
	keycloakUserInfoEndpoint,
	keycloakTokenEndpoint,
	keycloakAuthority,
};
