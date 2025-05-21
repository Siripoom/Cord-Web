import React, { forwardRef } from 'react';
import { CSVLink } from 'react-csv';

const VehicleExportCSV = forwardRef(({ data }, ref) => {
    const headers = [
        { label: 'ทะเบียนรถ', key: 'plateNumber' },
        { label: 'รุ่นรถ', key: 'model' },
        { label: 'ประเภทรถ', key: 'type' },
        { label: 'เลขไมล์ (กม.)', key: 'capacity' },
    ];

    const formattedData = data.map((item) => ({
        ...item
    }));

    return (
        <CSVLink
            data={formattedData}
            headers={headers}
            filename="รายการรถ.csv"
            className="hidden"
            ref={ref}
        >
            ดาวน์โหลด CSV รถ
        </CSVLink>
    );
});

export default VehicleExportCSV;
