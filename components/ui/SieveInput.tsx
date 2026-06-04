'use client';
import { useRef } from 'react';
import { SIEVES } from '@/constants/sieve';
import { useGrainAnalysis } from '@/hooks/useGrainAnalysis';

export default function SieveInput() {
  const { weights, updateWeight, calculate, loadSample, showOverlayCurve, setShowOverlayCurve } = useGrainAnalysis();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    const text = e.clipboardData.getData('text');
    const vals = text.split(/[\n\r\t]+/).map(v => v.trim()).filter(v => v !== '');
    if (vals.length > 1) {
      e.preventDefault();
      vals.forEach((v, i) => {
        const idx = index + i;
        if (idx < SIEVES.length) {
          updateWeight(idx, parseFloat(v) || 0);
          if (inputRefs.current[idx]) inputRefs.current[idx]!.value = v;
        }
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 border-b pb-2">1. Input Data</h2>

      <div>
        {SIEVES.map((sieve, index) => (
          <div key={sieve.size} className="grid grid-cols-2 items-center mb-2">
            <label className="text-sm font-bold">
              {sieve.size === 'Pan' ? 'Pan' : `Sieve ${sieve.size} mm`}:
            </label>
            <input
              type="number"
              ref={el => { inputRefs.current[index] = el; }}
              defaultValue={weights[index] || ''}
              onChange={e => updateWeight(index, parseFloat(e.target.value) || 0)}
              onPaste={e => handlePaste(e, index)}
              placeholder="0.0"
              className="border border-gray-300 rounded-md p-2 text-right focus:ring-2 focus:ring-blue-500 font-bold"
            />
          </div>
        ))}

        <div className="text-xs text-blue-600 mt-3 italic bg-blue-50 p-2 rounded border border-blue-100 font-bold">
          💡 <strong>Tip:</strong> Copy a column from Excel and paste it here into the first box.
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6">
        <button
          onClick={calculate}
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Calculate &amp; Plot
        </button>
        <button
          onClick={loadSample}
          className="w-full bg-gray-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-600 transition duration-300"
        >
          Load Sample Data
        </button>
      </div>

      <div className="flex items-center space-x-2 mt-4 px-3 py-2 bg-blue-50 rounded-full border border-blue-100 w-fit">
        <input
          type="checkbox"
          id="overlay-curve-toggle"
          checked={showOverlayCurve}
          onChange={e => setShowOverlayCurve(e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
        />
        <label htmlFor="overlay-curve-toggle" className="text-xs font-bold text-blue-800 cursor-pointer uppercase tracking-tight">
          Overlay Curve
        </label>
      </div>
    </div>
  );
}
