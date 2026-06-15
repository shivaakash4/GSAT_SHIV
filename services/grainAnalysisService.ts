export interface SieveEntry {
  size: number;
  weight: number;
}

export interface AnalyzedSieve extends SieveEntry {
  isPan: boolean;
  phi: number;
  midpointPhi: number;
  weightPercent: number;
  cumRetained: number;
  cumPassing: number;
}

export interface AnalysisResult {
  raw: AnalyzedSieve[];
  totalW: number;
  gravel: number;
  sand: number;
  silt: number;
  clay: number;
  fines: number;
  className: string;
  percentiles: {
    p5: number;
    p16: number;
    p25: number;
    p50: number;
    p75: number;
    p84: number;
    p95: number;
  };
  graphic: {
    Mz: number;
    Sd: number;
    Sk: number;
    Kg: number;
    D50mm: number;
  };
  mom: {
    mean: number;
    sd: number;
    skew: number;
    kurt: number;
  };
  panWarning: boolean;
  extrapolatedPercentiles: string[];
}

export interface KdePoint {
  x: number;
  y: number;
}

export function getWentworthClass(phi: number): string {
  if (phi < -8) return 'Boulder';
  if (phi < -6) return 'Cobble';
  if (phi < -2) return 'Pebble';
  if (phi < -1) return 'Granule';
  if (phi < 0) return 'Very Coarse Sand';
  if (phi < 1) return 'Coarse Sand';
  if (phi < 2) return 'Medium Sand';
  if (phi < 3) return 'Fine Sand';
  if (phi < 4) return 'Very Fine Sand';
  if (phi < 5) return 'Coarse Silt';
  if (phi < 6) return 'Medium Silt';
  if (phi < 7) return 'Fine Silt';
  if (phi < 8) return 'Very Fine Silt';
  return 'Clay';
}

export function generateKDE(
  raw: AnalyzedSieve[],
  bandwidth = 0.5
): KdePoint[] {
  if (raw.length === 0) return [];

  const safeBandwidth = Math.max(0.1, bandwidth);
  const minPhi = Math.floor(raw[0].phi - 2);
  const maxPhi = Math.ceil(raw[raw.length - 1].phi + 2);
  const points: KdePoint[] = [];

  for (let x = minPhi; x <= maxPhi; x += 0.1) {
    let density = 0;
    raw.forEach((bin) => {
      if (bin.weightPercent <= 0) return;
      const u = (x - bin.midpointPhi) / safeBandwidth;
      const kernel =
        (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * u * u);
      density += (bin.weightPercent / safeBandwidth) * kernel;
    });
    points.push({
      x: Number(x.toFixed(2)),
      y: Number(density.toFixed(2)),
    });
  }

  return points;
}

function interpolatePhi(
  percentile: number,
  data: AnalyzedSieve[],
  label: string,
  extrapolated: string[]
): number {
  const sorted = [...data].sort((a, b) => a.cumRetained - b.cumRetained);

  if (percentile < sorted[0].cumRetained) {
    extrapolated.push(label);
    if (sorted.length < 2) return sorted[0].phi;
    const retainedDelta = sorted[1].cumRetained - sorted[0].cumRetained;
    if (retainedDelta === 0) return sorted[0].phi;
    const slope = (sorted[1].phi - sorted[0].phi) / retainedDelta;
    return sorted[0].phi - slope * (sorted[0].cumRetained - percentile);
  }

  for (let index = 0; index < sorted.length - 1; index += 1) {
    const current = sorted[index];
    const next = sorted[index + 1];
    if (
      current.cumRetained <= percentile &&
      next.cumRetained >= percentile
    ) {
      const retainedDelta = next.cumRetained - current.cumRetained;
      if (retainedDelta === 0) return current.phi;
      return (
        current.phi +
        ((percentile - current.cumRetained) * (next.phi - current.phi)) /
          retainedDelta
      );
    }
  }

  extrapolated.push(label);
  const lastIndex = sorted.length - 1;
  if (lastIndex < 1) return sorted[lastIndex].phi;
  const previous = sorted[lastIndex - 1];
  const last = sorted[lastIndex];
  const retainedDelta = last.cumRetained - previous.cumRetained;
  if (retainedDelta === 0) return last.phi;
  const slope = (last.phi - previous.phi) / retainedDelta;
  return last.phi + slope * (percentile - last.cumRetained);
}

function safeRatio(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator;
}

export function analyzeGrainSize(
  entries: SieveEntry[]
): AnalysisResult | null {
  const normalized = entries
    .filter(
      (entry) =>
        Number.isFinite(entry.size) && Number.isFinite(entry.weight)
    )
    .map((entry) => ({
      size: entry.size <= 0 ? 0.0001 : entry.size,
      weight: Math.max(0, entry.weight),
      isPan: entry.size <= 0,
    }))
    .sort((a, b) => b.size - a.size);

  const totalW = normalized.reduce((sum, row) => sum + row.weight, 0);
  if (totalW === 0 || normalized.length === 0) return null;

  const lastMeasured = [...normalized].reverse().find((row) => !row.isPan);
  const panPhi = lastMeasured
    ? Math.ceil(-Math.log2(lastMeasured.size)) + 1
    : 1;

  let cumRetained = 0;
  const raw: AnalyzedSieve[] = normalized.map((row) => {
    const phi = row.isPan ? panPhi : -Math.log2(row.size);
    const weightPercent = (row.weight / totalW) * 100;
    cumRetained += weightPercent;
    return {
      ...row,
      phi,
      midpointPhi: phi,
      weightPercent,
      cumRetained,
      cumPassing: 100 - cumRetained,
    };
  });

  raw.forEach((row, index) => {
    row.midpointPhi =
      index === 0
        ? row.phi - 0.5
        : row.isPan
          ? raw[index - 1].phi + 1
          : (row.phi + raw[index - 1].phi) / 2;
  });

  const extrapolated: string[] = [];
  const p5 = interpolatePhi(5, raw, 'D95', extrapolated);
  const p16 = interpolatePhi(16, raw, 'D84', extrapolated);
  const p25 = interpolatePhi(25, raw, 'D75', extrapolated);
  const p50 = interpolatePhi(50, raw, 'D50', extrapolated);
  const p75 = interpolatePhi(75, raw, 'D25', extrapolated);
  const p84 = interpolatePhi(84, raw, 'D16', extrapolated);
  const p95 = interpolatePhi(95, raw, 'D5', extrapolated);

  const Mz = (p16 + p50 + p84) / 3;
  const Sd = (p84 - p16) / 4 + (p95 - p5) / 6.6;
  const Sk =
    safeRatio(p16 + p84 - 2 * p50, 2 * (p84 - p16)) +
    safeRatio(p5 + p95 - 2 * p50, 2 * (p95 - p5));
  const Kg = safeRatio(p95 - p5, 2.44 * (p75 - p25));

  const mean = raw.reduce(
    (sum, row) => sum + row.weightPercent * row.midpointPhi,
    0
  ) / 100;
  const variance = raw.reduce(
    (sum, row) =>
      sum + row.weightPercent * Math.pow(row.midpointPhi - mean, 2),
    0
  ) / 100;
  const sd = Math.sqrt(variance);
  const skewNumerator = raw.reduce(
    (sum, row) =>
      sum + row.weightPercent * Math.pow(row.midpointPhi - mean, 3),
    0
  ) / 100;
  const kurtNumerator = raw.reduce(
    (sum, row) =>
      sum + row.weightPercent * Math.pow(row.midpointPhi - mean, 4),
    0
  ) / 100;

  const gravel = raw
    .filter((row) => row.size > 2)
    .reduce((sum, row) => sum + row.weightPercent, 0);
  const sand = raw
    .filter((row) => row.size <= 2 && row.size > 0.0625)
    .reduce((sum, row) => sum + row.weightPercent, 0);
  const silt = raw
    .filter((row) => row.size <= 0.0625 && row.size > 0.0039)
    .reduce((sum, row) => sum + row.weightPercent, 0);
  const clay = raw
    .filter((row) => row.size <= 0.0039)
    .reduce((sum, row) => sum + row.weightPercent, 0);
  const fines = silt + clay;

  let className = 'Mixed Sediment';
  if (gravel > 50) className = sand > 10 ? 'Sandy Gravel' : 'Gravel';
  else if (sand > 50) {
    className =
      gravel > 10 ? 'Gravelly Sand' : fines > 10 ? 'Muddy Sand' : 'Sand';
  } else if (fines > 50) {
    className = sand > 10 ? 'Sandy Mud' : 'Mud';
  }

  return {
    raw,
    totalW,
    gravel,
    sand,
    silt,
    clay,
    fines,
    className,
    percentiles: { p5, p16, p25, p50, p75, p84, p95 },
    graphic: {
      Mz,
      Sd,
      Sk,
      Kg,
      D50mm: Math.pow(2, -p50),
    },
    mom: {
      mean,
      sd,
      skew: sd === 0 ? 0 : skewNumerator / Math.pow(sd, 3),
      kurt: sd === 0 ? 0 : kurtNumerator / Math.pow(sd, 4),
    },
    panWarning:
      (raw.find((row) => row.isPan)?.weightPercent ?? 0) > 5,
    extrapolatedPercentiles: [...new Set(extrapolated)],
  };
}

export function downloadCsvReport(result: AnalysisResult): void {
  const rows = [
    ['Metric', 'Value'],
    ['Classification', result.className],
    ['Gravel %', result.gravel.toFixed(2)],
    ['Sand %', result.sand.toFixed(2)],
    ['Silt %', result.silt.toFixed(2)],
    ['Clay %', result.clay.toFixed(2)],
    [],
    ['Graphic Stats', 'Value'],
    ['Mean (Phi)', result.graphic.Mz.toFixed(3)],
    ['Median D50 (mm)', result.graphic.D50mm.toFixed(3)],
    ['Sorting (Phi)', result.graphic.Sd.toFixed(3)],
    ['Skewness', result.graphic.Sk.toFixed(3)],
    ['Kurtosis', result.graphic.Kg.toFixed(3)],
    [],
    ['Sieve Data', 'Weight(g)', 'Retained %', 'Cum Passing %'],
    ...result.raw.map((row) => [
      row.isPan ? 'Pan' : String(row.size),
      String(row.weight),
      row.weightPercent.toFixed(2),
      row.cumPassing.toFixed(2),
    ]),
  ];
  const csv = rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`)
        .join(',')
    )
    .join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'grain_size_report.csv';
  link.click();
  URL.revokeObjectURL(url);
}
