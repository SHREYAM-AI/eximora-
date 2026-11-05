import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Wheat,
  Cpu,
  BarChart3,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

interface MonthlyTradeData {
  month: string;
  quarter: string;
  exportVolumeMT: number; // Food products in Metric Tons
  exportValueUSD: number; // in Millions USD
  importVolumeKUnits: number; // Electronics accessories in Thousands of Units
  importValueUSD: number; // in Millions USD
  totalTradeUSD: number;
}

const tradeTrendData: MonthlyTradeData[] = [
  { month: 'Jan 26', quarter: 'Q1', exportVolumeMT: 2850, exportValueUSD: 2.65, importVolumeKUnits: 240, importValueUSD: 1.82, totalTradeUSD: 4.47 },
  { month: 'Feb 26', quarter: 'Q1', exportVolumeMT: 3100, exportValueUSD: 2.88, importVolumeKUnits: 265, importValueUSD: 2.01, totalTradeUSD: 4.89 },
  { month: 'Mar 26', quarter: 'Q1', exportVolumeMT: 3450, exportValueUSD: 3.22, importVolumeKUnits: 290, importValueUSD: 2.22, totalTradeUSD: 5.44 },
  { month: 'Apr 26', quarter: 'Q2', exportVolumeMT: 3200, exportValueUSD: 2.98, importVolumeKUnits: 315, importValueUSD: 2.45, totalTradeUSD: 5.43 },
  { month: 'May 26', quarter: 'Q2', exportVolumeMT: 3600, exportValueUSD: 3.39, importVolumeKUnits: 330, importValueUSD: 2.58, totalTradeUSD: 5.97 },
  { month: 'Jun 26', quarter: 'Q2', exportVolumeMT: 3950, exportValueUSD: 3.71, importVolumeKUnits: 355, importValueUSD: 2.80, totalTradeUSD: 6.51 },
  { month: 'Jul 26', quarter: 'Q3', exportVolumeMT: 4100, exportValueUSD: 3.86, importVolumeKUnits: 380, importValueUSD: 3.02, totalTradeUSD: 6.88 },
  { month: 'Aug 26', quarter: 'Q3', exportVolumeMT: 4400, exportValueUSD: 4.15, importVolumeKUnits: 410, importValueUSD: 3.26, totalTradeUSD: 7.41 },
  { month: 'Sep 26', quarter: 'Q3', exportVolumeMT: 4750, exportValueUSD: 4.52, importVolumeKUnits: 445, importValueUSD: 3.56, totalTradeUSD: 8.08 },
  { month: 'Oct 26', quarter: 'Q4', exportVolumeMT: 5100, exportValueUSD: 4.88, importVolumeKUnits: 480, importValueUSD: 3.89, totalTradeUSD: 8.77 },
  { month: 'Nov 26', quarter: 'Q4', exportVolumeMT: 5500, exportValueUSD: 5.25, importVolumeKUnits: 510, importValueUSD: 4.18, totalTradeUSD: 9.43 },
  { month: 'Dec 26', quarter: 'Q4', exportVolumeMT: 5800, exportValueUSD: 5.58, importVolumeKUnits: 540, importValueUSD: 4.45, totalTradeUSD: 10.03 },
];

interface CommodityDistribution {
  category: string;
  corridor: 'export' | 'import';
  volumeShare: number;
  estAnnualValue: string;
  primaryDestOrigin: string;
  keyCert: string;
}

const commodityBreakdown: CommodityDistribution[] = [
  {
    category: 'Premium Basmati & Non-Basmati Rice',
    corridor: 'export',
    volumeShare: 42,
    estAnnualValue: '$19.8M',
    primaryDestOrigin: 'Middle East (Jebel Ali, Dammam) & EU',
    keyCert: 'APEDA & Phytosanitary',
  },
  {
    category: 'Organic Spices, Turmeric & Seeds',
    corridor: 'export',
    volumeShare: 28,
    estAnnualValue: '$13.2M',
    primaryDestOrigin: 'North America, UK & Netherlands',
    keyCert: 'FSSAI Export & USDA Organic',
  },
  {
    category: 'Cold-Pressed Oils & Processed Agri',
    corridor: 'export',
    volumeShare: 30,
    estAnnualValue: '$14.1M',
    primaryDestOrigin: 'Southeast Asia & Mediterranean',
    keyCert: 'BRCGS & Halal Certified',
  },
  {
    category: 'GaN Fast Chargers & Power Delivery Adapters',
    corridor: 'import',
    volumeShare: 38,
    estAnnualValue: '$14.2M',
    primaryDestOrigin: 'Shenzhen Tech Corridor → Nhava Sheva',
    keyCert: 'BIS CRS & CE RoHS',
  },
  {
    category: 'High-Durability Braided USB-C & Lightning Cables',
    corridor: 'import',
    volumeShare: 34,
    estAnnualValue: '$12.7M',
    primaryDestOrigin: 'Guangdong Cluster → Delhi ICD',
    keyCert: 'RoHS & MFi Qualified',
  },
  {
    category: 'Wireless Audio Drivers & Wearable Accessories',
    corridor: 'import',
    volumeShare: 28,
    estAnnualValue: '$10.5M',
    primaryDestOrigin: 'Taipei & Vietnam → Bangalore Cargo',
    keyCert: 'WPC ETA & BIS Lab QA',
  },
];

interface MarketPerformanceDashboardProps {
  onOpenOrderModal?: (corridor: 'export_agro' | 'import_electronics') => void;
}

export function MarketPerformanceDashboard({ onOpenOrderModal }: MarketPerformanceDashboardProps) {
  const [metricMode, setMetricMode] = useState<'value' | 'volume'>('value');
  const [selectedCorridor, setSelectedCorridor] = useState<'all' | 'export' | 'import'>('all');
  const [activeQuarterFilter, setActiveQuarterFilter] = useState<'all' | 'Q1' | 'Q2' | 'Q3' | 'Q4'>('all');

  const filteredTrendData = tradeTrendData.filter((d) => {
    if (activeQuarterFilter === 'all') return true;
    return d.quarter === activeQuarterFilter;
  });

  const totalFilteredExportValue = filteredTrendData.reduce((acc, curr) => acc + curr.exportValueUSD, 0);
  const totalFilteredImportValue = filteredTrendData.reduce((acc, curr) => acc + curr.importValueUSD, 0);
  const totalFilteredExportVolume = filteredTrendData.reduce((acc, curr) => acc + curr.exportVolumeMT, 0);
  const totalFilteredImportVolume = filteredTrendData.reduce((acc, curr) => acc + curr.importVolumeKUnits, 0);

  // Custom Chart Tooltip
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl bg-[#0c0d14]/95 border border-white/15 p-3.5 shadow-2xl backdrop-blur-md text-left font-sans min-w-[210px]">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
            <span className="font-mono text-xs font-semibold text-white tracking-wider">{label}</span>
            <span className="text-[10px] font-mono text-slate-400">Trade Run-Rate</span>
          </div>

          <div className="space-y-2">
            {payload.map((entry: any, index: number) => {
              const isExport = entry.dataKey?.toString().toLowerCase().includes('export');
              return (
                <div key={`tooltip-${index}`} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: entry.color || entry.fill }}
                    />
                    <span>{entry.name}</span>
                  </span>
                  <span className="font-mono font-medium text-white tabular-nums">
                    {metricMode === 'value'
                      ? `$${entry.value.toFixed(2)}M`
                      : isExport
                      ? `${entry.value.toLocaleString()} MT`
                      : `${entry.value.toLocaleString()}k Units`}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-amber-200/90 font-mono">
            <span>Asset-Light Fulfillment</span>
            <span>APEDA / BIS Validated</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="market-performance" className="w-full max-w-5xl mx-auto scroll-mt-20 text-left">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-amber-300/80 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
            <span>Two-Way Trade Intelligence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight">
            Market Performance & Volume Trends
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-xl font-light">
            Projected run-rate and volume distributions across Eximora's bilateral corridors. Exporting agricultural bounty from Indian producers overseas, and importing high-demand electronics for Indian trade sellers.
          </p>
        </div>

        {/* Action button */}
        {onOpenOrderModal && (
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onOpenOrderModal('export_agro')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-gradient-to-r from-amber-200 to-amber-300 hover:from-amber-100 hover:to-amber-200 active:scale-[0.98] rounded-xl transition-all shadow-lg shadow-amber-950/20 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Initiate Trade Order</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Console Box */}
      <div className="rounded-2xl bg-[#090A0F] border border-white/15 p-5 sm:p-7 shadow-2xl">
        {/* Top Control Bar: Corridor Toggle, Metric Mode Toggle, Quarter Selector */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
          {/* Corridor Selection */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono uppercase text-slate-400">Corridor:</span>
            <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-lg border border-white/10">
              <button
                type="button"
                onClick={() => setSelectedCorridor('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  selectedCorridor === 'all'
                    ? 'bg-white/15 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Combined Bilateral
              </button>
              <button
                type="button"
                onClick={() => setSelectedCorridor('export')}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
                  selectedCorridor === 'export'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Wheat className="w-3.5 h-3.5 text-emerald-400" />
                <span>Food Export</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedCorridor('import')}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
                  selectedCorridor === 'import'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                <span>Electronics Import</span>
              </button>
            </div>
          </div>

          {/* Metric and Quarter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Value vs Volume Metric Switcher */}
            <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-lg border border-white/10">
              <button
                type="button"
                onClick={() => setMetricMode('value')}
                className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                  metricMode === 'value'
                    ? 'bg-amber-300/20 text-amber-200 border border-amber-300/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Valuation ($M USD)
              </button>
              <button
                type="button"
                onClick={() => setMetricMode('volume')}
                className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                  metricMode === 'volume'
                    ? 'bg-amber-300/20 text-amber-200 border border-amber-300/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Physical Volume (MT / k-Units)
              </button>
            </div>

            {/* Quarter Filter */}
            <div className="flex items-center gap-1 text-xs font-mono text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {(['all', 'Q1', 'Q2', 'Q3', 'Q4'] as const).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setActiveQuarterFilter(q)}
                  className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                    activeQuarterFilter === q
                      ? 'bg-white/20 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {q.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4 Quantitative Metric Cards (Tabular figures, clean unboxed metadata) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6">
          {/* Card 1: Total Trade Value */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
              Estimated Total Run-Rate
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-serif font-bold text-white tabular-nums">
                ${(totalFilteredExportValue + totalFilteredImportValue).toFixed(1)}M
              </span>
              <span className="text-xs text-amber-300 font-mono">+27.4% YoY</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {activeQuarterFilter === 'all' ? 'Full 2026 Forward Horizon' : `${activeQuarterFilter} Focused Window`}
            </p>
          </div>

          {/* Card 2: Food Export Volume */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <Wheat className="w-3 h-3" />
              <span>Food Export Vol</span>
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-serif font-bold text-white tabular-nums">
                {totalFilteredExportVolume.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 font-mono">MT</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Est. ${totalFilteredExportValue.toFixed(1)}M Indian Agri
            </p>
          </div>

          {/* Card 3: Electronics Import Volume */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300 flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              <span>Electronics Import</span>
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-serif font-bold text-white tabular-nums">
                {totalFilteredImportVolume.toLocaleString()}k
              </span>
              <span className="text-xs text-slate-400 font-mono">Units</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Est. ${totalFilteredImportValue.toFixed(1)}M Wholesaler Reach
            </p>
          </div>

          {/* Card 4: Quality & Compliance */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
              Inspection Clearance
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-serif font-bold text-white tabular-nums">
                99.4%
              </span>
              <span className="text-xs text-emerald-400 font-mono">Zero Batch Reject</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              APEDA · FSSAI · BIS CRS · CE
            </p>
          </div>
        </div>

        {/* Primary Recharts Visualization */}
        <div className="mt-4 p-4 rounded-xl bg-black/40 border border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-300" />
              <h3 className="text-sm font-serif font-semibold text-white">
                {metricMode === 'value'
                  ? 'Bilateral Monthly Trade Valuation ($ Millions USD)'
                  : 'Bilateral Physical Trade Volume (Metric Tons vs. Thousand Units)'}
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                <span>Food Products Export</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
                <span>Electronic Accessories Import</span>
              </span>
            </div>
          </div>

          {/* Recharts Composed Chart (Area + Bar / Dual Axis) */}
          <div className="w-full h-[320px] sm:h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={filteredTrendData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="exportAgroGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="importElectronicsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.07)" vertical={false} />

                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.15)' }}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                />

                <YAxis
                  yAxisId="left"
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.15)' }}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                  tickFormatter={(val) => (metricMode === 'value' ? `$${val}M` : `${val}`)}
                />

                {metricMode === 'volume' && (
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(255, 255, 255, 0.15)' }}
                    tick={{ fill: '#f59e0b', fontSize: 11, fontFamily: 'monospace' }}
                    tickFormatter={(val) => `${val}k`}
                  />
                )}

                <Tooltip content={<CustomChartTooltip />} />

                {/* Export Corridor Visualization */}
                {(selectedCorridor === 'all' || selectedCorridor === 'export') && (
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey={metricMode === 'value' ? 'exportValueUSD' : 'exportVolumeMT'}
                    name="Food Exports (India → Global)"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#exportAgroGradient)"
                  />
                )}

                {/* Import Corridor Visualization */}
                {(selectedCorridor === 'all' || selectedCorridor === 'import') && (
                  <Bar
                    yAxisId={metricMode === 'volume' ? 'right' : 'left'}
                    dataKey={metricMode === 'value' ? 'importValueUSD' : 'importVolumeKUnits'}
                    name="Electronics Imports (Global → India)"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={38}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Commodity & Product Breakdown Grid */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-300" />
              <h3 className="text-sm font-serif font-semibold text-white">
                Bilateral Commodity Allocation & Verified Trade Routes
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-500">Asset-Light Trade Sourcing</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Export Commodity Card */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-xs font-mono uppercase text-emerald-400 flex items-center gap-1.5 font-semibold">
                  <Wheat className="w-3.5 h-3.5" />
                  <span>Export Corridor (Indian Farmers & Processors)</span>
                </span>
                <span className="text-xs font-mono text-slate-400">Total: $47.1M Est</span>
              </div>

              <div className="space-y-3">
                {commodityBreakdown
                  .filter((c) => c.corridor === 'export')
                  .map((item, idx) => (
                    <div key={`exp-${idx}`} className="text-xs">
                      <div className="flex items-center justify-between text-slate-200 mb-1">
                        <span className="font-medium text-white">{item.category}</span>
                        <span className="font-mono text-emerald-300 tabular-nums">{item.estAnnualValue}</span>
                      </div>
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-400 h-full rounded-full"
                          style={{ width: `${item.volumeShare}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 font-mono">
                        <span className="truncate max-w-[200px]">{item.primaryDestOrigin}</span>
                        <span className="text-slate-400">{item.keyCert}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Import Commodity Card */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-xs font-mono uppercase text-amber-300 flex items-center gap-1.5 font-semibold">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Import Corridor (Indian Retailers & Sellers)</span>
                </span>
                <span className="text-xs font-mono text-slate-400">Total: $37.4M Est</span>
              </div>

              <div className="space-y-3">
                {commodityBreakdown
                  .filter((c) => c.corridor === 'import')
                  .map((item, idx) => (
                    <div key={`imp-${idx}`} className="text-xs">
                      <div className="flex items-center justify-between text-slate-200 mb-1">
                        <span className="font-medium text-white">{item.category}</span>
                        <span className="font-mono text-amber-300 tabular-nums">{item.estAnnualValue}</span>
                      </div>
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-400 h-full rounded-full"
                          style={{ width: `${item.volumeShare}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 font-mono">
                        <span className="truncate max-w-[200px]">{item.primaryDestOrigin}</span>
                        <span className="text-slate-400">{item.keyCert}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Operating Model Summary Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-amber-300 font-semibold uppercase">Operational Model:</span>
            <span>Asset-light trader — sources, certifies, ships, and sells without manufacturing overhead.</span>
          </div>
          <span className="text-slate-500 shrink-0">Updated 2026 Projections</span>
        </div>
      </div>
    </div>
  );
}
