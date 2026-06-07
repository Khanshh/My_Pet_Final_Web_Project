import React, { useState } from 'react';
import { Modal, Form, Select, DatePicker, Button, message } from 'antd';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import { exportReportAPI } from '@/services/QuanLyPetStore';

const { RangePicker } = DatePicker;

interface ExportReportModalProps {
    visible: boolean;
    onCancel: () => void;
}

const ExportReportModal: React.FC<ExportReportModalProps> = ({ visible, onCancel }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const reportType = values.report_type;
            const startDate = values.date_range ? values.date_range[0].format('YYYY-MM-DD') : undefined;
            const endDate = values.date_range ? values.date_range[1].format('YYYY-MM-DD') : undefined;
            const groupBy = values.group_by || 'day';

            const data = await exportReportAPI({
                report_type: reportType,
                start_date: startDate,
                end_date: endDate,
                group_by: groupBy
            });

            const workbook = XLSX.utils.book_new();

            if (reportType === 'revenue_appointments') {
                const revenueSheet = XLSX.utils.json_to_sheet(data.revenue);
                XLSX.utils.book_append_sheet(workbook, revenueSheet, 'Doanh thu');

                const apptSheet = XLSX.utils.json_to_sheet(data.appointments);
                XLSX.utils.book_append_sheet(workbook, apptSheet, 'Lịch hẹn');
            } else if (reportType === 'users_vets') {
                const usersSheet = XLSX.utils.json_to_sheet(data.new_users);
                XLSX.utils.book_append_sheet(workbook, usersSheet, 'Người dùng mới');

                const vetsSheet = XLSX.utils.json_to_sheet(data.new_vets);
                XLSX.utils.book_append_sheet(workbook, vetsSheet, 'Bác sĩ mới');
            } else if (reportType === 'doctors_list') {
                const mappedData = data.map((vet: any) => ({
                    'ID Bác sĩ': vet.id,
                    'Họ và tên': vet.full_name,
                    'Email': vet.email,
                    'Số điện thoại': vet.phone,
                    'Chuyên khoa': vet.specialization || 'Không có',
                    'Số lịch hẹn hoàn thành': vet.completed_appointments || 0
                }));
                const doctorsSheet = XLSX.utils.json_to_sheet(mappedData);
                // Canh lề và in đậm tiêu đề (cơ bản của xlsx)
                const wscols = [
                    { wch: 36 }, { wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 30 }, { wch: 25 }
                ];
                doctorsSheet['!cols'] = wscols;

                XLSX.utils.book_append_sheet(workbook, doctorsSheet, 'Danh sách Bác sĩ');
            }

            const fileName = `Bao_Cao_${reportType}_${dayjs().format('YYYY-MM-DD')}.xlsx`;
            XLSX.writeFile(workbook, fileName);
            message.success('Xuất báo cáo thành công!');
            onCancel();
        } catch (error) {
            console.error(error);
            message.error('Lỗi khi xuất báo cáo!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={<h3 style={{ margin: 0 }}>Xuất Báo Cáo Tùy Chọn</h3>}
            visible={visible}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Hủy
                </Button>,
                <Button key="export" type="primary" loading={loading} onClick={handleExport} style={{ background: '#2A3D33' }}>
                    Xác nhận xuất
                </Button>
            ]}
        >
            <Form form={form} layout="vertical" style={{ marginTop: '20px' }}>
                <Form.Item
                    name="report_type"
                    label="Loại báo cáo"
                    rules={[{ required: true, message: 'Vui lòng chọn loại báo cáo!' }]}
                >
                    <Select placeholder="Chọn loại dữ liệu xuất">
                        <Select.Option value="revenue_appointments">Thống kê Doanh thu & Lịch hẹn</Select.Option>
                        <Select.Option value="users_vets">Thống kê Người dùng & Bác sĩ mới</Select.Option>
                        <Select.Option value="doctors_list">Danh sách Bác sĩ hiện tại</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) => prevValues.report_type !== currentValues.report_type}
                >
                    {({ getFieldValue }) => {
                        const isDoctorList = getFieldValue('report_type') === 'doctors_list';
                        if (isDoctorList) return null;
                        return (
                            <>
                                <Form.Item
                                    name="date_range"
                                    label="Khoảng thời gian"
                                    rules={[{ required: true, message: 'Vui lòng chọn khoảng thời gian!' }]}
                                >
                                    <RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                                </Form.Item>

                                <Form.Item
                                    name="group_by"
                                    label="Định dạng hiển thị"
                                    initialValue="day"
                                >
                                    <Select>
                                        <Select.Option value="day">Theo Ngày</Select.Option>
                                        <Select.Option value="month">Theo Tháng</Select.Option>
                                        <Select.Option value="year">Theo Năm</Select.Option>
                                    </Select>
                                </Form.Item>
                            </>
                        );
                    }}
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ExportReportModal;
