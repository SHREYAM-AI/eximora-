import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  PieChart as PieIcon,
  Wheat,
  Cpu,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Percent,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { TradeOrder } from '../types/order';

interface CorridorVolumeBreakdownProps {
  orders: TradeOrder[];
  onSelectCorridor?: (corridor: 'all' | 'export_agro' | 'import_electronics') => void;
  activeFilter?: 'all' | 'export_agro' | 'import_electronics';
}

interface CommodityBreakdownItem {
  name: string;
  category: string;
  corridor: 'export_agro' | 'import_electronics';
  ordersCount: number;
  totalVolume: number;
  unit: string;
  percentage: number;
  fill: string;
}

export function CorridorVolumeBreakdown({
  orders = [],
  onSelectCorridor,
  activeFilter = 'all',
}: CorridorVolumeBreakdownProps) {
  const [activeTab, setActiveTab] = useState<'donut' | 'commodities'>('donut');

  // Colors aligned with Eximora's luxury bilateral palette
  // Agro: Emerald / Jade tones
  // Electronics: Amber / Bronze / Gold tones
  const EXPORT_COLORS = ['#059669', '#10b981', '#34d399', '#047857'];
  const IMPORT_COLORS = ['#d97706', '#f59e0b', '#fbbf24', '#b45309'];

  const stats = useMemo(() => {
    const parseNumeric = (str: string) => {
      if (!str) return 0;
      const cleaned = str.replace(/[^0-9.]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    };

    const exportOrders = orders.filter((o) => o.corridor === 'export_agro');
    const importOrders = orders.filter((o) => o.corridor === 'import_electronics');

    const exportVolumeTotal = exportOrders.reduce((sum, o) => sum + parseNumeric(o.quantity), 0);
    const importVolumeTotal = importOrders.reduce((sum, o) => sum + parseNumeric(o.quantity), 0);

    const totalOrdersCount = orders.length;

    // Macro bilateral share (Order count-based for direct dimensional parity)
    const bilateralShareData = [
      {
        name: 'Food & Agro Exports',
        corridor: 'export_agro' as const,
        orderCount: exportOrders.length,
        volume: exportVolumeTotal,
        unit: 'MT',
        sharePercent: totalOrdersCount > 0 ? Math.round((exportOrders.length / totalOrdersCount) * 100) : 50,
        fill: '#059669',
      },
      {
        name: 'Electronics Imports',
        corridor: 'import_electronics' as const,
        orderCount: importOrders.length,
        volume: importVolumeTotal,
        unit: 'Units',
        sharePercent: totalOrdersCount > 0 ? Math.round((importOrders.length / totalOrdersCount) * 100) : 50,
        fill: '#d97706',
      },
    ];

    // Granular Commodity / Product Cluster Breakdown
    const commodityMap = new Map<string, {
      name: string;
      corridor: 'export_agro' | 'import_electronics';
      ordersCount: number;
      totalVolume: number;
      unit: string;
    }>();

    orders.forEach((ord) => {
      // Group by concise commodity root
      const rawName = ord.productName || (ord.corridor === 'export_agro' ? 'Basmati Rice' : 'GaN Fast Chargers');
      let clusterKey = rawName;
      if (/basmati|rice/i.test(rawName)) clusterKey = 'Basmati & Grain Rice';
      else if (/turmeric|spice|cumin|pepper/i.test(rawName)) clusterKey = 'Organic Spices & Condiments';
      else if (/pulses|lentil|bean/i.test(rawName)) clusterKey = 'Pulses & Agro Seeds';
      else if (/gan|charger|adapter/i.test(rawName)) clusterKey = 'GaN Wall Chargers & Adapters';
      else if (/cable|cord|type-c/i.test(rawName)) clusterKey = 'High-Durability USB-C Cables';
      else if (/audio|earphone|headphone/i.test(rawName)) clusterKey = 'TWS & Audio Peripherals';
      else clusterKey = rawName.slice(0, 24);

      const existing = commodityMap.get(clusterKey);
      const qty = parseNumeric(ord.quantity);
      if (existing) {
        existing.ordersCount += 1;
        existing.totalVolume += qty;
      } else {
        commodityMap.set(clusterKey, {
          name: clusterKey,
          corridor: ord.corridor,
          ordersCount: 1,
          totalVolume: qty,
          unit: ord.unit || (ord.corridor === 'export_agro' ? 'MT' : 'Units'),
        });
      }
    });

    const commodityList: CommodityBreakdownItem[] = Array.from(commodityMap.values()).map((item, idx) => {
      const palette = item.corridor === 'export_agro' ? EXPORT_COLORS : IMPORT_COLORS;
      const fill = palette[idx % palette.length];
      const categoryTotal = item.corridor === 'export_agro' ? exportOrders.length : importOrders.length;
      return {
        name: item.name,
        category: item.corridor === 'export_agro' ? 'Food & Agro Export' : 'Electronics Import',
        corridor: item.corridor,
        ordersCount: item.ordersCount,
        totalVolume: item.totalVolume,
        unit: item.unit,
        percentage: categoryTotal > 0 ? Math.round((item.ordersCount / categoryTotal) * 100) : 100,
        fill,
      };
    });

    // If no orders yet, provide illustrative portfolio clusters for architecture readiness
    const displayCommodities = commodityList.length > 0 ? commodityList : [
      {
        name: 'Basmati Rice (APEDA Certified)',
        category: 'Food & Agro Export',
        corridor: 'export_agro' as const,
        ordersCount: 0,
        totalVolume: 0,
        unit: 'MT',
        percentage: 60,
        fill: '#059669',
      },
      {
        name: 'Organic Spices (FSSAI Lab Tested)',
        category: 'Food & Agro Export',
        corridor: 'export_agro' as const,
        ordersCount: 0,
        totalVolume: 0,
        unit: 'MT',
        percentage: 40,
        fill: '#10b981',
      },
      {
        name: 'GaN Dual Chargers (BIS CRS IS 13252)',
        category: 'Electronics Import',
        corridor: 'import_electronics' as const,
        ordersCount: 0,
        totalVolume: 0,
        unit: 'Units',
        percentage: 65,
        fill: '#d97706',
      },
      {
        name: '100W PD Cables (RoHS 2.0)',
        category: 'Electronics Import',
        corridor: 'import_electronics' as const,
        ordersCount: 0,
        totalVolume: 0,
        unit: 'Units',
        percentage: 35,
        fill: '#f59e0b',
      },
    ];

    return {
      exportOrdersCount: exportOrders.length,
      importOrdersCount: importOrders.length,
      exportVolumeTotal,
      importVolumeTotal,
      totalOrdersCount,
      bilateralShareData,
      displayCommodities,
      hasRealData: totalOrdersCount > 0,
    };
  }, [orders]);

  // Tooltip for Pie & Donut Charts
  const CustomDonutTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <div className="rounded-xl bg-white/95 dark:bg-[#0c0d14]/95 border border-slate-200 dark:border-white/15 p-3.5 shadow-2xl backdrop-blur-md text-left font-sans min-w-[200px]">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/10 pb-1.5 mb-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: data.fill }}
            />
            <span className="font-serif text-xs font-semibold text-slate-900 dark:text-white">
              {data.name}
            </span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span>Bilateral Share:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{data.sharePercent}%</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span>Active Dockets:</span>
              <span className="font-mono font-medium text-slate-900 dark:text-white">{data.orderCount} Orders</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span>Aggregate Volume:</span>
              <span className="font-mono font-medium text-amber-800 dark:text-amber-300">
                {data.volume.toLocaleString()} {data.unit}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/10 text-left">
      {/* Component Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-amber-800 dark:text-amber-300 font-semibold mb-1">
            <PieIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-300" />
            <span>Corridor Volume Composition</span>
          </div>
          <h3 className="text-base sm:text-lg font-serif font-semibold text-slate-900 dark:text-white">
            Bilateral Trade Volume Breakdown
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Proportional allocation between Indian agro exports and overseas electronics imports.
          </p>
        </div>

        {/* View Switcher: Donut Proportion vs Granular Commodity Bars */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-white/[0.04] rounded-lg border border-slate-200 dark:border-white/10 self-start sm:self-auto shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab('donut')}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-colors cursor-pointer ${
              activeTab === 'donut'
                ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Bilateral Ratio
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('commodities')}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-colors cursor-pointer ${
              activeTab === 'commodities'
                ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Commodity Split
          </button>
        </div>
      </div>

      {/* Main Breakdown Visual Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column: Recharts Interactive Graphic (5 Cols) */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-slate-50/80 dark:bg-black/30 border border-slate-200 dark:border-white/10 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono pb-3 border-b border-slate-200 dark:border-white/5">
            <span className="text-slate-500 dark:text-slate-400 uppercase font-medium">Bilateral Share Metric</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
              {stats.totalOrdersCount} Tracked Dockets
            </span>
          </div>

          {activeTab === 'donut' ? (
            <div className="relative w-full h-[230px] flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomDonutTooltip />} />
                  <Pie
                    data={stats.bilateralShareData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="orderCount"
                    stroke="none"
                    cursor="pointer"
                    onClick={(entry: any) => {
                      const corridor = entry?.corridor || entry?.payload?.corridor;
                      if (onSelectCorridor && corridor) {
                        onSelectCorridor(corridor);
                      }
                    }}
                  >
                    {stats.bilateralShareData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.fill}
                        className="transition-opacity hover:opacity-85"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-serif font-bold text-slate-900 dark:text-white tabular-nums">
                  {stats.totalOrdersCount > 0
                    ? `${stats.bilateralShareData[0].sharePercent}% : ${stats.bilateralShareData[1].sharePercent}%`
                    : '1:1'}
                </span>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                  Agro : Elec
                </span>
              </div>
            </div>
          ) : (
            /* Commodity Breakdown Bar Chart */
            <div className="w-full h-[230px] my-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.displayCommodities}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(140, 140, 140, 0.15)" />
                  <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(140, 140, 140, 0.3)' }}
                    tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    width={110}
                    tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'sans-serif' }}
                  />
                  <Tooltip
                    formatter={(val: any, name: any, item: any) => [
                      `${val} Dockets (${item.payload.totalVolume.toLocaleString()} ${item.payload.unit})`,
                      item.payload.category,
                    ]}
                  />
                  <Bar dataKey="ordersCount" radius={[0, 4, 4, 0]}>
                    {stats.displayCommodities.map((entry, idx) => (
                      <Cell key={`bar-${idx}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Bottom Interactive Legend */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200 dark:border-white/5 text-xs font-mono">
            <button
              type="button"
              onClick={() => onSelectCorridor && onSelectCorridor('export_agro')}
              className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                activeFilter === 'export_agro'
                  ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-300'
                  : 'bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Food Exports</span>
              </div>
              <div className="mt-1 flex items-baseline justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">{stats.exportOrdersCount} Orders</span>
                <span className="font-bold">{stats.exportVolumeTotal.toLocaleString()} MT</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onSelectCorridor && onSelectCorridor('import_electronics')}
              className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                activeFilter === 'import_electronics'
                  ? 'bg-amber-50 dark:bg-amber-500/20 border-amber-300 dark:border-amber-500/40 text-amber-900 dark:text-amber-300'
                  : 'bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Electronics</span>
              </div>
              <div className="mt-1 flex items-baseline justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">{stats.importOrdersCount} Orders</span>
                <span className="font-bold">{stats.importVolumeTotal.toLocaleString()} Units</span>
              </div>
            </button>
          </div>
        </div>

        {/* Right Column: Comparative Commodity Cards & Execution Metrics (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Export Corridor Deep-Dive Card */}
            <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 flex flex-col justify-between text-left shadow-xs">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-white/5">
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold uppercase flex items-center gap-1">
                    <Wheat className="w-3 h-3" />
                    <span>Export Corridors</span>
                  </span>
                  <span>India → Global Ports</span>
                </div>

                <div className="mt-3">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Sourcing Quota</span>
                  <div className="text-xl font-serif font-bold text-slate-900 dark:text-white tabular-nums">
                    {stats.exportVolumeTotal.toLocaleString()}{' '}
                    <span className="text-xs font-mono text-slate-500 font-normal">Metric Tons</span>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Primary Hubs:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">Punjab, Gujarat, Haryana</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Quality Testing:</span>
                    <span className="font-mono text-emerald-700 dark:text-emerald-400 font-medium">APEDA · FSSAI · Phyto</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Key Commodities:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">Basmati, Spices, Pulses</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Asset-Light Farmer Co-op Allocations</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-medium">Verified Pure</span>
              </div>
            </div>

            {/* Import Corridor Deep-Dive Card */}
            <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 flex flex-col justify-between text-left shadow-xs">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-white/5">
                  <span className="text-amber-800 dark:text-amber-300 font-semibold uppercase flex items-center gap-1">
                    <Cpu className="w-3 h-3" />
                    <span>Import Corridors</span>
                  </span>
                  <span>World → Indian Hubs</span>
                </div>

                <div className="mt-3">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Procurement Quota</span>
                  <div className="text-xl font-serif font-bold text-slate-900 dark:text-white tabular-nums">
                    {stats.importVolumeTotal.toLocaleString()}{' '}
                    <span className="text-xs font-mono text-slate-500 font-normal">Finished Units</span>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Destination Ports:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">Nhava Sheva, Delhi ICD, Chennai</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Statutory Norms:</span>
                    <span className="font-mono text-amber-800 dark:text-amber-300 font-medium">BIS CRS IS 13252 · RoHS</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Target Channels:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">Wholesalers, E-Commerce, Retail</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Asset-Light OEM Sourcing Protocol</span>
                <span className="text-amber-800 dark:text-amber-300 font-medium">Direct Delivery</span>
              </div>
            </div>
          </div>

          {/* Operational Trade Insights Banner */}
          <div className="p-3.5 rounded-xl bg-amber-500/5 dark:bg-amber-400/[0.03] border border-amber-500/20 dark:border-amber-400/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 dark:bg-amber-400/15 flex items-center justify-center text-amber-700 dark:text-amber-300 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-light">
                <strong className="font-medium text-slate-900 dark:text-white font-serif">Bilateral Volume Balancing:</strong>{' '}
                Eximora continuously counterbalances outgoing agro commodities with incoming tech accessories to optimize container freight logistics.
              </p>
            </div>

            <div className="shrink-0 font-mono text-[11px] text-amber-800 dark:text-amber-300/90 font-medium">
              Zero Inventory Risk
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
