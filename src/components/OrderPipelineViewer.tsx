import React, { useState } from 'react';
import {
  Wheat,
  Cpu,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileText,
  Truck,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Plane,
  Anchor,
  Box,
} from 'lucide-react';
import { TradeOrder, OrderStage } from '../types/order';

interface OrderPipelineViewerProps {
  orders: TradeOrder[];
  onOpenOrderModal: () => void;
  onAdvanceOrder: (orderId: string) => Promise<void>;
}

export function OrderPipelineViewer({ orders, onOpenOrderModal, onAdvanceOrder }: OrderPipelineViewerProps) {
  const [selectedOrder, setSelectedOrder] = useState<TradeOrder | null>(orders[0] || null);
  const [advancingId, setAdvancingId] = useState<string | null>(null);
  const [filterCorridor, setFilterCorridor] = useState<'all' | 'export_agro' | 'import_electronics'>('all');

  const filteredOrders = orders.filter((o) => {
    if (filterCorridor === 'all') return true;
    return o.corridor === filterCorridor;
  });

  // Keep selected order in sync when orders list updates
  const activeOrder = orders.find((o) => o.id === selectedOrder?.id) || filteredOrders[0] || null;

  const handleAdvance = async (orderId: string) => {
    setAdvancingId(orderId);
    try {
      await onAdvanceOrder(orderId);
    } finally {
      setAdvancingId(null);
    }
  };

  const getStageBadge = (stage: OrderStage) => {
    switch (stage) {
      case 'registered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono bg-blue-500/15 border border-blue-500/30 text-blue-300">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            1. Registered Query
          </span>
        );
      case 'execution':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono bg-amber-400/15 border border-amber-400/30 text-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            2. In Execution
          </span>
        );
      case 'fulfilled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            3. Order Fulfilled
          </span>
        );
    }
  };

  return (
    <div id="ai-order-system" className="w-full max-w-5xl mx-auto scroll-mt-20">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 text-left">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-amber-800 dark:text-amber-300/80 mb-2 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-amber-300" />
            <span>AI Order Placement & Lifecycle</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 dark:text-white tracking-tight">
            Order with AI: From Query to Fulfillment
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl font-light">
            Customers register trade queries directly with Exora AI. Our asset-light architecture immediately routes specifications into verified producer matching, quality certification, shipping, and delivery fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenOrderModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 hover:from-amber-200 hover:to-amber-300 active:scale-[0.98] rounded-xl transition-all shadow-md cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Place Order with AI</span>
          </button>
        </div>
      </div>

      {/* 3-Stage Process Visual Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8 text-left">
        {/* Stage 1 Card */}
        <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 relative overflow-hidden shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-amber-700 dark:text-amber-300 font-semibold uppercase">Step 01</span>
            <span>Natural AI Intake</span>
          </div>
          <h3 className="text-sm font-serif font-semibold text-slate-900 dark:text-white">AI Query Registration</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
            The client specifies commodity specs or requirements. AI parses trade terms, HSN codes, and regulatory compliance.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-200 dark:border-white/5 flex items-center gap-1.5 text-[11px] text-amber-800 dark:text-amber-200/90 font-mono">
            <FileText className="w-3 h-3 text-amber-600 dark:text-amber-300" />
            <span>Trade Docket Generated</span>
          </div>
        </div>

        {/* Stage 2 Card */}
        <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 relative overflow-hidden shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-amber-700 dark:text-amber-300 font-semibold uppercase">Step 02</span>
            <span>Asset-Light Execution</span>
          </div>
          <h3 className="text-sm font-serif font-semibold text-slate-900 dark:text-white">Source & Quality Certify</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
            Direct matching with verified Indian farmers or global electronics clusters. Rigorous third-party lab certification (APEDA/BIS).
          </p>
          <div className="mt-3 pt-2 border-t border-slate-200 dark:border-white/5 flex items-center gap-1.5 text-[11px] text-amber-800 dark:text-amber-200/90 font-mono">
            <ShieldCheck className="w-3 h-3 text-amber-600 dark:text-amber-300" />
            <span>Certified Batch Testing</span>
          </div>
        </div>

        {/* Stage 3 Card */}
        <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 relative overflow-hidden shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-amber-700 dark:text-amber-300 font-semibold uppercase">Step 03</span>
            <span>Global Handover</span>
          </div>
          <h3 className="text-sm font-serif font-semibold text-slate-900 dark:text-white">Fulfillment & Delivery</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
            Customs clearance, live container/AWB airway freight tracking, and final delivery sign-off at destination port/warehouse.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-200 dark:border-white/5 flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Proof of Delivery Issued</span>
          </div>
        </div>
      </div>

      {/* Main Order Pipeline Console */}
      <div className="rounded-2xl bg-white dark:bg-[#090A0F] border border-slate-200 dark:border-white/15 p-5 sm:p-7 shadow-xl dark:shadow-2xl text-left transition-colors">
        {/* Top Control Bar: Corridor filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400">Filter Corridor:</span>
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-white/[0.03] rounded-lg border border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setFilterCorridor('all')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  filterCorridor === 'all'
                    ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Orders ({orders.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterCorridor('export_agro')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1 ${
                  filterCorridor === 'export_agro'
                    ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Wheat className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Food Export</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterCorridor('import_electronics')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1 ${
                  filterCorridor === 'import_electronics'
                    ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Cpu className="w-3 h-3 text-amber-600 dark:text-amber-300" />
                <span>Electronics Import</span>
              </button>
            </div>
          </div>

          <span className="text-xs font-mono text-slate-500">
            {orders.length} Active Trade Orders Indexed
          </span>
        </div>

        {/* Empty State or Master-Detail Split Grid */}
        {orders.length === 0 ? (
          <div className="py-14 px-6 text-center border border-dashed border-slate-300 dark:border-white/10 rounded-2xl bg-white dark:bg-white/[0.01] mt-6">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-700 dark:text-amber-300 mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif text-slate-900 dark:text-white font-medium">No Orders Placed Yet</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-1.5 leading-relaxed">
              Your trade pipeline is clean. Submit a commercial order query via the AI Order Placement terminal to register specifications and initiate execution.
            </p>
            <div className="mt-5">
              <button
                type="button"
                onClick={onOpenOrderModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 hover:from-amber-200 hover:to-amber-300 rounded-xl transition-all shadow-md cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Place Order with AI</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
            {/* Left Column: Order List Selector */}
            <div className="lg:col-span-5 space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
              {filteredOrders.length === 0 ? (
                <div className="p-8 text-center text-slate-500 border border-dashed border-slate-300 dark:border-white/10 rounded-xl">
                  <p className="text-xs">No orders in this corridor yet.</p>
                  <button
                    type="button"
                    onClick={() => setFilterCorridor('all')}
                    className="mt-2 text-xs text-amber-700 dark:text-amber-300 hover:underline font-mono"
                  >
                    View All Orders ({orders.length})
                  </button>
                </div>
              ) : (
                filteredOrders.map((ord) => {
                  const isSelected = activeOrder?.id === ord.id;
                  return (
                    <div
                      key={ord.id}
                      onClick={() => setSelectedOrder(ord)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer text-left relative ${
                        isSelected
                          ? 'bg-slate-100 dark:bg-white/[0.06] border-amber-500 dark:border-amber-400/50 shadow-sm'
                          : 'bg-slate-50/70 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white tracking-wider">
                          {ord.orderNumber}
                        </span>
                        {getStageBadge(ord.stage)}
                      </div>

                      <h4 className="text-sm font-medium text-slate-800 dark:text-slate-100 line-clamp-1">{ord.productName}</h4>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-mono">
                        <span>
                          {ord.quantity} {ord.unit}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 truncate max-w-[140px] text-right">
                          {ord.incoterm} · {ord.destination}
                        </span>
                      </div>

                      {/* Progress bar line */}
                      <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full mt-2.5 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            ord.stage === 'fulfilled'
                              ? 'bg-emerald-500'
                              : ord.stage === 'execution'
                              ? 'bg-amber-500'
                              : 'bg-blue-500'
                          }`}
                          style={{ width: `${ord.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right Column: Selected Order Detailed Lifecycle View */}
            {activeOrder ? (
              <div className="lg:col-span-7 bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl p-5 space-y-5">
              {/* Top Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-900 dark:text-white tracking-wider">
                      {activeOrder.orderNumber}
                    </span>
                    <span className="text-slate-300 dark:text-white/20">·</span>
                    <span className="text-xs font-mono uppercase text-amber-700 dark:text-amber-300/90 font-medium">
                      {activeOrder.corridor === 'export_agro' ? 'Food Export' : 'Electronics Import'}
                    </span>
                  </div>
                  <h3 className="text-base font-serif font-semibold text-slate-900 dark:text-white mt-0.5">
                    {activeOrder.productName}
                  </h3>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {getStageBadge(activeOrder.stage)}
                </div>
              </div>

              {/* Commercial Specs Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 shadow-xs">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Quantity</span>
                  <span className="text-slate-900 dark:text-white font-medium mt-0.5 block truncate">
                    {activeOrder.quantity} {activeOrder.unit}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 shadow-xs">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Incoterm</span>
                  <span className="text-amber-800 dark:text-amber-200 font-medium mt-0.5 block">
                    {activeOrder.incoterm}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 shadow-xs">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Origin</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium mt-0.5 block truncate" title={activeOrder.origin}>
                    {activeOrder.origin}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 shadow-xs">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Destination</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium mt-0.5 block truncate" title={activeOrder.destination}>
                    {activeOrder.destination}
                  </span>
                </div>
              </div>

              {/* AI Query Analysis Box */}
              <div className="p-4 rounded-xl bg-amber-500/[0.06] dark:bg-amber-400/[0.03] border border-amber-500/20 dark:border-amber-400/20 text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-amber-500/10 dark:border-amber-400/10 pb-1.5">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    AI Query Analysis & Sourcing Strategy
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    Risk: {activeOrder.aiQueryAnalysis.riskAssessment}
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                  {activeOrder.aiQueryAnalysis.summary}
                </p>
                <p className="text-amber-900 dark:text-amber-100/90 text-[11px] pt-1">
                  <strong className="text-amber-800 dark:text-amber-300 font-mono text-[10px] uppercase font-semibold">Asset-Light Action: </strong>
                  {activeOrder.aiQueryAnalysis.assetLightAction}
                </p>
              </div>

              {/* Milestone Lifecycle Steps */}
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-3 font-medium">
                  Execution & Fulfillment Timeline
                </span>
                <div className="space-y-3">
                  {activeOrder.milestones.map((m, idx) => (
                    <div key={m.id} className="flex items-start gap-3 text-xs">
                      <div className="mt-0.5 shrink-0">
                        {m.completed ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/20 text-slate-400 dark:text-slate-500 flex items-center justify-center">
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className={`font-medium ${m.completed ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                            {idx + 1}. {m.title}
                          </h5>
                          <span className="text-[10px] font-mono text-slate-500">{m.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">{m.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fulfillment Document Box (if present) */}
              {activeOrder.fulfillmentDoc && (
                <div className="p-3.5 rounded-xl bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-xs">
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block">Freight Manifest / AWB</span>
                    <span className="text-amber-800 dark:text-amber-200 font-bold">{activeOrder.fulfillmentDoc.trackingNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block">Carrier / Vessel</span>
                    <span className="text-slate-700 dark:text-slate-300">{activeOrder.fulfillmentDoc.vesselOrFlight}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block">Inspection Certificate</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{activeOrder.fulfillmentDoc.inspectionPassId}</span>
                  </div>
                </div>
              )}

              {/* Advance Lifecycle Stage Controls */}
              <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[11px] text-slate-500 font-mono">
                  Registered: {activeOrder.registeredAt}
                </span>

                {activeOrder.stage !== 'fulfilled' ? (
                  <button
                    type="button"
                    disabled={advancingId === activeOrder.id}
                    onClick={() => handleAdvance(activeOrder.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-black bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 hover:from-amber-200 hover:to-amber-300 rounded-lg transition-all shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {advancingId === activeOrder.id ? (
                      <span>Advancing...</span>
                    ) : activeOrder.stage === 'registered' ? (
                      <>
                        <span>Move to Execution Phase</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        <span>Complete & Fulfill Order</span>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-mono font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Order Successfully Fulfilled</span>
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="lg:col-span-7 bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
              <FileText className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-sm text-slate-800 dark:text-slate-300 font-medium">Select an order from the list</p>
              <p className="text-xs text-slate-500 mt-1">
                View live registration dockets, sourcing status, certifications, and fulfillment timeline.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
  );
}
