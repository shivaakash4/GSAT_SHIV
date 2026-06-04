'use client';
import { useCallback } from 'react';
import { useGrainStore } from '@/store/useGrainStore';
import { analyzeGrainSize } from '@/services/grainAnalysisService';
import { SAMPLE_WEIGHTS } from '@/constants/sieve';

export function useGrainAnalysis() {
  const { weights, setWeights, setResult, showOverlayCurve, setShowOverlayCurve } = useGrainStore();

  const updateWeight = useCallback((index: number, value: number) => {
    const next = [...weights];
    next[index] = value;
    setWeights(next);
  }, [weights, setWeights]);

  const calculate = useCallback(() => {
    const result = analyzeGrainSize(weights);
    setResult(result);
  }, [weights, setResult]);

  const loadSample = useCallback(() => {
    setWeights([...SAMPLE_WEIGHTS]);
    const result = analyzeGrainSize(SAMPLE_WEIGHTS);
    setResult(result);
  }, [setWeights, setResult]);

  return {
    weights,
    updateWeight,
    calculate,
    loadSample,
    showOverlayCurve,
    setShowOverlayCurve,
  };
}
