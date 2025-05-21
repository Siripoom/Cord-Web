// SalesComparisonChart.jsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import dayjs from 'dayjs';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SalesComparisonChart = ({ data, selectedRange }) => {
    const chartData = {
        labels: data.map(item => item.date),
        datasets: [
            {
                label: 'ลูกค้า',
                data: data.map(item => item.customer),
                backgroundColor: '#3f8600',
                borderRadius: 6,
            },
            {
                label: 'ซัพพลายเออร์',
                data: data.map(item => item.supplier),
                backgroundColor: '#cf1322',
                borderRadius: 6,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: `ยอดขายรายวัน (${dayjs().month(parseInt(selectedRange) - 1).format("MMMM")})`,
                font: { size: 18 },
            },
            tooltip: {
                callbacks: {
                    label: (context) =>
                        `${context.dataset.label}: ${context.raw.toLocaleString()} บาท`,
                },
            },
        },
        scales: {
            y: {
                ticks: {
                    beginAtZero: true,
                    callback: (value) => `${value.toLocaleString()} บาท`,
                },
            },
            x: {
                ticks: {
                    maxRotation: 60,
                    minRotation: 30,
                },
            },
        },
    };

    return <Bar data={chartData} options={chartOptions} style={{ width: "800px", height: "300px" }} />;
};


export default SalesComparisonChart;
