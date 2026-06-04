'use client';
import { useEffect, useRef } from 'react';
import {
  Chart,
  ChartConfiguration,
  // Controllers
  LineController, BarController, PieController, ScatterController,
  // Scales
  CategoryScale, LinearScale, LogarithmicScale,
  // Elements
  PointElement, LineElement, BarElement, ArcElement,
  // Plugins
  Title, Tooltip, Legend, Filler,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { SANS_SERIF_STACK, BASE_FONT_SIZE } from '@/constants/sieve';

Chart.register(
  // Controllers — required for each chart type used
  LineController, BarController, PieController, ScatterController,
  // Scales
  CategoryScale, LinearScale, LogarithmicScale,
  // Elements
  PointElement, LineElement, BarElement, ArcElement,
  // Plugins
  Title, Tooltip, Legend, Filler,
  // Datalabels
  ChartDataLabels,
);

Chart.defaults.font.family = SANS_SERIF_STACK;
Chart.defaults.font.size   = BASE_FONT_SIZE;
Chart.defaults.color       = '#000000';

interface ChartWrapperProps {
  id: string;
  config: ChartConfiguration;
  height?: number;
}

export default function ChartWrapper({ id, config, height = 400 }: ChartWrapperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef  = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    chartRef.current?.destroy();
    chartRef.current = new Chart(canvasRef.current, config as ChartConfiguration);
    return () => { chartRef.current?.destroy(); };
  }, [config]);

  return (
    <div style={{ position: 'relative', height, width: '100%' }}>
      <canvas ref={canvasRef} id={id} />
    </div>
  );
}
