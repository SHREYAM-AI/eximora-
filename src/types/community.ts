export type CommunityChannel = 'all' | 'export_agro' | 'import_electronics' | 'regulations_logistics';

export type PostType = 'buy_inquiry' | 'supply_offer' | 'market_insight' | 'regulatory_qa';

export type UserRole = 'Overseas Buyer' | 'Indian Farmer Cooperative' | 'Indian Processor' | 'Indian Wholesaler' | 'Retail & Online Seller' | 'Trade Compliance Specialist';

export interface CommunityReply {
  id: string;
  authorName: string;
  authorCompany: string;
  authorRole: UserRole;
  authorLocation: string;
  content: string;
  timestamp: string;
  isVerifiedPartner?: boolean;
}

export interface CommunityPost {
  id: string;
  title: string;
  channel: 'export_agro' | 'import_electronics' | 'regulations_logistics';
  postType: PostType;
  authorName: string;
  authorCompany: string;
  authorRole: UserRole;
  authorLocation: string;
  isVerifiedPartner?: boolean;
  content: string;
  commodityOrTopic: string;
  corridor: 'export_agro' | 'import_electronics' | 'bilateral';
  tags: string[];
  timestamp: string;
  upvotes: number;
  replies: CommunityReply[];
  formalTradeSpecs?: {
    suggestedProduct: string;
    quantity: string;
    unit: string;
    origin: string;
    destination: string;
    incoterm: 'FOB' | 'CIF' | 'CFR' | 'DDP' | 'EXW';
  };
}

export interface IndustryInsight {
  id: string;
  title: string;
  category: 'export_agro' | 'import_electronics' | 'logistics_freight' | 'tariffs_compliance';
  corridor: 'export_agro' | 'import_electronics' | 'bilateral';
  readTime: string;
  publishedDate: string;
  summary: string;
  keyTakeaways: string[];
  operationalImpact: string;
  relevantStandards: string[];
  author: string;
}
