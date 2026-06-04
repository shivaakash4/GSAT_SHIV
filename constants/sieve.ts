export const SIEVES = [
  { size: 8,      phi: -3 },
  { size: 4,      phi: -2 },
  { size: 2,      phi: -1 },
  { size: 1,      phi:  0 },
  { size: 0.5,    phi:  1 },
  { size: 0.25,   phi:  2 },
  { size: 0.125,  phi:  3 },
  { size: 0.062,  phi:  4 },
  { size: 'Pan',  phi:  5 },
] as const;

export const SAMPLE_WEIGHTS = [5.0, 10.5, 25.2, 75.0, 150.8, 80.4, 45.1, 15.6, 5.2];

export const PHI_POINTS = [-3, -2, -1, 0, 1, 2, 3, 4, 5];

export const SANS_SERIF_STACK = "'Inter', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";
export const BASE_FONT_SIZE   = 12;
export const BASE_AXIS_WIDTH  = 2;

export const CHART_COLORS = {
  gravel: '#6699CC',
  sand:   '#BDB76B',
  fines:  '#E69F00',
  curve:  '#374151',
  hist:   'rgba(54, 162, 235, 0.6)',
  histBorder: 'rgba(54, 162, 235, 1)',
  phi:    '#71717a',
  dark:   '#1e293b',
};
