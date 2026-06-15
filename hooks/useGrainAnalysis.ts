'use client';

import { useCallback, useEffect } from 'react';
import {
  DEFAULT_SIEVE_ROWS,
  type SieveRow,
  useGrainStore,
} from '@/store/useGrainStore';
import {
  analyzeGrainSize,
  type SieveEntry,
} from '@/services/grainAnalysisService';

const STORAGE_KEY = 'sieveData';

function createRow(size = '', weight = ''): SieveRow {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    size,
    weight,
  };
}

function parseRows(rows: SieveRow[]): SieveEntry[] {
  return rows.flatMap((row) => {
    const size = Number.parseFloat(row.size);
    const weight = Number.parseFloat(row.weight);
    return Number.isFinite(size) && Number.isFinite(weight)
      ? [{ size, weight }]
      : [];
  });
}

function persistRows(rows: SieveRow[]): void {
  const data = parseRows(rows).map((row) => ({
    size: row.size <= 0 ? 0 : row.size,
    weight: Math.max(0, row.weight),
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useGrainAnalysis() {
  const {
    rows,
    result,
    showOverlayCurve,
    kdeBandwidth,
    error,
    setRows,
    setResult,
    setShowOverlayCurve,
    setKdeBandwidth,
    setError,
  } = useGrainStore();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as SieveEntry[];
      if (!Array.isArray(parsed) || parsed.length === 0) return;
      setRows(
        parsed.map((row) =>
          createRow(String(row.size), String(row.weight))
        )
      );
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [setRows]);

  const updateRow = useCallback(
    (id: string, field: 'size' | 'weight', value: string) => {
      setRows(
        rows.map((row) =>
          row.id === id ? { ...row, [field]: value } : row
        )
      );
    },
    [rows, setRows]
  );

  const addRow = useCallback(() => {
    setRows([...rows, createRow()]);
  }, [rows, setRows]);

  const removeRow = useCallback(
    (id: string) => {
      setRows(rows.filter((row) => row.id !== id));
    },
    [rows, setRows]
  );

  const replaceFromPaste = useCallback(
    (text: string) => {
      const pastedRows = text
        .split(/[\n\r]+/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [size = '0', weight = '0'] = line.split(/[\t,]+/);
          return createRow(
            String(Number.parseFloat(size.trim()) || 0),
            String(Number.parseFloat(weight.trim()) || 0)
          );
        });
      if (pastedRows.length > 0) {
        setRows(pastedRows);
        setError(null);
      }
    },
    [setError, setRows]
  );

  const calculateRows = useCallback(
    (nextRows: SieveRow[]) => {
      const entries = parseRows(nextRows);
      if (entries.length < 3) {
        setError('Please enter at least 3 valid sieve rows.');
        return;
      }
      const nextResult = analyzeGrainSize(entries);
      if (!nextResult) {
        setError('Total retained weight must be greater than zero.');
        return;
      }
      persistRows(nextRows);
      setResult(nextResult);
      setError(null);
    },
    [setError, setResult]
  );

  const calculate = useCallback(() => {
    calculateRows(rows);
  }, [calculateRows, rows]);

  const loadSample = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    const sample = DEFAULT_SIEVE_ROWS.map((row) => ({ ...row }));
    setRows(sample);
    calculateRows(sample);
  }, [calculateRows, setRows]);

  return {
    rows,
    result,
    error,
    showOverlayCurve,
    kdeBandwidth,
    updateRow,
    addRow,
    removeRow,
    replaceFromPaste,
    calculate,
    loadSample,
    setShowOverlayCurve,
    setKdeBandwidth,
  };
}
