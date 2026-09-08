import * as cheerio from 'cheerio';

export interface YouTubeVideoItem {
  id: string;
  title: string;
  url: string;
  embedUrl: string;
  thumbnail: string;
  channel: string;
  duration?: string;
  views?: string;
  publishedTime?: string;
  description?: string;
}

export function extractYouTubeId(urlStr: string): string | null {
  try {
    const raw = (urlStr || '').trim();
    if (!raw) return null;

    // e.g. youtube.com/watch?v=ID, shorts/ID, embed/ID, youtu.be/ID
    const watchMatch = raw.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
    if (watchMatch && watchMatch[1]) {
      return watchMatch[1];
    }
    return null;
  } catch {
    return null;
  }
}

export async function getYouTubeVideoDetails(videoId: string, apiKey?: string): Promise<YouTubeVideoItem | null> {
  if (!videoId) return null;

  if (apiKey && apiKey.trim()) {
    try {
      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${apiKey.trim()}`;
      const resp = await fetch(apiUrl);
      if (resp.ok) {
        const data = await resp.json();
        if (data.items && data.items.length > 0) {
          const item = data.items[0];
          const viewsCount = item.statistics?.viewCount ? `${Number(item.statistics.viewCount).toLocaleString('tr-TR')} görüntüleme` : '';
          return {
            id: videoId,
            title: item.snippet?.title || 'YouTube Video',
            url: `https://www.youtube.com/watch?v=${videoId}`,
            embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&enablejsapi=1`,
            thumbnail: item.snippet?.thumbnails?.maxres?.url || item.snippet?.thumbnails?.high?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            channel: item.snippet?.channelTitle || 'YouTube Kanalı',
            views: viewsCount,
            publishedTime: item.snippet?.publishedAt ? new Date(item.snippet.publishedAt).toLocaleDateString('tr-TR') : '',
            description: item.snippet?.description || '',
          };
        }
      }
    } catch (err) {
      console.warn('YouTube Video Details API call exception:', err);
    }
  }

  return {
    id: videoId,
    title: 'YouTube Video',
    url: `https://www.youtube.com/watch?v=${videoId}`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&enablejsapi=1`,
    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    channel: 'YouTube İçerik Üreticisi',
    views: 'HD Oynatıcı',
    publishedTime: '',
    description: '',
  };
}

export function isYouTubeUrl(urlStr: string): boolean {
  const clean = (urlStr || '').toLowerCase();
  return clean.includes('youtube.com') || clean.includes('youtu.be');
}

export async function getYouTubeTrending(apiKey?: string, region = 'TR'): Promise<YouTubeVideoItem[]> {
  // 1. If API Key is present, use official YouTube v3 videos/mostPopular endpoint
  if (apiKey && apiKey.trim()) {
    try {
      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&chart=mostPopular&regionCode=${region}&maxResults=30&key=${apiKey.trim()}`;
      const resp = await fetch(apiUrl);
      if (resp.ok) {
        const data = await resp.json();
        if (data.items && Array.isArray(data.items)) {
          const items: YouTubeVideoItem[] = data.items.map((item: any) => {
            const viewsCount = item.statistics?.viewCount ? `${Number(item.statistics.viewCount).toLocaleString('tr-TR')} görüntüleme` : '';
            return {
              id: item.id || '',
              title: item.snippet?.title || 'YouTube Video',
              url: `https://www.youtube.com/watch?v=${item.id}`,
              embedUrl: `https://www.youtube-nocookie.com/embed/${item.id}?autoplay=1&enablejsapi=1`,
              thumbnail: item.snippet?.thumbnails?.maxres?.url || item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`,
              channel: item.snippet?.channelTitle || 'YouTube Kanalı',
              views: viewsCount,
              publishedTime: item.snippet?.publishedAt ? new Date(item.snippet.publishedAt).toLocaleDateString('tr-TR') : '',
              description: item.snippet?.description || '',
            };
          });
          if (items.length > 0) return items;
        }
      }
    } catch (apiErr) {
      console.warn('YouTube Trending API call exception:', apiErr);
    }
  }

  // Fallback to web search for trending
  return searchYouTubeVideos('trending', apiKey);
}

export async function searchYouTubeVideos(query: string, apiKey?: string): Promise<YouTubeVideoItem[]> {
  const cleanQ = query.trim() || 'trend videolar';

  // 1. If user provided a YouTube Data API v3 Key, use official Google API endpoint
  if (apiKey && apiKey.trim()) {
    try {
      const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=30&q=${encodeURIComponent(cleanQ)}&type=video&key=${apiKey.trim()}`;
      const resp = await fetch(apiUrl);
      if (resp.ok) {
        const data = await resp.json();
        if (data.items && Array.isArray(data.items)) {
          const items: YouTubeVideoItem[] = data.items.map((item: any) => ({
            id: item.id?.videoId || '',
            title: item.snippet?.title || 'YouTube Video',
            url: `https://www.youtube.com/watch?v=${item.id?.videoId}`,
            embedUrl: `https://www.youtube-nocookie.com/embed/${item.id?.videoId}?autoplay=1&enablejsapi=1`,
            thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${item.id?.videoId}/hqdefault.jpg`,
            channel: item.snippet?.channelTitle || 'YouTube Kanalı',
            publishedTime: item.snippet?.publishedAt ? new Date(item.snippet.publishedAt).toLocaleDateString('tr-TR') : '',
            description: item.snippet?.description || '',
          }));
          if (items.length > 0) return items;
        }
      } else {
        const errData = await resp.json().catch(() => ({}));
        console.warn('YouTube Data API error:', errData);
      }
    } catch (apiErr) {
      console.warn('YouTube API call exception:', apiErr);
    }
  }

  // 2. Fallback to Web Scraping & Instant Search
  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanQ)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return getDefaultYouTubeVideos(cleanQ);

    const html = await res.text();
    const videos: YouTubeVideoItem[] = [];

    // Parse ytInitialData JSON from HTML
    const match = html.match(/var ytInitialData\s*=\s*({.+?});<\/script>/s) ||
                  html.match(/ytInitialData\s*=\s*({.+?});/s);

    if (match && match[1]) {
      try {
        const data = JSON.parse(match[1]);
        const contents =
          data?.contents?.twoColumnSearchResultsRenderer?.primaryContents
            ?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents || [];

        for (const item of contents) {
          const v = item?.videoRenderer;
          if (!v || !v.videoId) continue;

          const title = v.title?.runs?.[0]?.text || 'YouTube Video';
          const channel = v.ownerText?.runs?.[0]?.text || 'YouTube Channel';
          const views = v.viewCountText?.simpleText || v.shortViewCountText?.simpleText || '';
          const publishedTime = v.publishedTimeText?.simpleText || '';
          const duration = v.lengthText?.simpleText || '';
          const snippet = v.detailedMetadataSnippets?.[0]?.snippetText?.runs?.map((r: any) => r.text).join('') || '';
          const thumb = v.thumbnail?.thumbnails?.[v.thumbnail.thumbnails.length - 1]?.url ||
            `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`;

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
            description: snippet,
          });

          if (videos.length >= 30) break;
        }
      } catch (err) {
        console.warn('ytInitialData parse error:', err);
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

export function getDefaultYouTubeVideos(category = 'trending'): YouTubeVideoItem[] {
  const defaultList = [
    {
      id: 'dQw4w9WgXcQ',
      title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
      channel: 'Rick Astley',
      views: '1.5M views',
      duration: '3:33',
    },
    {
      id: 'fJ9rUzIMcZQ',
      title: 'Queen – Bohemian Rhapsody (Official Video Remastered)',
      channel: 'Queen Official',
      views: '1.7B views',
      duration: '5:59',
    },
    {
      id: 'kJQP7kiw5Fk',
      title: 'Luis Fonsi - Despacito ft. Daddy Yankee',
      channel: 'Luis Fonsi',
      views: '8.2B views',
      duration: '4:41',
    },
    {
      id: 'L_LUpnjgPso',
      title: 'Google I/O Keynote Recap: Everything Announced',
      channel: 'Google',
      views: '2.1M views',
      duration: '14:20',
    },
    {
      id: '9bZkp7q19f0',
      title: 'PSY - GANGNAM STYLE (강남스타일) M/V',
      channel: 'officialpsy',
      views: '5.1B views',
      duration: '4:12',
    },
    {
      id: 'JGwWNGJdvx8',
      title: 'Ed Sheeran - Shape of You (Official Music Video)',
      channel: 'Ed Sheeran',
      views: '6.1B views',
      duration: '4:23',
    },
    {
      id: 'kXYiU_JCYtU',
      title: 'Linkin Park - Numb (Official Music Video) [4K Upgrade]',
      channel: 'Linkin Park',
      views: '2.3B views',
      duration: '3:07',
    },
    {
      id: '09R8_2nJtjg',
      title: 'Maroon 5 - Sugar (Official Music Video)',
      channel: 'Maroon 5',
      views: '4.0B views',
      duration: '5:01',
    },
    {
      id: 'hT_nvWreIhg',
      title: 'OneRepublic - Counting Stars (Official Music Video)',
      channel: 'OneRepublic',
      views: '4.0B views',
      duration: '4:43',
    },
    {
      id: 'CevxZvSJLk8',
      title: 'Katy Perry - Roar (Official)',
      channel: 'Katy Perry',
      views: '4.0B views',
      duration: '4:30',
    },
  ];

  return defaultList.map(v => ({
    id: v.id,
    title: v.title,
    url: `https://www.youtube.com/watch?v=${v.id}`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&enablejsapi=1`,
    thumbnail: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
    channel: v.channel,
    duration: v.duration,
    views: v.views,
  }));
}
