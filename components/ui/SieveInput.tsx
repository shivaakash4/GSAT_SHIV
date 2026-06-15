'use client';

import { useGrainAnalysis } from '@/hooks/useGrainAnalysis';
import { downloadCsvReport } from '@/services/grainAnalysisService';
import { downloadAllCharts } from '@/components/charts/AllCharts';

export default function SieveInput() {
  const {
    rows,
    result,
    error,
    updateRow,
    addRow,
    removeRow,
    replaceFromPaste,
    calculate,
    loadSample,
  } = useGrainAnalysis();

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const text = event.clipboardData.getData('text');
    if (!/[\t,\n\r]/.test(text)) return;
    event.preventDefault();
    replaceFromPaste(text);
  };

  return (
    <div className="max-w-3xl mx-auto w-full bg-white p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h2 className="text-2xl font-bold">1. Input Data</h2>
        <button
          type="button"
          onClick={addRow}
          className="text-sm bg-blue-100 text-blue-700 font-bold py-1 px-3 rounded hover:bg-blue-200 transition"
        >
          + Add Sieve
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 text-sm text-blue-800 font-bold">
        Tip: Paste two columns directly from Excel (Size in mm, Weight in g)
        into the first box. Use size &quot;0&quot; to represent the Pan.
      </div>

      <div className="grid grid-cols-12 gap-4 mb-2 font-bold text-gray-600 text-sm text-center border-b pb-1">
        <div className="col-span-5 text-left">Sieve Size (mm)</div>
        <div className="col-span-5 text-left">Weight Retained (g)</div>
        <div className="col-span-2">Action</div>
      </div>

      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <div
            key={row.id}
            className="grid grid-cols-12 gap-4 items-center"
          >
            <div className="col-span-5">
              <input
                type="number"
                value={row.size}
                onChange={(event) =>
                  updateRow(row.id, 'size', event.target.value)
                }
                onPaste={handlePaste}
                placeholder="Size (mm) or 0 for Pan"
                className="w-full border border-gray-300 rounded-md p-2 text-right focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>
            <div className="col-span-5">
              <input
                type="number"
                min="0"
                value={row.weight}
                onChange={(event) =>
                  updateRow(row.id, 'weight', event.target.value)
                }
                onPaste={handlePaste}
                placeholder="Weight (g)"
                className="w-full border border-gray-300 rounded-md p-2 text-right focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>
            <div className="col-span-2 text-center">
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                className="text-red-500 hover:text-red-700 font-bold px-2 py-1 bg-red-50 rounded"
                aria-label="Remove sieve row"
              >
                X
              </button>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border-l-4 border-red-600 text-red-800 p-3 font-bold text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6">
        <button
          type="button"
          onClick={calculate}
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Calculate &amp; Plot
        </button>
        <button
          type="button"
          onClick={loadSample}
          className="w-full bg-gray-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-600 transition duration-300"
        >
          Load Sample Data
        </button>
      </div>

      {result && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
          <button
            type="button"
            onClick={() => downloadCsvReport(result)}
            className="w-full bg-yellow-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-yellow-700 transition duration-300"
          >
            Download CSV Report
          </button>
          <button
            type="button"
            onClick={downloadAllCharts}
            className="w-full bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-emerald-700 transition duration-300"
          >
            Download Plots (4K)
          </button>
        </div>
      )}
    </div>
  );
}
