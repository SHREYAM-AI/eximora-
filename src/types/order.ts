export type TradeCorridor = 'export_agro' | 'import_electronics';

export type OrderStage = 'registered' | 'execution' | 'fulfilled';

export interface TradeMilestone {
  id: string;
  title: string;
  timestamp: string;
  completed: boolean;
  notes: string;
  category: 'query' | 'sourcing' | 'certification' | 'shipping' | 'customs' | 'delivery';
}

export interface TradeOrder {
  id: string;
  orderNumber: string;
  corridor: TradeCorridor;
  productName: string;
  productCategory: string;
  quantity: string;
  unit: string;
  origin: string;
  destination: string;
  incoterm: 'FOB' | 'CIF' | 'CFR' | 'DDP' | 'EXW';
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  targetPriceEstimate?: string;
  certificationsRequired: string[];
  hsnCode?: string;
  specialInstructions?: string;
  stage: OrderStage;
  progressPercent: number;
  registeredAt: string;
  lastUpdated: string;
  aiQueryAnalysis: {
    summary: string;
    riskAssessment: 'Low Risk' | 'Standard' | 'Elevated Compliance';
    assetLightAction: string;
    matchedNetwork: string;
  };
  milestones: TradeMilestone[];
  fulfillmentDoc?: {
    trackingNumber: string;
    vesselOrFlight: string;
    inspectionPassId: string;
    fulfillmentStatus: string;
  };
}
