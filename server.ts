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

// In-memory store initialized with two benchmark trade orders
const inMemoryOrders: TradeOrder[] = [
  {
    id: 'ord-exm-001',
    orderNumber: 'EXM-AGRO-2026-8812',
    corridor: 'export_agro',
    productName: '1121 Extra Long Steam Basmati Rice',
    productCategory: 'Food & Agricultural Commodities',
    quantity: '24',
    unit: 'Metric Tons (1x40ft FCL)',
    origin: 'Punjab / Haryana Processing Cluster, India',
    destination: 'Port of Jebel Ali, Dubai, UAE',
    incoterm: 'CIF',
    clientName: 'Hamdan Al-Maktoum Trading LLC',
    clientCompany: 'Gulf Horizon Foodstuffs',
    clientEmail: 'procurement@gulfhorizonfoods.ae',
    targetPriceEstimate: '$1,140 / MT',
    certificationsRequired: ['APEDA Phytosanitary', 'FSSAI Export Clearance', 'SGS Pre-Shipment Purity Report'],
    hsnCode: '1006.30.20',
    specialInstructions: 'Moisture content strictly under 12.5%. 25kg vacuum-sealed master gunny bags.',
    stage: 'execution',
    progressPercent: 65,
    registeredAt: '2026-10-28 09:30 UTC',
    lastUpdated: '2026-11-02 14:15 UTC',
    aiQueryAnalysis: {
      summary: 'High-grade Basmati export requirement for GCC retail distribution. Grade verified against APEDA standards.',
      riskAssessment: 'Low Risk',
      assetLightAction: 'Aggregated directly from APEDA-certified millers in Karnal; SGS inspection lab booked for container stuffing.',
      matchedNetwork: 'Verified Haryana Farmer Cooperative & Northern Milling Cluster #04',
    },
    milestones: [
      {
        id: 'm1',
        title: 'AI Order Query Registered & Parsed',
        timestamp: '2026-10-28 09:30 UTC',
        completed: true,
        notes: 'Specifications, incoterm CIF Jebel Ali, and compliance parameters validated.',
        category: 'query',
      },
      {
        id: 'm2',
        title: 'Producer Allocation & Pre-Cert Sourcing',
        timestamp: '2026-10-29 11:20 UTC',
        completed: true,
        notes: 'Batch #BR-901 allocated from certified Karnal mill cluster. Moisture test passed at 11.8%.',
        category: 'sourcing',
      },
      {
        id: 'm3',
        title: 'Mandatory Phytosanitary & APEDA Audit',
        timestamp: '2026-10-31 16:40 UTC',
        completed: true,
        notes: 'Phytosanitary inspection certificate PSC-IND-88219 issued. Zero pesticide residue detected.',
        category: 'certification',
      },
      {
        id: 'm4',
        title: 'Port Nhava Sheva Freight Booking & Seal',
        timestamp: '2026-11-02 14:15 UTC',
        completed: true,
        notes: 'Container MSKU-908123-4 stuffed & customs sealed. Scheduled on CMA CGM Mumbai Express.',
        category: 'shipping',
      },
      {
        id: 'm5',
        title: 'Final Customs Clearance & Delivery Handover',
        timestamp: 'Pending vessel arrival at Jebel Ali',
        completed: false,
        notes: 'Bill of Lading BL-EXM-0941 issued. Awaiting destination customs broker sign-off.',
        category: 'delivery',
      },
    ],
    fulfillmentDoc: {
      trackingNumber: 'BL-EXM-0941-DXB',
      vesselOrFlight: 'CMA CGM Mumbai Express / Voy 104W',
      inspectionPassId: 'APEDA-SGS-99120',
      fulfillmentStatus: 'In Transit to Destination Port',
    },
  },
  {
    id: 'ord-exm-002',
    orderNumber: 'EXM-ELEC-2026-4190',
    corridor: 'import_electronics',
    productName: '65W GaN Dual USB-C Fast Wall Chargers (BIS Certified)',
    productCategory: 'Consumer Electronic Accessories',
    quantity: '5,000',
    unit: 'Units (Retail Packaged)',
    origin: 'Electronics Assembly Corridor, Shenzhen/Taipei',
    destination: 'New Delhi ICD Tughlakabad / Bengaluru Hub, India',
    incoterm: 'DDP',
    clientName: 'Vikram Sethi',
    clientCompany: 'Apex Mobile Retail Networks Pvt Ltd',
    clientEmail: 'v.sethi@apexretail.in',
    targetPriceEstimate: '$6.80 / Unit',
    certificationsRequired: ['BIS CRS Registration (IS 13252)', 'RoHS 2.0 Compliance', 'CE / IEC 62368-1'],
    hsnCode: '8504.40.90',
    specialInstructions: 'Indian round pin plug configuration (Type D/M compatible). Custom retail blister packaging.',
    stage: 'fulfilled',
    progressPercent: 100,
    registeredAt: '2026-10-15 08:00 UTC',
    lastUpdated: '2026-10-27 17:30 UTC',
    aiQueryAnalysis: {
      summary: 'Commercial wholesale replenishment for Indian tier-1 electronics retailers. BIS safety protocol critical.',
      riskAssessment: 'Standard',
      assetLightAction: 'Matched with audited GaN specialist OEM. Verified pre-existing BIS CRS certificate R-41098273.',
      matchedNetwork: 'Shenzhen Tier-1 Power Electronics OEM Partner #12',
    },
    milestones: [
      {
        id: 'm1',
        title: 'AI Order Query Registered & Parsed',
        timestamp: '2026-10-15 08:00 UTC',
        completed: true,
        notes: 'Power specs (65W GaN, PD 3.0, PPS) and Indian BIS compliance requirements verified.',
        category: 'query',
      },
      {
        id: 'm2',
        title: 'Factory Sourcing & Batch QA',
        timestamp: '2026-10-17 12:00 UTC',
        completed: true,
        notes: '5,000 units inspected. Thermal stress test and drop test passed at 99.8% yield.',
        category: 'sourcing',
      },
      {
        id: 'm3',
        title: 'BIS CRS Verification & Indian Customs Filing',
        timestamp: '2026-10-20 09:30 UTC',
        completed: true,
        notes: 'BIS Certification R-41098273 filed with Indian ICEGATE portal. Duty & IGST cleared.',
        category: 'certification',
      },
      {
        id: 'm4',
        title: 'Air Cargo Express Transit',
        timestamp: '2026-10-23 15:45 UTC',
        completed: true,
        notes: 'Air Waybill AWB-098-44109312. Landed at Delhi IGI Airport cargo terminal.',
        category: 'shipping',
      },
      {
        id: 'm5',
        title: 'Warehouse Handover & Final Fulfillment',
        timestamp: '2026-10-27 17:30 UTC',
        completed: true,
        notes: 'Dispatched to Apex Central Distribution Warehouse, Okhla Phase III. Proof of Delivery signed.',
        category: 'delivery',
      },
    ],
    fulfillmentDoc: {
      trackingNumber: 'AWB-098-44109312',
      vesselOrFlight: 'Air India Cargo Flight AI-319',
      inspectionPassId: 'BIS-CRS-R41098273',
      fulfillmentStatus: 'Fulfilled & Handed Over',
    },
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

      const resolvedQuantity = extractedData.quantity || quantity || (resolvedCorridor === 'export_agro' ? '20' : '2,500');
      const resolvedUnit = extractedData.unit || unit || (resolvedCorridor === 'export_agro' ? 'Metric Tons' : 'Units');
      const resolvedOrigin = extractedData.origin || origin || (resolvedCorridor === 'export_agro' ? 'India (Punjab/Gujarat Trade Corridor)' : 'Global Electronics Hub (Shenzhen/Taipei)');
      const resolvedDestination = extractedData.destination || destination || (resolvedCorridor === 'export_agro' ? 'Port of Rotterdam / Jebel Ali' : 'Delhi ICD / Nhava Sheva, India');
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
          ? 'Verified Indian Agricultural Producer Network #07'
          : 'High-Reliability Electronics Partner Hub #14',
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
        targetPriceEstimate: extractedData.targetPriceEstimate || (resolvedCorridor === 'export_agro' ? 'Market Spot Rate' : '$5.50 - $8.00 / Unit'),
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
