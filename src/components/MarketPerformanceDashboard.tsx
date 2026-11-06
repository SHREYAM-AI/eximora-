import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  TrendingUp,
  Wheat,
  Cpu,
  BarChart3,
  Layers,
  Sparkles,
  Inbox,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { TradeOrder } from '../types/order';

interface MarketPerformanceDashboardProps {
  orders: TradeOrder[];
  onOpenOrderModal?: (corridor: 'export_agro' | 'import_electronics') => void;
}

export function MarketPerformanceDashboard({ orders = [], onOpenOrderModal }: MarketPerformanceDashboardProps) {
  const [selectedCorridor, setSelectedCorridor] = useState<'all' | 'export_agro' | 'import_electronics'>('all');

  // Compute real trade volume numbers from actual orders
  const metrics = useMemo(() => {
    const exportOrders = orders.filter((o) => o.corridor === 'export_agro');
    const importOrders = orders.filter((o) => o.corridor === 'import_electronics');

    const parseNumeric = (str: string) => {
      if (!str) return 0;
      const cleaned = str.replace(/[^0-9.]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    };

    const exportVolumeTotal = exportOrders.reduce((sum, o) => sum + parseNumeric(o.quantity), 0);
    const importVolumeTotal = importOrders.reduce((sum, o) => sum + parseNumeric(o.quantity), 0);

    const fulfilledCount = orders.filter((o) => o.stage === 'fulfilled').length;
    const inExecutionCount = orders.filter((o) => o.stage === 'execution').length;
    const registeredCount = orders.filter((o) => o.stage === 'registered').length;

    return {
      exportOrders,
      importOrders,
      exportVolumeTotal,
      importVolumeTotal,
      totalOrders: orders.length,
      fulfilledCount,
      inExecutionCount,
      registeredCount,
    };
  }, [orders]);

  // Generate dynamic chart data based exclusively on actual orders
  const chartData = useMemo(() => {
    if (orders.length === 0) return [];

    // Group orders chronologically by date or order ID
    return orders.map((ord, idx) => {
      const parseQty = (str: string) => {
        const cleaned = str.replace(/[^0-9.]/g, '');
        const val = parseFloat(cleaned);
        return isNaN(val) ? 1 : val;
      };

      const isExport = ord.corridor === 'export_agro';
      return {
        label: ord.orderNumber || `Order #${idx + 1}`,
        productName: ord.productName,
        exportVolumeMT: isExport ? parseQty(ord.quantity) : 0,
        importVolumeUnits: !isExport ? parseQty(ord.quantity) : 0,
        stage: ord.stage,
      };
    });
  }, [orders]);

  const hasOrders = orders.length > 0;

  // Custom Chart Tooltip
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <div className="rounded-xl bg-white/95 dark:bg-[#0c0d14]/95 border border-slate-200 dark:border-white/15 p-3.5 shadow-2xl backdrop-blur-md text-left font-sans min-w-[220px]">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-1.5 mb-2">
            <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white tracking-wider">{label}</span>
            <span className="text-[10px] font-mono uppercase text-amber-700 dark:text-amber-300 capitalize font-medium">{data?.stage}</span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate mb-2">{data?.productName}</p>

          <div className="space-y-1.5">
            {payload.map((entry: any, index: number) => {
              if (entry.value === 0) return null;
              const isExport = entry.dataKey === 'exportVolumeMT';
              return (
                <div key={`tooltip-${index}`} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: entry.color || entry.fill }}
                    />
                    <span>{entry.name}</span>
                  </span>
                  <span className="font-mono font-medium text-slate-900 dark:text-white tabular-nums">
                    {isExport ? `${entry.value.toLocaleString()} MT` : `${entry.value.toLocaleString()} Units`}
                  </span>
                </div>
              );
            })}
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
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-amber-800 dark:text-amber-300/80 mb-2 font-semibold">
            <TrendingUp className="w-3.5 h-3.5 text-amber-700 dark:text-amber-300" />
            <span>Two-Way Trade Volume Tracking</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 dark:text-white tracking-tight">
            Market Performance & Volume Trends
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl font-light">
            Live volume tracking across Eximora's bilateral corridors. Exporting agricultural bounty from Indian producers overseas, and importing high-demand electronics for Indian trade sellers.
          </p>
        </div>

        {/* Action button */}
        {onOpenOrderModal && (
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onOpenOrderModal('export_agro')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 hover:from-amber-200 hover:to-amber-300 active:scale-[0.98] rounded-xl transition-all shadow-md cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Place Order with AI</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Console Box */}
      <div className="rounded-2xl bg-white dark:bg-[#090A0F] border border-slate-200 dark:border-white/15 p-5 sm:p-7 shadow-xl dark:shadow-2xl transition-colors">
        {/* Top Control Bar: Corridor Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-white/10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400">Corridor View:</span>
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-white/[0.03] rounded-lg border border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setSelectedCorridor('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  selectedCorridor === 'all'
                    ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Combined Bilateral ({orders.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCorridor('export_agro')}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
                  selectedCorridor === 'export_agro'
                    ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Wheat className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Food Export ({metrics.exportOrders.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedCorridor('import_electronics')}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
                  selectedCorridor === 'import_electronics'
                    ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Electronics Import ({metrics.importOrders.length})</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span>Data Source: Live Trade Inquiries</span>
          </div>
        </div>

        {/* 4 Quantitative Metric Cards (Real figures only, zero dummy numbers) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6">
          {/* Card 1: Total Active Orders */}
          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-medium">
              Registered Inquiries
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white tabular-nums">
                {metrics.totalOrders}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Orders</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {metrics.totalOrders === 0 ? 'Awaiting initial trade query' : `${metrics.registeredCount} in registration queue`}
            </p>
          </div>

          {/* Card 2: Food Export Volume */}
          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-semibold">
              <Wheat className="w-3 h-3" />
              <span>Food Export Volume</span>
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white tabular-nums">
                {metrics.exportVolumeTotal.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">MT</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {metrics.exportOrders.length === 0 ? 'No export contracts queued' : `${metrics.exportOrders.length} active export dockets`}
            </p>
          </div>

          {/* Card 3: Electronics Import Volume */}
          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10">
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1 font-semibold">
              <Cpu className="w-3 h-3" />
              <span>Electronics Import</span>
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white tabular-nums">
                {metrics.importVolumeTotal.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Units</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {metrics.importOrders.length === 0 ? 'No import contracts queued' : `${metrics.importOrders.length} active import dockets`}
            </p>
          </div>

          {/* Card 4: Execution & Fulfillment */}
          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-medium">
              Fulfilled Orders
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white tabular-nums">
                {metrics.fulfilledCount}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">/ {metrics.totalOrders} Total</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {metrics.inExecutionCount} orders in execution
            </p>
          </div>
        </div>

        {/* Recharts Visualization Area */}
        <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-white/5">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-600 dark:text-amber-300" />
              <h3 className="text-sm font-serif font-semibold text-slate-900 dark:text-white">
                Bilateral Trade Volume Distribution
              </h3>
            </div>
            {hasOrders && (
              <div className="flex items-center gap-4 text-xs font-mono text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                  <span>Food Export (MT)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                  <span>Electronics Import (Units)</span>
                </span>
              </div>
            )}
          </div>

          {/* Real Data Chart or Clean Zero State */}
          {hasOrders ? (
            <div className="w-full h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="realExportAgroGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(140, 140, 140, 0.15)" vertical={false} />

                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(140, 140, 140, 0.3)' }}
                    tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
                  />

                  <YAxis
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(140, 140, 140, 0.3)' }}
                    tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
                  />

                  <Tooltip content={<CustomChartTooltip />} />

                  {(selectedCorridor === 'all' || selectedCorridor === 'export_agro') && (
                    <Area
                      type="monotone"
                      dataKey="exportVolumeMT"
                      name="Food Exports (MT)"
                      stroke="#059669"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#realExportAgroGradient)"
                    />
                  )}

                  {(selectedCorridor === 'all' || selectedCorridor === 'import_electronics') && (
                    <Bar
                      dataKey="importVolumeUnits"
                      name="Electronics Imports (Units)"
                      fill="#d97706"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-14 px-6 text-center border border-dashed border-slate-300 dark:border-white/10 rounded-xl bg-white dark:bg-white/[0.01]">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 mb-3">
                <Inbox className="w-6 h-6 text-slate-500 dark:text-slate-400" />
              </div>
              <h4 className="text-base font-serif text-slate-900 dark:text-white font-medium">No Trade Volume Recorded Yet</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                Volume trends and corridor distributions are calculated in real time as customer trade inquiries are registered. No dummy figures or simulated volumes are shown.
              </p>
              {onOpenOrderModal && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => onOpenOrderModal('export_agro')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-black bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 hover:from-amber-200 hover:to-amber-300 rounded-lg transition-all shadow-md cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Place Order to Initiate Tracking</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bilateral Trade Corridors Allocation Grid */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600 dark:text-amber-300" />
              <h3 className="text-sm font-serif font-semibold text-slate-900 dark:text-white">
                Bilateral Corridor Portfolio
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-500">Asset-Light Sourcing</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Export Corridor Overview */}
            <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/5">
                <span className="text-xs font-mono uppercase text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 font-semibold">
                  <Wheat className="w-3.5 h-3.5" />
                  <span>Export Corridor (Food & Agro)</span>
                </span>
                <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                  {metrics.exportVolumeTotal.toLocaleString()} MT Registered
                </span>
              </div>

              {metrics.exportOrders.length > 0 ? (
                <div className="space-y-2">
                  {metrics.exportOrders.map((ord) => (
                    <div key={ord.id} className="p-2.5 rounded-lg bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 text-xs flex items-center justify-between shadow-xs">
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white truncate max-w-[200px]">{ord.productName}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{ord.incoterm} · {ord.destination}</div>
                      </div>
                      <span className="font-mono text-emerald-700 dark:text-emerald-300 font-semibold">{ord.quantity} {ord.unit}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-black/20 border border-slate-200 dark:border-white/5 shadow-xs">
                    <div className="flex items-center justify-between text-slate-800 dark:text-slate-200">
                      <span className="font-medium text-slate-900 dark:text-white">Basmati & Non-Basmati Rice</span>
                      <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">APEDA / Phyto</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Sourced from certified farmers cooperatives in Punjab & Haryana</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-black/20 border border-slate-200 dark:border-white/5 shadow-xs">
                    <div className="flex items-center justify-between text-slate-800 dark:text-slate-200">
                      <span className="font-medium text-slate-900 dark:text-white">Organic Spices & Oilseeds</span>
                      <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">FSSAI / Lab Tested</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Direct sourcing from accredited processors in Gujarat & Rajasthan</p>
                  </div>
                </div>
              )}
            </div>

            {/* Import Corridor Overview */}
            <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/5">
                <span className="text-xs font-mono uppercase text-amber-700 dark:text-amber-300 flex items-center gap-1.5 font-semibold">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Import Corridor (Electronic Accessories)</span>
                </span>
                <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                  {metrics.importVolumeTotal.toLocaleString()} Units Registered
                </span>
              </div>

              {metrics.importOrders.length > 0 ? (
                <div className="space-y-2">
                  {metrics.importOrders.map((ord) => (
                    <div key={ord.id} className="p-2.5 rounded-lg bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 text-xs flex items-center justify-between shadow-xs">
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white truncate max-w-[200px]">{ord.productName}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{ord.incoterm} · {ord.destination}</div>
                      </div>
                      <span className="font-mono text-amber-700 dark:text-amber-300 font-semibold">{ord.quantity} {ord.unit}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-black/20 border border-slate-200 dark:border-white/5 shadow-xs">
                    <div className="flex items-center justify-between text-slate-800 dark:text-slate-200">
                      <span className="font-medium text-slate-900 dark:text-white">GaN Fast Charging Adapters</span>
                      <span className="text-[10px] font-mono text-amber-700 dark:text-amber-300 font-semibold">BIS CRS / CE</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Procured from verified electronics clusters for Indian wholesalers</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-black/20 border border-slate-200 dark:border-white/5 shadow-xs">
                    <div className="flex items-center justify-between text-slate-800 dark:text-slate-200">
                      <span className="font-medium text-slate-900 dark:text-white">Braided High-Durability Cables</span>
                      <span className="text-[10px] font-mono text-amber-700 dark:text-amber-300 font-semibold">RoHS / Tested</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Imported for e-commerce brands, retail networks, and regional distributors</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Operating Model Summary Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-amber-700 dark:text-amber-300 font-semibold uppercase">Operating Model:</span>
            <span>Asset-light trader — sources, certifies, ships, and sells without manufacturing.</span>
          </div>
          <span className="text-slate-400 dark:text-slate-500 shrink-0">Live Order Metrics</span>
        </div>
      </div>
    </div>
  );
}
