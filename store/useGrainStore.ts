import { create } from 'zustand';
import type { AnalysisResult } from '@/services/grainAnalysisService';

export interface SieveRow {
  id: string;
  size: string;
  weight: string;
}

export const DEFAULT_SIEVE_ROWS: SieveRow[] = [
  { id: 'default-8', size: '8', weight: '5' },
  { id: 'default-4', size: '4', weight: '10.5' },
  { id: 'default-2', size: '2', weight: '25.2' },
  { id: 'default-1', size: '1', weight: '75' },
  { id: 'default-05', size: '0.5', weight: '150.8' },
  { id: 'default-025', size: '0.25', weight: '80.4' },
  { id: 'default-0125', size: '0.125', weight: '45.1' },
  { id: 'default-0062', size: '0.062', weight: '15.6' },
  { id: 'default-pan', size: '0', weight: '5.2' },
];

interface GrainState {
  rows: SieveRow[];
  result: AnalysisResult | null;
  showOverlayCurve: boolean;
  kdeBandwidth: number;
  error: string | null;
  setRows: (rows: SieveRow[]) => void;
  setResult: (result: AnalysisResult | null) => void;
  setShowOverlayCurve: (value: boolean) => void;
  setKdeBandwidth: (value: number) => void;
  setError: (error: string | null) => void;
}

export const useGrainStore = create<GrainState>((set) => ({
  rows: DEFAULT_SIEVE_ROWS.map((row) => ({ ...row })),
  result: null,
  showOverlayCurve: false,
  kdeBandwidth: 0.5,
  error: null,
  setRows: (rows) => set({ rows }),
  setResult: (result) => set({ result }),
  setShowOverlayCurve: (showOverlayCurve) => set({ showOverlayCurve }),
  setKdeBandwidth: (kdeBandwidth) => set({ kdeBandwidth }),
  setError: (error) => set({ error }),
}));
