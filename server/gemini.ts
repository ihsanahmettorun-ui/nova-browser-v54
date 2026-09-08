import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Fallback models in priority order for resilience against 503 spikes
const CANDIDATE_MODELS = ['gemini-3.7-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

export async function executeWithRetryAndFallback(
  prompt: string,
  options?: {
    systemInstruction?: string;
    responseMimeType?: string;
  }
): Promise<string | null> {
  const client = getAiClient();
  if (!client) {
    return null;
  }

  for (const model of CANDIDATE_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await client.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction: options?.systemInstruction,
            responseMimeType: options?.responseMimeType,
          },
        });

        if (response && response.text) {
          return response.text;
        }
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        const isTransientIssue =
          errMsg.includes('503') ||
          errMsg.includes('high demand') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('429') ||
          errMsg.includes('RESOURCE_EXHAUSTED') ||
          errMsg.includes('overloaded');

        // Only log informative debug without noisy error spam
        if (!isTransientIssue) {
          console.warn(`[Gemini AI] Note on model ${model}:`, errMsg);
        }

        if (isTransientIssue && attempt === 0) {
          // Brief pause before single retry
          const backoff = 350 + Math.floor(Math.random() * 250);
          await new Promise((resolve) => setTimeout(resolve, backoff));
          continue;
        }

        // If high demand persists on this model, proceed immediately to the next candidate model
        break;
      }
    }
  }

  return null;
}

export async function generateSmartAnswer(query: string, lang = 'tr'): Promise<string | null> {
  const prompt = `Kullanıcı Nova Browser V54 arama motorunda bir sorgu arattı: "${query}".
Lütfen kullanıcıya ${lang === 'tr' ? 'Türkçe' : 'ilgili dilde'} net, doğru, anlaşılır ve 2-3 paragraflık özet bir bilgi ver. Markdown formatında başlıklar ve maddeler kullanabilirsin.`;

  return executeWithRetryAndFallback(prompt);
}

export async function summarizeWebPage(pageText: string, pageUrl: string): Promise<string | null> {
  const prompt = `Aşağıda Nova Browser ile ziyaret edilen "${pageUrl}" adresli web sayfasının metin içeriği yer almaktadır.
Lütfen bu sayfadaki en kritik bilgileri 3-4 maddede özetle:

İçerik:
${pageText.slice(0, 5000)}`;

  return executeWithRetryAndFallback(prompt);
}

