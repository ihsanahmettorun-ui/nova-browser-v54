import * as cheerio from 'cheerio';
import { executeWithRetryAndFallback } from './gemini.js';

export interface SearchResultItem {
  title: string;
  url: string;
  domain: string;
  description: string;
  source: string;
  type: 'web' | 'images' | 'books' | 'academic' | 'news';
  image?: string;
  score: number;
}

const SEARCH_CACHE = new Map<string, { data: SearchResultItem[]; expires: number }>();
const SUGGEST_CACHE = new Map<string, { data: string[]; expires: number }>();

const CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes
const SUGGEST_TTL_MS = 1000 * 60 * 5; // 5 minutes

function safeUrl(val: string): string {
  try {
    const u = new URL(val);
    return ['http:', 'https:'].includes(u.protocol) ? u.toString() : '';
  } catch {
    return '';
  }
}

function dedupeResults(items: SearchResultItem[]): SearchResultItem[] {
  const seen = new Set<string>();
  return items.filter(item => {
    if (!item.url) return false;
    const cleanUrl = item.url.replace(/\/$/, '').toLowerCase();
    if (seen.has(cleanUrl)) return false;
    seen.add(cleanUrl);
    return true;
  });
}

// 1. Google Web Search Scraper (Google ile birebir eşdeğer sonuçlar)
async function searchGoogle(query: string, lang = 'tr'): Promise<SearchResultItem[]> {
  try {
    const gl = lang === 'tr' ? 'tr' : 'us';
    const hl = lang === 'auto' ? 'tr' : lang;
    const u = new URL('https://www.google.com/search');
    u.searchParams.set('q', query);
    u.searchParams.set('hl', hl);
    u.searchParams.set('gl', gl);
    u.searchParams.set('num', '15');
    u.searchParams.set('pws', '0');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(u.toString(), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': `${hl}-${gl},${hl};q=0.9,en;q=0.8`,
        'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const html = await res.text();
    const $ = cheerio.load(html);
    const results: SearchResultItem[] = [];

    // Select standard Google search cards
    $('div.g, div.tF2Cxc, div.MjjYud').each((_, el) => {
      const linkEl = $(el).find('a[href^="http"]').first();
      let rawHref = linkEl.attr('href') || '';
      if (!rawHref) return;

      // Handle Google redirect urls (/url?q=...)
      if (rawHref.includes('/url?')) {
        try {
          const match = rawHref.match(/[?&]q=([^&]+)/);
          if (match && match[1]) {
            rawHref = decodeURIComponent(match[1]);
          }
        } catch {
          // ignore
        }
      }

      if (rawHref.includes('google.com/search') || rawHref.includes('webcache.googleusercontent')) {
        return;
      }

      const targetUrl = safeUrl(rawHref);
      if (!targetUrl) return;

      const title = $(el).find('h3').first().text().trim() || linkEl.text().trim();
      if (!title || title.length < 2) return;

      let snippet = $(el).find('div.VwiC3b, div.IsZvec, div.s3v9rd, div.kCrYT').first().text().trim();
      if (!snippet) {
        snippet = $(el).find('span').text().trim().slice(0, 180);
      }

      let domain = '';
      try {
        domain = new URL(targetUrl).hostname.replace(/^www\./, '');
      } catch {
        domain = 'google.com';
      }

      results.push({
        title,
        url: targetUrl,
        domain,
        description: snippet || `${title} hakkında detaylı bilgi ve web sayfası içeriği.`,
        source: 'Google Web Engine',
        type: 'web',
        score: 100,
      });
    });

    return results;
  } catch {
    return [];
  }
}

// 2. DuckDuckGo Web Scraper
async function searchDuckDuckGo(query: string, lang = 'tr'): Promise<SearchResultItem[]> {
  try {
    const u = new URL('https://html.duckduckgo.com/html/');
    u.searchParams.set('q', query);
    if (lang && lang !== 'auto') {
      const langMap: Record<string, string> = {
        tr: 'tr-tr',
        en: 'us-en',
        de: 'de-de',
        fr: 'fr-fr',
        es: 'es-es',
        ru: 'ru-ru',
        ar: 'xa-ar',
      };
      if (langMap[lang]) u.searchParams.set('kl', langMap[lang]);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(u.toString(), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'tr,en;q=0.9',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const html = await res.text();
    const $ = cheerio.load(html);
    const results: SearchResultItem[] = [];

    $('.result').each((_, el) => {
      const linkEl = $(el).find('.result__a');
      let rawHref = linkEl.attr('href') || '';
      if (!rawHref) return;

      if (rawHref.includes('uddg=')) {
        try {
          const match = rawHref.match(/uddg=([^&]+)/);
          if (match && match[1]) {
            rawHref = decodeURIComponent(match[1]);
          }
        } catch {
          // ignore
        }
      }

      const targetUrl = safeUrl(rawHref);
      if (!targetUrl) return;

      const title = linkEl.text().trim() || 'Sonuç';
      const snippet = $(el).find('.result__snippet').text().trim();
      let domain = '';
      try {
        domain = new URL(targetUrl).hostname.replace(/^www\./, '');
      } catch {
        domain = 'duckduckgo.com';
      }

      results.push({
        title,
        url: targetUrl,
        domain,
        description: snippet,
        source: 'DuckDuckGo Web',
        type: 'web',
        score: 95,
      });
    });

    return results;
  } catch {
    return [];
  }
}

// 3. Bing Web Scraper (Yedek Arama Katmanı)
async function searchBing(query: string, lang = 'tr'): Promise<SearchResultItem[]> {
  try {
    const u = new URL('https://www.bing.com/search');
    u.searchParams.set('q', query);
    u.searchParams.set('setlang', lang === 'auto' ? 'tr' : lang);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(u.toString(), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const html = await res.text();
    const $ = cheerio.load(html);
    const results: SearchResultItem[] = [];

    $('li.b_algo').each((_, el) => {
      const a = $(el).find('h2 a').first();
      const href = safeUrl(a.attr('href') || '');
      if (!href) return;

      const title = a.text().trim();
      const snippet = $(el).find('.b_caption p, .b_snippet').text().trim();
      let domain = '';
      try {
        domain = new URL(href).hostname.replace(/^www\./, '');
      } catch {
        domain = 'bing.com';
      }

      if (title) {
        results.push({
          title,
          url: href,
          domain,
          description: snippet || `${title} web sayfası.`,
          source: 'Bing Index',
          type: 'web',
          score: 92,
        });
      }
    });

    return results;
  } catch {
    return [];
  }
}

// 4. Wikipedia Search (Extracts & Articles)
async function searchWikipedia(query: string, lang = 'tr'): Promise<SearchResultItem[]> {
  try {
    const wikiLang = ['tr', 'en', 'de', 'fr', 'es', 'ru', 'ar', 'zh', 'ja', 'it', 'pt'].includes(lang) ? lang : 'tr';
    const u = new URL(`https://${wikiLang}.wikipedia.org/w/api.php`);
    u.searchParams.set('action', 'query');
    u.searchParams.set('generator', 'search');
    u.searchParams.set('gsrsearch', query);
    u.searchParams.set('gsrlimit', '10');
    u.searchParams.set('prop', 'info|extracts|pageimages');
    u.searchParams.set('inprop', 'url');
    u.searchParams.set('exintro', '1');
    u.searchParams.set('explaintext', '1');
    u.searchParams.set('exlimit', '10');
    u.searchParams.set('piprop', 'thumbnail');
    u.searchParams.set('pithumbsize', '400');
    u.searchParams.set('format', 'json');
    u.searchParams.set('origin', '*');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(u.toString(), {
      headers: { 'User-Agent': 'NovaBrowserV54/1.0 (https://novabrowser.local)' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const data = await res.json();
    const pages = data?.query?.pages ? Object.values(data.query.pages) : [];
    const results: SearchResultItem[] = [];

    for (const p of pages as any[]) {
      if (!p?.fullurl) continue;
      results.push({
        title: p.title || 'Vikipedi',
        url: p.fullurl,
        domain: `${wikiLang}.wikipedia.org`,
        description: p.extract ? p.extract.slice(0, 300) + '...' : 'Vikipedi ansiklopedi maddesi.',
        source: 'Vikipedi Ansiklopedi',
        type: 'web',
        image: p.thumbnail?.source || undefined,
        score: 96,
      });
    }

    return results;
  } catch {
    return [];
  }
}

// 5. Wikimedia Commons Image Search
async function searchWikimediaImages(query: string): Promise<SearchResultItem[]> {
  try {
    const u = new URL('https://commons.wikimedia.org/w/api.php');
    u.searchParams.set('action', 'query');
    u.searchParams.set('generator', 'search');
    u.searchParams.set('gsrsearch', query);
    u.searchParams.set('gsrnamespace', '6'); // File namespace
    u.searchParams.set('gsrlimit', '30');
    u.searchParams.set('prop', 'imageinfo');
    u.searchParams.set('iiprop', 'url|size|extmetadata');
    u.searchParams.set('iiurlwidth', '700');
    u.searchParams.set('format', 'json');
    u.searchParams.set('origin', '*');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(u.toString(), {
      headers: { 'User-Agent': 'NovaBrowserV54/1.0' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const data = await res.json();
    const pages = data?.query?.pages ? Object.values(data.query.pages) : [];
    const results: SearchResultItem[] = [];

    for (const p of pages as any[]) {
      const info = p.imageinfo?.[0];
      if (!info?.thumburl && !info?.url) continue;
      const title = (p.title || 'Görsel').replace(/^Dosya:|^File:/i, '').replace(/\.[^/.]+$/, '');
      results.push({
        title,
        url: info.descriptionurl || info.url,
        domain: 'commons.wikimedia.org',
        description: 'Yüksek çözünürlüklü Wikimedia görseli',
        source: 'Wikimedia Commons',
        type: 'images',
        image: info.thumburl || info.url,
        score: 98,
      });
    }

    return results;
  } catch {
    return [];
  }
}

// 6. Open Library Book Search
async function searchOpenLibrary(query: string): Promise<SearchResultItem[]> {
  try {
    const u = new URL('https://openlibrary.org/search.json');
    u.searchParams.set('q', query);
    u.searchParams.set('limit', '15');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(u.toString(), { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const data = await res.json();
    const docs = Array.isArray(data.docs) ? data.docs : [];
    const results: SearchResultItem[] = [];

    for (const doc of docs) {
      if (!doc.key) continue;
      const author = Array.isArray(doc.author_name) ? doc.author_name.slice(0, 2).join(', ') : 'Bilinmeyen Yazar';
      const year = doc.first_publish_year ? `(${doc.first_publish_year})` : '';
      const coverId = doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : undefined;

      results.push({
        title: `${doc.title || 'Kitap'} ${year}`,
        url: `https://openlibrary.org${doc.key}`,
        domain: 'openlibrary.org',
        description: `Yazar: ${author}. İlk basım yılı: ${doc.first_publish_year || 'N/A'}. Konular: ${(doc.subject || []).slice(0, 3).join(', ')}`,
        source: 'Open Library Kitaplar',
        type: 'books',
        image: coverId,
        score: 85,
      });
    }

    return results;
  } catch {
    return [];
  }
}

// 7. Gemini Web Grounding Fallback
async function searchWithGemini(query: string, _lang = 'tr'): Promise<SearchResultItem[]> {
  if (!process.env.GEMINI_API_KEY) return [];

  try {
    const prompt = `Kullanıcı web aramasında "${query}" kelimesini arattı. Bu arama için Google standartlarında en iyi 8 web arama sonucunu JSON dizisi olarak döndür.
Her öğede:
- title: sayfa başlığı
- url: gerçek, geçerli ve çalışan resmi URL (örneğin https://www.youtube.com, https://tr.wikipedia.org/... vb.)
- domain: ana alan adı (örneğin youtube.com, wikipedia.org)
- description: arama motoru açıklaması (snippet)

Yanıtı SADECE geçerli JSON dizisi olarak döndür:
[
  {"title": "...", "url": "https://...", "domain": "...", "description": "..."}
]`;

    const text = await executeWithRetryAndFallback(prompt, {
      responseMimeType: 'application/json',
    });

    if (!text) return [];
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((item: any, idx: number) => ({
      title: item.title || query,
      url: safeUrl(item.url) || `https://${item.domain || 'google.com'}`,
      domain: item.domain || 'google.com',
      description: item.description || `${query} ile ilgili web içeriği.`,
      source: 'Nova Ultra Engine',
      type: 'web' as const,
      score: 95 - idx,
    }));
  } catch {
    return [];
  }
}

// 8. Google News RSS Live Stream (Haberler)
async function searchGoogleNews(query: string, lang = 'tr'): Promise<SearchResultItem[]> {
  try {
    const gl = lang === 'tr' ? 'TR' : 'US';
    const hl = lang === 'auto' ? 'tr' : lang;
    const ceid = lang === 'tr' ? 'TR:tr' : 'US:en';
    const u = new URL('https://news.google.com/rss/search');
    u.searchParams.set('q', query);
    u.searchParams.set('hl', hl);
    u.searchParams.set('gl', gl);
    u.searchParams.set('ceid', ceid);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(u.toString(), {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const xml = await res.text();
    const $ = cheerio.load(xml, { xmlMode: true });
    const results: SearchResultItem[] = [];

    $('item').each((idx, el) => {
      if (idx >= 15) return;
      const title = $(el).find('title').text().trim();
      const link = safeUrl($(el).find('link').text().trim()) || '';
      const source = $(el).find('source').text().trim() || 'Haber Kaynağı';
      const pubDate = $(el).find('pubDate').text().trim();
      const desc = $(el).find('description').text().replace(/<[^>]+>/g, '').trim();

      if (title && link) {
        let domain = 'news.google.com';
        try {
          domain = new URL(link).hostname.replace(/^www\./, '');
        } catch {}

        results.push({
          title,
          url: link,
          domain,
          description: `${source} • ${pubDate ? new Date(pubDate).toLocaleDateString('tr-TR') : ''} • ${desc.slice(0, 220)}`,
          source: `Canlı Haber (${source})`,
          type: 'news',
          score: 98 - idx,
        });
      }
    });

    return results;
  } catch {
    return [];
  }
}

// 9. GitHub Developer Repos & Code
async function searchGitHub(query: string): Promise<SearchResultItem[]> {
  try {
    const u = new URL('https://api.github.com/search/repositories');
    u.searchParams.set('q', query);
    u.searchParams.set('sort', 'stars');
    u.searchParams.set('order', 'desc');
    u.searchParams.set('per_page', '10');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(u.toString(), {
      headers: {
        'User-Agent': 'NovaBrowser-App',
        Accept: 'application/vnd.github.v3+json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const data = await res.json();
    const items = Array.isArray(data?.items) ? data.items : [];
    return items.map((item: any, idx: number) => ({
      title: `${item.full_name} ⭐ ${item.stargazers_count?.toLocaleString() || 0}`,
      url: item.html_url,
      domain: 'github.com',
      description: `${item.description || 'GitHub Açık Kaynak Projesi'}. Dil: ${item.language || 'Çeşitli'}. Lisans: ${item.license?.name || 'Açık Kaynak'}.`,
      source: 'GitHub Geliştirici Ağı',
      type: 'academic',
      image: item.owner?.avatar_url,
      score: 95 - idx,
    }));
  } catch {
    return [];
  }
}

// 10. Live Weather Quick Search
async function searchLiveWeather(query: string): Promise<SearchResultItem[]> {
  try {
    const city = query.replace(/hava|durumu|bugün|yarın|tahmini|weather/gi, '').trim() || 'Istanbul';
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=tr&format=json`;
    const geoRes = await fetch(geoUrl);
    if (!geoRes.ok) return [];
    const geoData = await geoRes.json();
    const loc = geoData?.results?.[0];
    if (!loc) return [];

    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current_weather=true`;
    const fcRes = await fetch(forecastUrl);
    if (!fcRes.ok) return [];
    const fcData = await fcRes.json();
    const cw = fcData?.current_weather;
    if (!cw) return [];

    return [{
      title: `🌤️ ${loc.name}, ${loc.country || ''} Hava Durumu: ${cw.temperature}°C`,
      url: `https://www.accuweather.com/tr/search-locations?query=${encodeURIComponent(loc.name)}`,
      domain: 'open-meteo.com',
      description: `Rüzgar Hızı: ${cw.windspeed} km/s. Güncel sıcaklık: ${cw.temperature}°C. Canlı meteoroloji ölçümü.`,
      source: 'Canlı Meteoroloji',
      type: 'web',
      score: 100,
    }];
  } catch {
    return [];
  }
}

// Main Search Dispatcher
export async function performSearch(
  query: string,
  type: 'web' | 'images' | 'books' | 'academic' | 'news' | 'videos' = 'web',
  lang = 'tr',
  apiKey?: string
): Promise<{ query: string; type: string; lang: string; results: SearchResultItem[]; cached: boolean }> {
  const cleanQ = query.trim();
  if (!cleanQ) {
    return { query: '', type, lang, results: [], cached: false };
  }

  const cacheKey = `${type}:${lang}:${cleanQ.toLowerCase()}:${apiKey ? 'customKey' : 'default'}`;
  const cached = SEARCH_CACHE.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return { query: cleanQ, type, lang, results: cached.data, cached: true };
  }

  let finalResults: SearchResultItem[] = [];

  if (type === 'images') {
    finalResults = await searchWikimediaImages(cleanQ);
  } else if (type === 'books') {
    finalResults = await searchOpenLibrary(cleanQ);
  } else if (type === 'news') {
    finalResults = await searchGoogleNews(cleanQ, lang);
  } else if (type === 'academic') {
    const [ghResults, olResults] = await Promise.all([
      searchGitHub(cleanQ),
      searchOpenLibrary(cleanQ),
    ]);
    finalResults = dedupeResults([...ghResults, ...olResults]);
  } else if (type === 'videos') {
    const { searchYouTubeVideos } = await import('./youtube.js');
    const ytVideos = await searchYouTubeVideos(cleanQ, apiKey);
    finalResults = ytVideos.map((v, idx) => ({
      title: v.title,
      url: v.url,
      domain: 'youtube.com',
      description: `${v.channel} • ${v.views || ''} ${v.duration ? `(${v.duration})` : ''} • ${v.description || ''}`,
      source: apiKey ? 'YouTube Data API v3 (Özel Anahtar)' : 'YouTube Video Engine',
      type: 'videos' as any,
      image: v.thumbnail,
      score: 100 - idx,
    }));
  } else {
    // Web: Check for weather intent
    const isWeatherQuery = /hava|durumu|derece|sıcaklık|weather|forecast/i.test(cleanQ);
    const weatherPromise = isWeatherQuery ? searchLiveWeather(cleanQ) : Promise.resolve([]);

    // Direct Match for popular brands and sites (e.g. "poki", "poki oyun", "google", "youtube", "roblox")
    const directSiteResults: SearchResultItem[] = [];
    const lowerQ = cleanQ.toLowerCase().replace(/['".,!]/g, '').trim();
    const DIRECT_MATCHES: Record<string, { title: string; url: string; domain: string; desc: string }> = {
      poki: { title: 'Poki - Ücretsiz Çevrimiçi Oyunlar Oyna', url: 'https://poki.com/tr', domain: 'poki.com', desc: 'Poki\'de en popüler ve en yeni ücretsiz çevrimiçi oyunları hemen oynayın. İndirme yok, kayıt yok! Subway Surfers, Temple Run 2, Stickman ve araba oyunları.' },
      'poki com': { title: 'Poki - Ücretsiz Çevrimiçi Oyunlar Oyna', url: 'https://poki.com/tr', domain: 'poki.com', desc: 'Poki\'de en popüler ve en yeni ücretsiz çevrimiçi oyunları hemen oynayın. İndirme yok, kayıt yok!' },
      'poki oyun': { title: 'Poki Oyunları - En İyi Ücretsiz Oyunlar', url: 'https://poki.com/tr', domain: 'poki.com', desc: 'Poki\'de binlerce ücretsiz web oyunu: Subway Surfers, Temple Run, araba oyunları ve 2 kişilik oyunlar.' },
      'poki oyunları': { title: 'Poki Oyunları - En İyi Ücretsiz Oyunlar', url: 'https://poki.com/tr', domain: 'poki.com', desc: 'Poki\'de binlerce ücretsiz web oyunu: Subway Surfers, Temple Run, araba oyunları ve 2 kişilik oyunlar.' },
      'poki oyna': { title: 'Poki - Çevrimiçi Oyun Oyna', url: 'https://poki.com/tr', domain: 'poki.com', desc: 'En popüler Poki oyunlarını tarayıcınızda doğrudan hemen oynamaya başlayın.' },
      'poki games': { title: 'Poki Games - Free Online Games', url: 'https://poki.com/', domain: 'poki.com', desc: 'Play free online games at Poki! Subway Surfers, Stickman Hook, Monkey Mart and many more.' },
      google: { title: 'Google', url: 'https://www.google.com', domain: 'google.com', desc: 'Dünyanın en popüler arama motoru ile bilgi, görsel, video ve haritalara hızla ulaşın.' },
      'google com': { title: 'Google', url: 'https://www.google.com', domain: 'google.com', desc: 'Dünyanın en popüler arama motoru ile bilgi, görsel, video ve haritalara hızla ulaşın.' },
      'google arama': { title: 'Google Arama', url: 'https://www.google.com', domain: 'google.com', desc: 'Google arama motoru ile webde arama yapın.' },
      youtube: { title: 'YouTube', url: 'https://www.youtube.com', domain: 'youtube.com', desc: 'Milyonlarca video, müzik, canlı yayın ve içerik üreticisini YouTube\'da keşfedin.' },
      'youtube com': { title: 'YouTube', url: 'https://www.youtube.com', domain: 'youtube.com', desc: 'Milyonlarca video, müzik, canlı yayın ve içerik üreticisini YouTube\'da keşfedin.' },
      'youtube izle': { title: 'YouTube - Video İzle', url: 'https://www.youtube.com', domain: 'youtube.com', desc: 'YouTube videolarını ve canlı yayınları kesintisiz izleyin.' },
      roblox: { title: 'Roblox', url: 'https://www.roblox.com', domain: 'roblox.com', desc: 'Milyonlarca 3D dünyayı ve sürükleyici deneyimi arkadaşlarınızla birlikte keşfedin. Oyunlar, avatarlar ve topluluk deneyimleri.' },
      'roblox com': { title: 'Roblox', url: 'https://www.roblox.com', domain: 'roblox.com', desc: 'Roblox resmi sitesi. Milyonlarca 3D oyunu ve dünyayı keşfedin.' },
      'roblox oyna': { title: 'Roblox - Oyunları Oyna', url: 'https://www.roblox.com', domain: 'roblox.com', desc: 'Roblox dünyasına katılın ve milyonlarca kullanıcı tarafından oluşturulan oyunları oynayın.' },
      'roblox oyunları': { title: 'Roblox - Deneyimler ve Oyunlar', url: 'https://www.roblox.com/discover', domain: 'roblox.com', desc: 'Roblox üzerindeki en popüler deneyimleri keşfedin.' },
      'roblox giriş': { title: 'Roblox - Giriş Yap', url: 'https://www.roblox.com/login', domain: 'roblox.com', desc: 'Roblox hesabınıza giriş yapın ve oyun oynamaya başlayın.' },
      crazygames: { title: 'CrazyGames - Ücretsiz Tarayıcı Oyunları', url: 'https://www.crazygames.com', domain: 'crazygames.com', desc: 'En iyi aksiyon, yarış ve çok oyunculu tarayıcı oyunlarını CrazyGames\'te oynayın.' },
      'crazy games': { title: 'CrazyGames - Ücretsiz Tarayıcı Oyunları', url: 'https://www.crazygames.com', domain: 'crazygames.com', desc: 'En iyi aksiyon, yarış ve çok oyunculu tarayıcı oyunlarını CrazyGames\'te oynayın.' },
      oyunkolu: { title: 'Oyun Kolu - En Güzel Oyunlar', url: 'https://www.oyunkolu.com', domain: 'oyunkolu.com', desc: 'Türkiye\'nin en sevilen oyun portalında binlerce eğlenceli oyun.' },
      '1001oyun': { title: '1001 Oyun - Ücretsiz Çevrimiçi Oyunlar', url: 'https://1001oyun.com', domain: '1001oyun.com', desc: 'Her gün eklenen yeni ücretsiz oyunlarla 1001 Oyun keyfi.' },
      'kral oyun': { title: 'KralOyun - Ücretsiz Oyunlar', url: 'https://www.kraloyun.com', domain: 'kraloyun.com', desc: 'KralOyun ile binlerce ücretsiz flaş ve html5 oyunu oynayın.' },
      kraloyun: { title: 'KralOyun - Ücretsiz Oyunlar', url: 'https://www.kraloyun.com', domain: 'kraloyun.com', desc: 'KralOyun ile binlerce ücretsiz flaş ve html5 oyunu oynayın.' },
      friv: { title: 'Friv - Free Online Games', url: 'https://www.friv.com', domain: 'friv.com', desc: 'En sevilen klasik Friv oyunlarını ücretsiz tarayıcınızda oynayın.' },
      y8: { title: 'Y8 Games - Ücretsiz Çevrimiçi Oyunlar', url: 'https://tr.y8.com', domain: 'tr.y8.com', desc: 'Y8.com\'da 70.000\'den fazla oyunu ücretsiz oynayın.' },
      github: { title: 'GitHub: Where the world builds software', url: 'https://github.com', domain: 'github.com', desc: 'Dünyanın en büyük yazılım geliştirme ve açık kaynak kod paylaşım platformu.' },
      wikipedia: { title: 'Vikipedi - Özgür Ansiklopedi', url: 'https://tr.wikipedia.org', domain: 'tr.wikipedia.org', desc: 'Herkesin katkıda bulunabildiği özgür Türkçe ansiklopedi.' },
      vikipedi: { title: 'Vikipedi - Özgür Ansiklopedi', url: 'https://tr.wikipedia.org', domain: 'tr.wikipedia.org', desc: 'Herkesin katkıda bulunabildiği özgür Türkçe ansiklopedi.' },
      trendyol: { title: 'Trendyol - Türkiye\'nin Online Alışveriş Sitesi', url: 'https://www.trendyol.com', domain: 'trendyol.com', desc: 'Moda, elektronik, ev yaşam ve süpermarket ürünlerinde en iyi fırsatlar.' },
      hepsiburada: { title: 'Hepsiburada: Türkiye\'nin En Büyük Online Alışveriş Sitesi', url: 'https://www.hepsiburada.com', domain: 'hepsiburada.com', desc: 'Elektronik, giyim, kozmetik ve daha fazlası en uygun fiyatlarla.' },
      sahibinden: { title: 'sahibinden.com - Satılık, Kiralık, 2. El Emlak, Oto, Alışveriş', url: 'https://www.sahibinden.com', domain: 'sahibinden.com', desc: 'Türkiye\'nin en büyük ilan platformu.' },
      discord: { title: 'Discord - Topluluklar ve Arkadaşlarla Sohbet', url: 'https://discord.com', domain: 'discord.com', desc: 'Arkadaşlarınızla ve topluluklarla sesli, görüntülü ve yazılı sohbet edin.' },
      twitch: { title: 'Twitch - Canlı Yayın Platformu', url: 'https://www.twitch.tv', domain: 'twitch.tv', desc: 'Oyun, müzik ve eğlence canlı yayınlarını izleyin.' },
      spotify: { title: 'Spotify - Müzik ve Podcast Dinle', url: 'https://open.spotify.com', domain: 'spotify.com', desc: 'Milyonlarca şarkı ve podcasti ücretsiz dinleyin.' },
      steam: { title: 'Steam - Dijital Oyun Mağazası ve Topluluğu', url: 'https://store.steampowered.com', domain: 'steampowered.com', desc: 'PC ve Mac için en popüler dijital oyun mağazası.' },
    };

    for (const [key, val] of Object.entries(DIRECT_MATCHES)) {
      if (lowerQ === key || lowerQ.startsWith(key + ' ') || lowerQ.endsWith(' ' + key) || lowerQ.includes(key)) {
        directSiteResults.push({
          title: val.title,
          url: val.url,
          domain: val.domain,
          description: val.desc,
          source: 'Resmi Web Sitesi (Doğrulanmış)',
          type: 'web',
          score: 100,
        });
        break;
      }
    }

    // Web: Run Google, DuckDuckGo, Bing, News, and Wikipedia in parallel for maximum Google-like fidelity
    const [googleResults, ddgResults, bingResults, wikiResults, weatherResults] = await Promise.all([
      searchGoogle(cleanQ, lang),
      searchDuckDuckGo(cleanQ, lang),
      searchBing(cleanQ, lang),
      searchWikipedia(cleanQ, lang),
      weatherPromise,
    ]);

    // Rank & combine: Direct Match + Weather + DDG / Google Web + Bing + Wiki (filtering out raw news.google.com redirection tokens)
    finalResults = dedupeResults([
      ...directSiteResults,
      ...weatherResults,
      ...ddgResults,
      ...googleResults,
      ...bingResults,
      ...wikiResults.slice(0, 3),
    ]);

    // If still less than 4 results, supplement with Gemini
    if (finalResults.length < 4) {
      const geminiResults = await searchWithGemini(cleanQ, lang);
      finalResults = dedupeResults([...finalResults, ...geminiResults]);
    }
  }

  // Fallback if completely empty
  if (finalResults.length === 0) {
    const isDomain = /^[\w.-]+\.[a-zA-Z]{2,}$/.test(cleanQ);
    const target = isDomain ? `https://${cleanQ}` : `https://www.google.com/search?q=${encodeURIComponent(cleanQ)}`;
    finalResults.push({
      title: `${cleanQ} - Web Sayfası`,
      url: target,
      domain: isDomain ? cleanQ : 'google.com',
      description: `"${cleanQ}" için doğrudan siteye gidin veya Google arama sonuçlarına göz atın.`,
      source: 'NovaSearch Engine',
      type: 'web',
      score: 50,
    });
  }

  // Cache results
  SEARCH_CACHE.set(cacheKey, {
    data: finalResults,
    expires: Date.now() + CACHE_TTL_MS,
  });

  return { query: cleanQ, type, lang, results: finalResults, cached: false };
}

// Autocomplete Suggestions
export async function getSuggestions(query: string, lang = 'tr'): Promise<string[]> {
  const cleanQ = query.trim();
  if (cleanQ.length < 2) return [];

  const cacheKey = `${lang}:${cleanQ.toLowerCase()}`;
  const cached = SUGGEST_CACHE.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  try {
    // 1. Try Google Suggest API (public endpoint)
    const googleSuggestUrl = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(cleanQ)}&hl=${lang === 'auto' ? 'tr' : lang}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(googleSuggestUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    let suggestions: string[] = [];
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.[1])) {
        suggestions = data[1].filter((s: any) => typeof s === 'string');
      }
    }

    // 2. If Google suggest returned less than 5, try Wikipedia opensearch
    if (suggestions.length < 5) {
      const wikiLang = ['tr', 'en', 'de', 'fr', 'es', 'ru', 'ar'].includes(lang) ? lang : 'tr';
      const u = new URL(`https://${wikiLang}.wikipedia.org/w/api.php`);
      u.searchParams.set('action', 'opensearch');
      u.searchParams.set('search', cleanQ);
      u.searchParams.set('limit', '8');
      u.searchParams.set('format', 'json');

      const wikiRes = await fetch(u.toString());
      if (wikiRes.ok) {
        const wikiData = await wikiRes.json();
        if (Array.isArray(wikiData?.[1])) {
          suggestions = [...new Set([...suggestions, ...wikiData[1]])];
        }
      }
    }

    if (suggestions.length < 5) {
      const commonSuffixes = [
        `${cleanQ} nedir`,
        `${cleanQ} nasıl yapılır`,
        `${cleanQ} resmi site`,
        `${cleanQ} giriş`,
        `${cleanQ} haberleri`,
      ];
      suggestions = [...new Set([...suggestions, ...commonSuffixes])].slice(0, 8);
    }

    suggestions = suggestions.slice(0, 10);
    SUGGEST_CACHE.set(cacheKey, {
      data: suggestions,
      expires: Date.now() + SUGGEST_TTL_MS,
    });

    return suggestions;
  } catch {
    return [`${cleanQ} nedir`, `${cleanQ} hakkında`, `${cleanQ} resmi site`];
  }
}
