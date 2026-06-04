import { create } from 'zustand';
import type { AnalysisResult } from '@/services/grainAnalysisService';

interface GrainState {
  weights: number[];
  result: AnalysisResult | null;
  showOverlayCurve: boolean;
  setWeights: (weights: number[]) => void;
  setResult: (result: AnalysisResult | null) => void;
  setShowOverlayCurve: (val: boolean) => void;
}

export const useGrainStore = create<GrainState>((set) => ({
  weights:          new Array(9).fill(0),
  result:           null,
  showOverlayCurve: false,
  setWeights:          (weights) => set({ weights }),
  setResult:           (result)  => set({ result }),
  setShowOverlayCurve: (val)     => set({ showOverlayCurve: val }),
}));
