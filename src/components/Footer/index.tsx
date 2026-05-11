import { DefaultFooter } from '@ant-design/pro-layout';

export default () => {
	return (
		<DefaultFooter
			copyright={`2025 Bản quyền thuộc về Nhóm MyPet`}
			links={[
				{
					key: 'github',
					title: 'MyPet Shop',
					href: '#',
					blankTarget: true,
				},
			]}
			style={{ width: '100%' }}
		/>
	);
};
