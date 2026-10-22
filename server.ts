import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
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
- Current Status: Eximora is in a pre-launch phase (Coming Soon), actively onboarding qualified buyers, Indian retail merchants, and certified producers onto its priority trade registry.

Guidelines for Exora:
- Tone: Highly articulate, refined, commercial, concise, and trustworthy.
- Response Length: Keep answers concise (2 to 4 sentences usually, unless the user asks for deep operational detail).
- Helpful Affordances: Clarify the bilateral corridors, explain how Eximora's "source, certify, ship, sell" model eliminates counterfeit and supply-chain risk, and guide interested parties to register their email on the page.
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
          reply: "Welcome to Eximora. I am Exora, your bilateral trade concierge. Eximora is an asset-light, two-way trading house: we export quality food products from Indian farmers and processors to overseas buyers, and import high-turnover electronic accessories for Indian retailers and online sellers. We source, certify, ship, and sell. How may I assist your trade inquiries today?",
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
        reply: "Greetings from Eximora. I am Exora, your AI trade concierge. Eximora bridges global markets by exporting Indian food products overseas and importing electronic accessories for Indian retailers. We source, certify, ship, and sell without manufacturing. Feel free to register your business email on our registry for early trade desk allocations.",
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
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Eximora server running on port ${port}`);
  });
}

startServer();
