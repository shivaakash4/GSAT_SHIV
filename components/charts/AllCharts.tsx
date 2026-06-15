'use client';

import type { ChartConfiguration } from 'chart.js';
import type { AnalysisResult } from '@/services/grainAnalysisService';
import { generateKDE } from '@/services/grainAnalysisService';
import { useGrainStore } from '@/store/useGrainStore';
import ChartWrapper from './ChartWrapper';

interface AllChartsProps {
  result: AnalysisResult;
}

interface LabeledPoint {
  x: number;
  y: number;
  label: string;
}

const CHART_IDS = [
  'distribution-curve',
  'histogram-chart',
  'pie-chart',
  'classification-bar-chart',
  'phi-scale-chart',
  'frequency-curve',
  'density-curve',
];

function chartConfig(config: object): ChartConfiguration {
  return config as unknown as ChartConfiguration;
}

export function downloadAllCharts(): void {
  CHART_IDS.forEach((id) => {
    const canvas = document.getElementById(id) as HTMLCanvasElement | null;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${id}_export.png`;
    link.href = canvas.toDataURL('image/png', 1);
    link.click();
  });
}

export default function AllCharts({ result }: AllChartsProps) {
  const showOverlayCurve = useGrainStore(
    (state) => state.showOverlayCurve
  );
  const setShowOverlayCurve = useGrainStore(
    (state) => state.setShowOverlayCurve
  );
  const kdeBandwidth = useGrainStore((state) => state.kdeBandwidth);
  const setKdeBandwidth = useGrainStore(
    (state) => state.setKdeBandwidth
  );

  const labels = result.raw.map((row) =>
    row.isPan ? 'Pan' : row.phi.toFixed(1)
  );
  const weightPercents = result.raw.map((row) => row.weightPercent);
  const maxWeight = Math.max(...weightPercents);
  const curveData = result.raw
    .filter((row) => !row.isPan)
    .map((row) => ({ x: row.size, y: row.cumPassing }));
  if (curveData.length > 0) {
    curveData.unshift({ x: result.raw[0].size * 1.5, y: 100 });
  }

  const folkPoints: LabeledPoint[] = [
    {
      x: Math.pow(2, -result.percentiles.p5),
      y: 95,
      label: 'D95',
    },
    {
      x: Math.pow(2, -result.percentiles.p16),
      y: 84,
      label: 'D84',
    },
    {
      x: Math.pow(2, -result.percentiles.p50),
      y: 50,
      label: 'D50',
    },
    {
      x: Math.pow(2, -result.percentiles.p84),
      y: 16,
      label: 'D16',
    },
    {
      x: Math.pow(2, -result.percentiles.p95),
      y: 5,
      label: 'D5',
    },
  ];

  const distributionConfig = chartConfig({
    type: 'line',
    data: {
      datasets: [
        {
          label: 'Passing %',
          data: curveData,
          borderColor: '#374151',
          borderWidth: 2,
          tension: 0.2,
          datalabels: { display: false },
        },
        {
          label: 'Folk',
          type: 'scatter',
          data: folkPoints,
          backgroundColor: '#ef4444',
          pointRadius: 6,
          datalabels: {
            display: true,
            align: 'top',
            formatter: (value: LabeledPoint) => value.label,
            font: { weight: 'bold' },
          },
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'logarithmic',
          title: { display: true, text: 'Diameter (mm)' },
          ticks: {
            maxRotation: 0,
            callback: (value: string | number) => {
              const text = String(value);
              return /^[125]/.test(text) ? value : '';
            },
          },
        },
        y: {
          min: 0,
          max: 100,
          title: { display: true, text: 'Weight % Finer' },
        },
      },
    },
  });

  const histogramDatasets: object[] = [
    {
      label: 'Weight %',
      data: weightPercents,
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: '#3b82f6',
      borderWidth: 1,
      datalabels: {
        display: true,
        align: 'top',
        anchor: 'end',
        color: '#1e40af',
        formatter: (value: number) =>
          value === maxWeight && value > 0 ? 'MODE' : '',
      },
    },
  ];
  if (showOverlayCurve) {
    histogramDatasets.push({
      label: 'Trend',
      type: 'line',
      data: weightPercents,
      borderColor: '#1e293b',
      borderWidth: 2,
      tension: 0.4,
      pointRadius: 0,
      fill: false,
      datalabels: { display: false },
    });
  }

  const histogramConfig = chartConfig({
    type: 'bar',
    data: { labels, datasets: histogramDatasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { title: { display: true, text: 'Φ Scale' } },
        y: { title: { display: true, text: 'Weight %' }, grace: '20%' },
      },
    },
  });

  const pieConfig = chartConfig({
    type: 'pie',
    data: {
      labels: ['Gravel', 'Sand', 'Silt', 'Clay'],
      datasets: [
        {
          data: [
            result.gravel,
            result.sand,
            result.silt,
            result.clay,
          ],
          backgroundColor: ['#6699CC', '#BDB76B', '#E69F00', '#A0522D'],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        datalabels: {
          formatter: (value: number) =>
            value > 0 ? `${value.toFixed(1)}%` : '',
          color: '#fff',
          font: { weight: 'bold' },
        },
      },
    },
  });

  const compositionConfig = chartConfig({
    type: 'bar',
    data: {
      labels: ['Composition'],
      datasets: [
        {
          label: 'Gravel',
          data: [result.gravel],
          backgroundColor: '#6699CC',
          maxBarThickness: 40,
        },
        {
          label: 'Sand',
          data: [result.sand],
          backgroundColor: '#BDB76B',
          maxBarThickness: 40,
        },
        {
          label: 'Silt',
          data: [result.silt],
          backgroundColor: '#E69F00',
          maxBarThickness: 40,
        },
        {
          label: 'Clay',
          data: [result.clay],
          backgroundColor: '#A0522D',
          maxBarThickness: 40,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true },
        y: {
          stacked: true,
          min: 0,
          max: 100,
          title: { display: true, text: 'Percent (%)' },
        },
      },
      plugins: {
        datalabels: {
          formatter: (value: number) =>
            value > 3 ? `${value.toFixed(1)}%` : '',
          color: '#fff',
          font: { weight: 'bold' },
        },
      },
    },
  });

  const phiConfig = chartConfig({
    type: 'line',
    data: {
      labels: [
        (result.raw[0].phi - 1).toFixed(1),
        ...labels,
      ],
      datasets: [
        {
          data: [100, ...result.raw.map((row) => row.cumPassing)],
          borderColor: '#71717a',
          backgroundColor: '#71717a',
          tension: 0.4,
          datalabels: { display: false },
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        datalabels: { display: false },
        legend: { display: false },
      },
      scales: {
        x: { title: { display: true, text: 'Φ Scale' } },
        y: { title: { display: true, text: 'Weight % Finer' } },
      },
    },
  });

  const frequencyConfig = chartConfig({
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          data: weightPercents,
          borderColor: '#1e293b',
          backgroundColor: '#1e293b',
          tension: 0.4,
          datalabels: { display: false },
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        datalabels: { display: false },
        legend: { display: false },
      },
      scales: {
        x: { title: { display: true, text: 'Φ Scale' } },
        y: { title: { display: true, text: 'Weight %' } },
      },
    },
  });

  const densityConfig = chartConfig({
    type: 'line',
    data: {
      datasets: [
        {
          data: generateKDE(result.raw, kdeBandwidth),
          borderColor: '#1e293b',
          backgroundColor: 'rgba(30,41,59,0.4)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          datalabels: { display: false },
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        datalabels: { display: false },
        legend: { display: false },
      },
      scales: {
        x: {
          type: 'linear',
          title: { display: true, text: 'Φ Scale' },
        },
        y: { title: { display: true, text: 'Density Estimate' } },
      },
    },
  });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-4">
      <div className="bg-white p-6 rounded-xl shadow-lg xl:col-span-2">
        <h3 className="text-xl font-bold mb-4 text-center">
          Grain Size Distribution Curve (Arithmetic Log)
        </h3>
        <ChartWrapper
          id="distribution-curve"
          config={distributionConfig}
          height={500}
        />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 border-b pb-2 gap-2">
          <h3 className="text-xl font-bold">Weight % Histogram (Φ Scale)</h3>
          <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-100">
            <input
              type="checkbox"
              id="overlay-curve-toggle"
              checked={showOverlayCurve}
              onChange={(event) =>
                setShowOverlayCurve(event.target.checked)
              }
              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
            />
            <label
              htmlFor="overlay-curve-toggle"
              className="text-xs font-bold text-blue-800 cursor-pointer uppercase tracking-tight"
            >
              Overlay Curve
            </label>
          </div>
        </div>
        <ChartWrapper id="histogram-chart" config={histogramConfig} />
      </div>

      <ChartCard title="Sediment Classification (Pie)">
        <ChartWrapper id="pie-chart" config={pieConfig} />
      </ChartCard>

      <ChartCard title="Gravel-Sand-Silt-Clay Proportions">
        <ChartWrapper
          id="classification-bar-chart"
          config={compositionConfig}
        />
      </ChartCard>

      <ChartCard title="Weight % Finer vs. Φ Scale">
        <ChartWrapper id="phi-scale-chart" config={phiConfig} />
      </ChartCard>

      <ChartCard title="Frequency Curve (Φ)">
        <ChartWrapper id="frequency-curve" config={frequencyConfig} />
      </ChartCard>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 border-b pb-2 gap-2">
          <h3 className="text-xl font-bold">Kernel Density Estimate (Φ)</h3>
          <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded border border-gray-200">
            <label
              htmlFor="kde-bandwidth"
              className="text-xs font-bold text-gray-700 uppercase tracking-tight"
            >
              Bandwidth:
            </label>
            <input
              type="number"
              id="kde-bandwidth"
              value={kdeBandwidth}
              step="0.1"
              min="0.1"
              max="2"
              onChange={(event) =>
                setKdeBandwidth(
                  Math.min(
                    2,
                    Math.max(0.1, Number.parseFloat(event.target.value) || 0.5)
                  )
                )
              }
              className="w-16 border border-gray-300 rounded p-1 text-sm text-center font-bold"
            />
          </div>
        </div>
        <ChartWrapper id="density-curve" config={densityConfig} />
      </div>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-center">{title}</h3>
      {children}
    </div>
  );
}
