import type { Plugin } from 'chart.js';
import { BASE_AXIS_WIDTH, SANS_SERIF_STACK, BASE_FONT_SIZE } from '@/constants/sieve';

export const boxBorderPlugin: Plugin = {
  id: 'boxBorder',
  beforeDraw: (chart) => {
    const { ctx, chartArea: { left, top, right, bottom } } = chart;
    const scale = (chart.options as any).exportScale || 1;
    const lw = BASE_AXIS_WIDTH * scale;
    ctx.save();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = lw;
    ctx.lineCap = 'square';
    ctx.lineJoin = 'miter';
    ctx.beginPath();
    ctx.moveTo(left, top + lw / 2);
    ctx.lineTo(right - lw / 2, top + lw / 2);
    ctx.lineTo(right - lw / 2, bottom);
    ctx.stroke();
    ctx.restore();
  },
};

export const projectionLinesPlugin: Plugin = {
  id: 'projectionLines',
  beforeDraw: (chart) => {
    if (chart.canvas.id !== 'distribution-curve') return;
    const { ctx, scales: { x, y } } = chart as any;
    const dataset = chart.data.datasets.find((ds: any) => ds.label === 'Folk');
    if (!dataset?.data) return;
    const scale = (chart.options as any).exportScale || 1;
    ctx.save();
    ctx.setLineDash([4 * scale, 4 * scale]);
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 1 * scale;
    (dataset.data as any[]).forEach((point) => {
      if (isNaN(point.x) || isNaN(point.y)) return;
      const px = x.getPixelForValue(point.x);
      const py = y.getPixelForValue(point.y);
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x.left, py);  ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, y.bottom); ctx.stroke();
    });
    ctx.restore();
  },
};

export const boldAxisOptions = (
  titleText: string,
  reverse = false,
  stacked = false,
  offset = false,
) => ({
  title: { display: true, text: titleText, color: '#000', font: { weight: 'bold' as const, size: BASE_FONT_SIZE, family: SANS_SERIF_STACK } },
  ticks: { display: true, color: '#000', font: { weight: 'bold' as const, size: BASE_FONT_SIZE, family: SANS_SERIF_STACK }, maxRotation: 0, minRotation: 0 },
  border: { display: true, width: BASE_AXIS_WIDTH, color: '#000' },
  grid: { display: true, drawOnChartArea: false, drawTicks: true, color: '#000', lineWidth: BASE_AXIS_WIDTH, tickLength: 6, offset },
  offset, reverse, stacked,
});
