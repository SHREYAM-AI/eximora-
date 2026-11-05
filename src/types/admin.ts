import { TradeOrder } from './order';

export interface VisitorSession {
  id: string;
  timestamp: string;
  device: string;
  path: string;
  referrer: string;
  corridorInterest: 'export_agro' | 'import_electronics' | 'general';
  lastActive: string;
}

export interface WaitlistRegistration {
  id: string;
  email: string;
  category: string;
  code: string;
  joinedAt: string;
}

export interface AdminMetricsResponse {
  orders: TradeOrder[];
  totalVisits: number;
  activeVisitorsNow: number;
  recentVisitors: VisitorSession[];
  waitlist: WaitlistRegistration[];
}
