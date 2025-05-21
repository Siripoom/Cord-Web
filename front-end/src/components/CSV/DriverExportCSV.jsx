import React, { forwardRef } from 'react';
import { CSVLink } from 'react-csv';

const DriverExportCSV = forwardRef(({ data }, ref) => {
    const headers = [
        { label: 'ชื่อ', key: 'name' },
        { label: 'เลขใบขับขี่', key: 'licenseNo' },
        { label: 'ประเภทใบขับขี่', key: 'licenseType' },
        { label: 'วันหมดอายุใบขับขี่', key: 'licenseExpire' },
        { label: 'เบอร์โทรศัพท์', key: 'phone' },
        { label: 'วันเกิด', key: 'birthDay' },
        { label: 'วันเริ่มงาน', key: 'workStart' },
        { label: 'ที่อยู่', key: 'address' },

    ];

    const formattedData = data.map((item) => ({
        ...item,
        licenseExpire: item.licenseExpire ? new Date(item.licenseExpire).toLocaleDateString() : '',
        birthDay: item.birthDay ? new Date(item.birthDay).toLocaleDateString() : '',
        workStart: item.workStart ? new Date(item.workStart).toLocaleDateString() : '',
    }));

    return (
        <CSVLink
            data={formattedData}
            headers={headers}
            filename="รายชื่อคนขับ.csv"
            className="hidden"
            ref={ref}
        >
            ดาวน์โหลด CSV คนขับ
        </CSVLink>
    );
});

export default DriverExportCSV;
