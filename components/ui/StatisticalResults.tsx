'use client';
import { useGrainStore } from '@/store/useGrainStore';

export default function StatisticalResults() {
  const result = useGrainStore(s => s.result);
  if (!result) return null;

  const {
    Mz,
    D50mm,
    p50,
    Sd,
    Sk,
    Kg,
    modePhi,
    extrapolatedPercentiles,
  } = result;

  return (
    <div className="w-full bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 border-b pb-2">2. Statistical Results</h2>
      {extrapolatedPercentiles.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 p-3 mb-4 font-bold text-sm">
          Extrapolation warning: {extrapolatedPercentiles.join(', ')} fall
          outside the measured sieve bounds and were mathematically
          extrapolated. Statistics using these values may be less accurate.
        </div>
      )}
      <div className="grid grid-cols-1 gap-1 text-gray-700 text-sm">
        <div className="p-2 bg-blue-50 border-l-4 border-blue-600 mb-1 font-bold">
          <p>Graphic Mean (Mz): {Mz} φ</p>
          <p>Median (D50): {D50mm} mm ({p50.toFixed(2)} φ)</p>
        </div>
        <div className="p-2 bg-gray-50 border-l-4 border-gray-600 font-bold">
          <p>Sorting (σI): {Sd} φ</p>
          <p>Skewness (SkI): {Sk}</p>
          <p>Kurtosis (KG): {Kg}</p>
          <p>Modal Class: {modePhi} φ</p>
        </div>
      </div>
    </div>
  );
}
