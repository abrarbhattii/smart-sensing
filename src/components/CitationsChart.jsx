import { useEffect, useMemo, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import { aggregateCitationsByYear } from '../services/publicationsService';
import './CitationsChart.css';

const FONT_FAMILY = "Cambria, 'Hoefler Text', Georgia, 'Times New Roman', Times, serif";

function buildConfig({ labels, data }) {
    return {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Total citations',
                    data,
                    backgroundColor: 'rgba(44, 82, 130, 0.7)',
                    borderColor: 'rgb(44, 82, 130)',
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            font: { family: FONT_FAMILY },
            animation: {
                duration: 1400,
                easing: 'easeOutCubic',
                delay: (ctx) => (ctx.type === 'data' && ctx.mode === 'default' ? ctx.dataIndex * 120 : 0),
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    titleFont: { family: FONT_FAMILY },
                    bodyFont: { family: FONT_FAMILY },
                    callbacks: {
                        afterLabel: (ctx) => `Total: ${ctx.raw} citations`,
                    },
                },
            },
            scales: {
                x: {
                    title: { display: true, text: 'Year', font: { family: FONT_FAMILY } },
                    ticks: { font: { family: FONT_FAMILY } },
                    grid: { display: false },
                },
                y: { display: false, beginAtZero: true },
            },
        },
    };
}

export function CitationsChart({ papers }) {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);
    const series = useMemo(() => aggregateCitationsByYear(papers), [papers]);
    const seriesRef = useRef(series);
    const hasData = series.labels.length > 0;

    useEffect(() => {
        seriesRef.current = series;
        const chart = chartRef.current;
        if (!chart)
            return;
        chart.data.labels = series.labels;
        chart.data.datasets[0].data = series.data;
        chart.update();
    }, [series]);

    useEffect(() => {
        if (!canvasRef.current || !hasData)
            return;
        // Wait until the page has painted so the initial rise is visible instead of finishing during page load.
        let frame = requestAnimationFrame(() => {
            frame = requestAnimationFrame(() => {
                chartRef.current = new Chart(canvasRef.current, buildConfig(seriesRef.current));
            });
        });
        return () => {
            cancelAnimationFrame(frame);
            chartRef.current?.destroy();
            chartRef.current = null;
        };
    }, [hasData]);

    if (!hasData) {
        return <p className="citations-chart__empty">No publication years available for this section.</p>;
    }
    return (<canvas ref={canvasRef} role="img" aria-label="Bar chart of citations by year" id="citationsChartCanvas"/>);
}
