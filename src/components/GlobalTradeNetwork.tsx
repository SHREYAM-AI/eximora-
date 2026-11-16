import React, { useState, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import {
  Wheat,
  Cpu,
  ArrowRight,
  Compass,
  Sparkles,
  Radio,
  CheckCircle2,
  Truck,
} from 'lucide-react';
import { TradeCorridor } from '../types/order';

interface GlobalTradeNetworkProps {
  onOpenOrderModal?: (corridor: TradeCorridor, presetPrompt?: string) => void;
}

export interface TradeHub {
  id: string;
  name: string;
  state: string;
  region: string;
  terminalName: string;
  hubCode: string;
  coordinates: [number, number]; // [longitude, latitude]
  type: 'headquarters' | 'agro_export' | 'electronics_import';
  corridorRole: string;
  primaryCommodities: string[];
  certifications: string[];
  transitTimes: { destination: string; transitDays: string; mode?: string }[];
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
  distanceKm: number;
  avgTransitDays: string;
  terms: string[];
  standards: string[];
}

export const HUBS: TradeHub[] = [
  {
    id: 'hub-delhi',
    name: 'Delhi NCR (Okhla & Kundli)',
    state: 'Delhi / Haryana',
    region: 'Northern India',
    terminalName: 'Tughlakabad ICD & Kundli Agro-Tech Park',
    hubCode: 'DL-NCR-HUB',
    coordinates: [77.209, 28.6139],
    type: 'headquarters',
    corridorRole: 'Northern Bilateral HQ & Electronics Distribution Anchor',
    primaryCommodities: [
      '65W / 100W GaN Dual Chargers',
      'Braided Type-C PD Cables',
      '1121 Steam Basmati Rice',
      'TWS Audio & Power Banks',
    ],
    certifications: ['NIC E-Way & IGST', 'BIS CRS IS 13252', 'FSSAI Interstate', 'LMPC Verified'],
    transitTimes: [
      { destination: 'Mumbai / Bhiwandi', transitDays: '2 Days (NH-48 / DFC)' },
      { destination: 'Ludhiana', transitDays: '6–8 Hours (Express Truck)' },
      { destination: 'Bengaluru', transitDays: '3–4 Days (CONCOR Rail)' },
    ],
    description:
      'Tiffora’s northern command hub linking NCR electronics assembly clusters in Noida and Gurugram with Tier-1/2 state wholesalers, while aggregating grain dispatches from Haryana and Punjab.',
  },
  {
    id: 'hub-ludhiana',
    name: 'Ludhiana / Amritsar',
    state: 'Punjab',
    region: 'Northern Grain Belt',
    terminalName: 'Ludhiana Multi-Modal Logistics Park (MMLP)',
    hubCode: 'PB-LDH-AGRO',
    coordinates: [75.8573, 30.901],
    type: 'agro_export',
    corridorRole: 'Premier Basmati Rice & Grain Sourcing Epicenter',
    primaryCommodities: [
      '1121 Extra Long Basmati Rice',
      'Sortex Wheat & Pulses',
      'Cold-Pressed Mustard Oil',
    ],
    certifications: ['AGMARK Grade-A', 'FSSAI Central License', 'e-NAM APMC Verified', 'ISO 22000'],
    transitTimes: [
      { destination: 'Delhi NCR', transitDays: '6–8 Hours' },
      { destination: 'Mumbai / Bhiwandi', transitDays: '2–3 Days' },
      { destination: 'Bengaluru', transitDays: '3–4 Days' },
    ],
    description:
      'Direct farm-gate procurement anchor connecting verified Punjab & Haryana farmer producer organizations (FPOs) and sortex rice mills with institutional food buyers across Maharashtra, Karnataka, and Tamil Nadu.',
  },
  {
    id: 'hub-ahmedabad',
    name: 'Ahmedabad / Unjha',
    state: 'Gujarat',
    region: 'Western Agro & Spice Belt',
    terminalName: 'Sanand-Unjha Spice & Commodity Exchange Hub',
    hubCode: 'GJ-AMD-AGRO',
    coordinates: [72.5714, 23.0225],
    type: 'agro_export',
    corridorRole: 'Spice, Cumin, Oilseeds & Dry Commodity Dispatch Hub',
    primaryCommodities: [
      'Unjha Jeera (Cumin Seeds)',
      'Organic Turmeric & Coriander',
      'Groundnut & Sesame Oilseeds',
    ],
    certifications: ['Spices Board India QA', 'FSSAI Interstate', 'AGMARK Pure', 'NIC E-Way Cleared'],
    transitTimes: [
      { destination: 'Mumbai / Bhiwandi', transitDays: '1 Day (NH-48 Overnight)' },
      { destination: 'Chennai', transitDays: '3 Days' },
    ],
    description:
      'Western India’s flagship agricultural sourcing corridor centered around Unjha and Ahmedabad. Delivers moisture-tested spices, oilseeds, and pulses across Indian state borders with full IGST invoicing.',
  },
  {
    id: 'hub-mumbai',
    name: 'Mumbai / Bhiwandi',
    state: 'Maharashtra',
    region: 'Western Commerce',
    terminalName: 'Bhiwandi Interstate Fulfillment & Freight Park',
    hubCode: 'MH-BWD-HUB',
    coordinates: [73.0631, 19.2813],
    type: 'headquarters',
    corridorRole: 'Western Commercial Gateway & E-Commerce Redistribution',
    primaryCommodities: [
      'Retail & E-Commerce Electronics',
      'High-Volume Agro Consumer Lots',
      '100W PD Cables & MagSafe Docks',
    ],
    certifications: ['BIS CRS Verified', 'Legal Metrology (LMPC)', 'FSSAI State & Central', 'IGST B2B'],
    transitTimes: [
      { destination: 'Ahmedabad', transitDays: '1 Day' },
      { destination: 'Bengaluru', transitDays: '1–2 Days (NH-48)' },
      { destination: 'Delhi NCR', transitDays: '2 Days (Western DFC)' },
    ],
    description:
      'Western India’s high-velocity commercial nerve center. Counterbalances incoming Basmati and spice rail/truck lots from Punjab and Gujarat with outbound electronic accessories for state retail chains.',
  },
  {
    id: 'hub-bengaluru',
    name: 'Bengaluru',
    state: 'Karnataka',
    region: 'Southern Tech & Retail',
    terminalName: 'Nelamangala & Whitefield Tech Logistics Park',
    hubCode: 'KA-BLR-HUB',
    coordinates: [77.5946, 12.9716],
    type: 'electronics_import',
    corridorRole: 'Southern Tech Accessory & Agro Buyer Destination',
    primaryCommodities: [
      'GaN Fast Chargers & Power Banks',
      'TWS Audio & Laptop Docks',
      'Wholesale Basmati & Spices',
    ],
    certifications: ['BIS CRS IS 13252', 'RoHS 2.0 Compliant', 'FSSAI Buyer Audit', 'E-Way Part-B'],
    transitTimes: [
      { destination: 'Chennai', transitDays: '6–7 Hours (Expressway)' },
      { destination: 'Mumbai / Bhiwandi', transitDays: '1–2 Days' },
    ],
    description:
      'Receives multi-state food consignments for Southern institutional buyers and supermarkets, while distributing BIS-certified mobile & laptop accessories to regional retailers across Karnataka and Kerala.',
  },
  {
    id: 'hub-chennai',
    name: 'Chennai / Sriperumbudur',
    state: 'Tamil Nadu',
    region: 'Southern Electronics Corridor',
    terminalName: 'Sriperumbudur Electronics Manufacturing & Freight Cluster',
    hubCode: 'TN-MAA-TECH',
    coordinates: [80.2707, 13.0827],
    type: 'electronics_import',
    corridorRole: 'Southern Electronics Sourcing & State Wholesale Anchor',
    primaryCommodities: [
      'Made-in-India GaN Chargers',
      'Braided USB-C Cables & Adapters',
      'Audio Wearables & Peripherals',
    ],
    certifications: ['BIS CRS Registered', 'LMPC Retail Pack Ready', 'ISO 9001 Hub QA', 'IGST Compliant'],
    transitTimes: [
      { destination: 'Bengaluru', transitDays: '6–7 Hours' },
      { destination: 'Mumbai / Bhiwandi', transitDays: '2–3 Days' },
      { destination: 'Delhi NCR', transitDays: '3–4 Days (Express Rail)' },
    ],
    description:
      'Anchor southern sourcing hub in Tamil Nadu’s premier electronics corridor. Connects verified OEM accessory lots directly with state wholesalers and marketplace sellers across India.',
  },
];

export const ROUTES: TradeRoute[] = [
  {
    id: 'route-pb-mh',
    name: 'Punjab ⇄ Maharashtra Agro Expressway',
    originHubId: 'hub-ludhiana',
    destHubId: 'hub-mumbai',
    corridorType: 'export_agro',
    color: '#059669',
    commodities: '1121 Basmati Rice, Wheat, Mustard Oil & Pulses',
    distanceKm: 1620,
    avgTransitDays: '2–3 Days',
    terms: ['FOR Ludhiana', 'DDP Bhiwandi', 'EXW Mandi'],
    standards: ['FSSAI Interstate', 'AGMARK Grade A', 'NIC E-Way Bill'],
  },
  {
    id: 'route-dl-blr',
    name: 'Delhi NCR ⇄ Bengaluru Tech & Agro Bridge',
    originHubId: 'hub-delhi',
    destHubId: 'hub-bengaluru',
    corridorType: 'import_electronics',
    color: '#d97706',
    commodities: 'GaN 65W Chargers, PD Cables, TWS Audio Peripherals',
    distanceKm: 2150,
    avgTransitDays: '3–4 Days',
    terms: ['DDP Bengaluru', 'FOR Okhla', 'EXW Noida'],
    standards: ['BIS CRS IS 13252', 'LMPC MRP Ready', 'IGST Tax Invoice'],
  },
  {
    id: 'route-gj-mh',
    name: 'Gujarat ⇄ Maharashtra Spice Corridor',
    originHubId: 'hub-ahmedabad',
    destHubId: 'hub-mumbai',
    corridorType: 'export_agro',
    color: '#10b981',
    commodities: 'Unjha Cumin, Organic Turmeric, Sesame & Spices',
    distanceKm: 530,
    avgTransitDays: '1 Day',
    terms: ['FOR Unjha', 'DDP Mumbai', 'CIF'],
    standards: ['Spices Board QA', 'FSSAI Interstate', 'AGMARK'],
  },
  {
    id: 'route-maa-mh',
    name: 'Chennai ⇄ Mumbai Tech Supply Corridor',
    originHubId: 'hub-chennai',
    destHubId: 'hub-mumbai',
    corridorType: 'import_electronics',
    color: '#f59e0b',
    commodities: 'High-Velocity Mobile Chargers, Cables & Wearables',
    distanceKm: 1340,
    avgTransitDays: '2–3 Days',
    terms: ['DDP Bhiwandi', 'FOR Sriperumbudur', 'EXW'],
    standards: ['BIS CRS Registered', 'RoHS 2.0', 'E-Way Part-B'],
  },
  {
    id: 'route-pb-blr',
    name: 'Punjab ⇄ Karnataka Pan-India Grain Rail',
    originHubId: 'hub-ludhiana',
    destHubId: 'hub-bengaluru',
    corridorType: 'export_agro',
    color: '#059669',
    commodities: 'Sortex Basmati, Pulses & Processed Food Lots',
    distanceKm: 2420,
    avgTransitDays: '3–4 Days',
    terms: ['FOR Ludhiana', 'DDP Bengaluru'],
    standards: ['CONCOR Rail Manifest', 'FSSAI Interstate', 'AGMARK'],
  },
  {
    id: 'route-dl-mh',
    name: 'Delhi NCR ⇄ Mumbai Golden Trunk',
    originHubId: 'hub-delhi',
    destHubId: 'hub-mumbai',
    corridorType: 'bilateral',
    color: '#0284c7',
    commodities: 'Two-Way Agro Balancing & Retail Electronics Freight',
    distanceKm: 1410,
    avgTransitDays: '2 Days',
    terms: ['FOR', 'DDP', 'EXW'],
    standards: ['Western DFC Rail', 'NIC E-Way Bill', 'IGST B2B'],
  },
];

// Self-contained GeoJSON polygon for India's national outline (clockwise/closed ring)
const INDIA_LANDMASS_POLYGONS: [number, number][][] = [
  [
    [68.2, 23.7], [69.0, 22.8], [69.0, 22.2], [70.4, 20.9], [72.2, 21.7],
    [72.8, 21.1], [72.8, 19.1], [73.3, 17.0], [73.8, 15.4], [74.8, 12.9],
    [76.2, 9.9], [77.5, 8.1], [79.8, 10.3], [80.3, 13.1], [80.2, 15.8],
    [82.3, 16.9], [84.8, 19.3], [86.9, 20.8], [88.3, 21.6], [88.9, 22.6],
    [88.2, 24.5], [88.8, 26.6], [89.9, 26.2], [91.8, 25.2], [92.3, 23.7],
    [93.0, 23.8], [94.4, 24.8], [95.2, 27.1], [97.3, 28.0], [96.0, 29.2],
    [92.0, 27.8], [88.8, 27.9], [88.0, 27.2], [85.5, 26.6], [81.5, 28.0],
    [80.2, 29.8], [79.0, 31.2], [77.8, 32.8], [78.9, 34.4], [76.5, 35.5],
    [74.5, 35.0], [73.8, 34.0], [74.6, 32.5], [74.5, 31.0], [73.0, 29.5],
    [70.6, 27.8], [69.5, 26.5], [71.0, 24.7], [68.5, 24.0], [68.2, 23.7],
  ],
];

// Approximate highway/rail distance between any two Indian hubs using Haversine * 1.24 road factor
function estimateInterstateDistanceKm(a: TradeHub, b: TradeHub): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.coordinates[1] - a.coordinates[1]);
  const dLon = toRad(b.coordinates[0] - a.coordinates[0]);
  const lat1 = toRad(a.coordinates[1]);
  const lat2 = toRad(b.coordinates[1]);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const straightKm = 2 * R * Math.asin(Math.sqrt(h));
  return Math.round((straightKm * 1.24) / 10) * 10;
}

export function GlobalTradeNetwork({ onOpenOrderModal }: GlobalTradeNetworkProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'export_agro' | 'import_electronics'>('all');
  const [selectedHub, setSelectedHub] = useState<TradeHub>(HUBS[0]);
  const [hoveredRoute, setHoveredRoute] = useState<TradeRoute | null>(null);
  const [simulatorOrigin, setSimulatorOrigin] = useState<string>('hub-ludhiana');
  const [simulatorDest, setSimulatorDest] = useState<string>('hub-mumbai');

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredRoutes = useMemo(() => {
    if (activeFilter === 'all') return ROUTES;
    return ROUTES.filter((r) => r.corridorType === activeFilter || r.corridorType === 'bilateral');
  }, [activeFilter]);

  const dimensions = { width: 920, height: 500 };

  const projection = useMemo(() => {
    return d3
      .geoMercator()
      .center([82.0, 21.8])
      .scale(840)
      .translate([dimensions.width / 2, dimensions.height / 2]);
  }, [dimensions.width, dimensions.height]);

  const pathGenerator = useMemo(() => {
    return d3.geoPath().projection(projection);
  }, [projection]);

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

  const routePaths = useMemo(() => {
    return filteredRoutes
      .map((route) => {
        const originPos = hubPositions.get(route.originHubId);
        const destPos = hubPositions.get(route.destHubId);

        if (!originPos || !destPos) return null;

        const [x1, y1] = originPos;
        const [x2, y2] = destPos;

        const dx = x2 - x1;
        const dy = y2 - y1;

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
      })
      .filter(Boolean);
  }, [filteredRoutes, hubPositions]);

  const simulatedRoute = useMemo(() => {
    const origin = HUBS.find((h) => h.id === simulatorOrigin);
    const dest = HUBS.find((h) => h.id === simulatorDest);
    const directRoute = ROUTES.find(
      (r) =>
        (r.originHubId === simulatorOrigin && r.destHubId === simulatorDest) ||
        (r.originHubId === simulatorDest && r.destHubId === simulatorOrigin)
    );

    const estimatedKm =
      directRoute?.distanceKm ||
      (origin && dest ? estimateInterstateDistanceKm(origin, dest) : 1400);
    const estimatedDays =
      directRoute?.avgTransitDays ||
      (estimatedKm < 700 ? '1–2 Days' : estimatedKm < 1600 ? '2–3 Days' : '3–5 Days');

    return {
      origin,
      dest,
      directRoute,
      estimatedKm,
      estimatedDays,
    };
  }, [simulatorOrigin, simulatorDest]);

  return (
    <div id="global-network" className="w-full max-w-5xl mx-auto scroll-mt-24 text-left my-16 sm:my-20">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-amber-800 dark:text-amber-300 font-semibold mb-2">
            <Compass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-300" />
            <span>Pan-India Interstate Footprint</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 dark:text-white tracking-tight">
            Interstate Trade Network &amp; Active Corridors
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl font-light leading-relaxed">
            Interactive D3 visualization of Tiffora’s two-way interstate trading backbone connecting certified agricultural state hubs in Punjab and Gujarat with metro commercial and electronics centers in Delhi NCR, Mumbai, Bengaluru, and Chennai.
          </p>
        </div>

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

      {/* Main Network Console Box */}
      <div className="rounded-2xl bg-white dark:bg-[#090A0F] border border-slate-200 dark:border-white/15 p-5 sm:p-7 shadow-xl dark:shadow-2xl transition-colors">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-white/10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 font-medium">
              Corridor Focus:
            </span>
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
                All Corridors (6 State Hubs)
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
                <span>State Agro Dispatch</span>
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
                <span>Electronics Supply</span>
              </button>
            </div>
          </div>

          {/* Key Footprint Metrics */}
          <div className="flex items-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>State Agro Routes</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Tech Hub Routes</span>
            </span>
            <span className="hidden lg:inline text-slate-400 dark:text-slate-600">·</span>
            <span className="hidden lg:inline">E-Way &amp; IGST Synced</span>
          </div>
        </div>

        {/* Interactive D3 Visualization Canvas */}
        <div className="relative mt-6 rounded-xl bg-slate-950 overflow-hidden border border-slate-200 dark:border-white/10 shadow-inner group">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

          <div ref={containerRef} className="w-full aspect-[16/9] sm:aspect-[1.9/1] relative select-none">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
              className="w-full h-full block"
            >
              <defs>
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
              </defs>

              {/* 1. Geographical India Outline (D3 Rendered) */}
              <g className="landmasses" opacity="0.9">
                {INDIA_LANDMASS_POLYGONS.map((polygon, pIdx) => {
                  const geoJsonPolygon: any = {
                    type: 'Polygon',
                    coordinates: [polygon],
                  };
                  const pathData = pathGenerator(geoJsonPolygon);
                  return (
                    <path
                      key={`india-land-${pIdx}`}
                      d={pathData || ''}
                      fill="#161A24"
                      stroke="#334155"
                      strokeWidth="1.4"
                      className="transition-colors hover:fill-[#1B2130]"
                    />
                  );
                })}
              </g>

              {/* 2. Interstate Route Lines (D3 Quadratic Arcs) */}
              <g className="trade-routes">
                {routePaths.map((rp) => {
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
                      <path d={rp.d} fill="none" stroke="transparent" strokeWidth="18" />

                      <path
                        d={rp.d}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={isHovered ? 3.5 : 2}
                        strokeOpacity={isHovered ? 0.9 : 0.48}
                        strokeDasharray={isAgro ? '6,4' : '4,3'}
                        className="transition-all duration-200"
                      />

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

              {/* 3. State Trade Hub Pins */}
              <g className="trade-hubs">
                {HUBS.map((hub) => {
                  const pos = hubPositions.get(hub.id);
                  if (!pos) return null;
                  const [cx, cy] = pos;
                  const isSelected = selectedHub.id === hub.id;
                  const isAgro = hub.type === 'agro_export';
                  const hubColor = isAgro ? '#10B981' : '#F59E0B';
                  const shortLabel = hub.name.split('(')[0].split('/')[0].trim();

                  // Offset label slightly for nearby Bengaluru/Chennai pins so labels never collide
                  const labelOffsetY = hub.id === 'hub-bengaluru' ? 18 : hub.id === 'hub-chennai' ? -16 : 16;

                  return (
                    <g
                      key={`hub-node-${hub.id}`}
                      onClick={() => setSelectedHub(hub)}
                      className="cursor-pointer group/node"
                      transform={`translate(${cx}, ${cy})`}
                    >
                      <circle
                        r={isSelected ? 18 : 11}
                        fill={hubColor}
                        fillOpacity={isSelected ? 0.25 : 0.12}
                        className="animate-ping origin-center duration-3000"
                      />

                      <circle
                        r={isSelected ? 9.5 : 6.5}
                        fill="#0A0C14"
                        stroke={hubColor}
                        strokeWidth={isSelected ? 2.5 : 1.5}
                        className="transition-all duration-200"
                      />

                      <circle
                        r={isSelected ? 4 : 2.8}
                        fill={hubColor}
                        className="transition-transform group-hover/node:scale-125"
                      />

                      <g transform={`translate(0, ${labelOffsetY})`} className="pointer-events-none select-none">
                        <rect
                          x={-shortLabel.length * 3.8 - 6}
                          y={-7}
                          width={shortLabel.length * 7.6 + 12}
                          height={14}
                          rx={3}
                          fill="#090A0ED9"
                          stroke={isSelected ? hubColor : '#ffffff20'}
                          strokeWidth="0.8"
                        />
                        <text
                          textAnchor="middle"
                          y={3}
                          fill={isSelected ? '#FFFFFF' : '#CBD5E1'}
                          fontSize="9.5"
                          fontFamily="monospace"
                          fontWeight={isSelected ? 'bold' : 'normal'}
                          letterSpacing="0.04em"
                        >
                          {shortLabel}
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
                <span>Delhi NCR &amp; Mumbai · Commercial &amp; Tech HQs</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Ludhiana &amp; Ahmedabad · Surplus Agro Origins</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Bengaluru &amp; Chennai · Southern Tech &amp; Retail</span>
              </div>
            </div>

            {/* Projection Indicator (Top Right) */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-slate-300">
                India Mercator: 82.0°E, 21.8°N
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Hub Detail & Corridor Dossier Strip */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-6 items-stretch">
          {/* Left Column: Selected State Hub Profile */}
          <div className="lg:col-span-7 p-5 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 flex flex-col justify-between text-left shadow-xs">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-xs font-mono uppercase text-amber-800 dark:text-amber-300 font-semibold tracking-wider">
                    {selectedHub.state} · {selectedHub.region}
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-500">{selectedHub.hubCode}</span>
              </div>

              <div className="mt-4">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white">
                    {selectedHub.name}
                  </h3>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    {selectedHub.terminalName}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-light leading-relaxed">
                  {selectedHub.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-3 border-t border-slate-200 dark:border-white/5">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1.5 font-semibold">
                    Key Interstate Commodities:
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
                    Interstate Compliance Norms:
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

            {/* Express Highway / Rail Transit Schedules */}
            <div className="mt-5 pt-3 border-t border-slate-200 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
              <div className="flex flex-wrap items-center gap-3 text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Line-Haul Transit:</span>
                </span>
                {selectedHub.transitTimes.map((tt, idx) => (
                  <span key={idx}>
                    {tt.destination}: <strong className="text-slate-900 dark:text-white font-mono">{tt.transitDays}</strong>
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
                    onOpenOrderModal(
                      corridorTarget,
                      `Interstate consignment involving ${selectedHub.name}, ${selectedHub.state}`
                    );
                  }}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-200 inline-flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <span>Route Inquiry</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Interactive Interstate Corridor Router */}
          <div className="lg:col-span-5 p-5 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 flex flex-col justify-between text-left shadow-xs">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/5">
                <span className="text-xs font-mono uppercase text-slate-500 font-semibold flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-amber-600 dark:text-amber-300" />
                  <span>Interstate Transit Calculator</span>
                </span>
                <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-medium">
                  Active Schedule
                </span>
              </div>

              {/* Origin / Destination State Hub Pickers */}
              <div className="grid grid-cols-2 gap-3 my-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                    Origin State Hub:
                  </label>
                  <select
                    value={simulatorOrigin}
                    onChange={(e) => setSimulatorOrigin(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-black/50 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500"
                  >
                    {HUBS.map((h) => (
                      <option key={`origin-${h.id}`} value={h.id}>
                        {h.name.split('(')[0].trim()} ({h.state})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                    Destination State Hub:
                  </label>
                  <select
                    value={simulatorDest}
                    onChange={(e) => setSimulatorDest(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-black/50 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500"
                  >
                    {HUBS.map((h) => (
                      <option key={`dest-${h.id}`} value={h.id} disabled={h.id === simulatorOrigin}>
                        {h.name.split('(')[0].trim()} ({h.state})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Transit Calculation Output */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-500">Interstate Corridor:</span>
                  <span className="font-semibold text-slate-900 dark:text-white text-right">
                    {simulatedRoute.directRoute
                      ? simulatedRoute.directRoute.name
                      : `${simulatedRoute.origin?.state} → ${simulatedRoute.dest?.state}`}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-500">Highway / Rail Distance:</span>
                  <span className="font-mono text-slate-900 dark:text-white">
                    {simulatedRoute.estimatedKm.toLocaleString()} km
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-500">Estimated Road / Rail Transit:</span>
                  <span className="font-mono font-bold text-amber-700 dark:text-amber-300">
                    {simulatedRoute.estimatedDays}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono pt-1.5 border-t border-slate-100 dark:border-white/5">
                  <span className="text-slate-500">Interstate Freight Terms:</span>
                  <span className="font-mono text-emerald-700 dark:text-emerald-400">
                    {simulatedRoute.directRoute ? simulatedRoute.directRoute.terms.join(' · ') : 'FOR · DDP · EXW'}
                  </span>
                </div>
              </div>
            </div>

            {onOpenOrderModal && (
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    const isTech =
                      simulatedRoute.origin?.id === 'hub-chennai' ||
                      simulatedRoute.origin?.id === 'hub-delhi' ||
                      simulatedRoute.dest?.id === 'hub-bengaluru';
                    const targetCorridor: TradeCorridor = isTech ? 'import_electronics' : 'export_agro';
                    onOpenOrderModal(
                      targetCorridor,
                      `Book interstate consignment from ${simulatedRoute.origin?.name} (${simulatedRoute.origin?.state}) to ${simulatedRoute.dest?.name} (${simulatedRoute.dest?.state})`
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
            <span>Asset-light interstate corridors connecting Delhi NCR, Punjab, Gujarat, Maharashtra, Karnataka &amp; Tamil Nadu.</span>
          </div>
          <span className="text-slate-400 dark:text-slate-500 shrink-0">D3 India Mercator Projection</span>
        </div>
      </div>
    </div>
  );
}
