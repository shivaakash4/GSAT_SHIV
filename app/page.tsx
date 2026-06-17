'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { ChartConfiguration } from 'chart.js';
import { useAuth } from '@/hooks/useAuth';
import {
  analyzeGrainSize,
  getWentworthClass,
  type AnalysisResult,
} from '@/services/grainAnalysisService';
import { useGrainStore } from '@/store/useGrainStore';
import Header from '@/components/ui/Header';
import SieveInput from '@/components/ui/SieveInput';
import StatisticalResults from '@/components/ui/StatisticalResults';
import LandingPage from '@/components/ui/LandingPage';
import AuthModal from '@/components/auth/AuthModal';
import ChartWrapper from '@/components/charts/ChartWrapper';
import { downloadAllCharts } from '@/components/charts/AllCharts';

const AllCharts = dynamic(() => import('@/components/charts/AllCharts'), {
  ssr: false,
});

type View = 'landing' | 'app';
type BatchTab = 'single' | 'multi';

interface BatchRow {
  id: string;
  size: string;
  weights: string[];
}

interface BatchResult extends AnalysisResult {
  sampleName: string;
}

const SAMPLE_NAMES = ['Fluvial Sand', 'Dune Sand', 'Glacial Till'];
const SAMPLE_ROWS: BatchRow[] = [
  { id: 'batch-8', size: '8', weights: ['0', '0', '150.5'] },
  { id: 'batch-4', size: '4', weights: ['0', '0', '85.2'] },
  { id: 'batch-2', size: '2', weights: ['5.2', '0', '45'] },
  { id: 'batch-1', size: '1', weights: ['15', '5', '25'] },
  { id: 'batch-05', size: '0.5', weights: ['65.5', '25', '15'] },
  { id: 'batch-025', size: '0.25', weights: ['120.4', '150.5', '10.5'] },
  { id: 'batch-0125', size: '0.125', weights: ['45.1', '85', '5'] },
  { id: 'batch-00625', size: '0.0625', weights: ['15.6', '25.5', '12'] },
  { id: 'batch-pan', size: '0', weights: ['5.2', '2', '45'] },
];

const CHART_COLORS = [
  '#1e293b',
  '#2563eb',
  '#16a34a',
  '#dc2626',
  '#9333ea',
  '#ea580c',
  '#0d9488',
  '#ca8a04',
];

export default function HomePage() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<View>('landing');
  const [activeTab, setActiveTab] = useState<BatchTab>('single');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (user && view === 'app') {
    return (
      <div className="min-h-screen bg-gray-100 p-4 pb-8 md:flex md:h-screen md:min-h-0 md:flex-col md:overflow-hidden md:p-6">
        <div className="mx-auto w-full max-w-[1800px] md:shrink-0">
          <Header onBack={() => setView('landing')} />
          <BatchTabs activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {activeTab === 'single' ? <SingleBatchApp /> : <MultiBatchApp />}
      </div>
    );
  }

  return (
    <>
      <LandingPage onEnterApp={() => setView('app')} />
      {!user && <AuthModal onSuccess={() => setView('app')} />}
    </>
  );
}

function BatchTabs({
  activeTab,
  onChange,
}: {
  activeTab: BatchTab;
  onChange: (tab: BatchTab) => void;
}) {
  return (
    <div className="mb-5 flex justify-center">
      <div className="grid w-full max-w-md grid-cols-2 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
        {(['single', 'multi'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={`rounded-md px-4 py-2 text-sm font-bold transition ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab === 'single' ? 'Single Batch' : 'Multi Batch'}
          </button>
        ))}
      </div>
    </div>
  );
}

function SingleBatchApp() {
  return (
    <main className="mx-auto flex w-full max-w-[1800px] flex-col gap-8 md:grid md:min-h-0 md:flex-1 md:grid-cols-[minmax(340px,40%)_minmax(0,1fr)] md:gap-5 md:overflow-hidden">
      <section className="flex flex-col gap-8 md:overflow-y-auto md:pr-2">
        <SieveInput />
        <StatisticalResults />
      </section>

      <section className="min-w-0 md:overflow-y-auto md:pl-1">
        <SingleCharts />
      </section>
    </main>
  );
}

function SingleCharts() {
  const result = useGrainStore((state) => state.result);

  if (!result) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm font-semibold text-gray-400 md:h-full">
        Enter sieve sizes and weights, then click
        <span className="mx-1 text-blue-600">Calculate &amp; Plot</span>
        to see charts.
      </div>
    );
  }

  return <AllCharts result={result} />;
}

function MultiBatchApp() {
  const [sampleNames, setSampleNames] = useState<string[]>(['Sample 1']);
  const [rows, setRows] = useState<BatchRow[]>([
    { id: 'multi-8', size: '8', weights: ['0'] },
    { id: 'multi-4', size: '4', weights: ['0'] },
  ]);
  const [results, setResults] = useState<BatchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const activeResult = results[activeIndex] ?? null;

  const updateRow = (
    rowId: string,
    field: 'size' | 'weight',
    value: string,
    sampleIndex = 0
  ) => {
    setRows((currentRows) =>
      currentRows.map((row) => {
        if (row.id !== rowId) return row;
        if (field === 'size') return { ...row, size: value };
        const weights = [...row.weights];
        weights[sampleIndex] = value;
        return { ...row, weights };
      })
    );
  };

  const addRow = () => {
    setRows((currentRows) => [
      ...currentRows,
      {
        id: `multi-${Date.now()}`,
        size: '',
        weights: sampleNames.map(() => ''),
      },
    ]);
  };

  const addSample = () => {
    setSampleNames((current) => [...current, `Sample ${current.length + 1}`]);
    setRows((currentRows) =>
      currentRows.map((row) => ({ ...row, weights: [...row.weights, ''] }))
    );
  };

  const removeSample = (sampleIndex: number) => {
    if (sampleNames.length === 1) return;
    setSampleNames((current) =>
      current.filter((_, index) => index !== sampleIndex)
    );
    setRows((currentRows) =>
      currentRows.map((row) => ({
        ...row,
        weights: row.weights.filter((_, index) => index !== sampleIndex),
      }))
    );
    setResults([]);
    setActiveIndex(0);
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const text = event.clipboardData.getData('text');
    if (!/[\t,\n\r]/.test(text)) return;
    event.preventDefault();

    const lines = text
      .split(/[\n\r]+/)
      .map((line) => line.trim())
      .filter(Boolean);
    const first = lines[0]?.split(/[\t,]+/).map((cell) => cell.trim()) ?? [];
    const hasHeader = Number.isNaN(Number.parseFloat(first[1] ?? ''));
    const nextNames = hasHeader
      ? first.slice(1).filter(Boolean)
      : first.slice(1).map((_, index) => `Sample ${index + 1}`);
    const dataLines = hasHeader ? lines.slice(1) : lines;

    setSampleNames(nextNames.length > 0 ? nextNames : ['Sample 1']);
    setRows(
      dataLines.map((line, index) => {
        const cells = line.split(/[\t,]+/).map((cell) => cell.trim());
        return {
          id: `paste-${Date.now()}-${index}`,
          size: cells[0] ?? '',
          weights: cells.slice(1),
        };
      })
    );
    setResults([]);
  };

  const loadSample = () => {
    setSampleNames(SAMPLE_NAMES);
    setRows(SAMPLE_ROWS.map((row) => ({ ...row, weights: [...row.weights] })));
    setError(null);
  };

  const calculate = () => {
    const nextResults = sampleNames
      .map((sampleName, sampleIndex) => {
        const entries = rows
          .map((row) => ({
            size: Number.parseFloat(row.size),
            weight: Number.parseFloat(row.weights[sampleIndex] ?? ''),
          }))
          .filter(
            (entry) =>
              Number.isFinite(entry.size) && Number.isFinite(entry.weight)
          );
        const result = analyzeGrainSize(entries);
        return result ? { ...result, sampleName } : null;
      })
      .filter((result): result is BatchResult => Boolean(result));

    if (nextResults.length === 0) {
      setError('Please enter valid sieve data for at least one sample.');
      return;
    }

    setError(null);
    setResults(nextResults);
    setActiveIndex(0);
  };

  const downloadMasterCsv = () => {
    if (results.length === 0) return;
    const csv = buildMasterCsv(results);
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'master_batch_report.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="mx-auto flex w-full max-w-[1800px] flex-col gap-8 md:grid md:min-h-0 md:flex-1 md:grid-cols-[minmax(380px,42%)_minmax(0,1fr)] md:gap-5 md:overflow-hidden">
      <section className="flex flex-col gap-8 md:overflow-y-auto md:pr-2">
        <div className="w-full rounded-xl bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between border-b pb-2">
            <h2 className="text-2xl font-bold">1. Batch Input Data</h2>
          </div>

          <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm font-bold text-blue-800">
            Tip: Paste a multi-column block from Excel. Column A is sieve size,
            each following column is a sample. Use size &quot;0&quot; for the Pan.
          </div>

          <div className="mb-4 overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="w-32 border-b border-gray-300 p-2 text-left">
                    Sieve Size (mm)
                  </th>
                  {sampleNames.map((name, sampleIndex) => (
                    <th
                      key={`${name}-${sampleIndex}`}
                      className="min-w-32 border-b border-gray-300 p-2"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <input
                          type="text"
                          value={name}
                          onChange={(event) =>
                            setSampleNames((current) =>
                              current.map((item, index) =>
                                index === sampleIndex
                                  ? event.target.value
                                  : item
                              )
                            )
                          }
                          className="w-full min-w-20 bg-transparent text-right font-bold text-blue-600 outline-none focus:border-b focus:border-blue-400"
                        />
                        {sampleNames.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSample(sampleIndex)}
                            className="text-lg font-bold text-red-400 hover:text-red-600"
                            aria-label="Remove sample"
                          >
                            x
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="w-24 border-b border-gray-300 p-2">
                    <button
                      type="button"
                      onClick={addSample}
                      className="w-full rounded bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700 hover:bg-blue-200"
                    >
                      + Sample
                    </button>
                  </th>
                  <th className="w-16 border-b border-gray-300 p-2">
                    <button
                      type="button"
                      onClick={addRow}
                      className="w-full rounded bg-gray-200 px-2 py-1 text-xs font-bold text-gray-700 hover:bg-gray-300"
                    >
                      + Row
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="p-1">
                      <input
                        type="number"
                        value={row.size}
                        onChange={(event) =>
                          updateRow(row.id, 'size', event.target.value)
                        }
                        onPaste={handlePaste}
                        placeholder="Size/0"
                        className="w-full rounded border border-gray-300 p-2 text-left font-bold focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    {sampleNames.map((_, sampleIndex) => (
                      <td key={sampleIndex} className="p-1">
                        <input
                          type="number"
                          value={row.weights[sampleIndex] ?? ''}
                          onChange={(event) =>
                            updateRow(
                              row.id,
                              'weight',
                              event.target.value,
                              sampleIndex
                            )
                          }
                          onPaste={handlePaste}
                          placeholder="0.0"
                          className="w-full rounded border border-gray-300 p-2 text-right font-bold focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                    ))}
                    <td />
                    <td className="p-1 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          setRows((currentRows) =>
                            currentRows.filter((item) => item.id !== row.id)
                          )
                        }
                        className="text-xl font-bold text-red-400 hover:text-red-600"
                        aria-label="Remove row"
                      >
                        x
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {error && (
            <div className="mb-4 border-l-4 border-red-600 bg-red-50 p-3 text-sm font-bold text-red-800">
              {error}
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={calculate}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-bold text-white shadow-md transition hover:bg-blue-700"
            >
              Calculate Batch &amp; Plot
            </button>
            <button
              type="button"
              onClick={loadSample}
              className="w-full rounded-lg bg-gray-500 px-4 py-3 font-bold text-white shadow-md transition hover:bg-gray-600"
            >
              Load Sample Data
            </button>
          </div>

          {results.length > 0 && (
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={downloadMasterCsv}
                className="w-full rounded-lg bg-yellow-600 px-4 py-3 font-bold text-white transition hover:bg-yellow-700"
              >
                Download Master CSV
              </button>
              <button
                type="button"
                onClick={downloadAllCharts}
                className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-bold text-white transition hover:bg-emerald-700"
              >
                Download Current Plots (4K)
              </button>
            </div>
          )}
        </div>

        {activeResult && (
          <BatchStats
            results={results}
            activeIndex={activeIndex}
            onActiveIndexChange={setActiveIndex}
          />
        )}
      </section>

      <section className="min-w-0 md:overflow-y-auto md:pl-1">
        {activeResult ? (
          <BatchCharts results={results} activeIndex={activeIndex} />
        ) : (
          <div className="flex min-h-72 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm font-semibold text-gray-400 md:h-full">
            Enter batch sieve data, then click
            <span className="mx-1 text-blue-600">
              Calculate Batch &amp; Plot
            </span>
            to see charts.
          </div>
        )}
      </section>
    </main>
  );
}

function BatchStats({
  results,
  activeIndex,
  onActiveIndexChange,
}: {
  results: BatchResult[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
}) {
  const result = results[activeIndex];

  return (
    <div className="w-full rounded-xl bg-white p-6 shadow-lg">
      <div className="mb-6 flex flex-col justify-between gap-4 border-b pb-4 sm:flex-row sm:items-center">
        <h2 className="text-2xl font-bold">2. Statistical Results</h2>
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 shadow-sm">
          <label
            htmlFor="sample-selector"
            className="whitespace-nowrap text-xs font-bold uppercase tracking-wide text-blue-900"
          >
            Viewing Sample:
          </label>
          <select
            id="sample-selector"
            value={activeIndex}
            onChange={(event) =>
              onActiveIndexChange(Number.parseInt(event.target.value, 10))
            }
            className="w-44 cursor-pointer rounded border border-blue-300 bg-white p-1 text-sm font-bold text-blue-800 outline-none focus:ring-2 focus:ring-blue-500"
          >
            {results.map((item, index) => (
              <option key={item.sampleName} value={index}>
                {item.sampleName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {result.panWarning && (
        <div className="mb-4 border-l-4 border-red-600 bg-red-50 p-3 text-sm font-bold text-red-800">
          High Pan Weight Detected (&gt;5%). Interpret fine tail statistics
          with caution.
        </div>
      )}

      {result.extrapolatedPercentiles.length > 0 && (
        <div className="mb-4 border-l-4 border-yellow-500 bg-yellow-50 p-3 text-sm font-bold text-yellow-800">
          Extrapolation Warning: {result.extrapolatedPercentiles.join(', ')}{' '}
          fall outside the measured sieve bounds.
        </div>
      )}

      <div className="mb-4 text-center">
        <h3 className="text-xl font-bold text-gray-800">
          Sediment Classification
        </h3>
        <p className="mt-1 text-2xl font-extrabold uppercase tracking-wide text-blue-600">
          {result.className}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 text-sm text-gray-700 md:grid-cols-2">
        <StatCard title="Graphic Measures (Folk & Ward)">
          <p>
            Mean (Mz): {result.graphic.Mz.toFixed(2)} Phi (
            {getWentworthClass(result.graphic.Mz)})
          </p>
          <p>Median (D50): {result.graphic.D50mm.toFixed(3)} mm</p>
          <p>Sorting: {result.graphic.Sd.toFixed(2)} Phi</p>
          <p>Skewness: {result.graphic.Sk.toFixed(2)}</p>
          <p>Kurtosis: {result.graphic.Kg.toFixed(2)}</p>
        </StatCard>
        <StatCard title="Method of Moments (MoM)">
          <p>Mean: {result.mom.mean.toFixed(2)} Phi</p>
          <p>Standard Dev: {result.mom.sd.toFixed(2)} Phi</p>
          <p>Skewness: {result.mom.skew.toFixed(2)}</p>
          <p>Kurtosis: {result.mom.kurt.toFixed(2)}</p>
        </StatCard>
      </div>
    </div>
  );
}

function StatCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded border border-gray-200 bg-gray-50 p-4">
      <h4 className="mb-2 border-b pb-1 text-lg font-bold text-gray-900">
        {title}
      </h4>
      <div className="space-y-1 font-bold">{children}</div>
    </div>
  );
}

function BatchCharts({
  results,
  activeIndex,
}: {
  results: BatchResult[];
  activeIndex: number;
}) {
  const activeResult = results[activeIndex];
  const globalConfig = useMemo(
    () =>
      ({
        type: 'line',
        data: {
          datasets: results.map((result, index) => ({
            label: result.sampleName,
            data: result.raw
              .filter((row) => !row.isPan)
              .map((row) => ({ x: row.size, y: row.cumPassing })),
            borderColor: CHART_COLORS[index % CHART_COLORS.length],
            borderWidth: index === activeIndex ? 3 : 2,
            tension: 0.2,
            datalabels: { display: false },
          })),
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: results.length > 1,
              position: 'top',
              labels: { usePointStyle: true, boxWidth: 8 },
            },
          },
          scales: {
            x: {
              type: 'logarithmic',
              title: { display: true, text: 'Diameter (mm)' },
            },
            y: {
              min: 0,
              max: 100,
              title: { display: true, text: 'Weight % Finer' },
            },
          },
        },
      }) as ChartConfiguration,
    [activeIndex, results]
  );

  return (
    <div className="grid grid-cols-1 gap-8 pb-4 xl:grid-cols-2">
      <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-lg xl:col-span-2">
        <h3 className="mb-4 text-center text-xl font-bold">
          Global Grain Size Distribution Curve (Arithmetic Log)
        </h3>
        <ChartWrapper
          id="batch-global-distribution-curve"
          config={globalConfig}
          height={500}
        />
      </div>
      <div className="xl:col-span-2">
        <AllCharts result={activeResult} />
      </div>
    </div>
  );
}

function buildMasterCsv(results: BatchResult[]): string {
  const rows = [
    ['Metric', ...results.map((result) => result.sampleName)],
    ['Classification', ...results.map((result) => result.className)],
    ['Gravel %', ...results.map((result) => result.gravel.toFixed(2))],
    ['Sand %', ...results.map((result) => result.sand.toFixed(2))],
    ['Fines %', ...results.map((result) => result.fines.toFixed(2))],
    [],
    ['Graphic Measures (Folk & Ward)'],
    ['Mean (Phi)', ...results.map((result) => result.graphic.Mz.toFixed(3))],
    [
      'Median D50 (mm)',
      ...results.map((result) => result.graphic.D50mm.toFixed(3)),
    ],
    ['Sorting (Phi)', ...results.map((result) => result.graphic.Sd.toFixed(3))],
    ['Skewness', ...results.map((result) => result.graphic.Sk.toFixed(3))],
    ['Kurtosis', ...results.map((result) => result.graphic.Kg.toFixed(3))],
    [],
    ['Method of Moments'],
    ['Mean (Phi)', ...results.map((result) => result.mom.mean.toFixed(3))],
    ['Standard Dev', ...results.map((result) => result.mom.sd.toFixed(3))],
    ['Skewness', ...results.map((result) => result.mom.skew.toFixed(3))],
    ['Kurtosis', ...results.map((result) => result.mom.kurt.toFixed(3))],
  ];

  return rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`)
        .join(',')
    )
    .join('\n');
}
