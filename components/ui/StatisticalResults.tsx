'use client';

import { getWentworthClass } from '@/services/grainAnalysisService';
import { useGrainStore } from '@/store/useGrainStore';

export default function StatisticalResults() {
  const result = useGrainStore((state) => state.result);
  if (!result) return null;

  return (
    <div className="max-w-3xl mx-auto w-full bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 border-b pb-2">
        2. Statistical Results
      </h2>

      {result.panWarning && (
        <div className="bg-red-50 border-l-4 border-red-600 text-red-800 p-3 mb-4 font-bold text-sm">
          High Pan Weight Detected (&gt;5%). Interpret fine tail statistics
          with caution.
        </div>
      )}

      {result.extrapolatedPercentiles.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 p-3 mb-4 font-bold text-sm">
          Extrapolation Warning: The following percentiles fall outside the
          bounds of the measured sieves and were mathematically extrapolated:{' '}
          {result.extrapolatedPercentiles.join(', ')}. Graphic statistics
          relying on these values may be less accurate.
        </div>
      )}

      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">
          Sediment Classification
        </h3>
        <p className="text-2xl font-extrabold text-blue-600 uppercase tracking-wide mt-1">
          {result.className}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
        <div className="p-4 bg-gray-50 rounded border border-gray-200">
          <h4 className="font-bold text-lg mb-2 text-gray-900 border-b pb-1">
            Graphic Measures (Folk &amp; Ward)
          </h4>
          <div className="space-y-1 font-bold">
            <p>
              Mean (Mz): {result.graphic.Mz.toFixed(2)} Φ (
              {getWentworthClass(result.graphic.Mz)})
            </p>
            <p>Median (D50): {result.graphic.D50mm.toFixed(3)} mm</p>
            <p>Sorting: {result.graphic.Sd.toFixed(2)} Φ</p>
            <p>Skewness: {result.graphic.Sk.toFixed(2)}</p>
            <p>Kurtosis: {result.graphic.Kg.toFixed(2)}</p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded border border-gray-200">
          <h4 className="font-bold text-lg mb-2 text-gray-900 border-b pb-1">
            Method of Moments (MoM)
          </h4>
          <div className="space-y-1 font-bold">
            <p>Mean: {result.mom.mean.toFixed(2)} Φ</p>
            <p>Standard Dev: {result.mom.sd.toFixed(2)} Φ</p>
            <p>Skewness: {result.mom.skew.toFixed(2)}</p>
            <p>Kurtosis: {result.mom.kurt.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
