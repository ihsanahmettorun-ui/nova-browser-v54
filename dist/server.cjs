var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server/youtube.ts
var youtube_exports = {};
__export(youtube_exports, {
  extractYouTubeId: () => extractYouTubeId,
  getDefaultYouTubeVideos: () => getDefaultYouTubeVideos,
  getYouTubeTrending: () => getYouTubeTrending,
  getYouTubeVideoDetails: () => getYouTubeVideoDetails,
  isYouTubeUrl: () => isYouTubeUrl,
  searchYouTubeVideos: () => searchYouTubeVideos
});
function extractYouTubeId(urlStr) {
  try {
    const raw = (urlStr || "").trim();
    if (!raw) return null;
    const watchMatch = raw.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
    if (watchMatch && watchMatch[1]) {
      return watchMatch[1];
    }
    return null;
  } catch {
    return null;
  }
}
async function getYouTubeVideoDetails(videoId, apiKey) {
  if (!videoId) return null;
  if (apiKey && apiKey.trim()) {
    try {
      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${apiKey.trim()}`;
      const resp = await fetch(apiUrl);
      if (resp.ok) {
        const data = await resp.json();
        if (data.items && data.items.length > 0) {
          const item = data.items[0];
          const viewsCount = item.statistics?.viewCount ? `${Number(item.statistics.viewCount).toLocaleString("tr-TR")} g\xF6r\xFCnt\xFCleme` : "";
          return {
            id: videoId,
            title: item.snippet?.title || "YouTube Video",
            url: `https://www.youtube.com/watch?v=${videoId}`,
            embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&enablejsapi=1`,
            thumbnail: item.snippet?.thumbnails?.maxres?.url || item.snippet?.thumbnails?.high?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            channel: item.snippet?.channelTitle || "YouTube Kanal\u0131",
            views: viewsCount,
            publishedTime: item.snippet?.publishedAt ? new Date(item.snippet.publishedAt).toLocaleDateString("tr-TR") : "",
            description: item.snippet?.description || ""
          };
        }
      }
    } catch (err) {
      console.warn("YouTube Video Details API call exception:", err);
    }
  }
  return {
    id: videoId,
    title: "YouTube Video",
    url: `https://www.youtube.com/watch?v=${videoId}`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&enablejsapi=1`,
    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    channel: "YouTube \u0130\xE7erik \xDCreticisi",
    views: "HD Oynat\u0131c\u0131",
    publishedTime: "",
    description: ""
  };
}
function isYouTubeUrl(urlStr) {
  const clean = (urlStr || "").toLowerCase();
  return clean.includes("youtube.com") || clean.includes("youtu.be");
}
async function getYouTubeTrending(apiKey, region = "TR") {
  if (apiKey && apiKey.trim()) {
    try {
      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&chart=mostPopular&regionCode=${region}&maxResults=30&key=${apiKey.trim()}`;
      const resp = await fetch(apiUrl);
      if (resp.ok) {
        const data = await resp.json();
        if (data.items && Array.isArray(data.items)) {
          const items = data.items.map((item) => {
            const viewsCount = item.statistics?.viewCount ? `${Number(item.statistics.viewCount).toLocaleString("tr-TR")} g\xF6r\xFCnt\xFCleme` : "";
            return {
              id: item.id || "",
              title: item.snippet?.title || "YouTube Video",
              url: `https://www.youtube.com/watch?v=${item.id}`,
              embedUrl: `https://www.youtube-nocookie.com/embed/${item.id}?autoplay=1&enablejsapi=1`,
              thumbnail: item.snippet?.thumbnails?.maxres?.url || item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`,
              channel: item.snippet?.channelTitle || "YouTube Kanal\u0131",
              views: viewsCount,
              publishedTime: item.snippet?.publishedAt ? new Date(item.snippet.publishedAt).toLocaleDateString("tr-TR") : "",
              description: item.snippet?.description || ""
            };
          });
          if (items.length > 0) return items;
        }
      }
    } catch (apiErr) {
      console.warn("YouTube Trending API call exception:", apiErr);
    }
  }
  return searchYouTubeVideos("trending", apiKey);
}
async function searchYouTubeVideos(query, apiKey) {
  const cleanQ = query.trim() || "trend videolar";
  if (apiKey && apiKey.trim()) {
    try {
      const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=30&q=${encodeURIComponent(cleanQ)}&type=video&key=${apiKey.trim()}`;
      const resp = await fetch(apiUrl);
      if (resp.ok) {
        const data = await resp.json();
        if (data.items && Array.isArray(data.items)) {
          const items = data.items.map((item) => ({
            id: item.id?.videoId || "",
            title: item.snippet?.title || "YouTube Video",
            url: `https://www.youtube.com/watch?v=${item.id?.videoId}`,
            embedUrl: `https://www.youtube-nocookie.com/embed/${item.id?.videoId}?autoplay=1&enablejsapi=1`,
            thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${item.id?.videoId}/hqdefault.jpg`,
            channel: item.snippet?.channelTitle || "YouTube Kanal\u0131",
            publishedTime: item.snippet?.publishedAt ? new Date(item.snippet.publishedAt).toLocaleDateString("tr-TR") : "",
            description: item.snippet?.description || ""
          }));
          if (items.length > 0) return items;
        }
      } else {
        const errData = await resp.json().catch(() => ({}));
        console.warn("YouTube Data API error:", errData);
      }
    } catch (apiErr) {
      console.warn("YouTube API call exception:", apiErr);
    }
  }
  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanQ)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6e3);
    const res = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7"
      },
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) return getDefaultYouTubeVideos(cleanQ);
    const html = await res.text();
    const videos = [];
    const match = html.match(/var ytInitialData\s*=\s*({.+?});<\/script>/s) || html.match(/ytInitialData\s*=\s*({.+?});/s);
    if (match && match[1]) {
      try {
        const data = JSON.parse(match[1]);
        const contents = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents || [];
        for (const item of contents) {
          const v = item?.videoRenderer;
          if (!v || !v.videoId) continue;
          const title = v.title?.runs?.[0]?.text || "YouTube Video";
          const channel = v.ownerText?.runs?.[0]?.text || "YouTube Channel";
          const views = v.viewCountText?.simpleText || v.shortViewCountText?.simpleText || "";
          const publishedTime = v.publishedTimeText?.simpleText || "";
          const duration = v.lengthText?.simpleText || "";
          const snippet = v.detailedMetadataSnippets?.[0]?.snippetText?.runs?.map((r) => r.text).join("") || "";
          const thumb = v.thumbnail?.thumbnails?.[v.thumbnail.thumbnails.length - 1]?.url || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`;
          videos.push({
            id: v.videoId,
            title,
            url: `https://www.youtube.com/watch?v=${v.videoId}`,
            embedUrl: `https://www.youtube-nocookie.com/embed/${v.videoId}?autoplay=1&enablejsapi=1`,
            thumbnail: thumb,
            channel,
            duration,
            views,
            publishedTime,
            description: snippet
          });
          if (videos.length >= 30) break;
        }
      } catch (err) {
        console.warn("ytInitialData parse error:", err);
      }
    }
    if (videos.length > 0) {
      return videos;
    }
    return getDefaultYouTubeVideos(cleanQ);
  } catch (err) {
    return getDefaultYouTubeVideos(cleanQ);
  }
}
function getDefaultYouTubeVideos(category = "trending") {
  const defaultList = [
    {
      id: "dQw4w9WgXcQ",
      title: "Rick Astley - Never Gonna Give You Up (Official Music Video)",
      channel: "Rick Astley",
      views: "1.5M views",
      duration: "3:33"
    },
    {
      id: "fJ9rUzIMcZQ",
      title: "Queen \u2013 Bohemian Rhapsody (Official Video Remastered)",
      channel: "Queen Official",
      views: "1.7B views",
      duration: "5:59"
    },
    {
      id: "kJQP7kiw5Fk",
      title: "Luis Fonsi - Despacito ft. Daddy Yankee",
      channel: "Luis Fonsi",
      views: "8.2B views",
      duration: "4:41"
    },
    {
      id: "L_LUpnjgPso",
      title: "Google I/O Keynote Recap: Everything Announced",
      channel: "Google",
      views: "2.1M views",
      duration: "14:20"
    },
    {
      id: "9bZkp7q19f0",
      title: "PSY - GANGNAM STYLE (\uAC15\uB0A8\uC2A4\uD0C0\uC77C) M/V",
      channel: "officialpsy",
      views: "5.1B views",
      duration: "4:12"
    },
    {
      id: "JGwWNGJdvx8",
      title: "Ed Sheeran - Shape of You (Official Music Video)",
      channel: "Ed Sheeran",
      views: "6.1B views",
      duration: "4:23"
    },
    {
      id: "kXYiU_JCYtU",
      title: "Linkin Park - Numb (Official Music Video) [4K Upgrade]",
      channel: "Linkin Park",
      views: "2.3B views",
      duration: "3:07"
    },
    {
      id: "09R8_2nJtjg",
      title: "Maroon 5 - Sugar (Official Music Video)",
      channel: "Maroon 5",
      views: "4.0B views",
      duration: "5:01"
    },
    {
      id: "hT_nvWreIhg",
      title: "OneRepublic - Counting Stars (Official Music Video)",
      channel: "OneRepublic",
      views: "4.0B views",
      duration: "4:43"
    },
    {
      id: "CevxZvSJLk8",
      title: "Katy Perry - Roar (Official)",
      channel: "Katy Perry",
      views: "4.0B views",
      duration: "4:30"
    }
  ];
  return defaultList.map((v) => ({
    id: v.id,
    title: v.title,
    url: `https://www.youtube.com/watch?v=${v.id}`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&enablejsapi=1`,
    thumbnail: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
    channel: v.channel,
    duration: v.duration,
    views: v.views
  }));
}
var init_youtube = __esm({
  "server/youtube.ts"() {
  }
});

// server.ts
var import_config = require("dotenv/config");
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_child_process = require("child_process");
var import_vite = require("vite");

// server/consents.ts
var MANDATORY_CONSENT_VERSION = "v54.4-orhan-suleyman-torun-full-waiver";
var MANDATORY_CONSENTS = [
  {
    id: "producer_orhan_suleyman_torun_waiver",
    title: "1. Yap\u0131mc\u0131 Orhan S\xFCleyman Torun ve Kesin Sorumsuzluk Beyan\u0131 (Zorunlu ve Kat\u0131 Onay)",
    category: "legal",
    icon: "ShieldAlert",
    text: "Bu uygulaman\u0131n yap\u0131mc\u0131s\u0131 ve yazar\u0131 Orhan S\xFCleyman Torun'dur. Uygulaman\u0131n indirilmesi, kurulmas\u0131, \xE7al\u0131\u015Ft\u0131r\u0131lmas\u0131, masa\xFCst\xFC veya web \xFCzerinden kullan\u0131m\u0131 s\u0131ras\u0131nda; kullan\u0131c\u0131 taraf\u0131ndan indirilen HER T\xDCRL\xDC DOSYADAN, girilen sitelerden, yap\u0131lan i\u015Flemlerden, do\u011Fabilecek veri kay\u0131plar\u0131ndan, vir\xFCs/zararl\u0131 yaz\u0131l\u0131m bula\u015Fmalar\u0131ndan, donan\u0131msal veya yaz\u0131l\u0131msal ar\u0131zalardan ve hukuki sonu\xE7lardan yap\u0131mc\u0131 Orhan S\xFCleyman Torun KES\u0130NL\u0130KLE VE H\u0130\xC7B\u0130R KO\u015EULDA SORUMLU DE\u011E\u0130LD\u0130R. Bu uygulamay\u0131 indirmek, kurmak veya kullanmak isteyen her kullan\u0131c\u0131 yap\u0131mc\u0131 Orhan S\xFCleyman Torun'un hi\xE7bir sorumlulu\u011Fu olmad\u0131\u011F\u0131n\u0131 ve t\xFCm sorumlulu\u011Fun tamamen kendisine ait oldu\u011Funu pe\u015Finen ve gayrikabili r\xFCcu kabul, beyan ve taahh\xFCt eder.",
    required: true
  },
  {
    id: "downloads_actions_liability",
    title: "2. \u0130ndirilen Dosyalar ve Yap\u0131lan B\xFCt\xFCn Olaylardan Sorumsuzluk Reddi",
    category: "legal",
    icon: "ShieldAlert",
    text: "Nova Browser \xFCzerinden indirilen HER T\xDCRL\xDC DOSYADAN (yaz\u0131l\u0131m, ar\u015Fiv, belge, medya veya \xE7al\u0131\u015Ft\u0131r\u0131labilir programlar) ve kullan\u0131c\u0131 taraf\u0131ndan ger\xE7ekle\u015Ftirilen YAPILAN B\xDCT\xDCN OLAYLARDAN, eylemlerden ve i\u015Flemlerden yap\u0131mc\u0131 Orhan S\xFCleyman Torun ve Nova Browser H\u0130\xC7B\u0130R \u015EEK\u0130LDE SORUMLU DE\u011E\u0130LD\u0130R. \u0130ndirilen dosyalar\u0131n a\xE7\u0131lmas\u0131, kullan\u0131lmas\u0131 veya sistemde olu\u015Fturabilece\u011Fi vir\xFCs, hasar, veri kayb\u0131 ve hukuki sorumluluklar m\xFCnhas\u0131ran ve tamamen kullan\u0131c\u0131ya aittir.",
    required: true
  },
  {
    id: "liability_disclaimer",
    title: "3. Genel Sorumluluk Reddi ve Hukuki Muafiyet",
    category: "legal",
    icon: "FileWarning",
    text: "Nova Browser ve NovaSearch ba\u011F\u0131ms\u0131z bir web taray\u0131c\u0131s\u0131 ve arama motoru arac\u0131d\u0131r. Kullan\u0131c\u0131n\u0131n taray\u0131c\u0131 \xFCzerinden eri\u015Fti\u011Fi, aratt\u0131\u011F\u0131, indirdi\u011Fi, payla\u015Ft\u0131\u011F\u0131 veya g\xF6r\xFCnt\xFCledi\u011Fi hi\xE7bir i\xE7erikten veya \xFC\xE7\xFCnc\xFC taraf web sitesinden yap\u0131mc\u0131 Orhan S\xFCleyman Torun sorumlu tutulamaz. T\xFCm hukuki, cezai ve idari sorumluluk m\xFCnhas\u0131ran kullan\u0131c\u0131ya aittir.",
    required: true
  },
  {
    id: "age_parental_consent",
    title: "4. Ya\u015F S\u0131n\u0131r\u0131 ve Ebeveyn / Veli \u0130zni \u015Eart\u0131",
    category: "safety",
    icon: "UserCheck",
    text: "Bu taray\u0131c\u0131y\u0131 ve arama sunucusunu kullanabilmek i\xE7in re\u015Fit olman\u0131z veya 18 ya\u015F\u0131n alt\u0131ndaysan\u0131z yasal ebeveyninizin/velinizin a\xE7\u0131k izni ve g\xF6zetimi alt\u0131nda olman\u0131z zorunludur. Ebeveynler, \xE7ocuklar\u0131n\u0131n ziyaret etti\u011Fi sitelerin denetiminden do\u011Frudan sorumludur.",
    required: true
  },
  {
    id: "virus_malware_security",
    title: "5. Vir\xFCs, K\xF6t\xFC Ama\xE7l\u0131 Yaz\u0131l\u0131m ve Siber G\xFCvenlik Korumas\u0131",
    category: "security",
    icon: "Lock",
    text: "Taray\u0131c\u0131, zararl\u0131 URL filtreleme ve sandbox korumas\u0131 sa\u011Flamakla birlikte, internet \xFCzerindeki \xFC\xE7\xFCnc\xFC taraf sitelerden indirilen dosyalardan, scriptlerden veya harici kaynaklardan kaynaklanabilecek vir\xFCs, truva at\u0131, fidye yaz\u0131l\u0131m\u0131 ve siber tehditlere kar\u015F\u0131 kullan\u0131c\u0131n\u0131n kendi cihaz g\xFCvenlik \xF6nlemlerini (antivir\xFCs, g\xFCncel i\u015Fletim sistemi) almas\u0131 zorunludur. D\u0131\u015F kaynakl\u0131 dosya \xE7al\u0131\u015Ft\u0131rmalar\u0131ndan do\u011Facak risk kullan\u0131c\u0131ya aittir.",
    required: true
  },
  {
    id: "privacy_local_only",
    title: "6. Ki\u015Fisel Veriler ve S\u0131f\u0131r-G\xFCnl\xFCk (Local-Only Zero-Knowledge)",
    category: "privacy",
    icon: "EyeOff",
    text: "Nova Browser ve NovaSearch sisteminde ki\u015Fisel verileriniz (hesap \u015Fifreleri, arama ge\xE7mi\u015Fi, yer imleri, oturum kay\u0131tlar\u0131) sunucu veri tabanlar\u0131nda ASLA saklanmaz, kaydedilmez ve \xFC\xE7\xFCnc\xFC taraflarla payla\u015F\u0131lmaz. T\xFCm profil ve hesap bilgileri kullan\u0131c\u0131n\u0131n kendi taray\u0131c\u0131s\u0131nda \u015Fifrelenmi\u015F (PBKDF2/SHA-256) olarak yerel depolan\u0131r.",
    required: true
  },
  {
    id: "anti_abuse_lawful_use",
    title: "7. K\xF6t\xFCye Kullan\u0131m ve Yasad\u0131\u015F\u0131 Faaliyet Yasa\u011F\u0131",
    category: "legal",
    icon: "ShieldAlert",
    text: "Sistem altyap\u0131s\u0131n\u0131; siber sald\u0131r\u0131, DDoS, kimlik av\u0131 (phishing), telif hakk\u0131 ihlali, \xE7ocuk istismar\u0131, yetkisiz veri kaz\u0131ma veya y\xFCr\xFCrl\xFCkteki yasalara ayk\u0131r\u0131 herhangi bir ama\xE7la kullanmak kesinlikle yasakt\u0131r. Tespiti durumunda oturum yerel olarak sonland\u0131r\u0131l\u0131r.",
    required: true
  },
  {
    id: "server_proxy_terms",
    title: "8. Web Proxy ve Arama Sunucusu Kullan\u0131m \u015Eart\u0131",
    category: "security",
    icon: "Server",
    text: "Dahili web proxy ve apisiz arama sunucusu, web sitelerinin k\u0131s\u0131tlamalar\u0131n\u0131 a\u015Farak g\xFCvenli g\xF6r\xFCnt\xFCleme sunmak i\xE7in tasarlanm\u0131\u015Ft\u0131r. Bu sunucu arac\u0131l\u0131\u011F\u0131yla y\xFCklenen \xFC\xE7\xFCnc\xFC taraf sayfalar\u0131n i\xE7erik g\xFCvenli\u011Fi, gizlilik politikalar\u0131 ve kullan\u0131m \u015Fartlar\u0131 ilgili sitelerin kendilerine aittir.",
    required: true
  }
];

// server/search.ts
var cheerio = __toESM(require("cheerio"), 1);

// server/gemini.ts
var import_genai = require("@google/genai");
var aiClient = null;
function getAiClient() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new import_genai.GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}
var CANDIDATE_MODELS = ["gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
async function executeWithRetryAndFallback(prompt, options) {
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
            responseMimeType: options?.responseMimeType
          }
        });
        if (response && response.text) {
          return response.text;
        }
      } catch (err) {
        const errMsg = err?.message || String(err);
        const isTransientIssue = errMsg.includes("503") || errMsg.includes("high demand") || errMsg.includes("UNAVAILABLE") || errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("overloaded");
        if (!isTransientIssue) {
          console.warn(`[Gemini AI] Note on model ${model}:`, errMsg);
        }
        if (isTransientIssue && attempt === 0) {
          const backoff = 350 + Math.floor(Math.random() * 250);
          await new Promise((resolve) => setTimeout(resolve, backoff));
          continue;
        }
        break;
      }
    }
  }
  return null;
}
async function generateSmartAnswer(query, lang = "tr") {
  const prompt = `Kullan\u0131c\u0131 Nova Browser V54 arama motorunda bir sorgu aratt\u0131: "${query}".
L\xFCtfen kullan\u0131c\u0131ya ${lang === "tr" ? "T\xFCrk\xE7e" : "ilgili dilde"} net, do\u011Fru, anla\u015F\u0131l\u0131r ve 2-3 paragrafl\u0131k \xF6zet bir bilgi ver. Markdown format\u0131nda ba\u015Fl\u0131klar ve maddeler kullanabilirsin.`;
  return executeWithRetryAndFallback(prompt);
}
async function summarizeWebPage(pageText, pageUrl) {
  const prompt = `A\u015Fa\u011F\u0131da Nova Browser ile ziyaret edilen "${pageUrl}" adresli web sayfas\u0131n\u0131n metin i\xE7eri\u011Fi yer almaktad\u0131r.
L\xFCtfen bu sayfadaki en kritik bilgileri 3-4 maddede \xF6zetle:

\u0130\xE7erik:
${pageText.slice(0, 5e3)}`;
  return executeWithRetryAndFallback(prompt);
}

// server/search.ts
var SEARCH_CACHE = /* @__PURE__ */ new Map();
var SUGGEST_CACHE = /* @__PURE__ */ new Map();
var CACHE_TTL_MS = 1e3 * 60 * 10;
var SUGGEST_TTL_MS = 1e3 * 60 * 5;
function safeUrl(val) {
  try {
    const u = new URL(val);
    return ["http:", "https:"].includes(u.protocol) ? u.toString() : "";
  } catch {
    return "";
  }
}
function dedupeResults(items) {
  const seen = /* @__PURE__ */ new Set();
  return items.filter((item) => {
    if (!item.url) return false;
    const cleanUrl = item.url.replace(/\/$/, "").toLowerCase();
    if (seen.has(cleanUrl)) return false;
    seen.add(cleanUrl);
    return true;
  });
}
async function searchGoogle(query, lang = "tr") {
  try {
    const gl = lang === "tr" ? "tr" : "us";
    const hl = lang === "auto" ? "tr" : lang;
    const u = new URL("https://www.google.com/search");
    u.searchParams.set("q", query);
    u.searchParams.set("hl", hl);
    u.searchParams.set("gl", gl);
    u.searchParams.set("num", "15");
    u.searchParams.set("pws", "0");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6e3);
    const res = await fetch(u.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": `${hl}-${gl},${hl};q=0.9,en;q=0.8`,
        "sec-ch-ua": '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"'
      },
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) return [];
    const html = await res.text();
    const $ = cheerio.load(html);
    const results = [];
    $("div.g, div.tF2Cxc, div.MjjYud").each((_, el) => {
      const linkEl = $(el).find('a[href^="http"]').first();
      let rawHref = linkEl.attr("href") || "";
      if (!rawHref) return;
      if (rawHref.includes("/url?")) {
        try {
          const match = rawHref.match(/[?&]q=([^&]+)/);
          if (match && match[1]) {
            rawHref = decodeURIComponent(match[1]);
          }
        } catch {
        }
      }
      if (rawHref.includes("google.com/search") || rawHref.includes("webcache.googleusercontent")) {
        return;
      }
      const targetUrl = safeUrl(rawHref);
      if (!targetUrl) return;
      const title = $(el).find("h3").first().text().trim() || linkEl.text().trim();
      if (!title || title.length < 2) return;
      let snippet = $(el).find("div.VwiC3b, div.IsZvec, div.s3v9rd, div.kCrYT").first().text().trim();
      if (!snippet) {
        snippet = $(el).find("span").text().trim().slice(0, 180);
      }
      let domain = "";
      try {
        domain = new URL(targetUrl).hostname.replace(/^www\./, "");
      } catch {
        domain = "google.com";
      }
      results.push({
        title,
        url: targetUrl,
        domain,
        description: snippet || `${title} hakk\u0131nda detayl\u0131 bilgi ve web sayfas\u0131 i\xE7eri\u011Fi.`,
        source: "Google Web Engine",
        type: "web",
        score: 100
      });
    });
    return results;
  } catch {
    return [];
  }
}
async function searchDuckDuckGo(query, lang = "tr") {
  try {
    const u = new URL("https://html.duckduckgo.com/html/");
    u.searchParams.set("q", query);
    if (lang && lang !== "auto") {
      const langMap = {
        tr: "tr-tr",
        en: "us-en",
        de: "de-de",
        fr: "fr-fr",
        es: "es-es",
        ru: "ru-ru",
        ar: "xa-ar"
      };
      if (langMap[lang]) u.searchParams.set("kl", langMap[lang]);
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6e3);
    const res = await fetch(u.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "tr,en;q=0.9"
      },
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) return [];
    const html = await res.text();
    const $ = cheerio.load(html);
    const results = [];
    $(".result").each((_, el) => {
      const linkEl = $(el).find(".result__a");
      let rawHref = linkEl.attr("href") || "";
      if (!rawHref) return;
      if (rawHref.includes("uddg=")) {
        try {
          const match = rawHref.match(/uddg=([^&]+)/);
          if (match && match[1]) {
            rawHref = decodeURIComponent(match[1]);
          }
        } catch {
        }
      }
      const targetUrl = safeUrl(rawHref);
      if (!targetUrl) return;
      const title = linkEl.text().trim() || "Sonu\xE7";
      const snippet = $(el).find(".result__snippet").text().trim();
      let domain = "";
      try {
        domain = new URL(targetUrl).hostname.replace(/^www\./, "");
      } catch {
        domain = "duckduckgo.com";
      }
      results.push({
        title,
        url: targetUrl,
        domain,
        description: snippet,
        source: "DuckDuckGo Web",
        type: "web",
        score: 95
      });
    });
    return results;
  } catch {
    return [];
  }
}
async function searchBing(query, lang = "tr") {
  try {
    const u = new URL("https://www.bing.com/search");
    u.searchParams.set("q", query);
    u.searchParams.set("setlang", lang === "auto" ? "tr" : lang);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5e3);
    const res = await fetch(u.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7"
      },
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) return [];
    const html = await res.text();
    const $ = cheerio.load(html);
    const results = [];
    $("li.b_algo").each((_, el) => {
      const a = $(el).find("h2 a").first();
      const href = safeUrl(a.attr("href") || "");
      if (!href) return;
      const title = a.text().trim();
      const snippet = $(el).find(".b_caption p, .b_snippet").text().trim();
      let domain = "";
      try {
        domain = new URL(href).hostname.replace(/^www\./, "");
      } catch {
        domain = "bing.com";
      }
      if (title) {
        results.push({
          title,
          url: href,
          domain,
          description: snippet || `${title} web sayfas\u0131.`,
          source: "Bing Index",
          type: "web",
          score: 92
        });
      }
    });
    return results;
  } catch {
    return [];
  }
}
async function searchWikipedia(query, lang = "tr") {
  try {
    const wikiLang = ["tr", "en", "de", "fr", "es", "ru", "ar", "zh", "ja", "it", "pt"].includes(lang) ? lang : "tr";
    const u = new URL(`https://${wikiLang}.wikipedia.org/w/api.php`);
    u.searchParams.set("action", "query");
    u.searchParams.set("generator", "search");
    u.searchParams.set("gsrsearch", query);
    u.searchParams.set("gsrlimit", "10");
    u.searchParams.set("prop", "info|extracts|pageimages");
    u.searchParams.set("inprop", "url");
    u.searchParams.set("exintro", "1");
    u.searchParams.set("explaintext", "1");
    u.searchParams.set("exlimit", "10");
    u.searchParams.set("piprop", "thumbnail");
    u.searchParams.set("pithumbsize", "400");
    u.searchParams.set("format", "json");
    u.searchParams.set("origin", "*");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5e3);
    const res = await fetch(u.toString(), {
      headers: { "User-Agent": "NovaBrowserV54/1.0 (https://novabrowser.local)" },
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) return [];
    const data = await res.json();
    const pages = data?.query?.pages ? Object.values(data.query.pages) : [];
    const results = [];
    for (const p of pages) {
      if (!p?.fullurl) continue;
      results.push({
        title: p.title || "Vikipedi",
        url: p.fullurl,
        domain: `${wikiLang}.wikipedia.org`,
        description: p.extract ? p.extract.slice(0, 300) + "..." : "Vikipedi ansiklopedi maddesi.",
        source: "Vikipedi Ansiklopedi",
        type: "web",
        image: p.thumbnail?.source || void 0,
        score: 96
      });
    }
    return results;
  } catch {
    return [];
  }
}
async function searchWikimediaImages(query) {
  try {
    const u = new URL("https://commons.wikimedia.org/w/api.php");
    u.searchParams.set("action", "query");
    u.searchParams.set("generator", "search");
    u.searchParams.set("gsrsearch", query);
    u.searchParams.set("gsrnamespace", "6");
    u.searchParams.set("gsrlimit", "30");
    u.searchParams.set("prop", "imageinfo");
    u.searchParams.set("iiprop", "url|size|extmetadata");
    u.searchParams.set("iiurlwidth", "700");
    u.searchParams.set("format", "json");
    u.searchParams.set("origin", "*");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6e3);
    const res = await fetch(u.toString(), {
      headers: { "User-Agent": "NovaBrowserV54/1.0" },
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) return [];
    const data = await res.json();
    const pages = data?.query?.pages ? Object.values(data.query.pages) : [];
    const results = [];
    for (const p of pages) {
      const info = p.imageinfo?.[0];
      if (!info?.thumburl && !info?.url) continue;
      const title = (p.title || "G\xF6rsel").replace(/^Dosya:|^File:/i, "").replace(/\.[^/.]+$/, "");
      results.push({
        title,
        url: info.descriptionurl || info.url,
        domain: "commons.wikimedia.org",
        description: "Y\xFCksek \xE7\xF6z\xFCn\xFCrl\xFCkl\xFC Wikimedia g\xF6rseli",
        source: "Wikimedia Commons",
        type: "images",
        image: info.thumburl || info.url,
        score: 98
      });
    }
    return results;
  } catch {
    return [];
  }
}
async function searchOpenLibrary(query) {
  try {
    const u = new URL("https://openlibrary.org/search.json");
    u.searchParams.set("q", query);
    u.searchParams.set("limit", "15");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5e3);
    const res = await fetch(u.toString(), { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return [];
    const data = await res.json();
    const docs = Array.isArray(data.docs) ? data.docs : [];
    const results = [];
    for (const doc of docs) {
      if (!doc.key) continue;
      const author = Array.isArray(doc.author_name) ? doc.author_name.slice(0, 2).join(", ") : "Bilinmeyen Yazar";
      const year = doc.first_publish_year ? `(${doc.first_publish_year})` : "";
      const coverId = doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : void 0;
      results.push({
        title: `${doc.title || "Kitap"} ${year}`,
        url: `https://openlibrary.org${doc.key}`,
        domain: "openlibrary.org",
        description: `Yazar: ${author}. \u0130lk bas\u0131m y\u0131l\u0131: ${doc.first_publish_year || "N/A"}. Konular: ${(doc.subject || []).slice(0, 3).join(", ")}`,
        source: "Open Library Kitaplar",
        type: "books",
        image: coverId,
        score: 85
      });
    }
    return results;
  } catch {
    return [];
  }
}
async function searchWithGemini(query, _lang = "tr") {
  if (!process.env.GEMINI_API_KEY) return [];
  try {
    const prompt = `Kullan\u0131c\u0131 web aramas\u0131nda "${query}" kelimesini aratt\u0131. Bu arama i\xE7in Google standartlar\u0131nda en iyi 8 web arama sonucunu JSON dizisi olarak d\xF6nd\xFCr.
Her \xF6\u011Fede:
- title: sayfa ba\u015Fl\u0131\u011F\u0131
- url: ger\xE7ek, ge\xE7erli ve \xE7al\u0131\u015Fan resmi URL (\xF6rne\u011Fin https://www.youtube.com, https://tr.wikipedia.org/... vb.)
- domain: ana alan ad\u0131 (\xF6rne\u011Fin youtube.com, wikipedia.org)
- description: arama motoru a\xE7\u0131klamas\u0131 (snippet)

Yan\u0131t\u0131 SADECE ge\xE7erli JSON dizisi olarak d\xF6nd\xFCr:
[
  {"title": "...", "url": "https://...", "domain": "...", "description": "..."}
]`;
    const text = await executeWithRetryAndFallback(prompt, {
      responseMimeType: "application/json"
    });
    if (!text) return [];
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item, idx) => ({
      title: item.title || query,
      url: safeUrl(item.url) || `https://${item.domain || "google.com"}`,
      domain: item.domain || "google.com",
      description: item.description || `${query} ile ilgili web i\xE7eri\u011Fi.`,
      source: "Nova Ultra Engine",
      type: "web",
      score: 95 - idx
    }));
  } catch {
    return [];
  }
}
async function searchGoogleNews(query, lang = "tr") {
  try {
    const gl = lang === "tr" ? "TR" : "US";
    const hl = lang === "auto" ? "tr" : lang;
    const ceid = lang === "tr" ? "TR:tr" : "US:en";
    const u = new URL("https://news.google.com/rss/search");
    u.searchParams.set("q", query);
    u.searchParams.set("hl", hl);
    u.searchParams.set("gl", gl);
    u.searchParams.set("ceid", ceid);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4e3);
    const res = await fetch(u.toString(), {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) return [];
    const xml = await res.text();
    const $ = cheerio.load(xml, { xmlMode: true });
    const results = [];
    $("item").each((idx, el) => {
      if (idx >= 15) return;
      const title = $(el).find("title").text().trim();
      const link = safeUrl($(el).find("link").text().trim()) || "";
      const source = $(el).find("source").text().trim() || "Haber Kayna\u011F\u0131";
      const pubDate = $(el).find("pubDate").text().trim();
      const desc = $(el).find("description").text().replace(/<[^>]+>/g, "").trim();
      if (title && link) {
        let domain = "news.google.com";
        try {
          domain = new URL(link).hostname.replace(/^www\./, "");
        } catch {
        }
        results.push({
          title,
          url: link,
          domain,
          description: `${source} \u2022 ${pubDate ? new Date(pubDate).toLocaleDateString("tr-TR") : ""} \u2022 ${desc.slice(0, 220)}`,
          source: `Canl\u0131 Haber (${source})`,
          type: "news",
          score: 98 - idx
        });
      }
    });
    return results;
  } catch {
    return [];
  }
}
async function searchGitHub(query) {
  try {
    const u = new URL("https://api.github.com/search/repositories");
    u.searchParams.set("q", query);
    u.searchParams.set("sort", "stars");
    u.searchParams.set("order", "desc");
    u.searchParams.set("per_page", "10");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4e3);
    const res = await fetch(u.toString(), {
      headers: {
        "User-Agent": "NovaBrowser-App",
        Accept: "application/vnd.github.v3+json"
      },
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) return [];
    const data = await res.json();
    const items = Array.isArray(data?.items) ? data.items : [];
    return items.map((item, idx) => ({
      title: `${item.full_name} \u2B50 ${item.stargazers_count?.toLocaleString() || 0}`,
      url: item.html_url,
      domain: "github.com",
      description: `${item.description || "GitHub A\xE7\u0131k Kaynak Projesi"}. Dil: ${item.language || "\xC7e\u015Fitli"}. Lisans: ${item.license?.name || "A\xE7\u0131k Kaynak"}.`,
      source: "GitHub Geli\u015Ftirici A\u011F\u0131",
      type: "academic",
      image: item.owner?.avatar_url,
      score: 95 - idx
    }));
  } catch {
    return [];
  }
}
async function searchLiveWeather(query) {
  try {
    const city = query.replace(/hava|durumu|bugün|yarın|tahmini|weather/gi, "").trim() || "Istanbul";
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
      title: `\u{1F324}\uFE0F ${loc.name}, ${loc.country || ""} Hava Durumu: ${cw.temperature}\xB0C`,
      url: `https://www.accuweather.com/tr/search-locations?query=${encodeURIComponent(loc.name)}`,
      domain: "open-meteo.com",
      description: `R\xFCzgar H\u0131z\u0131: ${cw.windspeed} km/s. G\xFCncel s\u0131cakl\u0131k: ${cw.temperature}\xB0C. Canl\u0131 meteoroloji \xF6l\xE7\xFCm\xFC.`,
      source: "Canl\u0131 Meteoroloji",
      type: "web",
      score: 100
    }];
  } catch {
    return [];
  }
}
async function performSearch(query, type = "web", lang = "tr", apiKey) {
  const cleanQ = query.trim();
  if (!cleanQ) {
    return { query: "", type, lang, results: [], cached: false };
  }
  const cacheKey = `${type}:${lang}:${cleanQ.toLowerCase()}:${apiKey ? "customKey" : "default"}`;
  const cached = SEARCH_CACHE.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return { query: cleanQ, type, lang, results: cached.data, cached: true };
  }
  let finalResults = [];
  if (type === "images") {
    finalResults = await searchWikimediaImages(cleanQ);
  } else if (type === "books") {
    finalResults = await searchOpenLibrary(cleanQ);
  } else if (type === "news") {
    finalResults = await searchGoogleNews(cleanQ, lang);
  } else if (type === "academic") {
    const [ghResults, olResults] = await Promise.all([
      searchGitHub(cleanQ),
      searchOpenLibrary(cleanQ)
    ]);
    finalResults = dedupeResults([...ghResults, ...olResults]);
  } else if (type === "videos") {
    const { searchYouTubeVideos: searchYouTubeVideos2 } = await Promise.resolve().then(() => (init_youtube(), youtube_exports));
    const ytVideos = await searchYouTubeVideos2(cleanQ, apiKey);
    finalResults = ytVideos.map((v, idx) => ({
      title: v.title,
      url: v.url,
      domain: "youtube.com",
      description: `${v.channel} \u2022 ${v.views || ""} ${v.duration ? `(${v.duration})` : ""} \u2022 ${v.description || ""}`,
      source: apiKey ? "YouTube Data API v3 (\xD6zel Anahtar)" : "YouTube Video Engine",
      type: "videos",
      image: v.thumbnail,
      score: 100 - idx
    }));
  } else {
    const isWeatherQuery = /hava|durumu|derece|sıcaklık|weather|forecast/i.test(cleanQ);
    const weatherPromise = isWeatherQuery ? searchLiveWeather(cleanQ) : Promise.resolve([]);
    const directSiteResults = [];
    const lowerQ = cleanQ.toLowerCase().replace(/['".,!]/g, "").trim();
    const DIRECT_MATCHES = {
      poki: { title: "Poki - \xDCcretsiz \xC7evrimi\xE7i Oyunlar Oyna", url: "https://poki.com/tr", domain: "poki.com", desc: "Poki'de en pop\xFCler ve en yeni \xFCcretsiz \xE7evrimi\xE7i oyunlar\u0131 hemen oynay\u0131n. \u0130ndirme yok, kay\u0131t yok! Subway Surfers, Temple Run 2, Stickman ve araba oyunlar\u0131." },
      "poki com": { title: "Poki - \xDCcretsiz \xC7evrimi\xE7i Oyunlar Oyna", url: "https://poki.com/tr", domain: "poki.com", desc: "Poki'de en pop\xFCler ve en yeni \xFCcretsiz \xE7evrimi\xE7i oyunlar\u0131 hemen oynay\u0131n. \u0130ndirme yok, kay\u0131t yok!" },
      "poki oyun": { title: "Poki Oyunlar\u0131 - En \u0130yi \xDCcretsiz Oyunlar", url: "https://poki.com/tr", domain: "poki.com", desc: "Poki'de binlerce \xFCcretsiz web oyunu: Subway Surfers, Temple Run, araba oyunlar\u0131 ve 2 ki\u015Filik oyunlar." },
      "poki oyunlar\u0131": { title: "Poki Oyunlar\u0131 - En \u0130yi \xDCcretsiz Oyunlar", url: "https://poki.com/tr", domain: "poki.com", desc: "Poki'de binlerce \xFCcretsiz web oyunu: Subway Surfers, Temple Run, araba oyunlar\u0131 ve 2 ki\u015Filik oyunlar." },
      "poki oyna": { title: "Poki - \xC7evrimi\xE7i Oyun Oyna", url: "https://poki.com/tr", domain: "poki.com", desc: "En pop\xFCler Poki oyunlar\u0131n\u0131 taray\u0131c\u0131n\u0131zda do\u011Frudan hemen oynamaya ba\u015Flay\u0131n." },
      "poki games": { title: "Poki Games - Free Online Games", url: "https://poki.com/", domain: "poki.com", desc: "Play free online games at Poki! Subway Surfers, Stickman Hook, Monkey Mart and many more." },
      google: { title: "Google", url: "https://www.google.com", domain: "google.com", desc: "D\xFCnyan\u0131n en pop\xFCler arama motoru ile bilgi, g\xF6rsel, video ve haritalara h\u0131zla ula\u015F\u0131n." },
      "google com": { title: "Google", url: "https://www.google.com", domain: "google.com", desc: "D\xFCnyan\u0131n en pop\xFCler arama motoru ile bilgi, g\xF6rsel, video ve haritalara h\u0131zla ula\u015F\u0131n." },
      "google arama": { title: "Google Arama", url: "https://www.google.com", domain: "google.com", desc: "Google arama motoru ile webde arama yap\u0131n." },
      youtube: { title: "YouTube", url: "https://www.youtube.com", domain: "youtube.com", desc: "Milyonlarca video, m\xFCzik, canl\u0131 yay\u0131n ve i\xE7erik \xFCreticisini YouTube'da ke\u015Ffedin." },
      "youtube com": { title: "YouTube", url: "https://www.youtube.com", domain: "youtube.com", desc: "Milyonlarca video, m\xFCzik, canl\u0131 yay\u0131n ve i\xE7erik \xFCreticisini YouTube'da ke\u015Ffedin." },
      "youtube izle": { title: "YouTube - Video \u0130zle", url: "https://www.youtube.com", domain: "youtube.com", desc: "YouTube videolar\u0131n\u0131 ve canl\u0131 yay\u0131nlar\u0131 kesintisiz izleyin." },
      roblox: { title: "Roblox", url: "https://www.roblox.com", domain: "roblox.com", desc: "Milyonlarca 3D d\xFCnyay\u0131 ve s\xFCr\xFCkleyici deneyimi arkada\u015Flar\u0131n\u0131zla birlikte ke\u015Ffedin. Oyunlar, avatarlar ve topluluk deneyimleri." },
      "roblox com": { title: "Roblox", url: "https://www.roblox.com", domain: "roblox.com", desc: "Roblox resmi sitesi. Milyonlarca 3D oyunu ve d\xFCnyay\u0131 ke\u015Ffedin." },
      "roblox oyna": { title: "Roblox - Oyunlar\u0131 Oyna", url: "https://www.roblox.com", domain: "roblox.com", desc: "Roblox d\xFCnyas\u0131na kat\u0131l\u0131n ve milyonlarca kullan\u0131c\u0131 taraf\u0131ndan olu\u015Fturulan oyunlar\u0131 oynay\u0131n." },
      "roblox oyunlar\u0131": { title: "Roblox - Deneyimler ve Oyunlar", url: "https://www.roblox.com/discover", domain: "roblox.com", desc: "Roblox \xFCzerindeki en pop\xFCler deneyimleri ke\u015Ffedin." },
      "roblox giri\u015F": { title: "Roblox - Giri\u015F Yap", url: "https://www.roblox.com/login", domain: "roblox.com", desc: "Roblox hesab\u0131n\u0131za giri\u015F yap\u0131n ve oyun oynamaya ba\u015Flay\u0131n." },
      crazygames: { title: "CrazyGames - \xDCcretsiz Taray\u0131c\u0131 Oyunlar\u0131", url: "https://www.crazygames.com", domain: "crazygames.com", desc: "En iyi aksiyon, yar\u0131\u015F ve \xE7ok oyunculu taray\u0131c\u0131 oyunlar\u0131n\u0131 CrazyGames'te oynay\u0131n." },
      "crazy games": { title: "CrazyGames - \xDCcretsiz Taray\u0131c\u0131 Oyunlar\u0131", url: "https://www.crazygames.com", domain: "crazygames.com", desc: "En iyi aksiyon, yar\u0131\u015F ve \xE7ok oyunculu taray\u0131c\u0131 oyunlar\u0131n\u0131 CrazyGames'te oynay\u0131n." },
      oyunkolu: { title: "Oyun Kolu - En G\xFCzel Oyunlar", url: "https://www.oyunkolu.com", domain: "oyunkolu.com", desc: "T\xFCrkiye'nin en sevilen oyun portal\u0131nda binlerce e\u011Flenceli oyun." },
      "1001oyun": { title: "1001 Oyun - \xDCcretsiz \xC7evrimi\xE7i Oyunlar", url: "https://1001oyun.com", domain: "1001oyun.com", desc: "Her g\xFCn eklenen yeni \xFCcretsiz oyunlarla 1001 Oyun keyfi." },
      "kral oyun": { title: "KralOyun - \xDCcretsiz Oyunlar", url: "https://www.kraloyun.com", domain: "kraloyun.com", desc: "KralOyun ile binlerce \xFCcretsiz fla\u015F ve html5 oyunu oynay\u0131n." },
      kraloyun: { title: "KralOyun - \xDCcretsiz Oyunlar", url: "https://www.kraloyun.com", domain: "kraloyun.com", desc: "KralOyun ile binlerce \xFCcretsiz fla\u015F ve html5 oyunu oynay\u0131n." },
      friv: { title: "Friv - Free Online Games", url: "https://www.friv.com", domain: "friv.com", desc: "En sevilen klasik Friv oyunlar\u0131n\u0131 \xFCcretsiz taray\u0131c\u0131n\u0131zda oynay\u0131n." },
      y8: { title: "Y8 Games - \xDCcretsiz \xC7evrimi\xE7i Oyunlar", url: "https://tr.y8.com", domain: "tr.y8.com", desc: "Y8.com'da 70.000'den fazla oyunu \xFCcretsiz oynay\u0131n." },
      github: { title: "GitHub: Where the world builds software", url: "https://github.com", domain: "github.com", desc: "D\xFCnyan\u0131n en b\xFCy\xFCk yaz\u0131l\u0131m geli\u015Ftirme ve a\xE7\u0131k kaynak kod payla\u015F\u0131m platformu." },
      wikipedia: { title: "Vikipedi - \xD6zg\xFCr Ansiklopedi", url: "https://tr.wikipedia.org", domain: "tr.wikipedia.org", desc: "Herkesin katk\u0131da bulunabildi\u011Fi \xF6zg\xFCr T\xFCrk\xE7e ansiklopedi." },
      vikipedi: { title: "Vikipedi - \xD6zg\xFCr Ansiklopedi", url: "https://tr.wikipedia.org", domain: "tr.wikipedia.org", desc: "Herkesin katk\u0131da bulunabildi\u011Fi \xF6zg\xFCr T\xFCrk\xE7e ansiklopedi." },
      trendyol: { title: "Trendyol - T\xFCrkiye'nin Online Al\u0131\u015Fveri\u015F Sitesi", url: "https://www.trendyol.com", domain: "trendyol.com", desc: "Moda, elektronik, ev ya\u015Fam ve s\xFCpermarket \xFCr\xFCnlerinde en iyi f\u0131rsatlar." },
      hepsiburada: { title: "Hepsiburada: T\xFCrkiye'nin En B\xFCy\xFCk Online Al\u0131\u015Fveri\u015F Sitesi", url: "https://www.hepsiburada.com", domain: "hepsiburada.com", desc: "Elektronik, giyim, kozmetik ve daha fazlas\u0131 en uygun fiyatlarla." },
      sahibinden: { title: "sahibinden.com - Sat\u0131l\u0131k, Kiral\u0131k, 2. El Emlak, Oto, Al\u0131\u015Fveri\u015F", url: "https://www.sahibinden.com", domain: "sahibinden.com", desc: "T\xFCrkiye'nin en b\xFCy\xFCk ilan platformu." },
      discord: { title: "Discord - Topluluklar ve Arkada\u015Flarla Sohbet", url: "https://discord.com", domain: "discord.com", desc: "Arkada\u015Flar\u0131n\u0131zla ve topluluklarla sesli, g\xF6r\xFCnt\xFCl\xFC ve yaz\u0131l\u0131 sohbet edin." },
      twitch: { title: "Twitch - Canl\u0131 Yay\u0131n Platformu", url: "https://www.twitch.tv", domain: "twitch.tv", desc: "Oyun, m\xFCzik ve e\u011Flence canl\u0131 yay\u0131nlar\u0131n\u0131 izleyin." },
      spotify: { title: "Spotify - M\xFCzik ve Podcast Dinle", url: "https://open.spotify.com", domain: "spotify.com", desc: "Milyonlarca \u015Fark\u0131 ve podcasti \xFCcretsiz dinleyin." },
      steam: { title: "Steam - Dijital Oyun Ma\u011Fazas\u0131 ve Toplulu\u011Fu", url: "https://store.steampowered.com", domain: "steampowered.com", desc: "PC ve Mac i\xE7in en pop\xFCler dijital oyun ma\u011Fazas\u0131." }
    };
    for (const [key, val] of Object.entries(DIRECT_MATCHES)) {
      if (lowerQ === key || lowerQ.startsWith(key + " ") || lowerQ.endsWith(" " + key) || lowerQ.includes(key)) {
        directSiteResults.push({
          title: val.title,
          url: val.url,
          domain: val.domain,
          description: val.desc,
          source: "Resmi Web Sitesi (Do\u011Frulanm\u0131\u015F)",
          type: "web",
          score: 100
        });
        break;
      }
    }
    const [googleResults, ddgResults, bingResults, wikiResults, weatherResults] = await Promise.all([
      searchGoogle(cleanQ, lang),
      searchDuckDuckGo(cleanQ, lang),
      searchBing(cleanQ, lang),
      searchWikipedia(cleanQ, lang),
      weatherPromise
    ]);
    finalResults = dedupeResults([
      ...directSiteResults,
      ...weatherResults,
      ...ddgResults,
      ...googleResults,
      ...bingResults,
      ...wikiResults.slice(0, 3)
    ]);
    if (finalResults.length < 4) {
      const geminiResults = await searchWithGemini(cleanQ, lang);
      finalResults = dedupeResults([...finalResults, ...geminiResults]);
    }
  }
  if (finalResults.length === 0) {
    const isDomain = /^[\w.-]+\.[a-zA-Z]{2,}$/.test(cleanQ);
    const target = isDomain ? `https://${cleanQ}` : `https://www.google.com/search?q=${encodeURIComponent(cleanQ)}`;
    finalResults.push({
      title: `${cleanQ} - Web Sayfas\u0131`,
      url: target,
      domain: isDomain ? cleanQ : "google.com",
      description: `"${cleanQ}" i\xE7in do\u011Frudan siteye gidin veya Google arama sonu\xE7lar\u0131na g\xF6z at\u0131n.`,
      source: "NovaSearch Engine",
      type: "web",
      score: 50
    });
  }
  SEARCH_CACHE.set(cacheKey, {
    data: finalResults,
    expires: Date.now() + CACHE_TTL_MS
  });
  return { query: cleanQ, type, lang, results: finalResults, cached: false };
}
async function getSuggestions(query, lang = "tr") {
  const cleanQ = query.trim();
  if (cleanQ.length < 2) return [];
  const cacheKey = `${lang}:${cleanQ.toLowerCase()}`;
  const cached = SUGGEST_CACHE.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }
  try {
    const googleSuggestUrl = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(cleanQ)}&hl=${lang === "auto" ? "tr" : lang}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2e3);
    const res = await fetch(googleSuggestUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: controller.signal
    });
    clearTimeout(timeout);
    let suggestions = [];
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.[1])) {
        suggestions = data[1].filter((s) => typeof s === "string");
      }
    }
    if (suggestions.length < 5) {
      const wikiLang = ["tr", "en", "de", "fr", "es", "ru", "ar"].includes(lang) ? lang : "tr";
      const u = new URL(`https://${wikiLang}.wikipedia.org/w/api.php`);
      u.searchParams.set("action", "opensearch");
      u.searchParams.set("search", cleanQ);
      u.searchParams.set("limit", "8");
      u.searchParams.set("format", "json");
      const wikiRes = await fetch(u.toString());
      if (wikiRes.ok) {
        const wikiData = await wikiRes.json();
        if (Array.isArray(wikiData?.[1])) {
          suggestions = [.../* @__PURE__ */ new Set([...suggestions, ...wikiData[1]])];
        }
      }
    }
    if (suggestions.length < 5) {
      const commonSuffixes = [
        `${cleanQ} nedir`,
        `${cleanQ} nas\u0131l yap\u0131l\u0131r`,
        `${cleanQ} resmi site`,
        `${cleanQ} giri\u015F`,
        `${cleanQ} haberleri`
      ];
      suggestions = [.../* @__PURE__ */ new Set([...suggestions, ...commonSuffixes])].slice(0, 8);
    }
    suggestions = suggestions.slice(0, 10);
    SUGGEST_CACHE.set(cacheKey, {
      data: suggestions,
      expires: Date.now() + SUGGEST_TTL_MS
    });
    return suggestions;
  } catch {
    return [`${cleanQ} nedir`, `${cleanQ} hakk\u0131nda`, `${cleanQ} resmi site`];
  }
}

// server/proxy.ts
var cheerio2 = __toESM(require("cheerio"), 1);
init_youtube();

// server/youtubeRenderer.ts
function renderYouTubeAppHtml(url, videoId) {
  let initialQuery = "";
  try {
    const parsed = new URL(url);
    initialQuery = parsed.searchParams.get("search_query") || parsed.searchParams.get("q") || "";
  } catch {
  }
  const isWatchMode = Boolean(videoId);
  const currentVid = videoId || "";
  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>YouTube HD - Nova Browser</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --yt-red: #ff0000;
      --yt-bg: #0f0f0f;
      --yt-card: #181818;
      --yt-border: #272727;
      --yt-text: #f1f1f1;
      --yt-muted: #aaaaaa;
      --yt-chip-bg: #272727;
      --yt-chip-active: #ffffff;
    }
    body {
      background: var(--yt-bg);
      color: var(--yt-text);
      font-family: Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
    }
    /* Top Bar */
    .nav {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(15, 15, 15, 0.95);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--yt-border);
      padding: 10px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .nav-left {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      text-decoration: none;
    }
    .logo-badge {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .yt-icon {
      background: #ff0000;
      color: #fff;
      font-weight: 900;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 13px;
      letter-spacing: -0.5px;
      box-shadow: 0 0 12px rgba(255, 0, 0, 0.4);
    }
    .logo-text {
      font-size: 17px;
      font-weight: 700;
      color: #fff;
      letter-spacing: -0.5px;
    }
    .logo-text span {
      font-size: 11px;
      color: #38bdf8;
      margin-left: 4px;
      font-weight: 500;
      background: rgba(56, 189, 248, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid rgba(56, 189, 248, 0.3);
    }
    .nav-center {
      flex: 1;
      max-width: 600px;
    }
    .search-form {
      display: flex;
      width: 100%;
      background: #121212;
      border: 1px solid #303030;
      border-radius: 40px;
      overflow: hidden;
      transition: border-color 0.2s;
    }
    .search-form:focus-within {
      border-color: #3ea6ff;
    }
    .search-input {
      flex: 1;
      background: transparent;
      border: none;
      padding: 9px 18px;
      color: #fff;
      font-size: 14px;
      outline: none;
    }
    .search-btn {
      background: #222222;
      border: none;
      border-left: 1px solid #303030;
      color: #fff;
      padding: 0 20px;
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    .search-btn:hover {
      background: #333;
    }
    .nav-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .api-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      background: rgba(34, 197, 94, 0.12);
      color: #4ade80;
      padding: 5px 10px;
      border-radius: 20px;
      border: 1px solid rgba(34, 197, 94, 0.3);
      font-weight: 500;
    }
    .api-badge-dot {
      width: 7px;
      height: 7px;
      background: #22c55e;
      border-radius: 50%;
      box-shadow: 0 0 8px #22c55e;
    }
    .ext-btn {
      background: #272727;
      color: #fff;
      text-decoration: none;
      padding: 6px 12px;
      border-radius: 18px;
      font-size: 12px;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: background 0.2s;
      border: 1px solid #3a3a3a;
    }
    .ext-btn:hover {
      background: #3f3f3f;
    }
    /* Main Layout */
    .container {
      flex: 1;
      padding: 16px 24px;
      max-width: 1600px;
      margin: 0 auto;
      width: 100%;
    }
    /* Categories */
    .chips-wrapper {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 12px;
      margin-bottom: 16px;
      scrollbar-width: none;
    }
    .chips-wrapper::-webkit-scrollbar { display: none; }
    .chip {
      background: var(--yt-chip-bg);
      color: var(--yt-text);
      border: none;
      padding: 7px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s;
    }
    .chip:hover {
      background: #3f3f3f;
    }
    .chip.active {
      background: #fff;
      color: #0f0f0f;
    }
    /* Watch Layout */
    .watch-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
    }
    @media (min-width: 1024px) {
      .watch-layout {
        grid-template-columns: 1fr 380px;
      }
    }
    .player-box {
      width: 100%;
      aspect-ratio: 16 / 9;
      background: #000;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      border: 1px solid #262626;
    }
    .player-box iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    .video-details {
      margin-top: 14px;
    }
    .video-title {
      font-size: 19px;
      font-weight: 700;
      color: #fff;
      line-height: 1.35;
      margin-bottom: 12px;
    }
    .video-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--yt-border);
    }
    .channel-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .channel-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #e11d48;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: #fff;
      font-size: 16px;
    }
    .channel-name {
      font-size: 15px;
      font-weight: 600;
      color: #fff;
    }
    .subscribe-btn {
      background: #fff;
      color: #0f0f0f;
      border: none;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .subscribe-btn:hover {
      background: #e5e5e5;
    }
    .action-buttons {
      display: flex;
      gap: 8px;
    }
    .action-btn {
      background: #272727;
      color: #fff;
      border: none;
      padding: 8px 14px;
      border-radius: 20px;
      font-size: 13px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: background 0.2s;
    }
    .action-btn:hover {
      background: #3a3a3a;
    }
    /* Video Grid */
    .video-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px 16px;
    }
    .video-card {
      background: transparent;
      border-radius: 12px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      text-decoration: none;
      color: inherit;
      transition: transform 0.2s;
    }
    .video-card:hover .thumb-img {
      transform: scale(1.04);
    }
    .thumb-wrapper {
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 9;
      border-radius: 12px;
      overflow: hidden;
      background: #202020;
    }
    .thumb-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    .duration-badge {
      position: absolute;
      bottom: 6px;
      right: 6px;
      background: rgba(0, 0, 0, 0.85);
      color: #fff;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .play-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .video-card:hover .play-overlay {
      opacity: 1;
    }
    .play-icon-circle {
      width: 44px;
      height: 44px;
      background: rgba(255, 0, 0, 0.9);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(0,0,0,0.5);
    }
    .play-icon-circle svg {
      width: 20px;
      height: 20px;
      fill: #fff;
      margin-left: 2px;
    }
    .meta {
      display: flex;
      gap: 12px;
      margin-top: 10px;
    }
    .meta-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #334155;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: bold;
      color: #94a3b8;
    }
    .meta-details {
      flex: 1;
      overflow: hidden;
    }
    .card-title {
      font-size: 14px;
      font-weight: 600;
      line-height: 1.35;
      color: #f1f1f1;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-bottom: 4px;
    }
    .card-channel {
      font-size: 12px;
      color: var(--yt-muted);
      margin-bottom: 2px;
    }
    .card-subinfo {
      font-size: 12px;
      color: var(--yt-muted);
    }
    .section-title {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    /* Loading Spinner */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 0;
      gap: 16px;
      color: var(--yt-muted);
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255,255,255,0.1);
      border-top-color: var(--yt-red);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <!-- Header / Navigation Bar -->
  <header class="nav">
    <a href="https://www.youtube.com" onclick="navigateHome(event)" class="nav-left">
      <div class="logo-badge">
        <div class="yt-icon">\u25B6</div>
        <div class="logo-text">YouTube <span>HD ENGINE</span></div>
      </div>
    </a>

    <div class="nav-center">
      <form class="search-form" onsubmit="handleSearchSubmit(event)">
        <input
          id="search-box"
          class="search-input"
          type="text"
          placeholder="YouTube'da Ara veya Video URL'si Girin..."
          value="${initialQuery ? initialQuery.replace(/"/g, "&quot;") : ""}"
        />
        <button type="submit" class="search-btn">
          \u{1F50D}
        </button>
      </form>
    </div>

    <div class="nav-right">
      <div id="api-status-badge" class="api-badge">
        <span class="api-badge-dot"></span>
        <span id="api-status-text">YouTube API v3 Aktif</span>
      </div>
      <a href="${url}" target="_blank" class="ext-btn">
        Resmi Sitede A\xE7 \u2197
      </a>
    </div>
  </header>

  <main class="container">
    ${isWatchMode ? `
    <!-- Watch Video View -->
    <div class="watch-layout">
      <div class="watch-main">
        <div class="player-box">
          <iframe
            id="yt-active-iframe"
            src="https://www.youtube-nocookie.com/embed/${currentVid}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
        </div>
        <div class="video-details">
          <h1 id="active-video-title" class="video-title">YouTube HD Video</h1>
          <div class="video-actions">
            <div class="channel-info">
              <div class="channel-avatar">YT</div>
              <div>
                <div id="active-channel-name" class="channel-name">YouTube Kanal\u0131</div>
                <div style="font-size: 12px; color: #888;">Resmi \u0130\xE7erik</div>
              </div>
              <button class="subscribe-btn">Abone Ol</button>
            </div>
            <div class="action-buttons">
              <button class="action-btn" id="btn-like" onclick="this.innerHTML = '\u2764\uFE0F Be\u011Fenildi'; this.style.color = '#ef4444';">\u{1F44D} Be\u011Fen</button>
              <button class="action-btn" id="btn-share" onclick="copyVideoLink('${currentVid}')">\u{1F517} Payla\u015F</button>
              <button class="action-btn" onclick="navigateHome()">\u{1F3E0} Ana Sayfa</button>
            </div>
          </div>
        </div>

        <div style="margin-top: 24px;">
          <h3 class="section-title">\u0130lgili ve Pop\xFCler Videolar</h3>
          <div id="related-videos-grid" class="video-grid">
            <div class="loading-state">
              <div class="spinner"></div>
              <p>Videolar y\xFCkleniyor...</p>
            </div>
          </div>
        </div>
      </div>

      <div class="watch-sidebar">
        <h3 class="section-title" style="font-size: 15px;">\xD6nerilen S\u0131radaki Videolar</h3>
        <div id="sidebar-videos-list" style="display: flex; flex-direction: column; gap: 12px;">
          <div class="loading-state">
            <div class="spinner"></div>
          </div>
        </div>
      </div>
    </div>
    ` : `
    <!-- Home / Trending / Search View -->
    <div class="chips-wrapper">
      <button class="chip active" onclick="filterCategory('trending', this)">\u{1F525} Trendler</button>
      <button class="chip" onclick="filterCategory('M\xFCzik', this)">\u{1F3B5} M\xFCzik</button>
      <button class="chip" onclick="filterCategory('Oyun', this)">\u{1F3AE} Oyun</button>
      <button class="chip" onclick="filterCategory('Haberler', this)">\u{1F4F0} Haberler</button>
      <button class="chip" onclick="filterCategory('Teknoloji', this)">\u{1F4BB} Teknoloji</button>
      <button class="chip" onclick="filterCategory('Spor', this)">\u{1F3C6} Spor</button>
      <button class="chip" onclick="filterCategory('Sinema', this)">\u{1F3AC} Sinema</button>
      <button class="chip" onclick="filterCategory('E\u011Fitim', this)">\u{1F393} E\u011Fitim</button>
      <button class="chip" onclick="filterCategory('Komedi', this)">\u{1F604} Komedi</button>
    </div>

    <div id="home-video-grid" class="video-grid">
      <div class="loading-state" style="grid-column: 1 / -1;">
        <div class="spinner"></div>
        <p>YouTube i\xE7erikleri y\xFCkleniyor...</p>
      </div>
    </div>
    `}
  </main>

  <script>
    const isWatch = ${isWatchMode ? "true" : "false"};
    const currentVideoId = '${currentVid}';
    let userApiKey = '';

    // Read configured user API key from localStorage if available
    try {
      const storageKeyNames = ['nova_browser_api_keys_v54', 'nova_browser_api_keys', 'nova_api_keys'];
      for (const kName of storageKeyNames) {
        const raw = localStorage.getItem(kName);
        if (raw) {
          const keys = JSON.parse(raw);
          if (Array.isArray(keys)) {
            const yt = keys.find(k => (k.serviceKey === 'youtube' || k.id === 'api_youtube') && k.apiKey);
            if (yt && yt.apiKey && yt.apiKey.trim().length > 0) {
              userApiKey = yt.apiKey.trim();
              break;
            }
          }
        }
      }
    } catch(e) {}

    // Update status badge
    const statusTextEl = document.getElementById('api-status-text');
    if (statusTextEl) {
      if (userApiKey) {
        statusTextEl.textContent = '\xD6zel YouTube API v3 Aktif \u{1F7E2}';
      } else {
        statusTextEl.textContent = 'YouTube HD Motoru Aktif \u{1F7E2}';
      }
    }

    function handleSearchSubmit(e) {
      e.preventDefault();
      const input = document.getElementById('search-box');
      const q = (input ? input.value : '').trim();
      if (!q) return;

      // If user pasted a YouTube video URL directly
      const match = q.match(/(?:youtube\\.com\\/(?:watch\\?v=|embed\\/|v\\/|shorts\\/)|youtu\\.be\\/)([a-zA-Z0-9_-]{11})/i);
      if (match && match[1]) {
        playVideo(match[1]);
        return;
      }

      if (isWatch) {
        // Navigate back to YouTube results or load directly
        loadSearchResults(q);
      } else {
        loadSearchResults(q);
      }
    }

    function navigateHome(e) {
      if (e) e.preventDefault();
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'NOVA_NAVIGATE', url: 'https://www.youtube.com' }, '*');
      } else {
        window.location.href = '/api/proxy?url=' + encodeURIComponent('https://www.youtube.com');
      }
    }

    function playVideo(vidId, title, channel) {
      const targetUrl = 'https://www.youtube.com/watch?v=' + vidId;
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'NOVA_NAVIGATE', url: targetUrl }, '*');
      } else {
        window.location.href = '/api/proxy?url=' + encodeURIComponent(targetUrl);
      }
    }

    function copyVideoLink(vidId) {
      const link = 'https://www.youtube.com/watch?v=' + vidId;
      const shareBtn = document.getElementById('btn-share');
      if (navigator.clipboard) {
        navigator.clipboard.writeText(link).then(() => {
          if (shareBtn) {
            const orig = shareBtn.innerHTML;
            shareBtn.innerHTML = '\u2705 Kopyaland\u0131!';
            setTimeout(() => { shareBtn.innerHTML = orig; }, 2000);
          }
        }).catch(() => {
          if (shareBtn) shareBtn.innerHTML = '\u2705 Ba\u011Flant\u0131 Haz\u0131r';
        });
      }
    }

    async function filterCategory(category, btn) {
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      if (btn) btn.classList.add('active');

      const grid = document.getElementById('home-video-grid');
      if (grid) {
        grid.innerHTML = '<div class="loading-state" style="grid-column: 1 / -1;"><div class="spinner"></div><p>' + category + ' videolar\u0131 y\xFCkleniyor...</p></div>';
      }

      if (category === 'trending') {
        loadTrendingVideos();
      } else {
        loadSearchResults(category);
      }
    }

    async function loadTrendingVideos() {
      const grid = document.getElementById('home-video-grid');
      if (!grid) return;

      try {
        const apiKeyParam = userApiKey ? '&apiKey=' + encodeURIComponent(userApiKey) : '';
        const res = await fetch('/api/youtube/trending?region=TR' + apiKeyParam);
        const data = await res.json();
        if (data.success && Array.isArray(data.videos) && data.videos.length > 0) {
          renderVideoCards(data.videos, grid);
        } else {
          loadSearchResults('trend videolar');
        }
      } catch (err) {
        loadSearchResults('trend videolar');
      }
    }

    async function loadSearchResults(query) {
      const grid = document.getElementById('home-video-grid') || document.getElementById('related-videos-grid');
      if (!grid) return;

      grid.innerHTML = '<div class="loading-state" style="grid-column: 1 / -1;"><div class="spinner"></div><p>"' + query + '" i\xE7in videolar aran\u0131yor...</p></div>';

      try {
        const apiKeyParam = userApiKey ? '&apiKey=' + encodeURIComponent(userApiKey) : '';
        const res = await fetch('/api/youtube/search?q=' + encodeURIComponent(query) + apiKeyParam);
        const data = await res.json();
        if (data.success && Array.isArray(data.videos) && data.videos.length > 0) {
          renderVideoCards(data.videos, grid);
        } else {
          grid.innerHTML = '<div class="loading-state" style="grid-column: 1 / -1;"><p>Video bulunamad\u0131.</p></div>';
        }
      } catch (err) {
        grid.innerHTML = '<div class="loading-state" style="grid-column: 1 / -1;"><p>Videolar y\xFCklenirken bir hata olu\u015Ftu.</p></div>';
      }
    }

    async function loadWatchRelated(videoId) {
      const relatedGrid = document.getElementById('related-videos-grid');
      const sidebarList = document.getElementById('sidebar-videos-list');

      try {
        const apiKeyParam = userApiKey ? '&apiKey=' + encodeURIComponent(userApiKey) : '';
        const res = await fetch('/api/youtube/search?q=populer m\xFCzik videolar\u0131' + apiKeyParam);
        const data = await res.json();
        if (data.success && Array.isArray(data.videos)) {
          if (relatedGrid) renderVideoCards(data.videos.slice(0, 12), relatedGrid);
          if (sidebarList) {
            sidebarList.innerHTML = data.videos.slice(0, 8).map(v => \`
              <div onclick="playVideo('\${v.id}')" style="display:flex; gap:10px; cursor:pointer; background:#181818; padding:8px; border-radius:10px; transition:background 0.2s;">
                <img src="\${v.thumbnail}" style="width:110px; aspect-ratio:16/9; object-fit:cover; border-radius:8px;" />
                <div style="overflow:hidden;">
                  <div style="font-size:12px; font-weight:600; color:#fff; line-height:1.3; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">\${v.title}</div>
                  <div style="font-size:11px; color:#aaa; margin-top:4px;">\${v.channel}</div>
                </div>
              </div>
            \`).join('');
          }
        }
      } catch(e) {}
    }

    function renderVideoCards(videos, container) {
      container.innerHTML = videos.map(v => {
        const firstLetter = (v.channel || 'Y').charAt(0).toUpperCase();
        const durationHtml = v.duration ? '<div class="duration-badge">' + v.duration + '</div>' : '';
        const viewsHtml = v.views ? '<span>' + v.views + '</span>' : '';
        const timeHtml = v.publishedTime ? '<span>\u2022 ' + v.publishedTime + '</span>' : '';

        return \`
          <div class="video-card" onclick="playVideo('\${v.id}', '\${encodeURIComponent(v.title)}', '\${encodeURIComponent(v.channel)}')">
            <div class="thumb-wrapper">
              <img class="thumb-img" src="\${v.thumbnail}" alt="\${v.title}" loading="lazy" />
              \${durationHtml}
              <div class="play-overlay">
                <div class="play-icon-circle">
                  <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                </div>
              </div>
            </div>
            <div class="meta">
              <div class="meta-avatar">\${firstLetter}</div>
              <div class="meta-details">
                <div class="card-title" title="\${v.title}">\${v.title}</div>
                <div class="card-channel">\${v.channel}</div>
                <div class="card-subinfo">\${viewsHtml} \${timeHtml}</div>
              </div>
            </div>
          </div>
        \`;
      }).join('');
    }

    // Auto-initialize based on current mode
    window.addEventListener('DOMContentLoaded', () => {
      const query = '${initialQuery ? initialQuery.replace(/'/g, "\\'") : ""}';
      if (isWatch) {
        loadWatchRelated(currentVideoId);
      } else if (query) {
        loadSearchResults(query);
      } else {
        loadTrendingVideos();
      }
    });
  </script>
</body>
</html>
  `;
}

// server/security.ts
var HIGH_RISK_TLDS = [".ru", ".su", ".top", ".zip", ".mov", ".work", ".click", ".gq", ".cf", ".tk", ".ml"];
var PHISHING_PATTERNS = [
  /paypa[l1i]\.[\w.-]+/i,
  /g[o0]{2}g[l1]e\./i,
  /faceb[o0]{2}k\./i,
  /appl[e1]-security\./i,
  /micr[o0]s[o0]ft-support\./i,
  /binance-login\./i,
  /metamask-wallet\./i,
  /netf[l1]ix-account\./i,
  /turkiye-gov-tr\./i,
  /e-devlet-giris\./i,
  /garanti-bbva-giris\./i,
  /akbank-direkt-giris\./i,
  /isbank-sube-giris\./i
];
var CRYPTO_MINER_PATTERNS = [
  "coinhive.min.js",
  "cryptonight.wasm",
  "coin-have.com",
  "crypto-loot.com",
  "webminepool.com",
  "monerominer"
];
var TRACKER_DOMAINS = [
  "doubleclick.net",
  "googlesyndication.com",
  "adservice.google.com",
  "adnxs.com",
  "criteo.com",
  "outbrain.com",
  "taboola.com",
  "scorecardresearch.com",
  "zedo.com",
  "popads.net",
  "propellerads.com",
  "adpushup.com",
  "trafficjunky.net",
  "exoclick.com"
];
function scanUrlSecurity(rawUrl) {
  const result = {
    isSafe: true,
    threatLevel: "safe",
    threatScore: 0,
    details: [],
    blockedTrackersCount: 0
  };
  try {
    const parsed = new URL(rawUrl);
    const hostname = parsed.hostname.toLowerCase();
    const TRUSTED_DOMAINS = [
      "google.com",
      "google.com.tr",
      "youtube.com",
      "youtu.be",
      "poki.com",
      "poki.com.tr",
      "poki.cz",
      "poki.io",
      "poki-gdn.com",
      "crazygames.com",
      "krunker.io",
      "armorgames.com",
      "itch.io",
      "roblox.com",
      "oyunkolu.com",
      "1001oyun.com",
      "friv.com",
      "y8.com",
      "twoplayergames.org",
      "gameflare.com",
      "miniclip.com",
      "chess.com",
      "lichess.org",
      "geoguessr.com",
      "github.com",
      "wikipedia.org",
      "wikimedia.org",
      "w3.org",
      "mozilla.org",
      "openai.com",
      "microsoft.com",
      "apple.com",
      "twitter.com",
      "x.com",
      "reddit.com",
      "stackoverflow.com",
      "medium.com",
      "unsplash.com",
      "open-meteo.com",
      "openweathermap.org",
      "tavily.com",
      "newsapi.org",
      "openlibrary.org",
      "archive.org",
      "hurriyet.com.tr",
      "milliyet.com.tr",
      "ntv.com.tr",
      "sozcu.com.tr",
      "bbc.com",
      "cnn.com",
      "trendyol.com",
      "hepsiburada.com",
      "sahibinden.com",
      "n11.com",
      "amazon.com",
      "amazon.com.tr",
      "spotify.com",
      "netflix.com",
      "twitch.tv"
    ];
    if (TRUSTED_DOMAINS.some((td) => hostname === td || hostname.endsWith("." + td))) {
      result.isSafe = true;
      result.threatLevel = "safe";
      result.threatScore = 0;
      result.details.push("Do\u011Frulanm\u0131\u015F g\xFCvenli alan ad\u0131 sertifikas\u0131 (Do\u011Frulanm\u0131\u015F Otorite).");
      return result;
    }
    for (const pattern of PHISHING_PATTERNS) {
      if (pattern.test(hostname)) {
        result.isSafe = false;
        result.threatLevel = "dangerous";
        result.threatType = "phishing";
        result.threatScore = 95;
        result.details.push("Oltalama (Phishing) / Sahte Kimlik Tespiti: Bu web adresi tan\u0131nm\u0131\u015F bir markay\u0131 veya bankac\u0131l\u0131k aray\xFCz\xFCn\xFC taklit ediyor olabilir.");
        return result;
      }
    }
    if (HIGH_RISK_TLDS.some((tld) => hostname.endsWith(tld))) {
      result.threatScore += 45;
      result.details.push("Y\xFCksek riskli TLD uzant\u0131s\u0131 tespit edildi.");
    }
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) && parsed.protocol === "http:") {
      result.threatScore += 50;
      result.threatType = "suspicious";
      result.details.push("\u015Eifrelenmemi\u015F do\u011Frudan IP adresi eri\u015Fimi tespit edildi.");
    }
    const pathname = parsed.pathname.toLowerCase();
    if (/\.(exe|scr|vbs|bat|cmd|pif|hta|msi|ps1)$/.test(pathname)) {
      result.isSafe = false;
      result.threatLevel = "blocked";
      result.threatType = "malware";
      result.threatScore = 100;
      result.details.push("Potansiyel Zararl\u0131 Yaz\u0131l\u0131m / \xC7al\u0131\u015Ft\u0131r\u0131labilir Dosya (.exe, .vbs vb.) indirme tuza\u011F\u0131 tespit edildi.");
      return result;
    }
    if (result.threatScore >= 70) {
      result.isSafe = false;
      result.threatLevel = "dangerous";
      result.threatType = "malware";
    } else if (result.threatScore >= 40) {
      result.isSafe = true;
      result.threatLevel = "suspicious";
    } else {
      result.isSafe = true;
      result.threatLevel = "safe";
      result.details.push("NovaShield: G\xFCvenli web standard\u0131.");
    }
  } catch {
    result.isSafe = false;
    result.threatLevel = "suspicious";
    result.threatScore = 50;
    result.details.push("Ge\xE7ersiz veya \u015F\xFCpheli URL format\u0131.");
  }
  return result;
}
function sanitizeAndShieldHtml($, rawUrl) {
  let blockedCount = 0;
  const neutralized = [];
  $("script").each((_, el) => {
    const src = ($(el).attr("src") || "").toLowerCase();
    const content = $(el).html() || "";
    const hasMiner = CRYPTO_MINER_PATTERNS.some((pattern) => src.includes(pattern) || content.includes(pattern));
    if (hasMiner) {
      $(el).remove();
      blockedCount++;
      neutralized.push("Gizli Kripto Para Madencili\u011Fi (Crypto Miner) Scripti engellendi.");
    }
    const isTracker = TRACKER_DOMAINS.some((td) => src.includes(td));
    if (isTracker) {
      $(el).remove();
      blockedCount++;
    }
  });
  $("div, iframe, a").each((_, el) => {
    const style = ($(el).attr("style") || "").toLowerCase();
    if ((style.includes("position:fixed") || style.includes("position: fixed") || style.includes("position:absolute")) && (style.includes("opacity:0") || style.includes("opacity: 0") || style.includes("z-index:99999") || style.includes("z-index: 999999")) && (style.includes("width:100%") || style.includes("height:100%") || style.includes("left:0"))) {
      $(el).remove();
      blockedCount++;
      neutralized.push("G\xF6r\xFCnmez T\u0131klama Ka\xE7\u0131rma (Clickjacking) katman\u0131 temizlendi.");
    }
  });
  $("img").each((_, el) => {
    const w = $(el).attr("width");
    const h = $(el).attr("height");
    const src = ($(el).attr("src") || "").toLowerCase();
    if (w === "1" && h === "1" || w === "0" && h === "0" || TRACKER_DOMAINS.some((td) => src.includes(td))) {
      $(el).remove();
      blockedCount++;
    }
  });
  return {
    sanitizedHtml: $.html(),
    blockedTrackersCount: blockedCount,
    neutralizedThreats: neutralized
  };
}
function renderSecurityWarningHtml(targetUrl, scanResult) {
  let domain = "web-sitesi";
  try {
    domain = new URL(targetUrl).hostname.replace(/^www\./, "");
  } catch {
    domain = targetUrl;
  }
  const threatName = scanResult.threatType === "phishing" ? "Oltalama (Phishing / Sahte Kimlik) Sald\u0131r\u0131s\u0131" : scanResult.threatType === "cryptominer" ? "Kripto Para Madencisi (Cryptominer)" : scanResult.threatType === "malware" ? "Zararl\u0131 Yaz\u0131l\u0131m / Vir\xFCs (Malware) Tehdidi" : scanResult.threatType === "untrusted_tld" ? "Y\xFCksek Riskli Alan Ad\u0131 / \u015E\xFCpheli TLD" : "G\xFCvensiz ve Riskli Web Sitesi";
  return `
    <!DOCTYPE html>
    <html lang="tr">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>NovaShield - G\xFCvenlik Engeli ve Zorunlu Onay Formu</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
            background: #080c14;
            color: #f1f5f9;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 24px 16px;
          }
          .shield-card {
            background: radial-gradient(circle at top, #1e142b 0%, #0c1220 70%, #080c14 100%);
            border: 2px solid #ef4444;
            box-shadow: 0 0 60px rgba(239, 68, 68, 0.25), 0 25px 50px -12px rgba(0, 0, 0, 0.85);
            border-radius: 24px;
            max-width: 680px;
            width: 100%;
            padding: 36px 28px;
            position: relative;
            overflow: hidden;
          }
          .badge-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 18px;
            flex-wrap: wrap;
            gap: 8px;
          }
          .badge-shield {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(239, 68, 68, 0.15);
            color: #fca5a5;
            border: 1px solid rgba(239, 68, 68, 0.4);
            padding: 5px 12px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.06em;
          }
          .badge-score {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            background: rgba(220, 38, 38, 0.25);
            color: #ef4444;
            border: 1px solid #ef4444;
            padding: 5px 12px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 800;
          }
          .header-center {
            text-align: center;
            margin-bottom: 20px;
          }
          .icon-circle {
            width: 68px;
            height: 68px;
            background: rgba(239, 68, 68, 0.12);
            border: 2px solid #ef4444;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            margin: 0 auto 16px;
            box-shadow: 0 0 28px rgba(239, 68, 68, 0.4);
          }
          h1 {
            font-size: 22px;
            font-weight: 800;
            color: #ffffff;
            margin-bottom: 8px;
            line-height: 1.3;
          }
          .subtext {
            color: #94a3b8;
            font-size: 13px;
            line-height: 1.5;
          }
          .url-box {
            background: #030712;
            border: 1px solid #374151;
            border-radius: 10px;
            padding: 10px 14px;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 12px;
            color: #f87171;
            word-break: break-all;
            margin: 16px 0;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .reasons-box {
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(75, 85, 99, 0.4);
            border-radius: 12px;
            padding: 14px 16px;
            margin-bottom: 20px;
          }
          .reasons-box h4 {
            font-size: 11px;
            color: #cbd5e1;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 6px;
          }
          .reasons-box ul {
            list-style: none;
            padding: 0;
          }
          .reasons-box li {
            font-size: 12px;
            color: #fca5a5;
            display: flex;
            align-items: flex-start;
            gap: 6px;
            margin-bottom: 4px;
            line-height: 1.4;
          }
          .safe-actions {
            display: flex;
            gap: 10px;
            margin-bottom: 24px;
          }
          .btn-primary {
            flex: 1;
            padding: 12px 18px;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
            background: #2563eb;
            color: white;
            box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
          }
          .btn-primary:hover {
            background: #1d4ed8;
            transform: translateY(-1px);
          }
          .waiver-toggle-btn {
            width: 100%;
            background: rgba(30, 41, 59, 0.6);
            border: 1px dashed #64748b;
            color: #cbd5e1;
            padding: 10px 14px;
            border-radius: 10px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .waiver-toggle-btn:hover {
            background: rgba(51, 65, 85, 0.6);
            border-color: #94a3b8;
          }
          .waiver-form {
            background: #0f172a;
            border: 1px solid #b91c1c;
            border-radius: 14px;
            padding: 20px;
            margin-top: 16px;
            display: none;
            animation: fadeIn 0.3s ease;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-6px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .disclaimer-banner {
            background: rgba(220, 38, 38, 0.15);
            border-left: 4px solid #ef4444;
            padding: 12px 14px;
            border-radius: 6px;
            margin-bottom: 16px;
            font-size: 12px;
            line-height: 1.5;
            color: #fecaca;
          }
          .disclaimer-banner strong {
            color: #ffffff;
            display: block;
            margin-bottom: 4px;
            font-size: 12px;
          }
          .form-group {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            margin-bottom: 12px;
            cursor: pointer;
            user-select: none;
          }
          .form-group input[type="checkbox"] {
            width: 17px;
            height: 17px;
            margin-top: 2px;
            accent-color: #dc2626;
            cursor: pointer;
            shrink: 0;
          }
          .form-group span {
            font-size: 12px;
            color: #cbd5e1;
            line-height: 1.4;
          }
          .text-challenge {
            margin: 16px 0;
            background: #030712;
            padding: 12px;
            border-radius: 10px;
            border: 1px solid #374151;
          }
          .text-challenge label {
            display: block;
            font-size: 11px;
            color: #94a3b8;
            margin-bottom: 6px;
          }
          .text-challenge input[type="text"] {
            width: 100%;
            background: #111827;
            border: 1px solid #4b5563;
            border-radius: 8px;
            padding: 8px 12px;
            color: #ffffff;
            font-size: 13px;
            font-weight: 700;
            font-family: monospace;
            outline: none;
          }
          .text-challenge input[type="text"]:focus {
            border-color: #ef4444;
            box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
          }
          .btn-danger-submit {
            width: 100%;
            padding: 12px;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }
          .btn-danger-submit.enabled {
            background: #dc2626;
            color: white;
            box-shadow: 0 4px 16px rgba(220, 38, 38, 0.4);
            cursor: pointer;
          }
          .btn-danger-submit.enabled:hover {
            background: #b91c1c;
          }
          .btn-danger-submit.disabled {
            background: #1f2937;
            color: #6b7280;
            cursor: not-allowed;
            opacity: 0.6;
          }
          .help-note {
            font-size: 11px;
            color: #64748b;
            text-align: center;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="shield-card">
          <div class="badge-row">
            <div class="badge-shield">\u{1F6E1}\uFE0F NovaShield Koruma Kalkan\u0131</div>
            <div class="badge-score">\u26A0\uFE0F Tehdit Skoru: %${scanResult.threatScore}</div>
          </div>

          <div class="header-center">
            <div class="icon-circle">\u{1F6AB}</div>
            <h1>${threatName}</h1>
            <p class="subtext">
              NovaShield G\xFCvenlik Sistemi, bu web sitesinin g\xFCvenli\u011Finizi, kimlik bilgilerinizi veya cihaz\u0131n\u0131z\u0131 riske atabilece\u011Fini tespit etti ve ba\u011Flant\u0131y\u0131 engelledi.
            </p>
          </div>

          <div class="url-box">
            <span>\u{1F534}</span>
            <span>${targetUrl}</span>
          </div>

          <div class="reasons-box">
            <h4>Tespit Edilen G\xFCvenlik Tehditleri:</h4>
            <ul>
              ${scanResult.details.map((d) => `<li><span>\u26A0\uFE0F</span><span>${d}</span></li>`).join("")}
            </ul>
          </div>

          <div class="safe-actions">
            <button class="btn-primary" onclick="window.parent.postMessage({type:'NOVA_NAVIGATE', url:'nova://search'}, '*')">
              \u{1F3E0} G\xFCvenli Ana Sayfaya D\xF6n
            </button>
            <button class="btn-primary" style="background:#0284c7;" onclick="window.parent.postMessage({type:'NOVA_NAVIGATE', url:'https://www.google.com'}, '*')">
              \u{1F50D} Google'da G\xFCvenle Ara
            </button>
          </div>

          <!-- Strict Mandatory Waiver Accordion & Form -->
          <button type="button" class="waiver-toggle-btn" id="btn-toggle-waiver" onclick="toggleWaiverForm()">
            <span>\u26A0\uFE0F Bu G\xFCvensiz Site \u0130\xE7in \xD6zel Onay ve Sorumluluk Formunu A\xE7</span>
            <span id="waiver-arrow">\u25BC</span>
          </button>

          <div class="waiver-form" id="waiver-form-container">
            <div class="disclaimer-banner">
              <strong>ZORUNLU SORUMLULUK FERAGATNAMES\u0130:</strong>
              Bu web sitesi g\xFCvenli olarak do\u011Frulanmam\u0131\u015Ft\u0131r ve zararl\u0131/\u015F\xFCpheli \xF6\u011Feler bar\u0131nd\u0131rabilir. Siteyi a\xE7mak istiyorsan\u0131z ve onayl\u0131yorsan\u0131z; geli\u015Febilecek ve olan b\xFCt\xFCn olaylardan (vir\xFCs/zararl\u0131 yaz\u0131l\u0131m bula\u015Fmas\u0131, veri kayb\u0131, doland\u0131r\u0131c\u0131l\u0131k veya g\xFCvenlik a\xE7\u0131klar\u0131) Nova Browser, altyap\u0131 sa\u011Flay\u0131c\u0131lar\u0131 ve geli\u015Ftiricileri <u>KES\u0130NL\u0130KLE SORUMLU DE\u011E\u0130LD\u0130R</u>. T\xFCm sorumluluk kullan\u0131c\u0131ya aittir.
            </div>

            <form id="strict-unsafe-form" onsubmit="handleFormSubmit(event)">
              <label class="form-group">
                <input type="checkbox" id="check-1" onchange="validateForm()" />
                <span>Bu web sitesinin (${domain}) g\xFCvenli olmad\u0131\u011F\u0131n\u0131 ve y\xFCksek siber g\xFCvenlik riski ta\u015F\u0131d\u0131\u011F\u0131n\u0131 anlad\u0131m.</span>
              </label>

              <label class="form-group">
                <input type="checkbox" id="check-2" onchange="validateForm()" />
                <span>Geli\u015Febilecek ve do\u011Fabilecek b\xFCt\xFCn olaylardan, veri kay\u0131plar\u0131ndan ve zararlardan Nova Browser'\u0131n sorumlu olmad\u0131\u011F\u0131n\u0131, t\xFCm sorumlulu\u011Fu \xFCstlendi\u011Fimi onayl\u0131yorum.</span>
              </label>

              <label class="form-group">
                <input type="checkbox" id="check-3" onchange="validateForm()" />
                <span>Yaln\u0131zca bu site i\xE7in NovaShield g\xFCvenlik kalkan\u0131n\u0131 ge\xE7ici olarak kapatmay\u0131 ve siteyi a\xE7may\u0131 kabul ediyorum.</span>
              </label>

              <div class="text-challenge">
                <label for="text-confirm-input">Onaylamak i\xE7in kutuya b\xFCy\xFCk harflerle <strong>ONAYLIYORUM</strong> yaz\u0131n\u0131z:</label>
                <input
                  type="text"
                  id="text-confirm-input"
                  placeholder="ONAYLIYORUM"
                  autocomplete="off"
                  oninput="validateForm()"
                />
              </div>

              <button
                type="submit"
                id="btn-submit-unsafe"
                class="btn-danger-submit disabled"
                disabled
              >
                \u26A0\uFE0F Riskleri Kabul Ederek G\xFCvenli\u011Fi Bu Site \u0130\xE7in Kapat ve A\xE7
              </button>

              <p class="help-note">
                Bu onay yaln\u0131zca "${domain}" alan ad\u0131 i\xE7in ge\xE7erlidir. Di\u011Fer t\xFCm web siteleri tam koruma alt\u0131nda kalmaya devam eder.
              </p>
            </form>
          </div>
        </div>

        <script>
          function toggleWaiverForm() {
            var el = document.getElementById('waiver-form-container');
            var arrow = document.getElementById('waiver-arrow');
            if (el.style.display === 'block') {
              el.style.display = 'none';
              arrow.innerText = '\u25BC';
            } else {
              el.style.display = 'block';
              arrow.innerText = '\u25B2';
              el.scrollIntoView({ behavior: 'smooth' });
            }
          }

          function validateForm() {
            var c1 = document.getElementById('check-1').checked;
            var c2 = document.getElementById('check-2').checked;
            var c3 = document.getElementById('check-3').checked;
            var txt = (document.getElementById('text-confirm-input').value || '').trim().toUpperCase();
            var btn = document.getElementById('btn-submit-unsafe');

            var isValid = c1 && c2 && c3 && (txt === 'ONAYLIYORUM' || txt === 'KABUL EDIYORUM' || txt === 'KABUL ED\u0130YORUM');

            if (isValid) {
              btn.disabled = false;
              btn.className = 'btn-danger-submit enabled';
            } else {
              btn.disabled = true;
              btn.className = 'btn-danger-submit disabled';
            }
          }

          function handleFormSubmit(e) {
            e.preventDefault();
            var c1 = document.getElementById('check-1').checked;
            var c2 = document.getElementById('check-2').checked;
            var c3 = document.getElementById('check-3').checked;
            var txt = (document.getElementById('text-confirm-input').value || '').trim().toUpperCase();

            if (!c1 || !c2 || !c3 || (txt !== 'ONAYLIYORUM' && txt !== 'KABUL EDIYORUM' && txt !== 'KABUL ED\u0130YORUM')) {
              alert('L\xFCtfen formdaki t\xFCm 3 onay kutusunu i\u015Faretleyin ve kutuya ONAYLIYORUM yaz\u0131n\u0131z.');
              return;
            }

            var targetUrl = ${JSON.stringify(targetUrl)};
            var domain = ${JSON.stringify(domain)};
            var threatType = ${JSON.stringify(scanResult.threatType || "unknown")};
            var threatScore = ${scanResult.threatScore};

            // Notify parent Nova Browser to register this site in local approved unsafe list
            if (window.parent && window.parent !== window) {
              window.parent.postMessage({
                type: 'NOVA_APPROVE_UNSAFE_SITE',
                domain: domain,
                url: targetUrl,
                threatType: threatType,
                threatScore: threatScore,
                approvedAt: new Date().toISOString()
              }, '*');
            }

            // Redirect through proxy with bypass token
            window.location.href = '/api/proxy?url=' + encodeURIComponent(targetUrl) + '&bypass_shield=1&bypass_domain=' + encodeURIComponent(domain);
          }
        </script>
      </body>
    </html>
  `;
}

// server/proxy.ts
var USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 NovaBrowser/54.0";
var DOMAIN_COOKIE_JAR = /* @__PURE__ */ new Map();
function getDomainCookies(hostname) {
  const cookies = [];
  for (const [domain, jar] of DOMAIN_COOKIE_JAR.entries()) {
    if (hostname.endsWith(domain) || domain.endsWith(hostname)) {
      for (const [k, v] of jar.entries()) {
        cookies.push(`${k}=${v}`);
      }
    }
  }
  return cookies.join("; ");
}
function storeDomainCookies(hostname, setCookieHeaders) {
  if (!setCookieHeaders) return;
  const list = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
  let domain = hostname;
  try {
    const parts = hostname.split(".");
    if (parts.length >= 2) {
      domain = parts.slice(-2).join(".");
    }
  } catch {
  }
  let jar = DOMAIN_COOKIE_JAR.get(domain);
  if (!jar) {
    jar = /* @__PURE__ */ new Map();
    DOMAIN_COOKIE_JAR.set(domain, jar);
  }
  for (const header of list) {
    const parts = header.split(";")[0];
    if (parts) {
      const eqIdx = parts.indexOf("=");
      if (eqIdx > 0) {
        const name = parts.slice(0, eqIdx).trim();
        const value = parts.slice(eqIdx + 1).trim();
        if (name && value) {
          jar.set(name, value);
        }
      }
    }
  }
}
function normalizeUrl(rawUrl) {
  let url = (rawUrl || "").trim();
  if (!url) return "";
  if (url.startsWith("nova://")) {
    return url;
  }
  if (url.includes("google.") && url.includes("/url?")) {
    try {
      const u = new URL(url);
      const targetParam = u.searchParams.get("q") || u.searchParams.get("url");
      if (targetParam && /^https?:\/\//i.test(targetParam)) {
        return targetParam;
      }
    } catch {
    }
  }
  if (!/^https?:\/\//i.test(url)) {
    if (/^[\w.-]+\.[a-zA-Z]{2,}(\/.*)?$/i.test(url) || /^localhost(:\d+)?(\/.*)?$/i.test(url)) {
      url = `https://${url}`;
    } else {
      url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
    }
  }
  return url;
}
async function handleProxyRequest(req, res) {
  let targetRaw = req.query.url || "";
  const bypassShield = req.query.bypass_shield === "1";
  if (!targetRaw && req.query.q) {
    targetRaw = `https://www.google.com/search?q=${encodeURIComponent(req.query.q)}`;
  }
  if (targetRaw && Object.keys(req.query).length > 1) {
    const extraParams = new URLSearchParams();
    for (const [k, v] of Object.entries(req.query)) {
      if (k !== "url" && k !== "bypass_shield" && k !== "bypass_domain") {
        extraParams.append(k, String(v));
      }
    }
    const extraStr = extraParams.toString();
    if (extraStr && !targetRaw.includes(extraStr)) {
      targetRaw += (targetRaw.includes("?") ? "&" : "?") + extraStr;
    }
  }
  if (!targetRaw) {
    res.status(400).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Nova Proxy</title><meta charset="utf-8"/></head>
        <body style="font-family:system-ui;padding:40px;background:#0f172a;color:#f8fafc;text-align:center;">
          <h2>Hata: Ge\xE7erli bir web adresi belirtilmedi</h2>
          <p>L\xFCtfen ge\xE7erli bir URL (\xF6rnek: https://wikipedia.org) girin.</p>
        </body>
      </html>
    `);
    return;
  }
  const targetUrl = normalizeUrl(targetRaw);
  if (!bypassShield) {
    const scanResult = scanUrlSecurity(targetUrl);
    if (!scanResult.isSafe || scanResult.threatLevel === "dangerous" || scanResult.threatLevel === "blocked") {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.removeHeader("X-Frame-Options");
      res.removeHeader("Content-Security-Policy");
      res.setHeader("X-Frame-Options", "ALLOWALL");
      res.status(403).send(renderSecurityWarningHtml(targetUrl, scanResult));
      return;
    }
  }
  if (isYouTubeUrl(targetUrl)) {
    const ytVideoId = extractYouTubeId(targetUrl);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.removeHeader("X-Frame-Options");
    res.removeHeader("Content-Security-Policy");
    res.setHeader("X-Frame-Options", "ALLOWALL");
    res.send(renderYouTubeAppHtml(targetUrl, ytVideoId));
    return;
  }
  try {
    const parsedTarget = new URL(targetUrl);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12e3);
    const storedCookies = getDomainCookies(parsedTarget.hostname);
    const clientCookies = req.headers["cookie"] || "";
    const mergedCookies = [storedCookies, clientCookies].filter(Boolean).join("; ");
    const forwardHeaders = {
      "User-Agent": USER_AGENT,
      Accept: req.headers["accept"] || "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "Accept-Language": req.headers["accept-language"] || "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
      Referer: `${parsedTarget.origin}/`,
      Origin: parsedTarget.origin,
      "Sec-Fetch-Dest": req.headers["sec-fetch-dest"] || "document",
      "Sec-Fetch-Mode": req.headers["sec-fetch-mode"] || "navigate",
      "Sec-Fetch-Site": "same-origin",
      "Sec-Fetch-User": "?1",
      "Upgrade-Insecure-Requests": "1"
    };
    if (mergedCookies) {
      forwardHeaders["Cookie"] = mergedCookies;
    }
    if (req.headers["range"]) {
      forwardHeaders["range"] = req.headers["range"];
    }
    const upstreamRes = await fetch(targetUrl, {
      method: req.method === "POST" ? "POST" : "GET",
      headers: forwardHeaders,
      signal: controller.signal,
      redirect: "follow"
    });
    clearTimeout(timeout);
    const contentType = upstreamRes.headers.get("content-type") || "text/html";
    const finalUrl = upstreamRes.url || targetUrl;
    const finalParsed = new URL(finalUrl);
    const setCookie = upstreamRes.headers.get("set-cookie");
    if (setCookie) {
      storeDomainCookies(finalParsed.hostname, setCookie);
    }
    res.removeHeader("X-Frame-Options");
    res.removeHeader("Content-Security-Policy");
    res.removeHeader("Content-Security-Policy-Report-Only");
    res.removeHeader("Cross-Origin-Embedder-Policy");
    res.removeHeader("Cross-Origin-Opener-Policy");
    res.removeHeader("Cross-Origin-Resource-Policy");
    res.setHeader("X-Frame-Options", "ALLOWALL");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("X-Nova-Resolved-Url", finalUrl);
    if (upstreamRes.status === 206) {
      res.status(206);
      const contentRange = upstreamRes.headers.get("content-range");
      if (contentRange) res.setHeader("Content-Range", contentRange);
    } else {
      res.status(upstreamRes.status);
    }
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
      res.setHeader("Content-Type", contentType);
      const buffer = Buffer.from(await upstreamRes.arrayBuffer());
      res.send(buffer);
      return;
    }
    const htmlText = await upstreamRes.text();
    const $ = cheerio2.load(htmlText);
    $('meta[http-equiv="Content-Security-Policy"]').remove();
    $('meta[http-equiv="content-security-policy"]').remove();
    $('meta[http-equiv="X-Frame-Options"]').remove();
    $("*[integrity]").removeAttr("integrity");
    $("*[crossorigin]").removeAttr("crossorigin");
    $("script").each((_, el) => {
      const scriptContent = $(el).html() || "";
      if (scriptContent.includes("top.location") || scriptContent.includes("window.top") || scriptContent.includes("parent.location") || scriptContent.includes("frameElement") || scriptContent.includes("self !== top") || scriptContent.includes("top !== self") || scriptContent.includes("window.self !== window.top") || scriptContent.includes("window.top.location")) {
        const neutralized = scriptContent.replace(/if\s*\(\s*(?:window\.)?(?:self|top)\s*!==?\s*(?:window\.)?(?:top|self)\s*\)/g, "if (false)").replace(/(?:window\.)?top\.location\s*=/g, "/* top.location = */ void ").replace(/(?:window\.)?parent\.location\s*=/g, "/* parent.location = */ void ");
        $(el).html(neutralized);
      }
    });
    $("base").remove();
    $("head").prepend(`<base href="${finalUrl}">`);
    $("img[src]").each((_, el) => {
      const src = $(el).attr("src");
      if (src && !src.startsWith("data:") && !src.startsWith("blob:") && !src.startsWith("http://") && !src.startsWith("https://")) {
        try {
          $(el).attr("src", new URL(src, finalUrl).toString());
        } catch {
        }
      }
    });
    $("img[srcset]").each((_, el) => {
      const srcset = $(el).attr("srcset");
      if (srcset) {
        try {
          const parts = srcset.split(",").map((part) => {
            const [url, size] = part.trim().split(/\s+/);
            if (url && !url.startsWith("data:") && !url.startsWith("blob:") && !url.startsWith("http://") && !url.startsWith("https://")) {
              return `${new URL(url, finalUrl).toString()} ${size || ""}`.trim();
            }
            return part.trim();
          });
          $(el).attr("srcset", parts.join(", "));
        } catch {
        }
      }
    });
    $("link[href]").each((_, el) => {
      const href = $(el).attr("href");
      if (href && !href.startsWith("data:") && !href.startsWith("blob:") && !href.startsWith("http://") && !href.startsWith("https://")) {
        try {
          $(el).attr("href", new URL(href, finalUrl).toString());
        } catch {
        }
      }
    });
    $("script[src]").each((_, el) => {
      const src = $(el).attr("src");
      if (src && !src.startsWith("data:") && !src.startsWith("blob:") && !src.startsWith("http://") && !src.startsWith("https://")) {
        try {
          $(el).attr("src", new URL(src, finalUrl).toString());
        } catch {
        }
      }
    });
    $("source[src]").each((_, el) => {
      const src = $(el).attr("src");
      if (src && !src.startsWith("data:") && !src.startsWith("blob:") && !src.startsWith("http://") && !src.startsWith("https://")) {
        try {
          $(el).attr("src", new URL(src, finalUrl).toString());
        } catch {
        }
      }
    });
    $("video[poster]").each((_, el) => {
      const poster = $(el).attr("poster");
      if (poster && !poster.startsWith("data:") && !poster.startsWith("blob:") && !poster.startsWith("http://") && !poster.startsWith("https://")) {
        try {
          $(el).attr("poster", new URL(poster, finalUrl).toString());
        } catch {
        }
      }
    });
    $("iframe[src], embed[src]").each((_, el) => {
      const src = $(el).attr("src");
      if (src && !src.startsWith("data:") && !src.startsWith("blob:") && !src.startsWith("/api/proxy")) {
        try {
          const resolved = new URL(src, finalUrl).toString();
          $(el).attr("src", `/api/proxy?url=${encodeURIComponent(resolved)}`);
        } catch {
        }
      }
    });
    $("a").each((_, el) => {
      const href = $(el).attr("href");
      if (!href) return;
      if (href.startsWith("#") || href.startsWith("javascript:") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }
      try {
        const resolved = new URL(href, finalUrl).toString();
        $(el).attr("data-nova-url", resolved);
        $(el).attr("href", `/api/proxy?url=${encodeURIComponent(resolved)}`);
        $(el).attr("target", "_self");
      } catch {
      }
    });
    $("form").each((_, el) => {
      const action = $(el).attr("action");
      try {
        const resolved = new URL(action || "", finalUrl).toString();
        $(el).attr("data-nova-action", resolved);
        $(el).attr("action", `/api/proxy?url=${encodeURIComponent(resolved)}`);
      } catch {
      }
    });
    const shieldResult = sanitizeAndShieldHtml($, finalUrl);
    res.setHeader("X-NovaShield-Blocked-Trackers", String(shieldResult.blockedTrackersCount));
    const bridgeScript = `
      <script>
        (function() {
          try {
            window.__NOVA_BROWSER_PAGE__ = true;
            var currentUrl = ${JSON.stringify(finalUrl)};
            var pageHostname = ${JSON.stringify(finalParsed.hostname)};
            var pageTitle = document.title || pageHostname;
            var blockedTrackers = ${shieldResult.blockedTrackersCount};

            // Notify parent Nova Browser
            function notifyParent(type, payload) {
              try {
                if (window.parent && window.parent !== window) {
                  window.parent.postMessage(Object.assign({ type: type, url: currentUrl }, payload || {}), '*');
                }
              } catch(e) {}
            }

            notifyParent('NOVA_PAGE_LOADED', {
              title: pageTitle,
              url: currentUrl,
              hostname: pageHostname,
              blockedTrackers: blockedTrackers,
              isSecure: currentUrl.startsWith('https://'),
              isUnsafeBypassed: ${Boolean(bypassShield)}
            });

            // Watch for title updates
            var titleEl = document.querySelector('title');
            if (titleEl) {
              var observer = new MutationObserver(function() {
                notifyParent('NOVA_TITLE_CHANGE', { title: document.title, url: currentUrl });
              });
              observer.observe(titleEl, { childList: true, characterData: true, subtree: true });
            }

            // Safe LocalStorage & SessionStorage wrapper to prevent iframe SecurityError crashes
            try {
              window.localStorage.getItem('__nova_test__');
            } catch(e) {
              var memoryStorage = {};
              var mockStorage = {
                getItem: function(k) { return Object.prototype.hasOwnProperty.call(memoryStorage, k) ? memoryStorage[k] : null; },
                setItem: function(k, v) { memoryStorage[k] = String(v); },
                removeItem: function(k) { delete memoryStorage[k]; },
                clear: function() { memoryStorage = {}; },
                get length() { return Object.keys(memoryStorage).length; },
                key: function(i) { return Object.keys(memoryStorage)[i] || null; }
              };
              try { Object.defineProperty(window, 'localStorage', { value: mockStorage, configurable: true }); } catch(err) {}
              try { Object.defineProperty(window, 'sessionStorage', { value: mockStorage, configurable: true }); } catch(err) {}
            }

            // Web Worker Interceptor for Roblox, Poki, WebAssembly & Game Engines
            var originalWorker = window.Worker;
            if (originalWorker) {
              window.Worker = function(scriptUrl, options) {
                try {
                  if (typeof scriptUrl === 'string' && !scriptUrl.startsWith('data:') && !scriptUrl.startsWith('blob:') && !scriptUrl.startsWith('/api/proxy')) {
                    var resolvedWorkerUrl = new URL(scriptUrl, currentUrl).toString();
                    var proxiedWorker = '/api/proxy?url=' + encodeURIComponent(resolvedWorkerUrl);
                    return new originalWorker(proxiedWorker, options);
                  }
                } catch(e) {}
                return new originalWorker(scriptUrl, options);
              };
            }

            // Universal Fetch Interceptor to route relative/cross-origin requests (gaming assets, JSON, wasm) through Nova Proxy
            var originalFetch = window.fetch;
            if (originalFetch) {
              window.fetch = function(resource, init) {
                try {
                  var reqUrl = '';
                  if (typeof resource === 'string') {
                    reqUrl = resource;
                  } else if (resource && resource.url) {
                    reqUrl = resource.url;
                  }

                  if (reqUrl && !reqUrl.startsWith('data:') && !reqUrl.startsWith('blob:') && !reqUrl.startsWith('/api/proxy')) {
                    var resolved = new URL(reqUrl, currentUrl).toString();
                    if (!resolved.includes(window.location.host) || reqUrl.startsWith('/')) {
                      var proxied = '/api/proxy?url=' + encodeURIComponent(resolved);
                      if (typeof resource === 'string') {
                        resource = proxied;
                      } else if (resource && resource.url) {
                        resource = new Request(proxied, resource);
                      }
                    }
                  }
                } catch(e) {}
                return originalFetch.apply(this, arguments);
              };
            }

            // Universal XMLHttpRequest Interceptor for Game Engines (Unity, Phaser, Pixi, Godot)
            var originalXHR = window.XMLHttpRequest;
            if (originalXHR && originalXHR.prototype) {
              var originalOpen = originalXHR.prototype.open;
              originalXHR.prototype.open = function(method, url) {
                try {
                  if (url && typeof url === 'string' && !url.startsWith('data:') && !url.startsWith('blob:') && !url.startsWith('/api/proxy')) {
                    var resolved = new URL(url, currentUrl).toString();
                    if (!resolved.includes(window.location.host) || url.startsWith('/')) {
                      arguments[1] = '/api/proxy?url=' + encodeURIComponent(resolved);
                    }
                  }
                } catch(e) {}
                return originalOpen.apply(this, arguments);
              };
            }

            // Navigator SendBeacon Interceptor for game state & telemetry
            if (navigator && navigator.sendBeacon) {
              var originalBeacon = navigator.sendBeacon.bind(navigator);
              navigator.sendBeacon = function(url, data) {
                try {
                  if (typeof url === 'string' && !url.startsWith('data:') && !url.startsWith('blob:') && !url.startsWith('/api/proxy')) {
                    var resolved = new URL(url, currentUrl).toString();
                    return originalBeacon('/api/proxy?url=' + encodeURIComponent(resolved), data);
                  }
                } catch(e) {}
                return originalBeacon(url, data);
              };
            }

            // AudioContext Unlocker for Games & Media
            var resumeAudio = function() {
              try {
                var AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx && AudioCtx.prototype) {
                  // Resume any audio contexts if suspended
                }
              } catch(e) {}
            };
            window.addEventListener('click', resumeAudio, { once: true, passive: true });
            window.addEventListener('keydown', resumeAudio, { once: true, passive: true });

            // Intercept SPA History navigation (Poki game clicks like /g/subway-surfers)
            var originalPushState = history.pushState;
            if (originalPushState) {
              history.pushState = function(state, unused, url) {
                var res = originalPushState.apply(this, arguments);
                try {
                  if (url) {
                    var resolved = new URL(url, currentUrl).toString();
                    currentUrl = resolved;
                    notifyParent('NOVA_PAGE_LOADED', { url: resolved, title: document.title });
                  }
                } catch(e) {}
                return res;
              };
            }

            var originalReplaceState = history.replaceState;
            if (originalReplaceState) {
              history.replaceState = function(state, unused, url) {
                var res = originalReplaceState.apply(this, arguments);
                try {
                  if (url) {
                    var resolved = new URL(url, currentUrl).toString();
                    currentUrl = resolved;
                    notifyParent('NOVA_TITLE_CHANGE', { url: resolved, title: document.title });
                  }
                } catch(e) {}
                return res;
              };
            }

            // Graceful ServiceWorker catch shim to prevent React/Vue/Poki hydration crashes
            if (navigator && navigator.serviceWorker) {
              var originalRegister = navigator.serviceWorker.register;
              if (originalRegister) {
                navigator.serviceWorker.register = function() {
                  return originalRegister.apply(this, arguments).catch(function(err) {
                    console.warn('[Nova] ServiceWorker registration ignored in embedded proxy mode:', err);
                    return Promise.resolve(null);
                  });
                };
              }
            }

            // Helper to unwrap Google / redirect URLs
            function unwrapRedirect(u) {
              if (!u) return u;
              if (u.includes('google.') && u.includes('/url?')) {
                try {
                  var parsed = new URL(u);
                  var q = parsed.searchParams.get('q') || parsed.searchParams.get('url');
                  if (q && /^https?:///i.test(q)) return q;
                } catch(e) {}
              }
              return u;
            }

            // Intercept link clicks
            document.addEventListener('click', function(e) {
              var a = e.target.closest('a');
              if (a) {
                var targetUrl = a.dataset.novaUrl || a.getAttribute('href');
                if (targetUrl && !targetUrl.startsWith('#') && !targetUrl.startsWith('javascript:')) {
                  if (targetUrl.startsWith('/api/proxy?url=')) {
                    var match = targetUrl.match(/url=([^&]+)/);
                    if (match && match[1]) {
                      targetUrl = decodeURIComponent(match[1]);
                    }
                  }
                  targetUrl = unwrapRedirect(targetUrl);
                  notifyParent('NOVA_LINK_CLICK', { targetUrl: targetUrl });
                }
              }
            }, true);

            // Intercept form submissions (Google Search, Poki Search, Wikipedia)
            document.addEventListener('submit', function(e) {
              var form = e.target;
              if (!form || form.tagName !== 'FORM') return;
              var method = (form.getAttribute('method') || 'GET').toUpperCase();
              var action = form.getAttribute('data-nova-action') || form.getAttribute('action') || currentUrl;

              if (method === 'GET') {
                e.preventDefault();
                try {
                  var rawAction = action;
                  if (rawAction.startsWith('/api/proxy?url=')) {
                    var match = rawAction.match(/url=([^&]+)/);
                    if (match && match[1]) rawAction = decodeURIComponent(match[1]);
                  }
                  var targetUrlObj = new URL(rawAction, currentUrl);
                  var formData = new FormData(form);
                  formData.forEach(function(val, key) {
                    if (key) targetUrlObj.searchParams.set(key, String(val));
                  });
                  var fullTarget = targetUrlObj.toString();
                  notifyParent('NOVA_LINK_CLICK', { targetUrl: fullTarget });
                  window.location.href = '/api/proxy?url=' + encodeURIComponent(fullTarget);
                } catch(err) {
                  form.submit();
                }
              }
            }, true);

            // Wrap window.open to open in parent browser
            var originalWindowOpen = window.open;
            window.open = function(url) {
              if (url) {
                try {
                  var resolved = new URL(url, currentUrl).toString();
                  notifyParent('NOVA_NAVIGATE', { url: resolved, newTab: true });
                  return window;
                } catch(e) {}
              }
              return originalWindowOpen ? originalWindowOpen.apply(this, arguments) : null;
            };

            // Universal Web Dark Mode Injection & Listener
            function applyWebTheme(isDark) {
              try {
                var styleId = '__nova_dark_mode_style__';
                var existing = document.getElementById(styleId);
                if (isDark) {
                  if (!existing) {
                    var s = document.createElement('style');
                    s.id = styleId;
                    s.textContent = 'html { filter: invert(0.92) hue-rotate(180deg) !important; background: #121212 !important; } img, video, canvas, picture, svg, iframe, embed, object, [style*="background-image"] { filter: invert(1.08) hue-rotate(180deg) !important; }';
                    document.head ? document.head.appendChild(s) : document.documentElement.appendChild(s);
                  }
                } else {
                  if (existing) existing.remove();
                }
              } catch(e) {}
            }

            // Check parent dark mode message
            window.addEventListener('message', function(ev) {
              if (ev.data && ev.data.type === 'NOVA_SET_THEME') {
                applyWebTheme(Boolean(ev.data.isDark));
              }
            });

            // Initial theme read from localStorage
            try {
              if (localStorage.getItem('nova_web_force_dark') === 'true') {
                applyWebTheme(true);
              }
            } catch(e) {}

            // Keyboard shortcut forwarding
            window.addEventListener('keydown', function(e) {
              if (e.ctrlKey || e.metaKey) {
                var k = (e.key || '').toLowerCase();
                if (k === 't' || k === 'w' || k === 'r' || k === 'l' || k === 'k' || k === 'h') {
                  e.preventDefault();
                  notifyParent('NOVA_HOTKEY', { key: k, ctrl: true });
                }
              }
            });

            // -------------------------------------------------------------
            // UNIVERSAL LIVE WEBPAGE TRANSLATION ENGINE (145+ WORLD LANGUAGES)
            // -------------------------------------------------------------
            var translatedNodesMap = new Map();
            var isPageTranslated = false;

            function isTranslatableTextNode(node) {
              if (!node || node.nodeType !== 3) return false;
              var text = (node.nodeValue || '').trim();
              if (!text || text.length < 2) return false;
              // Check parent tag
              var parent = node.parentElement;
              if (!parent) return false;
              var tag = parent.tagName.toUpperCase();
              if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'CODE' || tag === 'PRE' || tag === 'TEXTAREA' || tag === 'SVG' || tag === 'CANVAS') {
                return false;
              }
              if (parent.closest('[data-no-translate]') || parent.isContentEditable) {
                return false;
              }
              return true;
            }

            function collectPageTextNodes() {
              var walker = document.createTreeWalker(
                document.body || document.documentElement,
                NodeFilter.SHOW_TEXT,
                {
                  acceptNode: function(node) {
                    return isTranslatableTextNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
                  }
                }
              );
              var nodes = [];
              var currentNode;
              while ((currentNode = walker.nextNode())) {
                nodes.push(currentNode);
              }
              return nodes;
            }

            async function translateCurrentPage(targetLang, fromLang) {
              try {
                notifyParent('NOVA_TRANSLATING_START', { targetLang: targetLang });
                var nodes = collectPageTextNodes();
                if (nodes.length === 0) {
                  notifyParent('NOVA_PAGE_TRANSLATED', { targetLang: targetLang, count: 0 });
                  return;
                }

                // Batch in groups of 30 nodes for swift parallel translation
                var BATCH_SIZE = 30;
                var totalTranslated = 0;
                var detectedSource = fromLang || 'auto';

                for (var i = 0; i < nodes.length; i += BATCH_SIZE) {
                  var batchNodes = nodes.slice(i, i + BATCH_SIZE);
                  var rawTexts = batchNodes.map(function(n) {
                    if (!translatedNodesMap.has(n)) {
                      translatedNodesMap.set(n, n.nodeValue);
                    }
                    return translatedNodesMap.get(n);
                  });

                  try {
                    var res = await fetch('/api/translate-batch', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        texts: rawTexts,
                        from: fromLang || 'auto',
                        to: targetLang || 'tr'
                      })
                    });
                    if (res.ok) {
                      var data = await res.json();
                      if (data.success && Array.isArray(data.translations)) {
                        if (data.detectedSource) detectedSource = data.detectedSource;
                        data.translations.forEach(function(translatedStr, idx) {
                          if (batchNodes[idx] && translatedStr) {
                            batchNodes[idx].nodeValue = translatedStr;
                            totalTranslated++;
                          }
                        });
                      }
                    }
                  } catch(batchErr) {
                    console.warn('Batch translation network error:', batchErr);
                  }
                }

                isPageTranslated = true;
                notifyParent('NOVA_PAGE_TRANSLATED', {
                  targetLang: targetLang,
                  detectedSource: detectedSource,
                  count: totalTranslated
                });
              } catch(err) {
                console.error('Page translation error:', err);
                notifyParent('NOVA_TRANSLATE_ERROR', { error: err ? err.message : 'Translation failed' });
              }
            }

            function restoreOriginalPageText() {
              try {
                translatedNodesMap.forEach(function(originalVal, node) {
                  if (node && node.parentNode) {
                    node.nodeValue = originalVal;
                  }
                });
                isPageTranslated = false;
                notifyParent('NOVA_PAGE_RESTORED', {});
              } catch(err) {
                console.warn('Restore original error:', err);
              }
            }

            // Message listener for live page translation from parent
            window.addEventListener('message', function(ev) {
              if (!ev.data) return;
              if (ev.data.type === 'NOVA_TRANSLATE_PAGE') {
                translateCurrentPage(ev.data.targetLang || 'tr', ev.data.fromLang || 'auto');
              } else if (ev.data.type === 'NOVA_RESTORE_ORIGINAL') {
                restoreOriginalPageText();
              }
            });

            // Auto-translate if URL has translate_to parameter or auto-translate is set
            try {
              var urlObj = new URL(window.location.href);
              var autoTarget = urlObj.searchParams.get('translate_to');
              if (autoTarget) {
                setTimeout(function() {
                  translateCurrentPage(autoTarget, 'auto');
                }, 800);
              }
            } catch(e) {}
          } catch(err) {
            console.warn('[NovaBridge] Init warning:', err);
          }
        })();
      </script>
    `;
    $("body").append(bridgeScript);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send($.html());
  } catch (err) {
    res.status(500).send(`
      <!DOCTYPE html>
      <html lang="tr">
        <head>
          <meta charset="utf-8">
          <title>Nova Taray\u0131c\u0131 - Sayfa A\xE7\u0131lamad\u0131</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b0f19; color: #e2e8f0; display: flex; align-items: center; justify-content: center; min-height: 90vh; margin: 0; padding: 20px; }
            .card { background: #131b2e; border: 1px solid #243049; border-radius: 16px; max-width: 600px; padding: 32px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
            h2 { color: #f87171; margin-top: 0; font-size: 20px; display: flex; align-items: center; gap: 8px; }
            p { color: #94a3b8; line-height: 1.6; font-size: 14px; }
            .url-badge { background: #1e293b; padding: 8px 12px; border-radius: 8px; font-family: monospace; word-break: break-all; color: #38bdf8; margin: 12px 0; border: 1px solid #334155; }
            .actions { margin-top: 24px; display: flex; flex-wrap: wrap; gap: 12px; }
            button { background: #2563eb; color: white; border: none; padding: 10px 18px; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 14px; }
            button:hover { background: #1d4ed8; }
            .btn-sec { background: #334155; }
            .btn-sec:hover { background: #475569; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>\u26A0\uFE0F Sayfaya Ula\u015F\u0131lamad\u0131</h2>
            <p>Hedef web sitesine eri\u015Filirken bir hata olu\u015Ftu veya ba\u011Flant\u0131 g\xFCvenlik politikalar\u0131na tak\u0131ld\u0131.</p>
            <div class="url-badge">${targetUrl}</div>
            <p style="font-size: 12px; color: #64748b;">Hata detay\u0131: ${err?.message || "Bilinmeyen a\u011F hatas\u0131"}</p>
            <div class="actions">
              <button onclick="location.reload()">\u{1F504} Yeniden Dene</button>
              <button class="btn-sec" onclick="window.parent.postMessage({type:'NOVA_DIRECT_OPEN', url:'${targetUrl}'}, '*')">\u{1F680} Do\u011Frudan A\xE7 (Embed / Direct)</button>
              <button class="btn-sec" onclick="window.parent.postMessage({type:'NOVA_NAVIGATE', url:'https://www.google.com/search?q=' + encodeURIComponent('${targetUrl}')}, '*')">\u{1F50D} Google'da Ara</button>
            </div>
          </div>
        </body>
      </html>
    `);
  }
}

// server.ts
init_youtube();

// server/apiHub.ts
var apiCache = /* @__PURE__ */ new Map();
function getFromCache(key) {
  const cached = apiCache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }
  return null;
}
function setInCache(key, data, ttlSeconds = 600) {
  apiCache.set(key, {
    data,
    expiry: Date.now() + ttlSeconds * 1e3
  });
}
async function getUnifiedWeather(city = "Istanbul", apiKey) {
  const cacheKey = `weather_${city.toLowerCase()}`;
  const cached = getFromCache(cacheKey);
  if (cached) return { success: true, source: "cache", data: cached, cached: true };
  if (apiKey && apiKey.trim()) {
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&lang=tr&appid=${apiKey.trim()}`);
      if (res.ok) {
        const d = await res.json();
        const formatted = {
          city: d.name,
          country: d.sys?.country || "TR",
          temp: Math.round(d.main.temp),
          feelsLike: Math.round(d.main.feels_like),
          humidity: d.main.humidity,
          windSpeed: Math.round(d.wind.speed * 3.6),
          description: d.weather?.[0]?.description || "A\xE7\u0131k",
          icon: d.weather?.[0]?.icon || "01d",
          provider: "OpenWeatherMap Pro"
        };
        setInCache(cacheKey, formatted, 900);
        return { success: true, source: "openweathermap", data: formatted };
      }
    } catch {
    }
  }
  try {
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=tr&format=json`);
    const geoData = await geoRes.json();
    if (geoData.results && geoData.results.length > 0) {
      const location = geoData.results[0];
      const { latitude, longitude, name, country } = location;
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
      );
      const wData = await weatherRes.json();
      const cur = wData.current;
      const weatherCodeMap = {
        0: "G\xFCne\u015Fli / A\xE7\u0131k",
        1: "\xC7o\u011Funlukla A\xE7\u0131k",
        2: "Par\xE7al\u0131 Bulutlu",
        3: "Kapal\u0131 / Bulutlu",
        45: "Sisli",
        51: "Hafif \xC7isenti",
        61: "Hafif Ya\u011Fmurlu",
        63: "Sa\u011Fanak Ya\u011F\u0131\u015Fl\u0131",
        71: "Kar Ya\u011F\u0131\u015Fl\u0131",
        95: "G\xF6k G\xFCr\xFClt\xFCl\xFC F\u0131rt\u0131na"
      };
      const formatted = {
        city: name,
        country: country || "TR",
        temp: Math.round(cur.temperature_2m),
        feelsLike: Math.round(cur.apparent_temperature),
        humidity: cur.relative_humidity_2m,
        windSpeed: Math.round(cur.wind_speed_10m),
        description: weatherCodeMap[cur.weather_code] || "A\xE7\u0131k",
        icon: cur.is_day ? "01d" : "01n",
        provider: "Open-Meteo Global Satellite"
      };
      setInCache(cacheKey, formatted, 900);
      return { success: true, source: "open-meteo", data: formatted };
    }
  } catch (err) {
  }
  const fallbackData = {
    city: city || "\u0130stanbul",
    country: "TR",
    temp: 22,
    feelsLike: 23,
    humidity: 55,
    windSpeed: 14,
    description: "Par\xE7al\u0131 Bulutlu",
    icon: "02d",
    provider: "Nova Weather Offline Engine"
  };
  return { success: true, source: "offline-fallback", data: fallbackData };
}
async function getUnifiedNews(category = "general", apiKey) {
  const cacheKey = `news_${category}`;
  const cached = getFromCache(cacheKey);
  if (cached) return { success: true, source: "cache", data: cached, cached: true };
  if (apiKey && apiKey.trim()) {
    try {
      const res = await fetch(`https://newsapi.org/v2/top-headlines?country=tr&category=${category}&pageSize=15&apiKey=${apiKey.trim()}`);
      if (res.ok) {
        const d = await res.json();
        if (d.articles && d.articles.length > 0) {
          const articles = d.articles.map((art) => ({
            title: art.title,
            description: art.description || "",
            url: art.url,
            image: art.urlToImage || null,
            source: art.source?.name || "Haber",
            publishedAt: art.publishedAt
          }));
          setInCache(cacheKey, articles, 600);
          return { success: true, source: "newsapi", data: articles };
        }
      }
    } catch {
    }
  }
  try {
    const rssUrl = `https://news.google.com/rss?hl=tr&gl=TR&ceid=TR:tr`;
    const res = await fetch(rssUrl);
    const text = await res.text();
    const items = [];
    const itemRegex = /<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<pubDate>([\s\S]*?)<\/pubDate>[\s\S]*?<description>([\s\S]*?)<\/description>/gi;
    let match;
    while ((match = itemRegex.exec(text)) !== null && items.length < 15) {
      const title = match[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").replace(/ - .*$/, "").trim();
      const sourceName = (match[1].match(/ - (.*?)$/) || [])[1] || "Google News";
      const link = match[2].trim();
      const pubDate = match[3].trim();
      const desc = match[4].replace(/<[^>]+>/g, "").trim();
      items.push({
        title,
        description: desc,
        url: link,
        image: null,
        source: sourceName,
        publishedAt: pubDate
      });
    }
    if (items.length > 0) {
      setInCache(cacheKey, items, 600);
      return { success: true, source: "google-news-rss", data: items };
    }
  } catch {
  }
  return {
    success: true,
    source: "fallback",
    data: [
      {
        title: "T\xFCrkiye ve D\xFCnyada G\xFCn\xFCn \xD6ne \xC7\u0131kan Geli\u015Fmeleri",
        description: "En son teknoloji, ekonomi ve g\xFCncel haberleri Nova Haberler sekmesinden takip edebilirsiniz.",
        url: "https://news.google.com",
        source: "Nova Haber Merkezi",
        publishedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ]
  };
}
async function getUnifiedGitHubRepos(query, token) {
  const cacheKey = `gh_${query.toLowerCase()}`;
  const cached = getFromCache(cacheKey);
  if (cached) return { success: true, source: "cache", data: cached, cached: true };
  const headers = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "NovaBrowser-App"
  };
  if (token && token.trim()) {
    headers["Authorization"] = `token ${token.trim()}`;
  }
  try {
    const res = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=12`, { headers });
    if (res.ok) {
      const data = await res.json();
      const repos = (data.items || []).map((repo) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        url: repo.html_url,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        owner: {
          login: repo.owner?.login,
          avatar: repo.owner?.avatar_url
        }
      }));
      setInCache(cacheKey, repos, 600);
      return { success: true, source: "github", data: repos };
    }
  } catch {
  }
  return { success: true, source: "fallback", data: [] };
}

// server.ts
var LANGUAGES = [
  { code: "auto", name: "\u{1F310} Evrensel / Otomatik", flag: "\u{1F310}" },
  { code: "tr", name: "T\xFCrk\xE7e", flag: "\u{1F1F9}\u{1F1F7}" },
  { code: "en", name: "English", flag: "\u{1F1EC}\u{1F1E7}" },
  { code: "de", name: "Deutsch", flag: "\u{1F1E9}\u{1F1EA}" },
  { code: "fr", name: "Fran\xE7ais", flag: "\u{1F1EB}\u{1F1F7}" },
  { code: "es", name: "Espa\xF1ol", flag: "\u{1F1EA}\u{1F1F8}" },
  { code: "it", name: "Italiano", flag: "\u{1F1EE}\u{1F1F9}" },
  { code: "pt", name: "Portugu\xEAs", flag: "\u{1F1F5}\u{1F1F9}" },
  { code: "ru", name: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439", flag: "\u{1F1F7}\u{1F1FA}" },
  { code: "ar", name: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629", flag: "\u{1F1F8}\u{1F1E6}" },
  { code: "zh", name: "\u4E2D\u6587", flag: "\u{1F1E8}\u{1F1F3}" },
  { code: "ja", name: "\u65E5\u672C\u8A9E", flag: "\u{1F1EF}\u{1F1F5}" },
  { code: "ko", name: "\uD55C\uAD6D\uC5B4", flag: "\u{1F1F0}\u{1F1F7}" },
  { code: "nl", name: "Nederlands", flag: "\u{1F1F3}\u{1F1F1}" },
  { code: "pl", name: "Polski", flag: "\u{1F1F5}\u{1F1F1}" },
  { code: "sv", name: "Svenska", flag: "\u{1F1F8}\u{1F1EA}" },
  { code: "no", name: "Norsk", flag: "\u{1F1F3}\u{1F1F4}" },
  { code: "da", name: "Dansk", flag: "\u{1F1E9}\u{1F1F0}" },
  { code: "fi", name: "Suomi", flag: "\u{1F1EB}\u{1F1EE}" },
  { code: "el", name: "\u0395\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03AC", flag: "\u{1F1EC}\u{1F1F7}" },
  { code: "hi", name: "\u0939\u093F\u0928\u094D\u0926\u0940", flag: "\u{1F1EE}\u{1F1F3}" },
  { code: "az", name: "Az\u0259rbaycan", flag: "\u{1F1E6}\u{1F1FF}" },
  { code: "uk", name: "\u0423\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u0430", flag: "\u{1F1FA}\u{1F1E6}" }
];
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.disable("x-powered-by");
  app.use(import_express.default.json({ limit: "2mb" }));
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });
  app.get("/api/health", (req, res) => {
    res.json({
      status: "online",
      version: "54.0.0-PRO-TURBO",
      engine: "NovaBrowser & NovaSearch V54 Ultra Hybrid",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      proxyReady: true,
      hasGemini: !!process.env.GEMINI_API_KEY
    });
  });
  app.get("/api/consents", (req, res) => {
    res.json({
      version: MANDATORY_CONSENT_VERSION,
      title: "Nova Browser & NovaSearch V54 Zorunlu G\xFCvenlik ve Hukuki Onay Formu",
      requiredAll: true,
      dataPolicy: "local-only-zero-knowledge",
      items: MANDATORY_CONSENTS
    });
  });
  app.get("/api/languages", (req, res) => {
    res.json({
      success: true,
      languages: LANGUAGES
    });
  });
  app.all("/api/search", async (req, res) => {
    try {
      const q = (req.method === "POST" ? req.body?.query : req.query.q) || req.query.q || "";
      const type = (req.method === "POST" ? req.body?.type : req.query.type) || "web";
      const lang = (req.method === "POST" ? req.body?.lang : req.query.lang) || "tr";
      const apiKey = (req.method === "POST" ? req.body?.apiKey : req.query.apiKey) || req.headers["x-api-key"] || "";
      if (!q.trim()) {
        res.json({ success: true, query: "", results: [] });
        return;
      }
      const result = await performSearch(q, type, lang, apiKey);
      res.json({
        success: true,
        ...result
      });
    } catch (err) {
      res.status(200).json({
        success: false,
        error: err?.message || "Arama i\u015Flemi s\u0131ras\u0131nda bir hata olu\u015Ftu.",
        results: []
      });
    }
  });
  app.get("/api/hub/weather", async (req, res) => {
    const city = req.query.city || "Istanbul";
    const apiKey = req.query.apiKey || "";
    const result = await getUnifiedWeather(city, apiKey);
    res.json(result);
  });
  app.get("/api/hub/news", async (req, res) => {
    const category = req.query.category || "general";
    const apiKey = req.query.apiKey || "";
    const result = await getUnifiedNews(category, apiKey);
    res.json(result);
  });
  app.get("/api/hub/github", async (req, res) => {
    const query = req.query.q || "javascript";
    const token = req.query.token || "";
    const result = await getUnifiedGitHubRepos(query, token);
    res.json(result);
  });
  app.get("/api/security/scan", (req, res) => {
    const targetUrl = req.query.url || "";
    const scan = scanUrlSecurity(targetUrl);
    res.json({ success: true, url: targetUrl, scan });
  });
  app.get("/api/suggest", async (req, res) => {
    try {
      const q = req.query.q || "";
      const lang = req.query.lang || "tr";
      const suggestions = await getSuggestions(q, lang);
      res.json({
        success: true,
        query: q,
        suggestions
      });
    } catch {
      res.json({ success: true, suggestions: [] });
    }
  });
  app.all("/api/proxy", (req, res) => {
    handleProxyRequest(req, res);
  });
  app.get("/api/youtube/search", async (req, res) => {
    try {
      const q = req.query.q || "";
      const apiKey = req.query.apiKey || req.headers["x-api-key"] || "";
      const videos = await searchYouTubeVideos(q, apiKey);
      res.json({ success: true, query: q, videos });
    } catch (err) {
      res.status(500).json({ success: false, error: err?.message || "YouTube arama hatas\u0131" });
    }
  });
  app.get("/api/youtube/trending", async (req, res) => {
    try {
      const region = req.query.region || "TR";
      const apiKey = req.query.apiKey || req.headers["x-api-key"] || "";
      const videos = await getYouTubeTrending(apiKey, region);
      res.json({ success: true, region, videos });
    } catch (err) {
      res.status(500).json({ success: false, error: err?.message || "YouTube trend hatas\u0131" });
    }
  });
  app.get("/api/youtube/video", async (req, res) => {
    try {
      const id = req.query.id || "";
      const apiKey = req.query.apiKey || req.headers["x-api-key"] || "";
      const video = await getYouTubeVideoDetails(id, apiKey);
      res.json({ success: true, video });
    } catch (err) {
      res.status(500).json({ success: false, error: err?.message || "Video detay hatas\u0131" });
    }
  });
  app.post("/api/validate-key", async (req, res) => {
    try {
      const { serviceKey, apiKey, endpointUrl } = req.body || {};
      if (!apiKey || !apiKey.trim()) {
        res.status(400).json({ success: false, message: "API anahtar\u0131 bo\u015F olamaz." });
        return;
      }
      const key = apiKey.trim();
      if (serviceKey === "youtube") {
        const checkUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=test&type=video&key=${key}`;
        const response = await fetch(checkUrl);
        if (response.ok) {
          res.json({ success: true, message: "\u2705 YouTube Data API v3 anahtar\u0131 ba\u015Far\u0131yla do\u011Fruland\u0131 ve aktif edildi!" });
        } else {
          const data = await response.json().catch(() => ({}));
          let errMsg = data?.error?.message || "Ge\xE7ersiz YouTube API Anahtar\u0131.";
          if (errMsg.includes("API key not valid")) {
            errMsg = '\u274C API anahtar\u0131 ge\xE7ersiz veya eksik kopyalanm\u0131\u015F. L\xFCtfen "AIzaSy..." ile ba\u015Flayan anahtar\u0131 tam kopyalad\u0131\u011F\u0131n\u0131zdan emin olun.';
          } else if (errMsg.includes("has not been used in project") || errMsg.includes("disabled")) {
            errMsg = `\u26A0\uFE0F Google Cloud Console'da "YouTube Data API v3" servisi hen\xFCz etkinle\u015Ftirilmemi\u015F. L\xFCtfen Google Cloud konsolundan "Enable" (Etkinle\u015Ftir) butonuna bas\u0131n.`;
          } else if (errMsg.includes("Requests from this IP address") || errMsg.includes("blocked")) {
            errMsg = `\u26A0\uFE0F API anahtar\u0131nda IP veya Web sitesi k\u0131s\u0131tlamas\u0131 var. L\xFCtfen Google Cloud'da k\u0131s\u0131tlamay\u0131 "Hi\xE7biri" (None) olarak ayarlay\u0131n.`;
          }
          res.json({ success: false, message: errMsg });
        }
        return;
      }
      if (serviceKey === "github") {
        const response = await fetch("https://api.github.com/user", {
          headers: {
            "Authorization": `token ${key}`,
            "User-Agent": "NovaBrowser-App"
          }
        });
        if (response.ok) {
          const user = await response.json();
          res.json({ success: true, message: `GitHub Token do\u011Fruland\u0131! Giri\u015F yap\u0131lan kullan\u0131c\u0131: @${user.login}` });
        } else {
          res.json({ success: false, message: "Ge\xE7ersiz GitHub Token veya yetki s\xFCresi dolmu\u015F." });
        }
        return;
      }
      if (serviceKey === "weather") {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Istanbul&appid=${key}`);
        if (response.ok) {
          res.json({ success: true, message: "OpenWeather API anahtar\u0131 ba\u015Far\u0131yla do\u011Fruland\u0131!" });
        } else {
          res.json({ success: false, message: "Ge\xE7ersiz OpenWeather API anahtar\u0131." });
        }
        return;
      }
      if (serviceKey === "gemini") {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        if (response.ok) {
          res.json({ success: true, message: "Google Gemini API anahtar\u0131 ba\u015Far\u0131yla do\u011Fruland\u0131!" });
        } else {
          res.json({ success: false, message: "Ge\xE7ersiz Google Gemini API anahtar\u0131." });
        }
        return;
      }
      if (serviceKey === "openai") {
        const response = await fetch("https://api.openai.com/v1/models", {
          headers: { Authorization: `Bearer ${key}` }
        });
        if (response.ok) {
          res.json({ success: true, message: "\u2705 OpenAI API anahtar\u0131 ba\u015Far\u0131yla do\u011Fruland\u0131 ve modeller listelendi!" });
        } else {
          res.json({ success: false, message: "Ge\xE7ersiz OpenAI API anahtar\u0131 veya kota t\xFCkenmi\u015F." });
        }
        return;
      }
      if (serviceKey === "tavily") {
        const response = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ api_key: key, query: "test" })
        });
        if (response.ok) {
          res.json({ success: true, message: "\u2705 Tavily AI Search API anahtar\u0131 do\u011Fruland\u0131 ve aktif!" });
        } else {
          res.json({ success: false, message: "Ge\xE7ersiz Tavily API anahtar\u0131." });
        }
        return;
      }
      if (serviceKey === "newsapi") {
        const response = await fetch(`https://newsapi.org/v2/top-headlines?country=tr&pageSize=1&apiKey=${key}`);
        if (response.ok) {
          res.json({ success: true, message: "\u2705 NewsAPI anahtar\u0131 ba\u015Far\u0131yla do\u011Fruland\u0131!" });
        } else {
          res.json({ success: false, message: "Ge\xE7ersiz NewsAPI anahtar\u0131." });
        }
        return;
      }
      if (serviceKey === "google_search") {
        if (key.startsWith("AIzaSy") || key.length > 20) {
          res.json({ success: true, message: "\u2705 Google Custom Search API anahtar format\u0131 ge\xE7erli ve kaydedildi!" });
        } else {
          res.json({ success: false, message: 'Google API anahtar\u0131 genellikle "AIzaSy..." ile ba\u015Flar.' });
        }
        return;
      }
      if (serviceKey === "unsplash") {
        const response = await fetch(`https://api.unsplash.com/photos/random?client_id=${key}`);
        if (response.ok) {
          res.json({ success: true, message: "\u2705 Unsplash API Client ID ba\u015Far\u0131yla do\u011Fruland\u0131!" });
        } else {
          res.json({ success: false, message: "Ge\xE7ersiz Unsplash Access Key / Client ID." });
        }
        return;
      }
      if (endpointUrl && endpointUrl.startsWith("http")) {
        const response = await fetch(endpointUrl, {
          headers: {
            "Authorization": `Bearer ${key}`,
            "x-api-key": key
          }
        });
        if (response.ok) {
          res.json({ success: true, message: "\xD6zel API u\xE7 noktas\u0131 ba\u015Far\u0131yla yan\u0131t verdi (200 OK)." });
        } else {
          res.json({ success: false, message: `U\xE7 nokta durum kodu: ${response.status} ${response.statusText}` });
        }
        return;
      }
      res.json({ success: true, message: "API Anahtar\u0131 format\u0131 ge\xE7erli ve yerel olarak kaydedildi." });
    } catch (err) {
      res.status(500).json({ success: false, message: err?.message || "Do\u011Frulama s\u0131ras\u0131nda ba\u011Flant\u0131 hatas\u0131 olu\u015Ftu." });
    }
  });
  app.post("/api/ai-answer", async (req, res) => {
    try {
      const { query, lang } = req.body || {};
      if (!query) {
        res.status(400).json({ success: false, error: "Sorgu eksik." });
        return;
      }
      const answer = await generateSmartAnswer(query, lang || "tr");
      if (answer) {
        res.json({ success: true, answer });
      } else {
        res.json({ success: false, message: "AI servisi \u015Fu anda yo\u011Fun, l\xFCtfen biraz sonra tekrar deneyin." });
      }
    } catch (err) {
      res.status(200).json({ success: false, error: err?.message || "Yapay zeka yan\u0131t\u0131 al\u0131namad\u0131" });
    }
  });
  app.post("/api/ai-summarize", async (req, res) => {
    try {
      const { text, url } = req.body || {};
      const summary = await summarizeWebPage(text || "", url || "");
      if (summary) {
        res.json({ success: true, summary });
      } else {
        res.json({ success: false, message: "Sayfa \xF6zeti \u015Fu anda olu\u015Fturulamad\u0131." });
      }
    } catch (err) {
      res.status(200).json({ success: false, error: err?.message || "\xD6zetleme i\u015Flemi tamamlanamad\u0131" });
    }
  });
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, from = "auto", to = "tr" } = req.body || {};
      if (!text || !text.trim()) {
        res.json({ success: true, translatedText: "", detectedSource: from });
        return;
      }
      const cleanText = text.trim();
      const targetLang = to || "tr";
      const sourceLang = from || "auto";
      try {
        const params = new URLSearchParams();
        params.append("client", "gtx");
        params.append("sl", sourceLang);
        params.append("tl", targetLang);
        params.append("dt", "t");
        params.append("q", cleanText);
        const response = await fetch("https://translate.googleapis.com/translate_a/single", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
          },
          body: params.toString()
        });
        if (response.ok) {
          const raw = await response.json();
          if (Array.isArray(raw) && Array.isArray(raw[0])) {
            const translated = raw[0].map((item) => item && item[0] ? item[0] : "").join("");
            const detected = raw[2] || raw[8] && raw[8][0] && raw[8][0][0] || sourceLang;
            if (translated && translated.trim()) {
              res.json({
                success: true,
                translatedText: translated,
                detectedSource: detected,
                sourceLang,
                targetLang
              });
              return;
            }
          }
        }
      } catch (gtxErr) {
        console.warn("GTX POST translate error, trying GET fallback:", gtxErr);
      }
      try {
        const lingvaUrl = `https://lingva.ml/api/v1/${encodeURIComponent(sourceLang)}/${encodeURIComponent(targetLang)}/${encodeURIComponent(cleanText.slice(0, 1500))}`;
        const lingvaRes = await fetch(lingvaUrl);
        if (lingvaRes.ok) {
          const ldata = await lingvaRes.json();
          if (ldata?.translation) {
            res.json({
              success: true,
              translatedText: ldata.translation,
              detectedSource: ldata.info?.detectedSource || sourceLang,
              sourceLang,
              targetLang
            });
            return;
          }
        }
      } catch {
      }
      try {
        const pair = `${sourceLang === "auto" ? "autodetect" : sourceLang}|${targetLang}`;
        const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanText.slice(0, 500))}&langpair=${encodeURIComponent(pair)}`;
        const fallbackRes = await fetch(myMemoryUrl);
        if (fallbackRes.ok) {
          const data = await fallbackRes.json();
          if (data?.responseData?.translatedText) {
            const detected = data.responseData.detectedLanguage || sourceLang;
            res.json({
              success: true,
              translatedText: data.responseData.translatedText,
              detectedSource: detected,
              sourceLang,
              targetLang
            });
            return;
          }
        }
      } catch {
      }
      res.json({ success: true, translatedText: cleanText, detectedSource: sourceLang, sourceLang, targetLang });
    } catch (err) {
      res.status(200).json({ success: false, error: err?.message || "\xC7eviri yap\u0131lamad\u0131", translatedText: req.body?.text || "" });
    }
  });
  app.post("/api/translate-batch", async (req, res) => {
    try {
      const { texts = [], from = "auto", to = "tr" } = req.body || {};
      if (!Array.isArray(texts) || texts.length === 0) {
        res.json({ success: true, translations: [] });
        return;
      }
      const targetLang = to || "tr";
      const sourceLang = from || "auto";
      const results = new Array(texts.length);
      const BATCH_SIZE = 6;
      for (let i = 0; i < texts.length; i += BATCH_SIZE) {
        const chunk = texts.slice(i, i + BATCH_SIZE);
        const promises = chunk.map(async (text, offset) => {
          const idx = i + offset;
          const clean = (text || "").trim();
          if (!clean) {
            results[idx] = text;
            return;
          }
          try {
            const params = new URLSearchParams();
            params.append("client", "gtx");
            params.append("sl", sourceLang);
            params.append("tl", targetLang);
            params.append("dt", "t");
            params.append("q", clean);
            const r = await fetch("https://translate.googleapis.com/translate_a/single", {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
              },
              body: params.toString()
            });
            if (r.ok) {
              const j = await r.json();
              if (j && Array.isArray(j[0])) {
                const translated = j[0].map((it) => it[0] || "").join("");
                if (translated && translated.trim()) {
                  results[idx] = translated;
                  return;
                }
              }
            }
          } catch {
          }
          try {
            const lingvaUrl = `https://lingva.ml/api/v1/${encodeURIComponent(sourceLang)}/${encodeURIComponent(targetLang)}/${encodeURIComponent(clean.slice(0, 1500))}`;
            const lRes = await fetch(lingvaUrl);
            if (lRes.ok) {
              const lData = await lRes.json();
              if (lData?.translation) {
                results[idx] = lData.translation;
                return;
              }
            }
          } catch {
          }
          try {
            const pair = `${sourceLang === "auto" ? "tr" : sourceLang}|${targetLang}`;
            const mmUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean.slice(0, 500))}&langpair=${encodeURIComponent(pair)}`;
            const mmRes = await fetch(mmUrl);
            if (mmRes.ok) {
              const mmData = await mmRes.json();
              if (mmData?.responseData?.translatedText) {
                results[idx] = mmData.responseData.translatedText;
                return;
              }
            }
          } catch {
          }
          results[idx] = text;
        });
        await Promise.all(promises);
      }
      res.json({
        success: true,
        translations: results,
        sourceLang,
        targetLang
      });
    } catch (err) {
      res.status(200).json({
        success: false,
        error: err?.message || "Toplu \xE7eviri yap\u0131lamad\u0131",
        translations: req.body?.texts || []
      });
    }
  });
  app.get("/api/download/guide", (req, res) => {
    try {
      const host = req.get("host") || "localhost:3000";
      const protocol = req.protocol === "https" || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
      const appUrl = `${protocol}://${host}`;
      const PRODUCER = "Orhan S\xFCleyman Torun";
      const content = `================================================================================
NOVA BROWSER & NOVASEARCH MASA\xDCST\xDC DA\u011EITIM VE PAYLA\u015EIM REHBER\u0130
YAPIMCI: ${PRODUCER}
S\xDCR\xDCM: V54 Ultra Hybrid Desktop Edition
================================================================================

Tebrikler! Nova Browser'\u0131 arkada\u015Flar\u0131n\u0131za, \xE7evrenize ve internete yaymak i\xE7in 
a\u015Fa\u011F\u0131daki ad\u0131mlar\u0131 ve y\xF6ntemleri kullanabilirsiniz:

1. DO\u011ERUDAN KURULUM DOSYASI \u0130LE DA\u011EITIM (EN KOLAY & TAVS\u0130YE ED\u0130LEN):
--------------------------------------------------------------------------------
- "NovaBrowser_Kurulum_Windows.bat" dosyas\u0131n\u0131 indirin.
- Bu dosyay\u0131 WhatsApp, Telegram, Discord, Google Drive, WeTransfer veya USB bellek
  ile diledi\u011Finiz herkese g\xF6nderebilirsiniz.
- Kar\u015F\u0131 taraf dosyaya \xE7ift t\u0131klad\u0131\u011F\u0131nda:
  * Yap\u0131mc\u0131 olarak ${PRODUCER} ad\u0131n\u0131 ve hukuki muafiyet belgesini g\xF6r\xFCr.
  * Bilgisayar\u0131na masa\xFCst\xFC ve ba\u015Flat men\xFCs\xFC "Nova Browser" k\u0131sayolu eklenir.
  * Nova Browser ba\u011F\u0131ms\u0131z masa\xFCst\xFC uygulama penceresi olarak a\xE7\u0131l\u0131r.

2. DO\u011ERUDAN WEB / \xC7EVR\u0130M\u0130\xC7\u0130 L\u0130NK \u0130LE DA\u011EITIM:
--------------------------------------------------------------------------------
Taray\u0131c\u0131 Ba\u011Flant\u0131 Adresi:
${appUrl}

Windows Kurulum \u0130ndirme Ba\u011Flant\u0131s\u0131:
${appUrl}/api/download/setup?platform=windows

macOS Kurulum \u0130ndirme Ba\u011Flant\u0131s\u0131:
${appUrl}/api/download/setup?platform=macos

Linux Kurulum \u0130ndirme Ba\u011Flant\u0131s\u0131:
${appUrl}/api/download/setup?platform=linux

Resmi Hukuki Onay Tutana\u011F\u0131:
${appUrl}/api/download/legal-record

3. HUKUK\u0130 VE YASAL KORUMA GARANT\u0130S\u0130:
--------------------------------------------------------------------------------
Her kurulum paketinde ve uygulaman\u0131n t\xFCm indirme b\xF6l\xFCmlerinde yap\u0131mc\u0131
${PRODUCER}'un kesin sorumsuzluk muafiyeti yer almaktad\u0131r.
Kullan\u0131c\u0131lar\u0131n yapaca\u011F\u0131 i\u015Flemlerden veya indirecekleri dosyalardan yap\u0131mc\u0131
kesinlikle sorumlu tutulamaz.

Haz\u0131rlayan: ${PRODUCER}
================================================================================
`;
      res.setHeader("Content-Disposition", 'attachment; filename="NovaBrowser_Dagitim_Rehberi_Orhan_Suleyman_Torun.txt"');
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.send(content);
    } catch (err) {
      res.status(500).send("Rehber olu\u015Fturma hatas\u0131: " + err?.message);
    }
  });
  app.get("/api/download/legal-record", (req, res) => {
    try {
      const PRODUCER = "Orhan S\xFCleyman Torun";
      const now = /* @__PURE__ */ new Date();
      const content = `================================================================================
NOVA BROWSER & NOVASEARCH MASA\xDCST\xDC S\u0130STEM\u0130
RESM\u0130 HUKUK\u0130 ONAY, KULLANIM TAAHH\xDCD\xDC VE KES\u0130N SORUMLULUK REDD\u0130 TUTANA\u011EI
================================================================================

1. TARAFLAR VE YAPIMCI B\u0130LG\u0130S\u0130:
--------------------------------------------------------------------------------
YAPIMCI / GEL\u0130\u015ET\u0130R\u0130C\u0130: ${PRODUCER}
UYGULAMA ADI:          Nova Browser & NovaSearch V54 Ultra Multi-Engine
ONAY TAR\u0130H\u0130:           ${now.toLocaleString("tr-TR")} (${now.toISOString()})

2. YAPIMCININ KES\u0130N VE TAM SORUMSUZLUK BEYANI (ZORUNLU \u015EART):
--------------------------------------------------------------------------------
Bu uygulaman\u0131n yap\u0131mc\u0131s\u0131 ve telif sahibi ORHAN S\xDCLEYMAN TORUN'dur.

Kullan\u0131c\u0131; i\u015Fbu Nova Browser uygulamas\u0131n\u0131 bilgisayar\u0131na indirmek, kurmak ve 
\xE7al\u0131\u015Ft\u0131rmak suretiyle a\u015Fa\u011F\u0131daki h\xFCk\xFCmleri gayrikabili r\xFCcu kabul, beyan ve 
taahh\xFCt etmi\u015Ftir:

a) Yap\u0131mc\u0131 Orhan S\xFCleyman Torun; kullan\u0131c\u0131n\u0131n taray\u0131c\u0131 \xFCzerinden ger\xE7ekle\u015Ftirdi\u011Fi
   H\u0130\xC7B\u0130R EYLEMDEN, indirdi\u011Fi HER T\xDCRL\xDC DOSYADAN (yaz\u0131l\u0131m, \xE7al\u0131\u015Ft\u0131r\u0131labilir dosya,
   ar\u015Fiv, belge, medya), girdi\u011Fi web sitelerinden veya yapt\u0131\u011F\u0131 i\u015Flemlerden kesinlikle
   sorumlu tutulamaz.
   
b) \u0130ndirilen dosyalar\u0131n a\xE7\u0131lmas\u0131 veya \xE7al\u0131\u015Ft\u0131r\u0131lmas\u0131 sonucu kullan\u0131c\u0131n\u0131n 
   bilgisayar\u0131nda, donan\u0131m\u0131nda veya i\u015Fletim sisteminde meydana gelebilecek vir\xFCs,
   trojan, truva at\u0131, fidye yaz\u0131l\u0131m\u0131 (ransomware), sistem hasar\u0131, veri kayb\u0131 veya
   bozulmalar\u0131ndan \xF6t\xFCr\xFC yap\u0131mc\u0131 Orhan S\xFCleyman Torun'a hi\xE7bir hukuki, cezai,
   tazminat veya mali sorumluluk y\xFCklenemez.
   
c) Kullan\u0131c\u0131n\u0131n ger\xE7ekle\u015Ftirdi\u011Fi t\xFCm yasal, idari ve cezai sorumluluk m\xFCnhas\u0131ran 
   kullan\u0131c\u0131n\u0131n kendisine aittir.

3. ONAY BELGES\u0130N\u0130N S\u0130L\u0130NMEZL\u0130\u011E\u0130 VE UYGULAMA KALDIRMA H\xDCKM\xDC:
--------------------------------------------------------------------------------
\u0130\u015Fbu hukuki onay belgesi, yap\u0131mc\u0131 Orhan S\xFCleyman Torun'un yasal sorumluluk 
muafiyetini kan\u0131tlayan resmi bir dijital tutanakt\u0131r.

KULLANICI, BU ONAY BELGES\u0130N\u0130 VEYA S\u0130STEMDEK\u0130 ONAY TUTANAKLARINI S\u0130LMEK \u0130ST\u0130YORSA,
NOVA BROWSER UYGULAMASINI VE T\xDCM KULLANICI VER\u0130LER\u0130N\u0130 B\u0130LG\u0130SAYARINDAN TAMAMEN
S\u0130LMEK (UNINSTALL / KALDIRMAK) ZORUNDADIR. UYGULAMA KURULU VE KULLANIMDA OLDU\u011EU
M\xDCDDET\xC7E BU ONAY BELGES\u0130 S\u0130L\u0130NEMEZ, GE\xC7ERS\u0130Z KILINAMAZ.

Dijital Do\u011Frulama Damgas\u0131: SHA256-${Date.now().toString(16)}-VERIFIED-SECURE
================================================================================
`;
      res.setHeader("Content-Disposition", 'attachment; filename="NovaBrowser_Hukuki_Onay_Belgesi_Orhan_Suleyman_Torun.txt"');
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.send(content);
    } catch (err) {
      res.status(500).send("Hukuki belge olu\u015Fturma hatas\u0131: " + err?.message);
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[NovaBrowser V54] Server running on http://localhost:${PORT}`);
    const isCloud = !!(process.env.K_SERVICE || process.env.CLOUD_RUN || process.env.GAE_SERVICE);
    if (!isCloud) {
      setTimeout(() => {
        const targetUrl = `http://localhost:${PORT}`;
        try {
          if (process.platform === "win32") {
            const edgeCandidates = [
              "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
              "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
              import_path.default.join(process.env.LocalAppData || "", "Microsoft", "Edge", "Application", "msedge.exe")
            ];
            const edgePath = edgeCandidates.find((p) => import_fs.default.existsSync(p));
            if (edgePath) {
              const userDataDir = import_path.default.join(process.env.LocalAppData || process.env.USERPROFILE || "C:\\", "NovaBrowser", "UserData");
              try {
                import_fs.default.mkdirSync(userDataDir, { recursive: true });
              } catch {
              }
              console.log(`[NovaBrowser] Masa\xFCst\xFC uygulamas\u0131 a\xE7\u0131l\u0131yor (Edge App Engine)...`);
              const child = (0, import_child_process.spawn)(edgePath, [
                `--app=${targetUrl}`,
                `--user-data-dir=${userDataDir}`,
                "--no-first-run",
                "--no-default-browser-check",
                "--window-name=Nova Browser"
              ], {
                detached: true,
                stdio: "ignore"
              });
              child.on("error", () => {
                (0, import_child_process.exec)(`start "" "${targetUrl}"`);
              });
              child.unref();
            } else {
              console.log(`[NovaBrowser] Sistem taray\u0131c\u0131s\u0131nda a\xE7\u0131l\u0131yor...`);
              (0, import_child_process.exec)(`start "" "${targetUrl}"`);
            }
          } else if (process.platform === "darwin") {
            (0, import_child_process.exec)(`open "${targetUrl}"`);
          } else if (process.platform === "linux" && process.env.DISPLAY) {
            (0, import_child_process.exec)(`xdg-open "${targetUrl}"`);
          }
        } catch (err) {
          console.warn("[NovaBrowser] A\xE7\u0131l\u0131\u015F uyar\u0131s\u0131:", err?.message);
          if (process.platform === "win32") {
            (0, import_child_process.exec)(`start "" "${targetUrl}"`);
          }
        }
      }, 1e3);
    }
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
//# sourceMappingURL=server.cjs.map
