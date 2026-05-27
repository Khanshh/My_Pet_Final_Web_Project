import { Settings as LayoutSettings } from '@ant-design/pro-layout';

const Settings: LayoutSettings & {
	pwa?: boolean;
	logo?: string;
	borderRadiusBase: string;
	siderWidth: number;
} = {
	navTheme: 'light',
	primaryColor: '#8B7355',
	borderRadiusBase: '16px',
	layout: 'side',
	contentWidth: 'Fluid',
	fixedHeader: true,
	fixSiderbar: true,
	colorWeak: false,
	title: 'PetCare',
	pwa: false,
	logo: 'https://cdn-icons-png.flaticon.com/512/3565/3565860.png',
	iconfontUrl: '',
	headerTheme: 'light',
	headerHeight: 0,
	siderWidth: 240,
};

export default Settings;
