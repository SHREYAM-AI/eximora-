import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TradeMilestone {
  id: string;
  title: string;
  timestamp: string;
  completed: boolean;
  notes: string;
  category: 'query' | 'sourcing' | 'certification' | 'shipping' | 'customs' | 'delivery';
}

interface TradeOrder {
  id: string;
  orderNumber: string;
  corridor: 'export_agro' | 'import_electronics';
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
  stage: 'registered' | 'execution' | 'fulfilled';
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

interface VisitorSession {
  id: string;
  timestamp: string;
  device: string;
  path: string;
  referrer: string;
  corridorInterest: 'export_agro' | 'import_electronics' | 'general';
  lastActive: string;
}

interface WaitlistRegistration {
  id: string;
  email: string;
  category: string;
  code: string;
  joinedAt: string;
}

interface CommunityReply {
  id: string;
  authorName: string;
  authorCompany: string;
  authorRole: string;
  authorLocation: string;
  content: string;
  timestamp: string;
  isVerifiedPartner?: boolean;
}

interface CommunityPost {
  id: string;
  title: string;
  channel: 'export_agro' | 'import_electronics' | 'regulations_logistics';
  postType: 'buy_inquiry' | 'supply_offer' | 'market_insight' | 'regulatory_qa';
  authorName: string;
  authorCompany: string;
  authorRole: string;
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

interface IndustryInsight {
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

// In-memory stores
const inMemoryOrders: TradeOrder[] = [];
const inMemoryVisitors: VisitorSession[] = [];
const inMemoryWaitlist: WaitlistRegistration[] = [];

// Seed authentic bilateral community discussions
const inMemoryCommunityPosts: CommunityPost[] = [
  {
    id: 'post-exm-001',
    title: 'Procurement Request: 50 MT Traditional 1121 Steam Basmati Rice for GCC Distribution',
    channel: 'export_agro',
    postType: 'buy_inquiry',
    authorName: 'Tariq Al-Nuaimi',
    authorCompany: 'Al-Maktoum Trade & Provisions LLC',
    authorRole: 'Overseas Buyer',
    authorLocation: 'Dubai, UAE',
    isVerifiedPartner: true,
    content: 'We are seeking allocation for 50 Metric Tons of Grade-A Sortex Cleaned 1121 Steam Basmati Rice for distribution across UAE and GCC hypermarket chains. Mandatory specifications: APEDA accredited inspection, moisture content strictly <= 11.5%, average grain length >= 8.35mm, vacuum packed in 25kg non-woven master bags under CIF Jebel Ali terms. Looking to lock delivery for the upcoming shipping window.',
    commodityOrTopic: '1121 Steam Basmati Rice',
    corridor: 'export_agro',
    tags: ['Basmati Rice', 'APEDA Certified', 'CIF Jebel Ali', 'Bulk Export'],
    timestamp: '2026-11-05 06:14 UTC',
    upvotes: 18,
    formalTradeSpecs: {
      suggestedProduct: 'Grade-A 1121 Steam Basmati Rice',
      quantity: '50',
      unit: 'Metric Tons',
      origin: 'Punjab / Haryana Mandi Cluster',
      destination: 'Port of Jebel Ali, Dubai',
      incoterm: 'CIF',
    },
    replies: [
      {
        id: 'rep-001-1',
        authorName: 'Harpreet Singh',
        authorCompany: 'Amritsar Agro Processors & Milling Federation',
        authorRole: 'Indian Processor',
        authorLocation: 'Punjab, India',
        isVerifiedPartner: true,
        content: 'Greetings Tariq. Our cooperative milling hub in Amritsar has newly milled Sortex lots with certified moisture at 11.2% and grain length 8.4mm. We hold active APEDA and Phytosanitary documentation. Eximora can inspect batch testing and coordinate seamless container stuffing for Mundra departure.',
        timestamp: '2026-11-05 08:30 UTC',
      },
      {
        id: 'rep-001-2',
        authorName: 'Vikram Joshi',
        authorCompany: 'Eximora Trade Desk',
        authorRole: 'Trade Compliance Specialist',
        authorLocation: 'Mumbai, India',
        isVerifiedPartner: true,
        content: 'We can facilitate this contract under our asset-light standard. Sourcing from Amritsar cooperative with third-party APEDA lab inspection, customs clearance at Mundra port, and direct CIF bill of lading release at Jebel Ali. Click "Formalize as AI Order" to register specs.',
        timestamp: '2026-11-05 09:12 UTC',
      },
    ],
  },
  {
    id: 'post-exm-002',
    title: 'Sourcing Inquiry: 8,000 Units 65W GaN Dual-Port Fast Chargers with Active BIS CRS',
    channel: 'import_electronics',
    postType: 'buy_inquiry',
    authorName: 'Rahul Mehta',
    authorCompany: 'Apex Mobile Retail Alliance',
    authorRole: 'Indian Wholesaler',
    authorLocation: 'Delhi NCR, India',
    isVerifiedPartner: true,
    content: 'Our wholesale distribution network supplying 240+ retail storefronts across Delhi NCR, Jaipur, and Chandigarh requires immediate allocation of 8,000 units of 65W GaN dual-port wall chargers (Type-C PD 3.0 + USB-A QC 4.0). Mandatory compliance: Valid BIS CRS certificate under IS 13252 (Part 1), Indian Type D 2-pin plugs, and CE/RoHS safety approval. DDP delivery to our Okhla ICD warehouse.',
    commodityOrTopic: '65W GaN Wall Chargers',
    corridor: 'import_electronics',
    tags: ['GaN Chargers', 'BIS CRS', 'Electronics Import', 'Wholesale'],
    timestamp: '2026-11-05 04:45 UTC',
    upvotes: 24,
    formalTradeSpecs: {
      suggestedProduct: '65W GaN Dual USB-C Fast Wall Chargers',
      quantity: '8,000',
      unit: 'Units',
      origin: 'Shenzhen / Taipei Technology Corridor',
      destination: 'Delhi ICD / Nhava Sheva',
      incoterm: 'DDP',
    },
    replies: [
      {
        id: 'rep-002-1',
        authorName: 'David Lin',
        authorCompany: 'Shenzhen MicroPower Electronics Co.',
        authorRole: 'Indian Wholesaler',
        authorLocation: 'Shenzhen, China',
        isVerifiedPartner: true,
        content: 'We maintain dedicated SMT lines for 65W GaN dual-port adapters with existing active BIS CRS registration reports (IS 13252). Indian Type D plugs are fully molded and drop-tested. Eximora audits our batch QA before export stuffing.',
        timestamp: '2026-11-05 07:05 UTC',
      },
    ],
  },
  {
    id: 'post-exm-003',
    title: 'Producer Allocation: Export-Ready Organic Turmeric (Curcumin >= 4.8%) & Cumin Seeds',
    channel: 'export_agro',
    postType: 'supply_offer',
    authorName: 'Bhavik Patel',
    authorCompany: 'Saurashtra Organic Farmer Producer Organization',
    authorRole: 'Indian Farmer Cooperative',
    authorLocation: 'Rajkot, Gujarat, India',
    isVerifiedPartner: true,
    content: 'Our cooperative of 340 certified organic farmers in Saurashtra has harvested 45 Metric Tons of premium Salem and Nizamabad variety organic turmeric fingers (curcumin content certified at 4.85%) and 30 MT of machine-cleaned machine-sorted cumin seeds. Tested free of ethylene oxide (ETO) and pesticide residues as per EU and US FDA maximum residue limits (MRL). Ready for inspection.',
    commodityOrTopic: 'Organic Spices & Seeds',
    corridor: 'export_agro',
    tags: ['Organic Turmeric', 'High Curcumin', 'FSSAI Export', 'EU Compliant'],
    timestamp: '2026-11-04 18:20 UTC',
    upvotes: 31,
    formalTradeSpecs: {
      suggestedProduct: 'High-Curcumin Organic Turmeric Fingers',
      quantity: '45',
      unit: 'Metric Tons',
      origin: 'Gujarat Agricultural Corridor',
      destination: 'Rotterdam / Hamburg / Newark',
      incoterm: 'FOB',
    },
    replies: [
      {
        id: 'rep-003-1',
        authorName: 'Lukas Van Der Meer',
        authorCompany: 'Nordic Organic Botanicals BV',
        authorRole: 'Overseas Buyer',
        authorLocation: 'Rotterdam, Netherlands',
        isVerifiedPartner: true,
        content: 'We are very interested in 20 MT of the turmeric lot if heavy metals testing (lead < 2.5 ppm, arsenic < 1.0 ppm) is validated by an accredited Eurofins or SGS lab. Eximora, can your team handle third-party lab verification prior to FOB Nhava Sheva release?',
        timestamp: '2026-11-05 01:15 UTC',
      },
    ],
  },
  {
    id: 'post-exm-004',
    title: 'Maritime Advisory: Red Sea Corridor Freight Schedules & Container Liner Liners',
    channel: 'regulations_logistics',
    postType: 'market_insight',
    authorName: 'Capt. Vijay Nair',
    authorCompany: 'Eximora Global Logistics & Freight Advisory',
    authorRole: 'Trade Compliance Specialist',
    authorLocation: 'Mumbai, India',
    isVerifiedPartner: true,
    content: 'Advisory for commercial exporters shipping out of JNPT and Mundra to European base ports (Rotterdam, Antwerp, Felixstowe): Cape of Good Hope routings currently incur 32-36 days transit vs 19 days via Suez. Eximora recommends: (1) Booking container slots minimum 14 days in advance, (2) Utilizing desiccated container liners for moisture-sensitive spices and rice, and (3) Structuring trade contracts under CIF terms to buffer buyer delivery expectations.',
    commodityOrTopic: 'Container Logistics & Transit',
    corridor: 'bilateral',
    tags: ['Freight Advisory', 'JNPT / Mundra', 'Container Liners', 'Logistics'],
    timestamp: '2026-11-04 12:10 UTC',
    upvotes: 42,
    replies: [],
  },
];

// Seed detailed industry insights & regulatory intelligence briefs
const inMemoryInsights: IndustryInsight[] = [
  {
    id: 'ins-001',
    title: '2026 APEDA Residue Limits & EU Phytosanitary Protocol for Indian Basmati Rice',
    category: 'export_agro',
    corridor: 'export_agro',
    readTime: '4 min read',
    publishedDate: 'November 2026',
    summary: 'Essential regulatory compliance breakdown for exporting Indian rice into the European Union and the Middle East, focusing on Maximum Residue Limits (MRL), aflatoxin standards, and digital TraceNet certification.',
    keyTakeaways: [
      'Tricyclazole and Buprofezin MRL limits strictly capped at default 0.01 mg/kg for EU shipments.',
      'Mandatory pre-shipment sampling by APEDA-authorized independent laboratories at milling point.',
      'Moisture levels must remain below 12.0% to prevent transit microbial growth on deep sea routes.',
      'Digital TraceNet issuance required before phytosanitary clearance certificate is released by customs.',
    ],
    operationalImpact: 'Eximora executes pre-shipment batch assays directly at accredited milling cooperatives before container sealing, mitigating destination port quarantine risk.',
    relevantStandards: ['APEDA TraceNet', 'EU MRL Regulation (EC) 396/2005', 'FSSAI Export Norms', 'ISO 22000'],
    author: 'Dr. S. K. Venkataraman, Chief Quality Officer',
  },
  {
    id: 'ins-002',
    title: 'Navigating BIS CRS Registration (IS 13252) for GaN Power Adapters Entering Indian Ports',
    category: 'import_electronics',
    corridor: 'import_electronics',
    readTime: '5 min read',
    publishedDate: 'November 2026',
    summary: 'Regulatory roadmap for Indian wholesalers and e-commerce brands importing high-wattage GaN chargers and power supply peripherals, including Compulsory Registration Scheme (CRS) lab testing timelines and customs clearance.',
    keyTakeaways: [
      'All external power adapters above 5W require valid BIS CRS registration under Indian Standard IS 13252 (Part 1).',
      'Factory testing must encompass over-voltage, thermal rise, and leakage current under 50Hz Indian grid conditions.',
      'Molded Type D/M plug pins must meet IS 1293 safety dimensions for physical pin insertion stability.',
      'Customs ICEGATE system cross-references active R-Number with importer IEC and manufacturing brand before bill of entry sign-off.',
    ],
    operationalImpact: 'Eximora verifies R-Number validity and physical test compliance reports directly with audited electronic manufacturing partners before booking airway or sea bills.',
    relevantStandards: ['Bureau of Indian Standards IS 13252:2010', 'IS 1293:2019', 'RoHS 2.0 Directive', 'CE EMC/LVD'],
    author: 'Priya Sharma, Regulatory Affairs Lead',
  },
  {
    id: 'ins-003',
    title: 'Moisture Management & Vacuum Packaging Standards for High-Value Spice Exports',
    category: 'export_agro',
    corridor: 'export_agro',
    readTime: '3 min read',
    publishedDate: 'October 2026',
    summary: 'Technical study on preventing volatile oil depletion and moisture condensation in turmeric, black pepper, and cardamom during 30+ day ocean transit.',
    keyTakeaways: [
      'Critical moisture threshold for whole black pepper is 11.0% and whole turmeric fingers is 10.0%.',
      'Container rain condensation prevented by multi-layer desiccated absorption blankets mounted on container roofs.',
      'Multi-ply poly-woven master bags with vacuum-sealed inner EVOH liners extend volatile aroma shelf-life up to 24 months.',
      'Spices Board mandatory testing for Sudan dyes, aflatoxins (B1, B2, G1, G2), and Ethylene Oxide (ETO).',
    ],
    operationalImpact: 'All spice export allocations routed through Eximora utilize certified humidity-controlled container liners and independent pre-dispatch lab assays.',
    relevantStandards: ['Spices Board India Quality Norms', 'ASTA Cleanliness Specs', 'US FDA BAM', 'FSSAI'],
    author: 'Anand Kulkarni, Agricultural Sourcing Director',
  },
  {
    id: 'ins-004',
    title: 'Customs Tariff & HSN Code Optimization for Consumer Electronic Accessories in India',
    category: 'import_electronics',
    corridor: 'import_electronics',
    readTime: '4 min read',
    publishedDate: 'October 2026',
    summary: 'Strategic analysis of Chapter 85 tariff lines (8504.40.90 for static converters/chargers and 8544.42.99 for USB cables), Basic Customs Duty (BCD), and IGST input tax credits for Indian distributors.',
    keyTakeaways: [
      'GaN fast chargers classified under HSN 8504.40.90 attract standard BCD with 18% IGST credit offset.',
      'Nylon-braided data cables under HSN 8544.42.99 require proper labeling of voltage rating to prevent customs reclassification.',
      'Proper country-of-origin (COO) documentation under AIFTA/RCEP trade agreements can lower landing landed costs by 4-7%.',
      'Advance Bill of Entry filing 48 hours prior to vessel arrival at Nhava Sheva or Delhi ICD minimizes demurrage charges.',
    ],
    operationalImpact: 'Eximora prepares accurate trade dockets with verified HSN declarations to ensure zero tariff friction at Indian ports of entry.',
    relevantStandards: ['Indian Customs Tariff Act 1975', 'Chapter 85 Harmonized System', 'CBIC Circulars', 'DGFT FTP 2023'],
    author: 'Rajesh Singhania, Customs Logistics Specialist',
  },
];

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  // AI Studio control plane routes to port 3000
  const port = 3000;

  app.use(express.json());

  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // GET /api/orders - list current trade orders
  app.get('/api/orders', (_req, res) => {
    res.json({ orders: inMemoryOrders });
  });

  // POST /api/visits - record/update visitor session telemetry
  app.post('/api/visits', (req, res) => {
    try {
      const { sessionId, device, path: visitPath, referrer, corridorInterest } = req.body;
      const now = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

      const existingIndex = inMemoryVisitors.findIndex((v) => v.id === sessionId);
      if (existingIndex >= 0) {
        inMemoryVisitors[existingIndex].lastActive = now;
        if (visitPath) inMemoryVisitors[existingIndex].path = visitPath;
        if (corridorInterest) inMemoryVisitors[existingIndex].corridorInterest = corridorInterest;
      } else {
        const userAgent = req.headers['user-agent'] || '';
        let detectedDevice = device || 'Desktop';
        if (!device) {
          if (/mobile/i.test(userAgent)) detectedDevice = 'Mobile';
          else if (/tablet|ipad/i.test(userAgent)) detectedDevice = 'Tablet';
        }

        inMemoryVisitors.unshift({
          id: sessionId || 'sess-' + Math.random().toString(36).substring(2, 9),
          timestamp: now,
          device: detectedDevice,
          path: visitPath || '/',
          referrer: referrer || 'Direct Trade Traffic',
          corridorInterest: corridorInterest || 'general',
          lastActive: now,
        });

        // Cap stored visitors to last 500
        if (inMemoryVisitors.length > 500) {
          inMemoryVisitors.pop();
        }
      }

      // Calculate active visitors in last 15 mins
      const fifteenMinsAgo = Date.now() - 15 * 60 * 1000;
      const activeCount = inMemoryVisitors.filter((v) => {
        const t = new Date(v.lastActive).getTime();
        return !isNaN(t) && t > fifteenMinsAgo;
      }).length;

      res.json({ success: true, activeVisitorsNow: Math.max(1, activeCount) });
    } catch (e: any) {
      res.status(500).json({ error: 'Failed to record visit' });
    }
  });

  // GET /api/admin/metrics - comprehensive operations telemetry for Admin Centre
  app.get('/api/admin/metrics', (_req, res) => {
    const fifteenMinsAgo = Date.now() - 15 * 60 * 1000;
    const activeVisitorsNow = Math.max(
      1,
      inMemoryVisitors.filter((v) => {
        const t = new Date(v.lastActive).getTime();
        return !isNaN(t) && t > fifteenMinsAgo;
      }).length
    );

    res.json({
      orders: inMemoryOrders,
      totalVisits: inMemoryVisitors.length,
      activeVisitorsNow,
      recentVisitors: inMemoryVisitors.slice(0, 50),
      waitlist: inMemoryWaitlist,
      communityPostsCount: inMemoryCommunityPosts.length,
    });
  });

  // POST /api/waitlist - record waitlist registration
  app.post('/api/waitlist', (req, res) => {
    try {
      const { email, category, code } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const now = new Date().toISOString().replace('T', ' ').slice(0, 10);
      const entry: WaitlistRegistration = {
        id: 'reg-' + Date.now(),
        email: email.trim().toLowerCase(),
        category: category || 'Bilateral Trade Partner',
        code: code || `EXM-TRD-${Math.floor(1000 + Math.random() * 9000)}`,
        joinedAt: now,
      };

      inMemoryWaitlist.unshift(entry);
      res.status(201).json({ success: true, entry });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to register' });
    }
  });

  // GET /api/waitlist - list waitlist entries
  app.get('/api/waitlist', (_req, res) => {
    res.json({ waitlist: inMemoryWaitlist });
  });

  // GET /api/community/posts - fetch community threads with optional filtering
  app.get('/api/community/posts', (req, res) => {
    try {
      const { channel, type, search } = req.query;
      let posts = [...inMemoryCommunityPosts];

      if (channel && channel !== 'all') {
        posts = posts.filter((p) => p.channel === channel);
      }

      if (type && type !== 'all') {
        posts = posts.filter((p) => p.postType === type);
      }

      if (search && typeof search === 'string') {
        const q = search.toLowerCase();
        posts = posts.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.content.toLowerCase().includes(q) ||
            p.commodityOrTopic.toLowerCase().includes(q) ||
            p.authorCompany.toLowerCase().includes(q) ||
            p.tags.some((t) => t.toLowerCase().includes(q))
        );
      }

      res.json({ posts });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch community posts' });
    }
  });

  // POST /api/community/posts - create a new discussion or trade inquiry
  app.post('/api/community/posts', (req, res) => {
    try {
      const {
        title,
        channel,
        postType,
        authorName,
        authorCompany,
        authorRole,
        authorLocation,
        content,
        commodityOrTopic,
        corridor,
        tags,
        formalTradeSpecs,
      } = req.body;

      if (!title || !content || !authorName) {
        return res.status(400).json({ error: 'Title, content, and author name are required.' });
      }

      const now = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
      const newPost: CommunityPost = {
        id: 'post-' + Date.now(),
        title,
        channel: channel || 'export_agro',
        postType: postType || 'buy_inquiry',
        authorName,
        authorCompany: authorCompany || 'Commercial Trade Entity',
        authorRole: authorRole || 'Buyer',
        authorLocation: authorLocation || 'Global',
        isVerifiedPartner: false,
        content,
        commodityOrTopic: commodityOrTopic || title,
        corridor: corridor || (channel === 'import_electronics' ? 'import_electronics' : channel === 'export_agro' ? 'export_agro' : 'bilateral'),
        tags: Array.isArray(tags) && tags.length > 0 ? tags : [commodityOrTopic || 'General Trade'],
        timestamp: now,
        upvotes: 1,
        replies: [],
        formalTradeSpecs,
      };

      inMemoryCommunityPosts.unshift(newPost);
      res.status(201).json({ success: true, post: newPost });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to publish post', details: err.message });
    }
  });

  // POST /api/community/posts/:id/reply - reply to a community thread
  app.post('/api/community/posts/:id/reply', (req, res) => {
    try {
      const { id } = req.params;
      const { authorName, authorCompany, authorRole, authorLocation, content } = req.body;

      if (!content || !authorName) {
        return res.status(400).json({ error: 'Author name and content are required.' });
      }

      const post = inMemoryCommunityPosts.find((p) => p.id === id);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const now = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
      const newReply: CommunityReply = {
        id: 'rep-' + Date.now(),
        authorName,
        authorCompany: authorCompany || 'Commercial Trader',
        authorRole: authorRole || 'Trader',
        authorLocation: authorLocation || 'India',
        content,
        timestamp: now,
        isVerifiedPartner: false,
      };

      post.replies.push(newReply);
      res.status(201).json({ success: true, reply: newReply, repliesCount: post.replies.length });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to submit reply' });
    }
  });

  // POST /api/community/posts/:id/upvote - endorse thread
  app.post('/api/community/posts/:id/upvote', (req, res) => {
    const { id } = req.params;
    const post = inMemoryCommunityPosts.find((p) => p.id === id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    post.upvotes += 1;
    res.json({ success: true, upvotes: post.upvotes });
  });

  // GET /api/community/insights - fetch industry intelligence briefings
  app.get('/api/community/insights', (_req, res) => {
    res.json({ insights: inMemoryInsights });
  });

  // POST /api/community/generate-brief - AI generated trade regulatory & market briefing
  app.post('/api/community/generate-brief', async (req, res) => {
    try {
      const { topic, corridor } = req.body;
      if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
      }

      if (!apiKey) {
        return res.json({
          brief: {
            title: `Eximora Trade Intelligence: ${topic}`,
            summary: `Regulatory and supply chain assessment for ${topic} across Eximora's bilateral corridors. Under our asset-light model, all transactions are sourced directly from verified cooperatives or certified manufacturing clusters with rigorous third-party lab inspection (APEDA, FSSAI, or BIS CRS).`,
            keyTakeaways: [
              'Verify mandatory pre-shipment lab certifications prior to container loading.',
              'Ensure HSN classification matches customs tariff schedules to avoid port clearance demurrage.',
              'Book maritime container allocations or air freight minimum 14 days in advance.',
              'Implement desiccated packaging and vacuum sealing for deep sea moisture protection.',
            ],
            operationalImpact: 'Eximora coordinates inspection, transit monitoring, and customs clearance without manufacturing markups.',
            relevantStandards: ['APEDA', 'BIS CRS', 'FSSAI Export', 'ISO 22000'],
          },
        });
      }

      const prompt = `You are the Senior Trade Intelligence Officer for Eximora, a two-way trading house.
Corridor 1: Export food products from Indian farmers and processors to overseas buyers.
Corridor 2: Import electronic accessories for Indian wholesalers, retailers, and online sellers.
Operating model: Asset-light trader (sources, certifies, ships, sells; does not manufacture).

Generate a concise, authoritative, professional bilateral trade intelligence brief for this topic:
"${topic}"
Corridor context: ${corridor || 'bilateral'}

Return a valid JSON object matching this schema:
{
  "title": "Concise professional title",
  "summary": "2-3 sentences executive summary explaining market dynamics, compliance, or logistics",
  "keyTakeaways": ["Bullet 1 with exact standard or regulation", "Bullet 2 with operational guidance", "Bullet 3 with customs or freight advice", "Bullet 4 with risk mitigation"],
  "operationalImpact": "1 sentence on how Eximora's asset-light sourcing and certification resolves this",
  "relevantStandards": ["Standard 1 (e.g. APEDA, BIS CRS, FSSAI, CE)", "Standard 2"]
}`;

      const aiCall = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      if (aiCall && aiCall.text) {
        const parsed = JSON.parse(aiCall.text);
        return res.json({ brief: parsed });
      }

      throw new Error('No AI text returned');
    } catch (err: any) {
      console.warn('AI brief fallback:', err.message);
      res.json({
        brief: {
          title: `Trade Advisory: ${req.body.topic || 'Bilateral Trade Overview'}`,
          summary: 'Eximora bridges Indian agricultural harvests with global buyers and routes high-turnover electronic accessories directly to Indian wholesale networks.',
          keyTakeaways: [
            'Mandatory certification audits (APEDA, FSSAI, BIS CRS) at origin.',
            'Direct container stuffing and seal validation.',
            'Structured Incoterms (FOB, CIF, DDP) to minimize counterparty risk.',
          ],
          operationalImpact: 'Asset-light execution ensures high quality and verified provenance without manufacturing overhead.',
          relevantStandards: ['APEDA', 'BIS CRS', 'FSSAI Export', 'ISO 22000'],
        },
      });
    }
  });

  // POST /api/orders/parse-and-register - AI based order placement
  app.post('/api/orders/parse-and-register', async (req, res) => {
    try {
      const {
        naturalLanguagePrompt,
        corridor,
        productName,
        quantity,
        unit,
        origin,
        destination,
        incoterm,
        clientName,
        clientCompany,
        clientEmail,
        specialInstructions,
      } = req.body;

      let extractedData: Partial<TradeOrder> = {};

      if (apiKey && naturalLanguagePrompt) {
        try {
          const prompt = `You are the AI Order Placement Engine for Eximora, a two-way trading company.
Corridor 1: Export food products from Indian farmers and processors to overseas buyers.
Corridor 2: Import electronic accessories for Indian wholesalers, retailers, and online sellers.
Asset-light trader: Sourcing, certifying, shipping, selling.

Parse the following customer order request into structured trade parameters:
"${naturalLanguagePrompt}"

Return a valid JSON object matching this schema:
{
  "corridor": "export_agro" or "import_electronics",
  "productName": "Concise product title",
  "productCategory": "Category description",
  "quantity": "Amount as string or number",
  "unit": "Units, e.g. Metric Tons, Units, Cartons, Containers",
  "origin": "Estimated origin port or region",
  "destination": "Target delivery destination",
  "incoterm": "FOB" | "CIF" | "CFR" | "DDP" | "EXW",
  "certificationsRequired": ["List of relevant trade certificates, e.g. FSSAI, APEDA, Phytosanitary, BIS, CE, RoHS"],
  "hsnCode": "Estimated 6 to 8 digit HSN code",
  "targetPriceEstimate": "Estimated target price if mentioned or standard benchmark",
  "aiAnalysis": {
    "summary": "1-2 sentence commercial order summary",
    "riskAssessment": "Low Risk" | "Standard" | "Elevated Compliance",
    "assetLightAction": "Exact asset-light sourcing and verification plan",
    "matchedNetwork": "Sourcing cluster recommendation"
  }
}`;

          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('AI order parsing timed out')), 4500)
          );

          const aiCall = ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          });

          const result = await Promise.race([aiCall, timeoutPromise]);

          if (result && result.text) {
            extractedData = JSON.parse(result.text);
          }
        } catch (aiErr) {
          console.warn('AI order parsing fallback to heuristics:', aiErr);
        }
      }

      // Determine final fields with graceful heuristics
      const resolvedCorridor: 'export_agro' | 'import_electronics' =
        extractedData.corridor || corridor || (naturalLanguagePrompt?.toLowerCase().includes('electronic') || naturalLanguagePrompt?.toLowerCase().includes('charger') || naturalLanguagePrompt?.toLowerCase().includes('cable') ? 'import_electronics' : 'export_agro');

      const resolvedProductName =
        extractedData.productName || productName || (resolvedCorridor === 'export_agro' ? 'Certified Organic Basmati Rice' : 'Fast Charging GaN USB-C Adapters');

      const resolvedCategory =
        extractedData.productCategory || (resolvedCorridor === 'export_agro' ? 'Food & Agricultural Commodities' : 'Consumer Electronic Accessories');

      const resolvedQuantity = extractedData.quantity || quantity || '1';
      const resolvedUnit = extractedData.unit || unit || (resolvedCorridor === 'export_agro' ? 'Metric Tons' : 'Units');
      const resolvedOrigin = extractedData.origin || origin || (resolvedCorridor === 'export_agro' ? 'India' : 'Global Tech Hub');
      const resolvedDestination = extractedData.destination || destination || (resolvedCorridor === 'export_agro' ? 'Destination Port' : 'India Destination Port/ICD');
      const resolvedIncoterm = (extractedData.incoterm || incoterm || (resolvedCorridor === 'export_agro' ? 'CIF' : 'DDP')) as 'FOB' | 'CIF' | 'CFR' | 'DDP' | 'EXW';

      const certs = extractedData.certificationsRequired || (resolvedCorridor === 'export_agro' ? ['APEDA Export Certification', 'Phytosanitary Inspection', 'FSSAI Lab Tested'] : ['BIS CRS Registration', 'CE Certified', 'RoHS Compliance']);

      const hsn = extractedData.hsnCode || (resolvedCorridor === 'export_agro' ? '1006.30.20' : '8504.40.90');

      const orderCount = inMemoryOrders.length + 1;
      const orderPrefix = resolvedCorridor === 'export_agro' ? 'EXM-AGRO' : 'EXM-ELEC';
      const orderNumber = `${orderPrefix}-2026-${String(1000 + orderCount).slice(-4)}`;
      const now = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';

      const aiAnalysis = extractedData.aiQueryAnalysis || {
        summary: `AI has registered the trade inquiry for ${resolvedQuantity} ${resolvedUnit} of ${resolvedProductName} under ${resolvedIncoterm} terms.`,
        riskAssessment: 'Low Risk' as const,
        assetLightAction: resolvedCorridor === 'export_agro'
          ? 'Dispatching sourcing request to verified Indian farming cooperatives & APEDA accredited milling hubs.'
          : 'Connecting to audited electronic component manufacturers with active BIS/CE test certificates.',
        matchedNetwork: resolvedCorridor === 'export_agro'
          ? 'Verified Indian Agricultural Producer Network'
          : 'Accredited Electronics Manufacturing Hub',
      };

      const newOrder: TradeOrder = {
        id: 'ord-' + Date.now(),
        orderNumber,
        corridor: resolvedCorridor,
        productName: resolvedProductName,
        productCategory: resolvedCategory,
        quantity: String(resolvedQuantity),
        unit: resolvedUnit,
        origin: resolvedOrigin,
        destination: resolvedDestination,
        incoterm: resolvedIncoterm,
        clientName: clientName || 'Authorized Trade Representative',
        clientCompany: clientCompany || 'Registered Commercial Enterprise',
        clientEmail: clientEmail || 'client@enterprise.com',
        targetPriceEstimate: extractedData.targetPriceEstimate || 'Spot Trade Pricing upon Sourcing Allocation',
        certificationsRequired: certs,
        hsnCode: hsn,
        specialInstructions: specialInstructions || naturalLanguagePrompt || 'Standard commercial export/import compliance packaging.',
        stage: 'registered',
        progressPercent: 25,
        registeredAt: now,
        lastUpdated: now,
        aiQueryAnalysis: aiAnalysis,
        milestones: [
          {
            id: 'm-reg-1',
            title: 'AI Order Query Registered & Parsed',
            timestamp: now,
            completed: true,
            notes: `Trade query validated by Exora AI. Corridor: ${resolvedCorridor === 'export_agro' ? 'Export (India → Overseas)' : 'Import (Global → India)'}.`,
            category: 'query',
          },
          {
            id: 'm-reg-2',
            title: 'Sourcing Allocation to Certified Producers',
            timestamp: 'Queued for Execution',
            completed: false,
            notes: 'Asset-light matching with pre-qualified agricultural processors or electronics manufacturers.',
            category: 'sourcing',
          },
          {
            id: 'm-reg-3',
            title: 'Quality & Regulatory Certification Audit',
            timestamp: 'Pending Execution',
            completed: false,
            notes: `Scheduled inspection: ${certs.join(', ')}.`,
            category: 'certification',
          },
          {
            id: 'm-reg-4',
            title: 'Freight Booking & Customs Dispatch',
            timestamp: 'Pending Execution',
            completed: false,
            notes: 'Container slot allocation, bill of lading issuance, and customs compliance.',
            category: 'shipping',
          },
          {
            id: 'm-reg-5',
            title: 'Destination Fulfillment & Proof of Delivery',
            timestamp: 'Pending Fulfillment',
            completed: false,
            notes: `Final release and delivery to ${resolvedDestination}.`,
            category: 'delivery',
          },
        ],
      };

      inMemoryOrders.unshift(newOrder);

      res.status(201).json({
        success: true,
        order: newOrder,
        message: `Order ${newOrder.orderNumber} successfully registered by AI.`,
      });
    } catch (error: any) {
      console.error('Error parsing and registering order:', error);
      res.status(500).json({ error: 'Failed to register order', details: error.message });
    }
  });

  // POST /api/orders/advance - advance an order stage (registered -> execution -> fulfilled)
  app.post('/api/orders/advance', (req, res) => {
    try {
      const { orderId } = req.body;
      const order = inMemoryOrders.find((o) => o.id === orderId);

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const now = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';

      if (order.stage === 'registered') {
        // Move to Execution
        order.stage = 'execution';
        order.progressPercent = 65;
        order.lastUpdated = now;

        // Mark sourcing & certification milestones complete
        order.milestones[1].completed = true;
        order.milestones[1].timestamp = now;
        order.milestones[1].notes =
          order.corridor === 'export_agro'
            ? 'Matched with certified farmers cooperative. Harvest purity test approved.'
            : 'Sourcing contract locked with certified electronics manufacturing partner. Batch QA verified.';

        order.milestones[2].completed = true;
        order.milestones[2].timestamp = now;
        order.milestones[2].notes = `Mandatory certification completed: ${order.certificationsRequired.slice(0, 2).join(' & ')} verified.`;

        order.milestones[3].timestamp = 'In Transit / Manifest Active';
        order.milestones[3].completed = true;
        order.milestones[3].notes = 'Export/Import clearance completed. Freight container dispatched.';

        order.fulfillmentDoc = {
          trackingNumber: `EXM-TRK-${Math.floor(100000 + Math.random() * 900000)}`,
          vesselOrFlight: order.corridor === 'export_agro' ? 'Maersk Sea Corridor Voy 44B' : 'Singapore Airlines Cargo SQ-712',
          inspectionPassId: `CERT-PASS-${Math.floor(1000 + Math.random() * 9000)}`,
          fulfillmentStatus: 'In Execution - Vessel/Flight Dispatched',
        };
      } else if (order.stage === 'execution') {
        // Move to Fulfilled
        order.stage = 'fulfilled';
        order.progressPercent = 100;
        order.lastUpdated = now;

        order.milestones.forEach((m) => {
          m.completed = true;
          if (m.timestamp.includes('Pending') || m.timestamp.includes('Queued')) {
            m.timestamp = now;
          }
        });
        order.milestones[4].notes = `Customs cleared at ${order.destination}. Commercial delivery signed by consignee.`;

        if (order.fulfillmentDoc) {
          order.fulfillmentDoc.fulfillmentStatus = 'Fulfilled & Handed Over to Client';
        }
      }

      res.json({
        success: true,
        order,
        message: `Order ${order.orderNumber} advanced to ${order.stage}.`,
      });
    } catch (error: any) {
      console.error('Error advancing order:', error);
      res.status(500).json({ error: 'Failed to advance order' });
    }
  });

  // Exora AI Trade Concierge chat endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, userMessage } = req.body;

      const systemInstruction = `You are Exora, the exclusive AI Trade Concierge for Eximora.
About Eximora:
- Eximora is a two-way cross-border trading company.
- Export Corridor: Exports food and agricultural products from Indian farmers and certified processors to overseas buyers worldwide.
- Import Corridor: Imports high-demand electronic accessories for Indian wholesalers, retailers, and online sellers.
- Operating Model: An asset-light trader. Eximora does not manufacture; it sources, certifies, ships, and sells.
- New Capability: Eximora has an AI-based Order Placement & Execution Tracking System. Clients can tell you or input their trade requirements (commodity, volume, ports, certifications), and Eximora's AI registers the query, routes it into execution (sourcing from certified farmers/manufacturers, certification audits, container freight), and tracks it through to final fulfillment.

Guidelines for Exora:
- Tone: Highly articulate, refined, commercial, concise, and trustworthy.
- Response Length: Keep answers concise (2 to 4 sentences usually, unless the user asks for deep operational detail).
- Helpful Affordances: Clarify the bilateral corridors, explain how Eximora's "source, certify, ship, sell" model eliminates counterfeit and supply-chain risk, and guide interested clients to click "Place Order with AI" or track active orders on the page.
- Integrity: Never claim that Eximora manufactures products. Always emphasize the asset-light sourcing and quality certification standard.`;

      const contents = [];

      if (Array.isArray(messages) && messages.length > 0) {
        for (const msg of messages) {
          contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
          });
        }
      }

      if (userMessage) {
        contents.push({
          role: 'user',
          parts: [{ text: userMessage }],
        });
      }

      if (!apiKey) {
        return res.json({
          reply: "Welcome to Eximora. I am Exora, your bilateral trade concierge. Eximora is an asset-light, two-way trading house: we export quality food products from Indian farmers and processors to overseas buyers, and import high-turnover electronic accessories for Indian retailers and online sellers. We source, certify, ship, and sell. You can now also place trade orders directly through our AI order placement system, where we register your query, move it into execution, and fulfill it seamlessly. How may I assist your trade requirements today?",
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const reply = response.text || "I am pleased to assist you with Eximora's trade operations. How may I direct your inquiry?";
      res.json({ reply });
    } catch (error: any) {
      console.error('Error in Exora chat endpoint:', error);
      res.json({
        reply: "Greetings from Eximora. I am Exora, your AI trade concierge. Eximora bridges global markets by exporting Indian food products overseas and importing electronic accessories for Indian retailers. We source, certify, ship, and sell without manufacturing. You can register your query via our AI Order Placement system to begin sourcing, certification, and fulfillment.",
      });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        ws: {
          server,
        },
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`Eximora server running on port ${port}`);
  });
}

startServer();
