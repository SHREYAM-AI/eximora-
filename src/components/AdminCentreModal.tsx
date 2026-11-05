import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  X,
  RefreshCw,
  Search,
  Filter,
  Users,
  Package,
  Clock,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Laptop,
  Smartphone,
  Tablet,
  Globe,
  FileText,
  Wheat,
  Cpu,
  Layers,
  Download,
  AlertCircle,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import { TradeOrder, OrderStage } from '../types/order';
import { VisitorSession, WaitlistRegistration, AdminMetricsResponse } from '../types/admin';

interface AdminCentreModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: TradeOrder[];
  onAdvanceOrder: (orderId: string) => Promise<void>;
  onOpenOrderModal: (corridor: 'export_agro' | 'import_electronics') => void;
}

export function AdminCentreModal({
  isOpen,
  onClose,
  orders: propOrders,
  onAdvanceOrder,
  onOpenOrderModal,
}: AdminCentreModalProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'visitors' | 'waitlist'>('orders');
  const [isLoading, setIsLoading] = useState(false);
  const [adminData, setAdminData] = useState<AdminMetricsResponse>({
    orders: propOrders,
    totalVisits: 0,
    activeVisitorsNow: 1,
    recentVisitors: [],
    waitlist: [],
  });

  // Filters for Orders Tab
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCorridor, setSelectedCorridor] = useState<'all' | 'export_agro' | 'import_electronics'>('all');
  const [selectedStage, setSelectedStage] = useState<'all' | OrderStage>('all');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<TradeOrder | null>(null);
  const [advancingOrderId, setAdvancingOrderId] = useState<string | null>(null);

  // Fetch admin metrics from server
  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/metrics');
      if (res.ok) {
        const data = await res.json();
        setAdminData({
          orders: Array.isArray(data.orders) ? data.orders : propOrders,
          totalVisits: data.totalVisits || 0,
          activeVisitorsNow: data.activeVisitorsNow || 1,
          recentVisitors: Array.isArray(data.recentVisitors) ? data.recentVisitors : [],
          waitlist: Array.isArray(data.waitlist) ? data.waitlist : [],
        });
      }
    } catch (err) {
      console.warn('Failed to fetch admin metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMetrics();
      // Auto-poll metrics every 15s when admin modal is open
      const interval = setInterval(fetchMetrics, 15000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  // Synchronize orders if parent passed updated orders
  useEffect(() => {
    if (propOrders) {
      setAdminData((prev) => ({
        ...prev,
        orders: propOrders,
      }));
    }
  }, [propOrders]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle Advancing an Order from Admin Console
  const handleAdvance = async (orderId: string) => {
    setAdvancingOrderId(orderId);
    try {
      await onAdvanceOrder(orderId);
      await fetchMetrics();
    } finally {
      setAdvancingOrderId(null);
    }
  };

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    const list = adminData.orders || [];
    return list.filter((ord) => {
      if (selectedCorridor !== 'all' && ord.corridor !== selectedCorridor) return false;
      if (selectedStage !== 'all' && ord.stage !== selectedStage) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNum = ord.orderNumber.toLowerCase().includes(q);
        const matchProd = ord.productName.toLowerCase().includes(q);
        const matchClient = ord.clientCompany.toLowerCase().includes(q) || ord.clientName.toLowerCase().includes(q);
        const matchDest = ord.destination.toLowerCase().includes(q);
        if (!matchNum && !matchProd && !matchClient && !matchDest) return false;
      }
      return true;
    });
  }, [adminData.orders, selectedCorridor, selectedStage, searchQuery]);

  // Visitor analytics breakdown
  const visitorStats = useMemo(() => {
    const visitors = adminData.recentVisitors || [];
    const desktopCount = visitors.filter((v) => v.device?.toLowerCase() === 'desktop').length;
    const mobileCount = visitors.filter((v) => v.device?.toLowerCase() === 'mobile').length;
    const tabletCount = visitors.filter((v) => v.device?.toLowerCase() === 'tablet').length;

    const agroInterest = visitors.filter((v) => v.corridorInterest === 'export_agro').length;
    const elecInterest = visitors.filter((v) => v.corridorInterest === 'import_electronics').length;

    return {
      desktopCount,
      mobileCount,
      tabletCount,
      agroInterest,
      elecInterest,
    };
  }, [adminData.recentVisitors]);

  // Export audit dump
  const handleExportAudit = () => {
    const dump = {
      timestamp: new Date().toISOString(),
      activeVisitors: adminData.activeVisitorsNow,
      totalVisits: adminData.totalVisits,
      orders: adminData.orders,
      recentVisitors: adminData.recentVisitors,
      waitlist: adminData.waitlist,
    };

    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eximora-admin-audit-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-hidden animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-title"
    >
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl bg-[#090A0F] border border-white/15 shadow-2xl text-slate-100 overflow-hidden">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-300">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="admin-title" className="text-base font-serif font-semibold text-white tracking-wide">
                  Eximora Operations & Intelligence Centre
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{adminData.activeVisitorsNow} Active Online</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Bilateral trade order surveillance & real-time visitor session monitoring
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={fetchMetrics}
              disabled={isLoading}
              title="Refresh telemetry"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleExportAudit}
              title="Export operational audit JSON"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-slate-300 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Audit</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close Admin Centre"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Operational Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/10 border-b border-white/10 text-left">
          {/* Active Visitors */}
          <div className="bg-[#090A0F] p-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Active Visitors Now
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-serif font-bold text-white tabular-nums">
                {adminData.activeVisitorsNow}
              </span>
              <span className="text-[11px] text-emerald-400 font-mono">Live Sessions</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
              {adminData.totalVisits} Total Sessions Recorded
            </span>
          </div>

          {/* Trade Orders Count */}
          <div className="bg-[#090A0F] p-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 block">
              Total Trade Orders
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-serif font-bold text-white tabular-nums">
                {adminData.orders.length}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">In Pipeline</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
              {adminData.orders.filter((o) => o.stage === 'fulfilled').length} Fulfilled
            </span>
          </div>

          {/* Export vs Import Split */}
          <div className="bg-[#090A0F] p-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Corridor Distribution
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-serif font-bold text-white tabular-nums">
                {adminData.orders.filter((o) => o.corridor === 'export_agro').length} :{' '}
                {adminData.orders.filter((o) => o.corridor === 'import_electronics').length}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Agro : Elec</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
              Bilateral Trade Balancing
            </span>
          </div>

          {/* Waitlist Signups */}
          <div className="bg-[#090A0F] p-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Registered Accounts
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-serif font-bold text-white tabular-nums">
                {adminData.waitlist.length}
              </span>
              <span className="text-[11px] text-amber-300 font-mono">Waitlist Entries</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
              Commercial Partners
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-white/10 bg-white/[0.01]">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 text-xs font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'border-amber-400 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Orders Pipeline ({adminData.orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('visitors')}
            className={`px-4 py-2.5 text-xs font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'visitors'
                ? 'border-amber-400 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Visitor Intelligence ({adminData.totalVisits})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('waitlist')}
            className={`px-4 py-2.5 text-xs font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'waitlist'
                ? 'border-amber-400 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Waitlist & Inquiries ({adminData.waitlist.length})</span>
          </button>
        </div>

        {/* Main Tab Viewport */}
        <div className="flex-1 overflow-y-auto p-6 text-left">
          {/* TAB 1: ORDERS PIPELINE */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Search & Filter Header Bar */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by order #, commodity, company, or destination..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Corridor Filter */}
                  <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-lg border border-white/10 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setSelectedCorridor('all')}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        selectedCorridor === 'all' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCorridor('export_agro')}
                      className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                        selectedCorridor === 'export_agro' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Wheat className="w-3 h-3 text-emerald-400" />
                      <span>Agro</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCorridor('import_electronics')}
                      className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                        selectedCorridor === 'import_electronics' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Cpu className="w-3 h-3 text-amber-300" />
                      <span>Electronics</span>
                    </button>
                  </div>

                  {/* Stage Filter */}
                  <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-lg border border-white/10 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setSelectedStage('all')}
                      className={`px-2 py-1 rounded transition-colors ${
                        selectedStage === 'all' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      All Stages
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedStage('registered')}
                      className={`px-2 py-1 rounded transition-colors ${
                        selectedStage === 'registered' ? 'bg-blue-500/20 text-blue-300' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      1. Registered
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedStage('execution')}
                      className={`px-2 py-1 rounded transition-colors ${
                        selectedStage === 'execution' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      2. Execution
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedStage('fulfilled')}
                      className={`px-2 py-1 rounded transition-colors ${
                        selectedStage === 'fulfilled' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      3. Fulfilled
                    </button>
                  </div>
                </div>
              </div>

              {/* Orders Data Table */}
              {filteredOrders.length === 0 ? (
                <div className="py-14 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                  <Package className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                  <h4 className="text-sm font-medium text-white">No Matching Orders Found</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    {adminData.orders.length === 0
                      ? 'The order pipeline is clean. Test order placement with the AI Order Desk.'
                      : 'No orders match your current search and stage filters.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenOrderModal('export_agro');
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-black bg-gradient-to-r from-amber-200 to-amber-300 hover:from-amber-100 hover:to-amber-200 rounded-lg transition-all cursor-pointer"
                  >
                    <span>Place Order with AI</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="border border-white/10 rounded-xl overflow-x-auto bg-black/40">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                        <th className="py-3 px-4">Order Number</th>
                        <th className="py-3 px-4">Commodity / Specs</th>
                        <th className="py-3 px-4">Volume & Terms</th>
                        <th className="py-3 px-4">Client Enterprise</th>
                        <th className="py-3 px-4">Stage</th>
                        <th className="py-3 px-4 text-right">Administrative Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-sans">
                      {filteredOrders.map((ord) => (
                        <tr
                          key={ord.id}
                          className="hover:bg-white/[0.03] transition-colors cursor-pointer"
                          onClick={() => setSelectedOrderDetails(ord)}
                        >
                          {/* Order Number */}
                          <td className="py-3.5 px-4 font-mono">
                            <div className="font-semibold text-white tracking-wide">{ord.orderNumber}</div>
                            <span className="text-[10px] text-slate-500">{ord.registeredAt}</span>
                          </td>

                          {/* Commodity */}
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-200 max-w-[220px] truncate">
                              {ord.productName}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5">
                              {ord.corridor === 'export_agro' ? (
                                <span className="text-emerald-400 flex items-center gap-0.5">
                                  <Wheat className="w-2.5 h-2.5" />
                                  <span>Agro Export</span>
                                </span>
                              ) : (
                                <span className="text-amber-300 flex items-center gap-0.5">
                                  <Cpu className="w-2.5 h-2.5" />
                                  <span>Electronics Import</span>
                                </span>
                              )}
                              <span>·</span>
                              <span>{ord.origin}</span>
                            </div>
                          </td>

                          {/* Volume & Incoterm */}
                          <td className="py-3.5 px-4 font-mono">
                            <div className="text-white font-medium">
                              {ord.quantity} {ord.unit}
                            </div>
                            <div className="text-[10px] text-amber-200/90 mt-0.5">
                              {ord.incoterm} → {ord.destination}
                            </div>
                          </td>

                          {/* Client */}
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-200 truncate max-w-[160px]">
                              {ord.clientCompany || 'Commercial Buyer'}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono truncate max-w-[160px]">
                              {ord.clientEmail}
                            </div>
                          </td>

                          {/* Stage */}
                          <td className="py-3.5 px-4 font-mono">
                            {ord.stage === 'registered' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-blue-500/15 border border-blue-500/30 text-blue-300">
                                1. Registered
                              </span>
                            )}
                            {ord.stage === 'execution' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-amber-400/15 border border-amber-400/30 text-amber-300">
                                2. In Execution
                              </span>
                            )}
                            {ord.stage === 'fulfilled' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                3. Fulfilled
                              </span>
                            )}
                          </td>

                          {/* Action Button */}
                          <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            {ord.stage !== 'fulfilled' ? (
                              <button
                                type="button"
                                disabled={advancingOrderId === ord.id}
                                onClick={() => handleAdvance(ord.id)}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-[11px] font-mono font-medium text-black bg-amber-300 hover:bg-amber-200 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                              >
                                {advancingOrderId === ord.id ? (
                                  <span>Advancing...</span>
                                ) : ord.stage === 'registered' ? (
                                  <>
                                    <span>Advance to Execution</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </>
                                ) : (
                                  <>
                                    <span>Complete & Fulfill</span>
                                    <CheckCircle2 className="w-3 h-3" />
                                  </>
                                )}
                              </button>
                            ) : (
                              <span className="text-[11px] font-mono text-emerald-400 inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Completed</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Order Detailed Inspector Drawer (if selected) */}
              {selectedOrderDetails && (
                <div className="p-5 rounded-xl bg-white/[0.03] border border-amber-400/30 mt-4 relative">
                  <button
                    type="button"
                    onClick={() => setSelectedOrderDetails(null)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2 text-xs font-mono text-amber-300 uppercase mb-2">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Selected Trade Docket Inspector: {selectedOrderDetails.orderNumber}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mb-3">
                    <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">Product & Specs</span>
                      <p className="font-semibold text-white mt-0.5">{selectedOrderDetails.productName}</p>
                      <p className="text-slate-400 text-[11px] mt-1">{selectedOrderDetails.quantity} {selectedOrderDetails.unit} · {selectedOrderDetails.incoterm}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">Certifications Audit</span>
                      <p className="font-medium text-emerald-300 mt-0.5 truncate">
                        {selectedOrderDetails.certificationsRequired.join(', ')}
                      </p>
                      <p className="text-slate-400 text-[11px] mt-1 font-mono">HSN: {selectedOrderDetails.hsnCode}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">Asset-Light Network</span>
                      <p className="font-medium text-white mt-0.5 truncate">
                        {selectedOrderDetails.aiQueryAnalysis?.matchedNetwork || 'Audited Producer Cluster'}
                      </p>
                      <p className="text-amber-200 text-[11px] mt-1 font-mono">
                        Risk: {selectedOrderDetails.aiQueryAnalysis?.riskAssessment}
                      </p>
                    </div>
                  </div>

                  {selectedOrderDetails.fulfillmentDoc && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-slate-400">Tracking: </span>
                        <span className="text-emerald-300 font-bold">{selectedOrderDetails.fulfillmentDoc.trackingNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Carrier: </span>
                        <span className="text-white">{selectedOrderDetails.fulfillmentDoc.vesselOrFlight}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Status: </span>
                        <span className="text-emerald-300">{selectedOrderDetails.fulfillmentDoc.fulfillmentStatus}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: VISITOR ANALYTICS */}
          {activeTab === 'visitors' && (
            <div className="space-y-6">
              {/* Traffic Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                    <Laptop className="w-3.5 h-3.5 text-slate-400" />
                    <span>Desktop Traffic</span>
                  </div>
                  <div className="mt-1 text-2xl font-serif font-bold text-white tabular-nums">
                    {visitorStats.desktopCount}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Enterprise Terminals</span>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                    <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Mobile Traffic</span>
                  </div>
                  <div className="mt-1 text-2xl font-serif font-bold text-white tabular-nums">
                    {visitorStats.mobileCount}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Handheld Devices</span>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                    <Wheat className="w-3.5 h-3.5" />
                    <span>Food Export Interest</span>
                  </div>
                  <div className="mt-1 text-2xl font-serif font-bold text-white tabular-nums">
                    {visitorStats.agroInterest}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Indian Agri Sourcing</span>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-amber-300">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Electronics Interest</span>
                  </div>
                  <div className="mt-1 text-2xl font-serif font-bold text-white tabular-nums">
                    {visitorStats.elecInterest}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Accessories Procurement</span>
                </div>
              </div>

              {/* Real-Time Visitor Session Stream Table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-serif font-semibold text-white">
                      Live Visitor Activity Log ({adminData.recentVisitors.length} Recent Sessions)
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-slate-500">Auto-Refreshed via Telemetry</span>
                </div>

                {adminData.recentVisitors.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                    <Globe className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                    <h4 className="text-sm font-medium text-white">No External Sessions Recorded Yet</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                      Visitor sessions are logged in real time as clients access the website, explore corridors, or converse with Exora.
                    </p>
                  </div>
                ) : (
                  <div className="border border-white/10 rounded-xl overflow-x-auto bg-black/40">
                    <table className="w-full text-left border-collapse text-xs font-mono">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 text-[11px] uppercase tracking-wider">
                          <th className="py-3 px-4">Session ID</th>
                          <th className="py-3 px-4">Timestamp (UTC)</th>
                          <th className="py-3 px-4">Device</th>
                          <th className="py-3 px-4">Referrer / Source</th>
                          <th className="py-3 px-4">Corridor Interest</th>
                          <th className="py-3 px-4">Last Active</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {adminData.recentVisitors.map((vis) => (
                          <tr key={vis.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-3 px-4 font-semibold text-amber-200">
                              {vis.id}
                            </td>
                            <td className="py-3 px-4 text-slate-300">
                              {vis.timestamp}
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1.5 text-slate-300">
                                {vis.device === 'Mobile' ? (
                                  <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                                ) : vis.device === 'Tablet' ? (
                                  <Tablet className="w-3.5 h-3.5 text-slate-400" />
                                ) : (
                                  <Laptop className="w-3.5 h-3.5 text-slate-400" />
                                )}
                                <span>{vis.device}</span>
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-400 truncate max-w-[200px]">
                              {vis.referrer}
                            </td>
                            <td className="py-3 px-4">
                              {vis.corridorInterest === 'export_agro' ? (
                                <span className="text-emerald-400 inline-flex items-center gap-1">
                                  <Wheat className="w-3 h-3" />
                                  <span>Food Export</span>
                                </span>
                              ) : vis.corridorInterest === 'import_electronics' ? (
                                <span className="text-amber-300 inline-flex items-center gap-1">
                                  <Cpu className="w-3 h-3" />
                                  <span>Electronics Import</span>
                                </span>
                              ) : (
                                <span className="text-slate-400">General Overview</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-slate-400">
                              {vis.lastActive}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: WAITLIST & INQUIRIES */}
          {activeTab === 'waitlist' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-serif font-semibold text-white">
                    Commercial Waitlist & Trade Registrations
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Prospective importers, exporters, and wholesale partners registered for Eximora launch.
                  </p>
                </div>
                <span className="text-xs font-mono text-amber-300">
                  {adminData.waitlist.length} Registered Accounts
                </span>
              </div>

              {adminData.waitlist.length === 0 ? (
                <div className="py-14 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                  <Users className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                  <h4 className="text-sm font-medium text-white">No Waitlist Registrations Yet</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    Signups from the 'Register Interest' form will be indexed here automatically with their designated VIP docket codes.
                  </p>
                </div>
              ) : (
                <div className="border border-white/10 rounded-xl overflow-x-auto bg-black/40">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 text-[11px] uppercase tracking-wider">
                        <th className="py-3 px-4">VIP Docket Code</th>
                        <th className="py-3 px-4">Business Email</th>
                        <th className="py-3 px-4">Trade Category</th>
                        <th className="py-3 px-4">Registration Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {adminData.waitlist.map((reg) => (
                        <tr key={reg.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-4 font-semibold text-amber-300">
                            {reg.code}
                          </td>
                          <td className="py-3 px-4 text-white font-sans">
                            {reg.email}
                          </td>
                          <td className="py-3 px-4 text-slate-300 font-sans">
                            {reg.category}
                          </td>
                          <td className="py-3 px-4 text-slate-400">
                            {reg.joinedAt}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-white/[0.01] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Eximora Operating Core · Live Node Connected</span>
          </div>
          <span>Press ESC to exit Admin Centre</span>
        </div>
      </div>
    </div>
  );
}
