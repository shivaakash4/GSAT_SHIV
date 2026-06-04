'use client';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import type { AnalysisResult } from '@/services/grainAnalysisService';
import { boldAxisOptions, boxBorderPlugin, projectionLinesPlugin } from '@/lib/chartPlugins';
import { BASE_FONT_SIZE, CHART_COLORS, PHI_POINTS, SANS_SERIF_STACK } from '@/constants/sieve';

const ChartWrapper = dynamic(() => import('./ChartWrapper'), { ssr: false });

interface AllChartsProps {
  result: AnalysisResult;
  showOverlayCurve: boolean;
}

const CHART_IDS = [
  { id: 'distribution-curve',      label: 'Grain_Size_Distribution_Curve' },
  { id: 'histogram-chart',         label: 'Weight_Percent_Histogram' },
  { id: 'pie-chart',               label: 'Sediment_Classification_Pie' },
  { id: 'classification-bar-chart',label: 'Gravel_Sand_Fines_Bar' },
  { id: 'phi-scale-chart',         label: 'Weight_Finer_vs_Phi' },
  { id: 'frequency-curve',         label: 'Frequency_Curve_Phi' },
  { id: 'density-curve',           label: 'Kernel_Density_Estimate' },
];

export function downloadAllCharts() {
  CHART_IDS.forEach(({ id, label }) => {
    const canvas = document.getElementById(id) as HTMLCanvasElement | null;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${label}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
}

export default function AllCharts({ result, showOverlayCurve }: AllChartsProps) {
  const { weightPercent, cumulativePassingPercent, p5, p16, p50, p84, p95 } = result;
  const histData   = [...weightPercent].reverse();
  const currentMax = Math.max(...histData);

  const distributionConfig: any = {
    type: 'line',
    plugins: [boxBorderPlugin, projectionLinesPlugin],
    data: {
      datasets: [
        {
          label: 'Curve',
          data: [16, 8, 4, 2, 1, 0.5, 0.25, 0.125, 0.062, 0.031].map((s, idx) => ({
            x: s, y: [100, ...cumulativePassingPercent][idx],
          })),
          borderColor: CHART_COLORS.curve, borderWidth: 2, tension: 0.3, pointRadius: 0,
          datalabels: { display: false },
        },
        {
          label: 'Folk',
          type: 'scatter',
          data: [
            { x: Math.pow(2, -p5),  y: 95, label: 'D95' },
            { x: Math.pow(2, -p16), y: 84, label: 'D84' },
            { x: Math.pow(2, -p50), y: 50, label: 'D50' },
            { x: Math.pow(2, -p84), y: 16, label: 'D16' },
            { x: Math.pow(2, -p95), y: 5,  label: 'D5'  },
          ].filter(p => !isNaN(p.x)),
          backgroundColor: '#000', pointRadius: 6,
          datalabels: {
            display: true, align: 'top',
            font: { weight: 'bold', size: BASE_FONT_SIZE, family: SANS_SERIF_STACK },
            formatter: (v: any) => v.label,
          },
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, datalabels: { display: false } },
      scales: {
        x: {
          ...boldAxisOptions('Diameter (mm)'), type: 'logarithmic', min: 0.01, max: 20,
          afterBuildTicks: (a: any) => { a.ticks = [0.01, 0.1, 1, 10].map(v => ({ value: v })); },
          ticks: { callback: (v: any) => v.toString() },
        },
        y: { ...boldAxisOptions('Weight % Finer'), min: 0, max: 100 },
      },
      responsive: true, maintainAspectRatio: false,
    },
  };

  const histConfig: any = {
    type: 'bar',
    plugins: [boxBorderPlugin],
    data: {
      labels: ['>4', '4', '3', '2', '1', '0', '-1', '-2', '-3'],
      datasets: [
        {
          label: 'Freq', data: histData,
          backgroundColor: CHART_COLORS.hist, borderColor: CHART_COLORS.histBorder, borderWidth: 1,
          datalabels: {
            display: true, align: 'top', anchor: 'end', offset: 5, clip: false,
            font: { weight: 'bold', size: BASE_FONT_SIZE, family: SANS_SERIF_STACK },
            color: '#1e40af',
            formatter: (v: number) => (v === currentMax && v > 0) ? 'MODE' : '',
          },
        },
        ...(showOverlayCurve ? [{
          label: 'Trend', type: 'line', data: histData,
          borderColor: '#1e293b', borderWidth: 1.5, tension: 0.4, pointRadius: 0, fill: false,
          datalabels: { display: false },
        }] : []),
      ],
    },
    options: {
      animation: false,
      layout: { padding: { right: 40, top: 20 } },
      plugins: { legend: { display: false }, datalabels: { display: false } },
      scales: {
        x: boldAxisOptions('Φ Scale', false, false, true),
        y: { ...boldAxisOptions('Weight %'), grace: '45%' },
      },
      responsive: true, maintainAspectRatio: false,
    },
  };

  const pieConfig: any = {
    type: 'pie',
    data: {
      labels: ['Gravel', 'Sand', 'Fines'],
      datasets: [{
        data: [
          weightPercent.slice(0, 3).reduce((a, b) => a + b, 0),
          weightPercent.slice(3, 8).reduce((a, b) => a + b, 0),
          weightPercent[8],
        ],
        backgroundColor: [CHART_COLORS.gravel, CHART_COLORS.sand, CHART_COLORS.fines],
        borderColor: '#fff', borderWidth: 2,
        datalabels: {
          display: true,
          font: { weight: 'bold', size: BASE_FONT_SIZE, family: SANS_SERIF_STACK },
          formatter: (v: number) => v > 0 ? v.toFixed(1) + '%' : '',
        },
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { labels: { font: { weight: 'bold', family: SANS_SERIF_STACK } } },
        datalabels: { display: true },
      },
    },
  };

  const barConfig: any = {
    type: 'bar',
    data: {
      labels: ['Composition'],
      datasets: [
        {
          label: 'Gravel',
          data: [weightPercent.slice(0, 3).reduce((a, b) => a + b, 0)],
          backgroundColor: CHART_COLORS.gravel, maxBarThickness: 60,
          datalabels: {
            anchor: 'center', align: 'center',
            font: { weight: 'bold', size: BASE_FONT_SIZE, family: SANS_SERIF_STACK },
            formatter: (v: number) => v > 3 ? v.toFixed(1) + '%' : '',
          },
        },
        {
          label: 'Sand',
          data: [weightPercent.slice(3, 8).reduce((a, b) => a + b, 0)],
          backgroundColor: CHART_COLORS.sand, maxBarThickness: 60,
          datalabels: {
            anchor: 'center', align: 'center',
            font: { weight: 'bold', size: BASE_FONT_SIZE, family: SANS_SERIF_STACK },
            formatter: (v: number) => v > 3 ? v.toFixed(1) + '%' : '',
          },
        },
        {
          label: 'Fines',
          data: [weightPercent[8]],
          backgroundColor: CHART_COLORS.fines, maxBarThickness: 60,
          datalabels: {
            anchor: 'center', align: 'center',
            font: { weight: 'bold', size: BASE_FONT_SIZE, family: SANS_SERIF_STACK },
            formatter: (v: number) => v > 3 ? v.toFixed(1) + '%' : '',
          },
        },
      ],
    },
    options: {
      plugins: {
        legend: { display: true, position: 'bottom', labels: { font: { weight: 'bold', family: SANS_SERIF_STACK } } },
        datalabels: { display: true },
      },
      scales: {
        x: boldAxisOptions('Total', false, true, true),
        y: { ...boldAxisOptions('Percent', false, true), min: 0, max: 100 },
      },
      responsive: true, maintainAspectRatio: false,
    },
  };

  const makeLineConfig = (id: string, yLabel: string, data: number[], labels: number[]): any => {
    const color = id.includes('phi') ? CHART_COLORS.phi : CHART_COLORS.dark;
    const isDensity = id === 'density-curve';
    return {
      type: 'line',
      plugins: [boxBorderPlugin],
      data: {
        labels,
        datasets: [{
          data, borderColor: color,
          backgroundColor: isDensity ? 'rgba(30,41,59,0.4)' : color,
          pointRadius: isDensity ? 0 : 4,
          pointBackgroundColor: color, pointBorderColor: color,
          borderWidth: 3, tension: 0.4, fill: isDensity,
          datalabels: { display: false },
        }],
      },
      options: {
        plugins: { legend: { display: false }, datalabels: { display: false } },
        scales: {
          x: { ...boldAxisOptions('Φ Scale', true, false, true), ticks: { autoSkip: false, maxRotation: 0, minRotation: 0 } },
          y: boldAxisOptions(yLabel),
        },
        responsive: true, maintainAspectRatio: false,
      },
    };
  };

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Charts grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg xl:col-span-2">
          <h3 className="text-xl font-bold mb-4 text-center">Grain Size Distribution Curve (Arithmetic Log)</h3>
          <ChartWrapper id="distribution-curve" config={distributionConfig} height={420} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-center">Weight % Histogram (Φ Scale)</h3>
          <ChartWrapper id="histogram-chart" config={histConfig} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-center">Sediment Classification (Pie)</h3>
          <ChartWrapper id="pie-chart" config={pieConfig} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-center">Gravel-Sand-Fines Proportions</h3>
          <ChartWrapper id="classification-bar-chart" config={barConfig} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-center">Weight % Finer vs. Φ Scale</h3>
          <ChartWrapper id="phi-scale-chart" config={makeLineConfig('phi-scale-chart', 'Weight % Finer', [100, ...cumulativePassingPercent], [-4, ...PHI_POINTS])} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-center">Frequency Curve (Φ)</h3>
          <ChartWrapper id="frequency-curve" config={makeLineConfig('frequency-curve', 'Weight %', weightPercent, PHI_POINTS)} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-center">Kernel Density Estimate (Φ)</h3>
          <ChartWrapper id="density-curve" config={makeLineConfig('density-curve', 'Density (wt % per Φ)', weightPercent, PHI_POINTS)} />
        </div>
      </div>
    </div>
  );
}
