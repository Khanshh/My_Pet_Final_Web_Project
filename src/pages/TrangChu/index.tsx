import { Card } from 'antd';
import './components/style.less';
import { useModel } from 'umi';

const TrangChu = () => {
	const { data } = useModel('randomuser');

	return (
		<Card bodyStyle={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
			<div className='home-welcome'>
				<div className='welcome-logo'>🐾</div>
				<h1 className='title'>Chào mừng đến với MyPet!</h1>
				<h2 className='sub-title'>Hệ thống quản trị cửa hàng thú cưng hiện đại</h2>
				<div className='stats-brief'>
					<b>{data.length} khách hàng</b> đang hoạt động
				</div>
			</div>
		</Card>
	);
};

export default TrangChu;
