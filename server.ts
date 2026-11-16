import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { WebSocketServer, WebSocket } from 'ws';

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
  incoterm: 'FOR' | 'FOB' | 'CIF' | 'CFR' | 'DDP' | 'EXW';
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  partyRole?: 'vendor' | 'buyer' | 'wholesaler' | 'processor';
  partyRoleLabel?: string;
  placedAtIso?: string;
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
    incoterm: 'FOR' | 'FOB' | 'CIF' | 'CFR' | 'DDP' | 'EXW';
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

// Live in-memory community posts and industry insights (clean initialization without dummy data)
const inMemoryCommunityPosts: CommunityPost[] = [];
const inMemoryInsights: IndustryInsight[] = [];

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  // AI Studio control plane routes to port 3000 or process.env.PORT
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} currently in use. Retrying in 1s...`);
      setTimeout(() => {
        try {
          server.close();
        } catch {}
        server.listen(port, '0.0.0.0');
      }, 1000);
    } else {
      console.error('HTTP Server error:', err);
    }
  });

  app.use(express.json());

  // Immediate health check routes for watchdog/proxy
  app.get('/health', (_req, res) => {
    res.status(200).send('OK');
  });
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Real-time Event Broadcaster (SSE + WebSockets)
  const sseClients = new Set<express.Response>();

  // WebSocket Server supporting both application channels and Vite dev client HMR
  const wss = new WebSocketServer({
    noServer: true,
    handleProtocols: (protocols) => {
      // Support vite-hmr or application protocols gracefully without handshake failure
      return Array.from(protocols)[0] || false;
    },
  });

  server.on('upgrade', (request, socket, head) => {
    try {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } catch {
      try {
        socket.destroy();
      } catch {}
    }
  });

  wss.on('connection', (ws) => {
    try {
      // Send Vite connected status to satisfy @vite/client and initialize application state
      ws.send(JSON.stringify({ type: 'connected' }));
      ws.send(JSON.stringify({ type: 'init', count: inMemoryOrders.length }));
    } catch {}

    ws.on('message', (msg) => {
      try {
        const parsed = JSON.parse(msg.toString());
        if (parsed.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      } catch {}
    });
  });

  function broadcastOrderEvent(eventType: 'order:created' | 'order:advanced', order: TradeOrder) {
    // 1. SSE broadcast to all open browser sessions
    const ssePayload = `event: ${eventType}\ndata: ${JSON.stringify(order)}\n\n`;
    for (const client of sseClients) {
      try {
        client.write(ssePayload);
      } catch {
        sseClients.delete(client);
      }
    }

    // 2. WebSocket broadcast
    const wsPayload = JSON.stringify({ type: eventType, order });
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(wsPayload);
        } catch {}
      }
    });
  }

  // SSE Real-time stream for instant order notifications & Admin Centre synchronization
  app.get(['/api/orders/stream', '/api/events'], (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    if (typeof res.flushHeaders === 'function') {
      res.flushHeaders();
    }

    // Initial connection event
    res.write(`event: init\ndata: ${JSON.stringify({ activeOrders: inMemoryOrders.length, timestamp: Date.now() })}\n\n`);

    sseClients.add(res);

    const keepAlive = setInterval(() => {
      try {
        res.write(': keepalive\n\n');
      } catch {
        clearInterval(keepAlive);
        sseClients.delete(res);
      }
    }, 20000);

    req.on('close', () => {
      clearInterval(keepAlive);
      sseClients.delete(res);
    });
  });

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
        category: category || 'Interstate Trade Partner',
        code: code || `TIF-TRD-${Math.floor(1000 + Math.random() * 9000)}`,
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
        authorRole: authorRole || 'Interstate Buyer',
        authorLocation: authorLocation || 'Maharashtra, India',
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
            title: `Tiffora Interstate Intelligence: ${topic}`,
            summary: `Regulatory and supply chain assessment for ${topic} across Tiffora's Indian interstate corridors. Under our asset-light model, all transactions are sourced directly from certified FPOs or metro electronics hubs with rigorous third-party inspection (FSSAI Interstate, AGMARK, or BIS CRS) and automated NIC E-Way Bill / IGST compliance.`,
            keyTakeaways: [
              'Verify mandatory pre-dispatch FSSAI / AGMARK or BIS CRS certificates prior to truck or rail loading.',
              'Ensure HSN classification and IGST invoice match NIC E-Way Bill Part-A and Part-B schedules.',
              'Book dedicated GPS-tracked express container trucks or CONCOR rail rakes in advance for peak harvest dispatches.',
              'Implement moisture-barrier liner packaging and palletization for long-haul multi-state highway transit.',
            ],
            operationalImpact: 'Tiffora coordinates lab testing, interstate E-Way compliance, and line-haul transport without manufacturing overhead.',
            relevantStandards: ['FSSAI Interstate', 'AGMARK', 'NIC E-Way Bill & IGST', 'BIS CRS IS 13252'],
          },
        });
      }

      const prompt = `You are the Senior Interstate Trade Intelligence Officer for Tiffora, a two-way interstate import-export trading house in India.
Corridor 1 (State Agro Dispatch): Sourcing food products from farmers, FPOs, and processors in producer Indian states (e.g. Punjab, Haryana, Gujarat, MP, Andhra Pradesh) and supplying buyers in consumer states (e.g. Maharashtra, Karnataka, Delhi NCR, Tamil Nadu, West Bengal).
Corridor 2 (Electronics Supply): Procuring high-demand electronic accessories from metro tech hubs (Delhi NCR/Noida, Mumbai/Bhiwandi, Chennai, Bengaluru) for state wholesalers, retailers, and online sellers across India.
Upcoming Initiative: Tiffy (Coming Soon) — Tiffora's curated food brand backed by FSSAI, AGMARK, and direct state FPO provenance.
Operating model: Asset-light interstate trader (sources, certifies, ships, sells; does not manufacture).

Generate a concise, authoritative, professional Indian interstate trade intelligence brief for this topic:
"${topic}"
Corridor context: ${corridor || 'bilateral'}

Return a valid JSON object matching this schema:
{
  "title": "Concise professional title",
  "summary": "2-3 sentences executive summary explaining interstate market dynamics, GST/E-Way compliance, or highway/rail logistics",
  "keyTakeaways": ["Bullet 1 with exact Indian statutory standard (FSSAI, AGMARK, BIS CRS, LMPC)", "Bullet 2 with operational mandi/warehouse guidance", "Bullet 3 with E-Way Bill, IGST, or express truck/CONCOR rail advice", "Bullet 4 with transit risk mitigation"],
  "operationalImpact": "1 sentence on how Tiffora's asset-light sourcing and certification resolves this across state borders",
  "relevantStandards": ["Standard 1 (e.g. FSSAI Interstate, AGMARK, BIS CRS, NIC E-Way Bill, IGST)", "Standard 2"]
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
        const newInsight: IndustryInsight = {
          id: 'ins-' + Date.now(),
          title: parsed.title,
          category: corridor === 'import_electronics' ? 'import_electronics' : corridor === 'export_agro' ? 'export_agro' : 'logistics_freight',
          corridor: corridor || 'bilateral',
          readTime: '4 min read',
          publishedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          summary: parsed.summary,
          keyTakeaways: parsed.keyTakeaways || [],
          operationalImpact: parsed.operationalImpact || '',
          relevantStandards: parsed.relevantStandards || [],
          author: 'Tiffora AI Interstate Compliance Desk',
        };
        inMemoryInsights.unshift(newInsight);
        return res.json({ brief: parsed });
      }

      throw new Error('No AI text returned');
    } catch (err: any) {
      console.warn('AI brief fallback:', err.message);
      res.json({
        brief: {
          title: `Interstate Trade Advisory: ${req.body.topic || 'State-to-State Corridor Overview'}`,
          summary: 'Tiffora bridges Indian agricultural producer states with commercial buyers across India and distributes fast-moving electronic accessories from metro tech hubs to state wholesale networks.',
          keyTakeaways: [
            'Mandatory quality audits (FSSAI Interstate, AGMARK, BIS CRS) at origin state hubs.',
            'Automated NIC E-Way Bill generation, IGST invoicing, and tamper-evident truck seals.',
            'Structured interstate delivery terms (FOR, DDP, EXW) to eliminate transit risk.',
          ],
          operationalImpact: 'Asset-light interstate execution ensures verified provenance and timely delivery without manufacturing overhead.',
          relevantStandards: ['FSSAI Interstate', 'BIS CRS IS 13252', 'NIC E-Way Bill', 'AGMARK'],
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
        partyRole,
        partyRoleLabel,
        specialInstructions,
      } = req.body;

      let extractedData: Partial<TradeOrder> = {};

      if (apiKey && naturalLanguagePrompt) {
        try {
          const prompt = `You are the AI Order Placement Engine for Tiffora, a two-way interstate import-export trading company across Indian states.
Corridor 1 (export_agro): Dispatching food products from farmers, FPOs, and processors in producer Indian states to commercial buyers in consumer Indian states.
Corridor 2 (import_electronics): Procuring electronic accessories from metro tech hubs (Delhi NCR, Noida, Mumbai, Chennai, Bengaluru) for wholesalers, retailers, and online sellers across Indian states.
Asset-light trader: Sourcing, certifying, shipping via express highway/CONCOR rail, selling.

Parse the following interstate customer order request into structured trade parameters:
"${naturalLanguagePrompt}"

Return a valid JSON object matching this schema:
{
  "corridor": "export_agro" or "import_electronics",
  "productName": "Concise product title",
  "productCategory": "Category description",
  "quantity": "Amount as string or number",
  "unit": "Units, e.g. Metric Tons, Quintals, Units, Cartons, FTL Trucks",
  "origin": "Origin Indian city & state (e.g. Ludhiana, Punjab or Noida, UP)",
  "destination": "Destination Indian city & state (e.g. Bhiwandi, Maharashtra or Bengaluru, Karnataka)",
  "incoterm": "FOR" | "DDP" | "EXW" | "CIF" | "FOB" | "CFR",
  "certificationsRequired": ["List of Indian interstate certificates, e.g. FSSAI Interstate, AGMARK, NIC E-Way Bill, BIS CRS IS 13252, LMPC"],
  "hsnCode": "Estimated 6 to 8 digit GST HSN code",
  "targetPriceEstimate": "Estimated target price in INR if mentioned or standard benchmark",
  "aiAnalysis": {
    "summary": "1-2 sentence commercial interstate order summary",
    "riskAssessment": "Low Risk" | "Standard" | "Elevated Compliance",
    "assetLightAction": "Exact asset-light sourcing, lab certification, and interstate dispatch plan",
    "matchedNetwork": "State FPO / Metro Hub sourcing cluster recommendation"
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
        extractedData.productName || productName || (resolvedCorridor === 'export_agro' ? 'Certified 1121 Steam Basmati Rice' : '65W GaN Fast Charging USB-C Adapters');

      const resolvedCategory =
        extractedData.productCategory || (resolvedCorridor === 'export_agro' ? 'Interstate Food & Agricultural Commodities' : 'Consumer Electronic Accessories');

      const resolvedQuantity = extractedData.quantity || quantity || '1';
      const resolvedUnit = extractedData.unit || unit || (resolvedCorridor === 'export_agro' ? 'Metric Tons' : 'Units');
      const resolvedOrigin = extractedData.origin || origin || (resolvedCorridor === 'export_agro' ? 'Ludhiana, Punjab' : 'Delhi NCR / Noida Hub');
      const resolvedDestination = extractedData.destination || destination || (resolvedCorridor === 'export_agro' ? 'Mumbai / Bhiwandi, Maharashtra' : 'Bengaluru, Karnataka');
      const resolvedIncoterm = (extractedData.incoterm || incoterm || (resolvedCorridor === 'export_agro' ? 'FOR' : 'DDP')) as 'FOR' | 'FOB' | 'CIF' | 'CFR' | 'DDP' | 'EXW';

      const certs = extractedData.certificationsRequired || (resolvedCorridor === 'export_agro' ? ['FSSAI Interstate License', 'AGMARK Grade A', 'NIC E-Way & IGST'] : ['BIS CRS IS 13252', 'Legal Metrology (LMPC)', 'IGST Tax Invoice']);

      const hsn = extractedData.hsnCode || (resolvedCorridor === 'export_agro' ? '1006.30.20' : '8504.40.90');

      const orderCount = inMemoryOrders.length + 1;
      const orderPrefix = resolvedCorridor === 'export_agro' ? 'TIF-AGRO' : 'TIF-ELEC';
      const orderNumber = `${orderPrefix}-2026-${String(1000 + orderCount).slice(-4)}`;
      const now = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
      const isoNow = new Date().toISOString();

      const aiAnalysis = extractedData.aiQueryAnalysis || {
        summary: `AI has registered the interstate inquiry for ${resolvedQuantity} ${resolvedUnit} of ${resolvedProductName} (${resolvedOrigin} → ${resolvedDestination}) under ${resolvedIncoterm} terms.`,
        riskAssessment: 'Low Risk' as const,
        assetLightAction: resolvedCorridor === 'export_agro'
          ? 'Dispatching sourcing allocation to verified state FPOs & FSSAI/AGMARK accredited milling hubs.'
          : 'Connecting to audited metro electronics hubs with active BIS CRS & Legal Metrology compliance.',
        matchedNetwork: resolvedCorridor === 'export_agro'
          ? 'Verified Interstate FPO & Agro Producer Network'
          : 'Accredited Metro Tech Hub Distribution Network',
      };

      const resolvedPartyRole = (partyRole || 'vendor') as 'vendor' | 'buyer' | 'wholesaler' | 'processor';
      const resolvedPartyRoleLabel = partyRoleLabel || (resolvedPartyRole === 'vendor' ? 'Verified State Vendor' : 'Interstate Trade Partner');

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
        clientName: clientName || 'Authorized Representative',
        clientCompany: clientCompany || 'Interstate Commercial Enterprise',
        clientEmail: clientEmail || 'trade@enterprise.in',
        partyRole: resolvedPartyRole,
        partyRoleLabel: resolvedPartyRoleLabel,
        placedAtIso: isoNow,
        targetPriceEstimate: extractedData.targetPriceEstimate || 'Spot Mandi / Hub Rate upon Allocation',
        certificationsRequired: certs,
        hsnCode: hsn,
        specialInstructions: specialInstructions || naturalLanguagePrompt || 'Standard interstate palletization with NIC E-Way Bill and IGST invoice.',
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
            notes: `Interstate query validated by Tiffora AI. Corridor: ${resolvedCorridor === 'export_agro' ? 'State Agro Dispatch (Producer → Buyer State)' : 'Metro Tech Supply (Hub → State Retail)'}.`,
            category: 'query',
          },
          {
            id: 'm-reg-2',
            title: 'Sourcing Allocation to State FPOs / Tech Hubs',
            timestamp: 'Queued for Execution',
            completed: false,
            notes: 'Asset-light matching with pre-qualified state agricultural processors or metro electronics hubs.',
            category: 'sourcing',
          },
          {
            id: 'm-reg-3',
            title: 'FSSAI / AGMARK / BIS CRS Quality Audit',
            timestamp: 'Pending Execution',
            completed: false,
            notes: `Scheduled verification: ${certs.join(', ')}.`,
            category: 'certification',
          },
          {
            id: 'm-reg-4',
            title: 'NIC E-Way Bill & Interstate Fleet Dispatch',
            timestamp: 'Pending Execution',
            completed: false,
            notes: 'IGST invoice generation, E-Way Bill Part-B assignment, and GPS truck/CONCOR rail dispatch.',
            category: 'shipping',
          },
          {
            id: 'm-reg-5',
            title: 'Destination State Fulfillment & POD',
            timestamp: 'Pending Fulfillment',
            completed: false,
            notes: `Final warehouse unloading and Proof of Delivery at ${resolvedDestination}.`,
            category: 'delivery',
          },
        ],
      };

      inMemoryOrders.unshift(newOrder);

      // Instantly broadcast to admin dashboard and connected clients
      broadcastOrderEvent('order:created', newOrder);

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
            ? 'Matched with certified state farmer FPO. Harvest moisture & purity lab test approved.'
            : 'Sourcing allocation locked with metro electronics distribution hub. BIS CRS batch QA verified.';

        order.milestones[2].completed = true;
        order.milestones[2].timestamp = now;
        order.milestones[2].notes = `Mandatory certification completed: ${order.certificationsRequired.slice(0, 2).join(' & ')} verified.`;

        order.milestones[3].timestamp = 'In Transit / E-Way Active';
        order.milestones[3].completed = true;
        order.milestones[3].notes = 'IGST tax invoice & NIC E-Way Bill generated. Interstate carrier dispatched.';

        order.fulfillmentDoc = {
          trackingNumber: `EWB-${Math.floor(100000000 + Math.random() * 900000000)}`,
          vesselOrFlight: order.corridor === 'export_agro' ? 'NH-48 Express Container Truck MH-04-EX-8821' : 'CONCOR Domestic Rail & Express Air Cargo',
          inspectionPassId: `QC-PASS-${Math.floor(1000 + Math.random() * 9000)}`,
          fulfillmentStatus: 'In Execution - Interstate Transit Active',
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
        order.milestones[4].notes = `Arrived at ${order.destination}. E-Way Bill closed & commercial Proof of Delivery signed.`;

        if (order.fulfillmentDoc) {
          order.fulfillmentDoc.fulfillmentStatus = 'Fulfilled & Handed Over to State Consignee';
        }
      }

      // Broadcast order update to admin and connected clients
      broadcastOrderEvent('order:advanced', order);

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

  // Tiffora AI Trade Concierge chat endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, userMessage } = req.body;

      const systemInstruction = `You are Tiffora AI, the exclusive AI Trade Concierge for Tiffora, an interstate import-export trading house operating across India.
About Tiffora:
- Tiffora is a two-way interstate trading company moving commercial goods across Indian state borders.
- State Agro Dispatch Corridor (export_agro): Sources certified food and agricultural products from farmers, FPOs, and processors in surplus states (Punjab, Haryana, Gujarat, MP, Andhra Pradesh) and supplies commercial buyers in consumer states (Maharashtra, Karnataka, Tamil Nadu, Delhi NCR, West Bengal).
- Metro Tech Supply Corridor (import_electronics): Procures high-demand electronic accessories from metro manufacturing & tech hubs (Delhi NCR/Noida, Mumbai/Bhiwandi, Chennai, Bengaluru) for state wholesalers, multi-brand retailers, and online sellers across Tier-1, Tier-2, and Tier-3 Indian states.
- Tiffy (Coming Soon): Tiffora's upcoming consumer and bulk food initiative ("Tiffy — Fresh Food, Interstate Direct") built on direct state FPOs, FSSAI & AGMARK grading, and zero middlemen. Clients can join the Tiffy Early Access waitlist on the page.
- Operating Model: An asset-light interstate trader. Tiffora does not manufacture; it sources, certifies, ships, and sells with full IGST, NIC E-Way Bill, FSSAI Interstate, AGMARK, and BIS CRS compliance.
- Capability: Tiffora has an AI-based Order Placement & Execution Tracking System with QR-coded Interstate Dispatch Passes. Clients can specify commodity, volume, origin/destination states, and certifications, and Tiffora's AI registers the query, routes it into execution, and tracks highway/CONCOR rail transit through to fulfillment.

Guidelines for Tiffora AI:
- Tone: Highly articulate, refined, commercial, concise, and trustworthy.
- Response Length: Keep answers concise (2 to 4 sentences usually, unless the user asks for deep operational detail).
- Helpful Affordances: Clarify the two-way interstate corridors, explain how Tiffora's "source, certify, ship, sell" model eliminates regional broker fragmentation and transit risk, highlight Tiffy (Coming Soon) early access when asked, and guide interested clients to click "Place Order with AI" or track active orders on the page.
- Integrity: Never claim that Tiffora manufactures products. Always emphasize asset-light interstate sourcing, quality certification, and E-Way/IGST compliance.`;

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
          reply: "Welcome to Tiffora. I am Tiffora AI, your interstate trade concierge. Tiffora is an asset-light, two-way interstate trading house across India: we dispatch quality food products from farmers and FPOs in surplus states to buyers across consumer states, supply high-turnover electronic accessories from metro hubs to regional wholesalers, and are preparing to launch Tiffy (Coming Soon) — our direct interstate food brand. You can place orders directly through our AI Order Placement system or join Tiffy Early Access below.",
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

      const reply = response.text || "I am pleased to assist you with Tiffora's interstate trade operations across India, including our upcoming Tiffy food initiative. How may I direct your inquiry?";
      res.json({ reply });
    } catch (error: any) {
      console.error('Error in Tiffora AI chat endpoint:', error);
      res.json({
        reply: "Greetings from Tiffora. I am Tiffora AI, your trade concierge. Tiffora bridges Indian state markets by dispatching certified agricultural produce from farmer states, supplying electronic accessories from metro hubs, and launching Tiffy (Coming Soon) for direct interstate food distribution. Register your query via our AI Order Placement system or join Tiffy Early Access on the page.",
      });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    try {
      const vite = await createViteServer({
        server: {
          middlewareMode: true,
          hmr: false,
        },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      console.log('  ➜  Vite middleware attached and ready.');
    } catch (err) {
      console.error('Failed to initialize Vite dev server:', err);
    }
  }

  // Gracefully start accepting HTTP requests only when middlewares are ready
  server.listen(port, '0.0.0.0', () => {
    console.log(`\n  VITE ready in full-stack mode\n`);
    console.log(`  ➜  Local:   http://localhost:${port}/`);
    console.log(`  ➜  Network: http://0.0.0.0:${port}/`);
    console.log(`  ➜  Tiffora full-stack trading server running\n`);
  });

  // Graceful shutdown on restart or termination
  const handleShutdown = () => {
    try {
      wss.close();
      server.close(() => {
        process.exit(0);
      });
    } catch {
      process.exit(0);
    }
  };

  process.on('SIGTERM', handleShutdown);
  process.on('SIGINT', handleShutdown);
}

startServer();
