import { PHI_POINTS, SIEVES } from '@/constants/sieve';

export interface AnalysisResult {
  weightPercent: number[];
  cumulativePassingPercent: number[];
  Mz: string;
  D50mm: string;
  p50: number;
  Sd: string;
  Sk: string;
  Kg: string;
  modePhi: number | string;
  p5: number; p16: number; p25: number;
  p75: number; p84: number; p95: number;
}

function interpolatePhi(p: number, analysisCumRetained: number[]): number {
  const phiScale = [-4, ...PHI_POINTS];
  for (let i = 0; i < analysisCumRetained.length - 1; i++) {
    if (analysisCumRetained[i] <= p && analysisCumRetained[i + 1] >= p) {
      return (
        phiScale[i] +
        ((p - analysisCumRetained[i]) * (phiScale[i + 1] - phiScale[i])) /
          (analysisCumRetained[i + 1] - analysisCumRetained[i])
      );
    }
  }
  return NaN;
}

export function analyzeGrainSize(weights: number[]): AnalysisResult | null {
  const totalWeight = weights.reduce((s, w) => s + w, 0);
  if (totalWeight === 0) return null;

  const weightPercent = weights.map(w => (w / totalWeight) * 100);
  const cumulativePassingPercent = weights.map((_, i) => {
    const sumRetained = weights.slice(0, i + 1).reduce((a, b) => a + b, 0);
    return 100 - (sumRetained / totalWeight) * 100;
  });

  const analysisCumRetained = [
    0,
    ...weights.map((_, i) =>
      (weights.slice(0, i + 1).reduce((a, b) => a + b, 0) / totalWeight) * 100
    ),
  ];

  const p5  = interpolatePhi(5,  analysisCumRetained);
  const p16 = interpolatePhi(16, analysisCumRetained);
  const p25 = interpolatePhi(25, analysisCumRetained);
  const p50 = interpolatePhi(50, analysisCumRetained);
  const p75 = interpolatePhi(75, analysisCumRetained);
  const p84 = interpolatePhi(84, analysisCumRetained);
  const p95 = interpolatePhi(95, analysisCumRetained);

  const maxW = Math.max(...weightPercent);
  const mIdx = weightPercent.indexOf(maxW);
  const modePhi = SIEVES[mIdx].size === 'Pan' ? '>4' : SIEVES[mIdx].phi;

  return {
    weightPercent,
    cumulativePassingPercent,
    Mz:    ((p16 + p50 + p84) / 3).toFixed(2),
    D50mm: Math.pow(2, -p50).toFixed(3),
    p50,
    Sd:    ((p84 - p16) / 4 + (p95 - p5) / 6.6).toFixed(2),
    Sk:    ((p16 + p84 - 2 * p50) / (2 * (p84 - p16)) + (p5 + p95 - 2 * p50) / (2 * (p95 - p5))).toFixed(2),
    Kg:    ((p95 - p5) / (2.44 * (p75 - p25))).toFixed(2),
    modePhi,
    p5, p16, p25, p75, p84, p95,
  };
}
