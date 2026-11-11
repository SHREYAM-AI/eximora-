import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import {
  Globe,
  Wheat,
  Cpu,
  Layers,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Clock,
  Anchor,
  Compass,
  Sparkles,
  ChevronRight,
  Radio,
  CheckCircle2,
  Maximize2,
  RotateCcw,
} from 'lucide-react';
import { TradeCorridor } from '../types/order';

interface GlobalTradeNetworkProps {
  onOpenOrderModal?: (corridor: TradeCorridor, presetPrompt?: string) => void;
}

export interface TradeHub {
  id: string;
  name: string;
  country: string;
  region: string;
  portName: string;
  portCode: string;
  coordinates: [number, number]; // [longitude, latitude]
  type: 'headquarters' | 'agro_export' | 'electronics_import' | 'european_terminal';
  corridorRole: string;
  primaryCommodities: string[];
  certifications: string[];
  transitTimes: { destination: string; seaDays: string; airHours?: string }[];
  description: string;
}

export interface TradeRoute {
  id: string;
  name: string;
  originHubId: string;
  destHubId: string;
  corridorType: 'export_agro' | 'import_electronics' | 'bilateral';
  color: string;
  commodities: string;
  distanceNauticalMiles: number;
  avgTransitDays: string;
  incoterms: string[];
  standards: string[];
}

export const HUBS: TradeHub[] = [
  {
    id: 'hub-india',
    name: 'Mumbai / JNPT & Mundra',
    country: 'India',
    region: 'South Asia',
    portName: 'Jawaharlal Nehru Port (JNPT) & Port of Mundra',
    portCode: 'INNSA / INMUN',
    coordinates: [72.8777, 18.9712],
    type: 'headquarters',
    corridorRole: 'Bilateral Headquarters & Sourcing Epicenter',
    primaryCommodities: [
      '1121 & Pusa Basmati Rice',
      'Organic Turmeric & Cumin',
      'High-Power GaN Chargers (Import)',
      '100W PD Cables (Import)',
    ],
    certifications: ['APEDA Accredited', 'FSSAI Export License', 'BIS CRS IS 13252', 'Phytosanitary'],
    transitTimes: [
      { destination: 'Dubai (Jebel Ali)', seaDays: '4–6 Days', airHours: '3.5 Hours' },
      { destination: 'Singapore', seaDays: '5–7 Days', airHours: '5.5 Hours' },
      { destination: 'Rotterdam', seaDays: '22–26 Days', airHours: '10 Hours' },
    ],
    description:
      'The central coordination nerve center for Eximora’s bilateral operations. Directly links certified agricultural farming cooperatives in Punjab, Gujarat, and Haryana with international markets, while distributing imported electronics to Indian wholesale and retail channels.',
  },
  {
    id: 'hub-dubai',
    name: 'Dubai / Jebel Ali',
    country: 'United Arab Emirates',
    region: 'Middle East & GCC',
    portName: 'Port of Jebel Ali Terminal',
    portCode: 'AEJEA',
    coordinates: [55.0273, 24.9857],
    type: 'agro_export',
    corridorRole: 'GCC Food Distribution & Bulk Agro Gateway',
    primaryCommodities: [
      'Sortex Cleaned Basmati Rice',
      'Organic Culinary Spices',
      'Lentils & Agro Seeds',
    ],
    certifications: ['APEDA TraceNet', 'Dubai Municipality Food Safety', 'ESMA Conformity', 'Halal QA'],
    transitTimes: [
      { destination: 'Mumbai (JNPT)', seaDays: '4–6 Days' },
      { destination: 'Rotterdam', seaDays: '16–19 Days' },
    ],
    description:
      'Premier commercial trading crossroad for Middle Eastern food security. Receives containerized food products shipped under CIF Jebel Ali terms for re-distribution across UAE, Saudi Arabia, Oman, and regional hypermarket chains.',
  },
  {
    id: 'hub-singapore',
    name: 'Singapore',
    country: 'Singapore',
    region: 'Southeast Asia',
    portName: 'Port of Singapore (PSA) & Jurong Logistics Hub',
    portCode: 'SGSIN',
    coordinates: [103.8198, 1.3521],
    type: 'electronics_import',
    corridorRole: 'High-Demand Consumer Electronics Consolidation Hub',
    primaryCommodities: [
      'GaN 65W/100W Wall Adapters',
      'Braided Type-C PD Cables',
      'TWS Earphones & Audio Peripherals',
    ],
    certifications: ['BIS CRS IS 13252 (Part 1)', 'RoHS 2.0 Compliant', 'CE EMC/LVD', 'IEC 62368-1'],
    transitTimes: [
      { destination: 'Mumbai (Nhava Sheva)', seaDays: '5–7 Days', airHours: '5 Hours' },
      { destination: 'Dubai', seaDays: '9–12 Days' },
    ],
    description:
      'Leading Asian tech procurement anchor. Coordinates verified electronics suppliers, batch laboratory safety assays under Indian BIS standards, and container stuffing for immediate delivery to Indian wholesale distributors.',
  },
  {
    id: 'hub-rotterdam',
    name: 'Rotterdam',
    country: 'Netherlands',
    region: 'Western Europe',
    portName: 'Port of Rotterdam (Maasvlakte Gateway)',
    portCode: 'NLRTM',
    coordinates: [4.4777, 51.9244],
    type: 'european_terminal',
    corridorRole: 'European Continental Agricultural Terminal',
    primaryCommodities: [
      'High-Curcumin Organic Turmeric',
      'Pesticide-Free Spices',
      'Non-GMO Agricultural Produce',
    ],
    certifications: ['EU MRL Regulation (EC) 396/2005', 'FSSAI Export Standard', 'GlobalGAP', 'Eurofins Lab Tested'],
    transitTimes: [
      { destination: 'Mumbai (JNPT)', seaDays: '22–26 Days' },
      { destination: 'Dubai', seaDays: '16–19 Days' },
    ],
    description:
      'Europe’s largest deep-sea port terminal. Fulfills strict European agricultural and phytosanitary import contracts with zero residue tolerance, receiving temperature-monitored container consignments from certified Indian growers.',
  },
];

export const ROUTES: TradeRoute[] = [
  {
    id: 'route-in-dxb',
    name: 'India ⇄ Dubai Agro Express',
    originHubId: 'hub-india',
    destHubId: 'hub-dubai',
    corridorType: 'export_agro',
    color: '#059669', // Emerald
    commodities: 'Basmati Rice, Organic Spices & Oilseeds',
    distanceNauticalMiles: 1060,
    avgTransitDays: '4–6 Days',
    incoterms: ['CIF Jebel Ali', 'FOB Mundra', 'CFR'],
    standards: ['APEDA TraceNet', 'Phytosanitary', 'FSSAI Export'],
  },
  {
    id: 'route-sg-in',
    name: 'Singapore ⇄ India Tech Bridge',
    originHubId: 'hub-singapore',
    destHubId: 'hub-india',
    corridorType: 'import_electronics',
    color: '#d97706', // Amber
    commodities: 'GaN Dual Chargers, 100W PD Cables, Audio Gear',
    distanceNauticalMiles: 2150,
    avgTransitDays: '5–7 Days',
    incoterms: ['DDP Delhi ICD', 'CIF Nhava Sheva', 'EXW'],
    standards: ['BIS CRS IS 13252', 'RoHS 2.0', 'IS 1293'],
  },
  {
    id: 'route-in-rtm',
    name: 'India ⇄ Rotterdam Maritime Corridor',
    originHubId: 'hub-india',
    destHubId: 'hub-rotterdam',
    corridorType: 'export_agro',
    color: '#10b981', // Jade Green
    commodities: 'Organic Turmeric (Curcumin >= 4.8%), Cumin, Non-GMO Commodities',
    distanceNauticalMiles: 6350,
    avgTransitDays: '22–26 Days',
    incoterms: ['CIF Rotterdam', 'FOB Nhava Sheva'],
    standards: ['EU MRL (EC) 396/2005', 'APEDA Lab Certified', 'ISO 22000'],
  },
  {
    id: 'route-dxb-rtm',
    name: 'Dubai ⇄ Rotterdam Trade Alignment',
    originHubId: 'hub-dubai',
    destHubId: 'hub-rotterdam',
    corridorType: 'bilateral',
    color: '#0284c7', // Steel Blue
    commodities: 'Bilateral Food Re-Allocation & Strategic Commodities',
    distanceNauticalMiles: 5400,
    avgTransitDays: '16–19 Days',
    incoterms: ['CIF', 'FOB'],
    standards: ['International Maritime Protocol', 'Customs Pre-Clearance'],
  },
];

// Simplified geographic landmass polygon paths for Eurasia, Africa, and East Asia (offline, self-contained)
const WORLD_LANDMASS_POLYGONS: [number, number][][] = [
  // Western Europe / British Isles / Mediterranean outline
  [
    [-9, 36], [-8, 43], [-1, 46], [3, 51], [8, 54], [10, 57], [18, 58], [24, 60],
    [32, 65], [40, 67], [50, 68], [60, 66], [66, 60], [60, 55], [50, 50], [40, 45],
    [30, 42], [24, 38], [15, 38], [5, 36], [-5, 36], [-9, 36]
  ],
  // North Africa & Arabian Peninsula
  [
    [-17, 21], [-5, 36], [12, 38], [25, 32], [32, 31], [35, 28], [44, 13], [51, 12],
    [58, 22], [55, 26], [48, 30], [40, 31], [36, 30], [33, 27], [32, 22], [38, 15],
    [43, 11], [50, 9], [44, 4], [30, -5], [10, 5], [0, 6], [-16, 12], [-17, 21]
  ],
  // Indian Subcontinent & South Asia
  [
    [62, 25], [68, 24], [70, 22], [72, 19], [76, 10], [77, 8], [80, 10], [80, 13],
    [85, 20], [88, 22], [90, 24], [80, 28], [74, 34], [68, 30], [62, 25]
  ],
  // Southeast Asia & Indonesian Archipelago outline
  [
    [98, 10], [101, 3], [104, 1], [108, 12], [109, 18], [105, 21], [100, 18],
    [98, 14], [98, 10]
  ],
  // East Asia & Coast
  [
    [105, 21], [110, 20], [118, 25], [122, 30], [120, 38], [128, 42], [115, 40],
    [100, 35], [90, 32], [85, 27], [90, 24], [100, 22], [105, 21]
  ],
];

export function GlobalTradeNetwork({ onOpenOrderModal }: GlobalTradeNetworkProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'export_agro' | 'import_electronics'>('all');
  const [selectedHub, setSelectedHub] = useState<TradeHub>(HUBS[0]);
  const [hoveredRoute, setHoveredRoute] = useState<TradeRoute | null>(null);
  const [simulatorOrigin, setSimulatorOrigin] = useState<string>('hub-india');
  const [simulatorDest, setSimulatorDest] = useState<string>('hub-dubai');

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Compute filtered routes
  const filteredRoutes = useMemo(() => {
    if (activeFilter === 'all') return ROUTES;
    return ROUTES.filter((r) => r.corridorType === activeFilter || r.corridorType === 'bilateral');
  }, [activeFilter]);

  // Setup D3 Projection
  // Framing Europe, Africa, Middle East, India, and Southeast Asia:
  // Center longitude ~58°E, latitude ~26°N
  const dimensions = { width: 920, height: 500 };

  const projection = useMemo(() => {
    return d3
      .geoMercator()
      .center([62, 28])
      .scale(380)
      .translate([dimensions.width / 2, dimensions.height / 2]);
  }, [dimensions.width, dimensions.height]);

  const pathGenerator = useMemo(() => {
    return d3.geoPath().projection(projection);
  }, [projection]);

  // Generate Hub pixel positions
  const hubPositions = useMemo(() => {
    const map = new Map<string, [number, number]>();
    HUBS.forEach((hub) => {
      const pos = projection(hub.coordinates);
      if (pos) {
        map.set(hub.id, pos);
      }
    });
    return map;
  }, [projection]);

  // Generate Bezier curved paths for routes with animated pulse
  const routePaths = useMemo(() => {
    return filteredRoutes.map((route) => {
      const originPos = hubPositions.get(route.originHubId);
      const destPos = hubPositions.get(route.destHubId);

      if (!originPos || !destPos) return null;

      // Calculate smooth curved arc using quadratic bezier
      const [x1, y1] = originPos;
      const [x2, y2] = destPos;

      const dx = x2 - x1;
      const dy = y2 - y1;
      const dr = Math.sqrt(dx * dx + dy * dy);

      // Arc curvature height based on distance
      const curvature = 0.22;
      const mx = (x1 + x2) / 2 - dy * curvature;
      const my = (y1 + y2) / 2 + dx * curvature;

      const d = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;

      return {
        route,
        d,
        x1,
        y1,
        x2,
        y2,
        mx,
        my,
      };
    }).filter(Boolean);
  }, [filteredRoutes, hubPositions]);

  // Simulator route info
  const simulatedRoute = useMemo(() => {
    const origin = HUBS.find((h) => h.id === simulatorOrigin);
    const dest = HUBS.find((h) => h.id === simulatorDest);
    const directRoute = ROUTES.find(
      (r) =>
        (r.originHubId === simulatorOrigin && r.destHubId === simulatorDest) ||
        (r.originHubId === simulatorDest && r.destHubId === simulatorOrigin)
    );

    return {
      origin,
      dest,
      directRoute,
    };
  }, [simulatorOrigin, simulatorDest]);

  return (
    <div id="global-network" className="w-full max-w-5xl mx-auto scroll-mt-24 text-left my-16 sm:my-20">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-amber-800 dark:text-amber-300 font-semibold mb-2">
            <Compass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-300" />
            <span>International Trade Footprint</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 dark:text-white tracking-tight">
            Global Trade Network & Active Corridors
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl font-light leading-relaxed">
            Interactive D3 visualization of Eximora’s bilateral trading backbone connecting certified agricultural suppliers in India with key commercial hubs in Dubai, Singapore, and Rotterdam.
          </p>
        </div>

        {/* Action Button */}
        {onOpenOrderModal && (
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onOpenOrderModal('export_agro')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 hover:from-amber-200 hover:to-amber-300 active:scale-[0.98] rounded-xl transition-all shadow-md cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Route Order via AI</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Global Network Console Box */}
      <div className="rounded-2xl bg-white dark:bg-[#090A0F] border border-slate-200 dark:border-white/15 p-5 sm:p-7 shadow-xl dark:shadow-2xl transition-colors">
        {/* Top Control Bar: Corridor Filter & Network Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-white/10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 font-medium">Corridor Focus:</span>
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-white/[0.04] rounded-lg border border-slate-200 dark:border-white/10 shadow-xs">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 text-xs font-mono rounded transition-colors cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Corridors (4 Hubs)
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('export_agro')}
                className={`px-3 py-1.5 text-xs font-mono rounded transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeFilter === 'export_agro'
                    ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Wheat className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Agro Exports</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('import_electronics')}
                className={`px-3 py-1.5 text-xs font-mono rounded transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeFilter === 'import_electronics'
                    ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Cpu className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>Electronics Imports</span>
              </button>
            </div>
          </div>

          {/* Key Footprint Metrics */}
          <div className="flex items-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Export Corridors</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Import Corridors</span>
            </span>
            <span className="hidden lg:inline text-slate-400 dark:text-slate-600">·</span>
            <span className="hidden lg:inline">Asset-Light Routing</span>
          </div>
        </div>

        {/* Interactive D3 Visualization Canvas */}
        <div className="relative mt-6 rounded-xl bg-slate-950 overflow-hidden border border-slate-200 dark:border-white/10 shadow-inner group">
          {/* Subtle Grid Lines & Latitude Graticules */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

          {/* SVG Map Container */}
          <div ref={containerRef} className="w-full aspect-[16/9] sm:aspect-[1.9/1] relative select-none">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
              className="w-full h-full block"
            >
              <defs>
                {/* Glow Filter for Active Routes */}
                <filter id="emerald-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="amber-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Linear Gradients along routes */}
                <linearGradient id="grad-india-dubai" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="1" />
                </linearGradient>
                <linearGradient id="grad-singapore-india" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="1" />
                </linearGradient>
                <linearGradient id="grad-india-rotterdam" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="1" />
                </linearGradient>
              </defs>

              {/* 1. Geographical Landmass Shapes (D3 Rendered) */}
              <g className="landmasses" opacity="0.85">
                {WORLD_LANDMASS_POLYGONS.map((polygon, pIdx) => {
                  const geoJsonPolygon: any = {
                    type: 'Polygon',
                    coordinates: [polygon],
                  };
                  const pathData = pathGenerator(geoJsonPolygon);
                  return (
                    <path
                      key={`land-${pIdx}`}
                      d={pathData || ''}
                      fill="#161A24"
                      stroke="#272D3D"
                      strokeWidth="1"
                      className="transition-colors hover:fill-[#1B2130]"
                    />
                  );
                })}
              </g>

              {/* 2. Maritime Route Lines (D3 Quadratic Arcs with animated pulse flow) */}
              <g className="trade-routes">
                {routePaths.map((rp, rIdx) => {
                  if (!rp) return null;
                  const isHovered = hoveredRoute?.id === rp.route.id;
                  const isAgro = rp.route.corridorType === 'export_agro';
                  const strokeColor = rp.route.color;

                  return (
                    <g
                      key={`route-${rp.route.id}`}
                      onMouseEnter={() => setHoveredRoute(rp.route)}
                      onMouseLeave={() => setHoveredRoute(null)}
                      className="cursor-pointer"
                    >
                      {/* Wide invisible hit area for easy hover */}
                      <path
                        d={rp.d}
                        fill="none"
                        stroke="transparent"
                        strokeWidth="18"
                      />

                      {/* Route Base Arc */}
                      <path
                        d={rp.d}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={isHovered ? 3.5 : 2}
                        strokeOpacity={isHovered ? 0.9 : 0.45}
                        strokeDasharray={isAgro ? '6,4' : '4,3'}
                        className="transition-all duration-200"
                      />

                      {/* Animated Pulse Beam along route */}
                      <path
                        d={rp.d}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={isHovered ? 4 : 2.5}
                        strokeOpacity={0.95}
                        strokeDasharray="18,120"
                        className="animate-route-flow"
                        filter={isAgro ? 'url(#emerald-glow)' : 'url(#amber-glow)'}
                      />

                      {/* Midpoint Vessel Badge */}
                      <circle
                        cx={rp.mx}
                        cy={rp.my}
                        r={isHovered ? 5 : 3.5}
                        fill={strokeColor}
                        stroke="#090A0E"
                        strokeWidth="1.5"
                        className="transition-transform duration-200"
                      />
                    </g>
                  );
                })}
              </g>

              {/* 3. Trade Hub Pins & Pulsing Concentric Radar Rings */}
              <g className="trade-hubs">
                {HUBS.map((hub) => {
                  const pos = hubPositions.get(hub.id);
                  if (!pos) return null;
                  const [cx, cy] = pos;
                  const isSelected = selectedHub.id === hub.id;
                  const isHQ = hub.type === 'headquarters';
                  const hubColor = isHQ
                    ? '#F59E0B' // Golden Amber
                    : hub.type === 'agro_export' || hub.type === 'european_terminal'
                    ? '#10B981' // Emerald
                    : '#F59E0B'; // Amber

                  return (
                    <g
                      key={`hub-node-${hub.id}`}
                      onClick={() => setSelectedHub(hub)}
                      className="cursor-pointer group/node"
                      transform={`translate(${cx}, ${cy})`}
                    >
                      {/* Pulse Wave Radar Ring */}
                      <circle
                        r={isSelected ? 18 : 12}
                        fill={hubColor}
                        fillOpacity={isSelected ? 0.25 : 0.12}
                        className="animate-ping origin-center duration-3000"
                      />

                      {/* Outer Selection Ring */}
                      <circle
                        r={isSelected ? 10 : 7}
                        fill="#0A0C14"
                        stroke={hubColor}
                        strokeWidth={isSelected ? 2.5 : 1.5}
                        className="transition-all duration-200"
                      />

                      {/* Center Core Dot */}
                      <circle
                        r={isSelected ? 4 : 3}
                        fill={hubColor}
                        className="transition-transform group-hover/node:scale-125"
                      />

                      {/* Port Label Tag */}
                      <g transform="translate(0, 16)" className="pointer-events-none select-none">
                        <rect
                          x={-hub.name.length * 3.4}
                          y={-7}
                          width={hub.name.length * 6.8}
                          height={14}
                          rx={3}
                          fill="#090A0ECC"
                          stroke={isSelected ? hubColor : '#ffffff15'}
                          strokeWidth="0.8"
                        />
                        <text
                          textAnchor="middle"
                          y={3}
                          fill={isSelected ? '#FFFFFF' : '#94A3B8'}
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight={isSelected ? 'bold' : 'normal'}
                          letterSpacing="0.05em"
                        >
                          {hub.name}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Quick Floating Map Overlay (Bottom Left Legend) */}
            <div className="absolute bottom-3 left-3 p-2.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-mono text-slate-300 space-y-1 pointer-events-none hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>India HQ · JNPT & Mundra</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Dubai (Jebel Ali) & Rotterdam</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Singapore (Tech Procurement)</span>
              </div>
            </div>

            {/* Reset / Zoom Indicator (Top Right) */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-slate-300">
                Mercator Centered: 62°E, 28°N
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Hub Detail & Corridor Dossier Strip */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-6 items-stretch">
          {/* Left Column: Selected Hub Port Profile (7 Cols) */}
          <div className="lg:col-span-7 p-5 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 flex flex-col justify-between text-left shadow-xs">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-xs font-mono uppercase text-amber-800 dark:text-amber-300 font-semibold tracking-wider">
                    {selectedHub.region} Hub
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-500">{selectedHub.portCode}</span>
              </div>

              <div className="mt-4">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white">
                    {selectedHub.name}
                  </h3>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    {selectedHub.portName}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-light leading-relaxed">
                  {selectedHub.description}
                </p>
              </div>

              {/* Commodities & Compliance Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-3 border-t border-slate-200 dark:border-white/5">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1.5 font-semibold">
                    Key Commodities Traded:
                  </span>
                  <div className="space-y-1">
                    {selectedHub.primaryCommodities.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1.5 font-semibold">
                    Statutory Compliance Norms:
                  </span>
                  <div className="space-y-1">
                    {selectedHub.certifications.map((cert, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Maritime Transit Schedules & Order Action */}
            <div className="mt-5 pt-3 border-t border-slate-200 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
              <div className="flex flex-wrap items-center gap-3 text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <Anchor className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Sea Transit:</span>
                </span>
                {selectedHub.transitTimes.map((tt, idx) => (
                  <span key={idx}>
                    {tt.destination}: <strong className="text-slate-900 dark:text-white font-mono">{tt.seaDays}</strong>
                    {idx < selectedHub.transitTimes.length - 1 && ' · '}
                  </span>
                ))}
              </div>

              {onOpenOrderModal && (
                <button
                  type="button"
                  onClick={() => {
                    const corridorTarget: TradeCorridor =
                      selectedHub.type === 'electronics_import' ? 'import_electronics' : 'export_agro';
                    onOpenOrderModal(corridorTarget, `Trade consignment involving ${selectedHub.name} (${selectedHub.portName})`);
                  }}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-200 inline-flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <span>Route Inquiry</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Interactive Transit & Corridor Router (5 Cols) */}
          <div className="lg:col-span-5 p-5 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 flex flex-col justify-between text-left shadow-xs">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/5">
                <span className="text-xs font-mono uppercase text-slate-500 font-semibold flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-amber-600 dark:text-amber-300" />
                  <span>Corridor Transit Calculator</span>
                </span>
                <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-medium">Active Schedule</span>
              </div>

              {/* Origin / Destination Pickers */}
              <div className="grid grid-cols-2 gap-3 my-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                    Origin Port Hub:
                  </label>
                  <select
                    value={simulatorOrigin}
                    onChange={(e) => setSimulatorOrigin(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-black/50 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500"
                  >
                    {HUBS.map((h) => (
                      <option key={`origin-${h.id}`} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                    Destination Hub:
                  </label>
                  <select
                    value={simulatorDest}
                    onChange={(e) => setSimulatorDest(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-black/50 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500"
                  >
                    {HUBS.map((h) => (
                      <option key={`dest-${h.id}`} value={h.id} disabled={h.id === simulatorOrigin}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Transit Calculation Output */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-500">Route Corridor:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {simulatedRoute.directRoute ? simulatedRoute.directRoute.name : 'Bilateral Multi-Leg Freight'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-500">Nautical Distance:</span>
                  <span className="font-mono text-slate-900 dark:text-white">
                    {simulatedRoute.directRoute
                      ? `${simulatedRoute.directRoute.distanceNauticalMiles.toLocaleString()} NM`
                      : '3,200+ NM'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-500">Estimated Sea Transit:</span>
                  <span className="font-mono font-bold text-amber-700 dark:text-amber-300">
                    {simulatedRoute.directRoute ? simulatedRoute.directRoute.avgTransitDays : '7–12 Days'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono pt-1.5 border-t border-slate-100 dark:border-white/5">
                  <span className="text-slate-500">Standard Incoterms:</span>
                  <span className="font-mono text-emerald-700 dark:text-emerald-400">
                    {simulatedRoute.directRoute ? simulatedRoute.directRoute.incoterms.join(' · ') : 'CIF · FOB · DDP'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            {onOpenOrderModal && (
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    const isImport =
                      simulatedRoute.origin?.id === 'hub-singapore' ||
                      simulatedRoute.dest?.id === 'hub-singapore';
                    const targetCorridor: TradeCorridor = isImport ? 'import_electronics' : 'export_agro';
                    onOpenOrderModal(
                      targetCorridor,
                      `Book consignment between ${simulatedRoute.origin?.name} and ${simulatedRoute.dest?.name}`
                    );
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-black bg-gradient-to-r from-amber-300 to-amber-400 hover:from-amber-200 hover:to-amber-300 transition-all cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Initiate AI Docket on this Corridor</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Operating Model Footnote */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-amber-700 dark:text-amber-300 font-semibold uppercase">Footprint Standard:</span>
            <span>Asset-light bilateral corridors connecting India, Dubai, Singapore, and Rotterdam.</span>
          </div>
          <span className="text-slate-400 dark:text-slate-500 shrink-0">D3 Geodesic Projection</span>
        </div>
      </div>
    </div>
  );
}
