export interface EntityKnowledge {
  name: string;
  subtitle: string;
  category: 'athlete' | 'celebrity' | 'company' | 'crypto' | 'place' | 'general' | 'tech';
  images: {
    hero: string;
    thumb1: string;
    thumb2: string;
    credit: string;
    totalCount: number;
  };
  stats: {
    title: string;
    subtitle: string;
    metrics: { label: string; value: string | number }[];
  };
  topNews: {
    sourceName: string;
    sourceIcon: string;
    title: string;
    timeAgo: string;
    url: string;
    thumbnail: string;
  };
  socialPost: {
    platform: 'instagram' | 'twitter' | 'youtube' | 'tiktok';
    handle: string;
    platformName: string;
    content: string;
    timeAgo: string;
    url: string;
    thumbnail?: string;
  };
  relatedSearches: string[];
  discussions: {
    source: string;
    icon: string;
    title: string;
    snippet: string;
    replies: number;
    timeAgo: string;
    url: string;
  }[];
  shorts: {
    title: string;
    channel: string;
    views: string;
    thumbnail: string;
    url: string;
  }[];
}

// Generate rich entity data dynamically based on query
export function getEntityKnowledge(query: string, rawWiki?: any): EntityKnowledge {
  const q = query.trim().toLowerCase();

  // 1. Cristiano Ronaldo & Footballers
  if (q.includes('ronaldo') || q.includes('cristiano')) {
    return {
      name: 'Cristiano Ronaldo',
      subtitle: 'Portekizli profesyonel futbolcu',
      category: 'athlete',
      images: {
        hero: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80',
        thumb1: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=80',
        thumb2: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=500&auto=format&fit=crop&q=80',
        credit: 'SOPA Images / Getty Images / Al-Nassr FC',
        totalCount: 1420,
      },
      stats: {
        title: 'İstatistikler',
        subtitle: 'Suudi Pro Ligi • Al-Nassr • 2026-27',
        metrics: [
          { label: 'Maçlar', value: '34' },
          { label: 'Hedefler (Gol)', value: '38' },
          { label: 'Yardımcı olur (Asist)', value: '11' },
          { label: 'Sarı kartlar', value: '2' },
        ],
      },
      topNews: {
        sourceName: 'OneFootball',
        sourceIcon: '⚽',
        title: "Ronaldo, Al-Nassr'ın şampiyonluk yolundaki kritik galibiyetine 2 golle damga vurdu.",
        timeAgo: '11 dakika önce',
        url: 'https://onefootball.com',
        thumbnail: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&auto=format&fit=crop&q=80',
      },
      socialPost: {
        platform: 'instagram',
        handle: '@cristiano',
        platformName: 'Instagram',
        content: 'Bir başka inanılmaz zaferin ve taraftarlarımızın desteğinin parçası olmaktan gurur duyuyorum. ⚽🏆 Birlikte daha güçlüyüz! #AlNassr #CR7',
        timeAgo: '4 saat önce',
        url: 'https://instagram.com/cristiano',
        thumbnail: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&auto=format&fit=crop&q=80',
      },
      relatedSearches: [
        'cristiano ronaldo gol sayısı',
        'ronaldo al nassr maçları',
        'ronaldo instagram takipçi',
        'cristiano ronaldo serveti',
        'ronaldo messi kıyaslaması',
      ],
      discussions: [
        {
          source: 'r/soccer (Reddit)',
          icon: '🔴',
          title: "Cristiano Ronaldo's scoring records and longevity in 2026",
          snippet: 'Discussion on CR7 achieving over 900+ career goals and his tactical role in Al-Nassr and Portugal national team...',
          replies: 342,
          timeAgo: '2 saat önce',
          url: 'https://reddit.com/r/soccer',
        },
        {
          source: 'Ekşi Sözlük',
          icon: '🟢',
          title: 'cristiano ronaldo',
          snippet: 'tarihin en disiplinli ve istikrarlı forvet oyuncusu. kariyeri boyunca kırdığı rekorlar...',
          replies: 1289,
          timeAgo: '5 saat önce',
          url: 'https://eksisozluk.com',
        },
      ],
      shorts: [
        {
          title: "CR7 Unstoppable Free-Kick Goal 🔥",
          channel: 'Al-Nassr Official',
          views: '4.2M izlenme',
          thumbnail: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=300&h=500&auto=format&fit=crop&q=80',
          url: 'https://youtube.com/shorts',
        },
        {
          title: "Ronaldo's Legendary SIUU Celebration",
          channel: 'Football Shorts HD',
          views: '8.9M izlenme',
          thumbnail: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=300&h=500&auto=format&fit=crop&q=80',
          url: 'https://youtube.com/shorts',
        },
      ],
    };
  }

  // 2. Lionel Messi
  if (q.includes('messi') || q.includes('lionel')) {
    return {
      name: 'Lionel Messi',
      subtitle: 'Arjantinli profesyonel futbolcu • Inter Miami CF',
      category: 'athlete',
      images: {
        hero: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&auto=format&fit=crop&q=80',
        thumb1: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=500&auto=format&fit=crop&q=80',
        thumb2: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500&auto=format&fit=crop&q=80',
        credit: 'MLS / Getty Images / Inter Miami',
        totalCount: 1350,
      },
      stats: {
        title: 'İstatistikler',
        subtitle: 'Major League Soccer • Inter Miami • 2026',
        metrics: [
          { label: 'Maçlar', value: '28' },
          { label: 'Goller', value: '25' },
          { label: 'Asistler', value: '18' },
          { label: 'Ballon d’Or', value: '8' },
        ],
      },
      topNews: {
        sourceName: 'ESPN FC',
        sourceIcon: '⚽',
        title: "Messi'nin liderliğinde Inter Miami, MLS Doğu Konferansı zirvesini koruyor.",
        timeAgo: '25 dakika önce',
        url: 'https://espn.com',
        thumbnail: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400&auto=format&fit=crop&q=80',
      },
      socialPost: {
        platform: 'instagram',
        handle: '@leomessi',
        platformName: 'Instagram',
        content: 'Gran victoria de todo el equipo ayer! Seguimos trabajando juntos paso a paso ⚽🇺🇸 #InterMiami',
        timeAgo: '1 gün önce',
        url: 'https://instagram.com/leomessi',
        thumbnail: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=400&auto=format&fit=crop&q=80',
      },
      relatedSearches: [
        'messi golleri inter miami',
        'messi ronaldo karşılaştırması',
        'lionel messi 2026 dünya kupası',
        'messi asist krallığı',
      ],
      discussions: [
        {
          source: 'r/MLS (Reddit)',
          icon: '🔴',
          title: "Messi's impact on MLS tactical development and viewership",
          snippet: 'Analytical breakdown of how Messi creates high-danger passing lanes in the final third...',
          replies: 215,
          timeAgo: '4 saat önce',
          url: 'https://reddit.com',
        },
      ],
      shorts: [
        {
          title: "Messi Magical Dribble & Assist 🪄",
          channel: 'Inter Miami CF',
          views: '5.1M izlenme',
          thumbnail: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=300&h=500&auto=format&fit=crop&q=80',
          url: 'https://youtube.com/shorts',
        },
      ],
    };
  }

  // 3. Elon Musk & Tesla / SpaceX
  if (q.includes('elon') || q.includes('musk') || q.includes('tesla') || q.includes('spacex')) {
    return {
      name: 'Elon Musk',
      subtitle: 'Girişimci, Mühendis & Teknoloji Lideri • Tesla & SpaceX CEO',
      category: 'celebrity',
      images: {
        hero: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=800&auto=format&fit=crop&q=80',
        thumb1: 'https://images.unsplash.com/photo-1517976487502-5f69f4cb4829?w=500&auto=format&fit=crop&q=80',
        thumb2: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=500&auto=format&fit=crop&q=80',
        credit: 'SpaceX / Tesla Press / Bloomberg',
        totalCount: 980,
      },
      stats: {
        title: 'Önemli Bilgiler & Şirketler',
        subtitle: 'Piyasa & Net Değer Verileri (2026)',
        metrics: [
          { label: 'Net Servet', value: '$248 Milyar' },
          { label: 'Şirketler', value: 'Tesla, SpaceX, xAI, X' },
          { label: 'Starship Uçuşu', value: 'Test #7 Başarılı' },
          { label: 'Doğum', value: '1971 (Güney Afrika)' },
        ],
      },
      topNews: {
        sourceName: 'Reuters Teknoloji',
        sourceIcon: '🚀',
        title: "SpaceX Starship, Mars keşif misyonu için yörünge yakıt ikmali testlerini tamamladı.",
        timeAgo: '18 dakika önce',
        url: 'https://reuters.com',
        thumbnail: 'https://images.unsplash.com/photo-1517976487502-5f69f4cb4829?w=400&auto=format&fit=crop&q=80',
      },
      socialPost: {
        platform: 'twitter',
        handle: '@elonmusk',
        platformName: 'X (Twitter)',
        content: 'Humanity will become multiplanetary. The stars are calling! 🚀 ✨ Full self-driving v13 rolling out globally.',
        timeAgo: '2 saat önce',
        url: 'https://x.com/elonmusk',
        thumbnail: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=400&auto=format&fit=crop&q=80',
      },
      relatedSearches: [
        'elon musk serveti 2026',
        'spacex starship son fırlatma',
        'tesla fsd otonom sürüş',
        'xai grok yapay zeka',
      ],
      discussions: [
        {
          source: 'r/SpaceXLounge',
          icon: '🚀',
          title: 'Starship flight test telemetry breakdown and heat shield status',
          snippet: 'Orbital velocity data analysis indicates remarkable re-entry stability...',
          replies: 489,
          timeAgo: '1 saat önce',
          url: 'https://reddit.com',
        },
      ],
      shorts: [
        {
          title: "Starship Booster Catch by Mechazilla Arms 🦾",
          channel: 'SpaceX Highlights',
          views: '12.4M izlenme',
          thumbnail: 'https://images.unsplash.com/photo-1517976487502-5f69f4cb4829?w=300&h=500&auto=format&fit=crop&q=80',
          url: 'https://youtube.com/shorts',
        },
      ],
    };
  }

  // 4. Bitcoin & Crypto
  if (q.includes('bitcoin') || q.includes('btc') || q.includes('kripto') || q.includes('ethereum')) {
    return {
      name: 'Bitcoin (BTC)',
      subtitle: 'Merkeziyetsiz Dijital Kripto Para Birimi',
      category: 'crypto',
      images: {
        hero: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
        thumb1: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=500&auto=format&fit=crop&q=80',
        thumb2: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=500&auto=format&fit=crop&q=80',
        credit: 'CoinMarketCap / TradingView',
        totalCount: 540,
      },
      stats: {
        title: 'Piyasa İstatistikleri',
        subtitle: 'Canlı Küresel Blokzincir Verileri',
        metrics: [
          { label: 'Canlı Fiyat', value: '$84,250' },
          { label: '24s Değişim', value: '+4.2%' },
          { label: 'Piyasa Değeri', value: '$1.65 Trilyon' },
          { label: 'Maksimum Arz', value: '21,000,000 BTC' },
        ],
      },
      topNews: {
        sourceName: 'Bloomberg Crypto',
        sourceIcon: '📈',
        title: "Kurumsal ETF girişleri rekor seviyeye ulaştı; Bitcoin yeni zirve seviyelerini test ediyor.",
        timeAgo: '42 dakika önce',
        url: 'https://bloomberg.com',
        thumbnail: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=400&auto=format&fit=crop&q=80',
      },
      socialPost: {
        platform: 'twitter',
        handle: '@Bitcoin',
        platformName: 'X (Twitter)',
        content: 'Bitcoin is the hardest, most verifiable money ever created by human civilization. #Bitcoin #BTC ⚡',
        timeAgo: '6 saat önce',
        url: 'https://x.com/Bitcoin',
      },
      relatedSearches: [
        'bitcoin canlı fiyat grafik',
        'btc etf girişleri',
        'kripto para piyasa değeri',
        'bitcoin halving döngüsü',
      ],
      discussions: [
        {
          source: 'r/Bitcoin',
          icon: '₿',
          title: 'Daily Discussion & Technical Analysis - Bull Run momentum',
          snippet: 'On-chain accumulation metrics show continuous long-term holder inflows...',
          replies: 820,
          timeAgo: '1 saat önce',
          url: 'https://reddit.com/r/Bitcoin',
        },
      ],
      shorts: [
        {
          title: "How Bitcoin Blockchain Works in 60 Seconds ⛓️",
          channel: 'Crypto Explained',
          views: '3.4M izlenme',
          thumbnail: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=300&h=500&auto=format&fit=crop&q=80',
          url: 'https://youtube.com/shorts',
        },
      ],
    };
  }

  // 5. Galatasaray / Turkish Football Clubs
  if (q.includes('galatasaray') || q.includes('fenerbahce') || q.includes('besiktas')) {
    const club = q.includes('galatasaray') ? 'Galatasaray' : q.includes('fenerbahce') ? 'Fenerbahçe' : 'Beşiktaş';
    const city = 'İstanbul, Türkiye';
    return {
      name: `${club} Spor Kulübü`,
      subtitle: `Süper Lig Kulübü • ${city}`,
      category: 'athlete',
      images: {
        hero: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80',
        thumb1: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500&auto=format&fit=crop&q=80',
        thumb2: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=500&auto=format&fit=crop&q=80',
        credit: `${club} Resmi Medya / TFF`,
        totalCount: 890,
      },
      stats: {
        title: 'Süper Lig İstatistikleri',
        subtitle: 'Trendyol Süper Lig 2026-27 Sezonu',
        metrics: [
          { label: 'Puan', value: '68 Puan' },
          { label: 'Oynanan Maç', value: '26 Maç' },
          { label: 'Galibiyet', value: '21 Galibiyet' },
          { label: 'Averaj', value: '+42 Averaj' },
        ],
      },
      topNews: {
        sourceName: 'NTV Spor',
        sourceIcon: '🏆',
        title: `${club}, hafta sonu oynanacak derbi maçı öncesi taktik hazırlıklarını tamamladı.`,
        timeAgo: '15 dakika önce',
        url: 'https://ntvspor.net',
        thumbnail: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&auto=format&fit=crop&q=80',
      },
      socialPost: {
        platform: 'twitter',
        handle: `@${club.toLowerCase()}`,
        platformName: 'X (Twitter)',
        content: `Hedefe adım adım! Büyük taraftarımızla birlikte zafere odaklandık. 💛❤️🦁 #Hedef25`,
        timeAgo: '3 saat önce',
        url: `https://x.com/${club.toLowerCase()}`,
      },
      relatedSearches: [
        `${club.toLowerCase()} maç fikstürü`,
        `${club.toLowerCase()} transfer haberleri`,
        `${club.toLowerCase()} puan durumu`,
        `${club.toLowerCase()} canlı maç izle`,
      ],
      discussions: [
        {
          source: 'Ekşi Sözlük',
          icon: '🟢',
          title: `${club.toLowerCase()}`,
          snippet: 'kulübün son dönemdeki taktiksel oyun anlayışı ve kadro derinliği...',
          replies: 1540,
          timeAgo: '2 saat önce',
          url: 'https://eksisozluk.com',
        },
      ],
      shorts: [
        {
          title: `${club} Derbi Golü ve Tribün Çoşkusu 🏟️`,
          channel: 'Süper Lig TV',
          views: '2.1M izlenme',
          thumbnail: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=300&h=500&auto=format&fit=crop&q=80',
          url: 'https://youtube.com/shorts',
        },
      ],
    };
  }

  // 6. Generic Dynamic Entity (Fallback for Any Query: Turkey, Istanbul, Python, NASA, AI etc.)
  const formattedName = query.charAt(0).toUpperCase() + query.slice(1);
  return {
    name: formattedName,
    subtitle: rawWiki?.description || `${formattedName} hakkında kapsamlı web ansiklopedisi ve canlı bilgi paneli`,
    category: 'general',
    images: {
      hero: rawWiki?.image || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
      thumb1: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=80',
      thumb2: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=500&auto=format&fit=crop&q=80',
      credit: 'Web Kaynakları / Wikimedia / NovaSearch Index',
      totalCount: 380,
    },
    stats: {
      title: 'Öne Çıkan Bilgiler',
      subtitle: `${formattedName} • Güncel Bilgi Özetleri`,
      metrics: [
        { label: 'İndeks Kaydı', value: '1.24 Milyon' },
        { label: 'Doğruluk', value: '%99.8' },
        { label: 'Güvenlik Kalkanı', value: 'Aktif' },
        { label: 'Kaynak', value: 'Evrensel Web' },
      ],
    },
    topNews: {
      sourceName: 'Google Haberler',
      sourceIcon: '📰',
      title: `${formattedName} ile ilgili en son gelişmeler ve analizler.`,
      timeAgo: '30 dakika önce',
      url: `https://news.google.com/search?q=${encodeURIComponent(query)}`,
      thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80',
    },
    socialPost: {
      platform: 'twitter',
      handle: `@${query.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'trend'}`,
      platformName: 'X (Twitter)',
      content: `${formattedName} konusunda bugün dünya genelinde binlerce paylaşım yapıldı. Trendlerdeki son başlıklar ve analizler.`,
      timeAgo: '5 saat önce',
      url: `https://x.com/search?q=${encodeURIComponent(query)}`,
    },
    relatedSearches: [
      `${query} nedir`,
      `${query} nasıl kullanılır`,
      `${query} son dakika gelişmeleri`,
      `${query} resmi web sitesi`,
    ],
    discussions: [
      {
        source: 'Reddit / Ekşi Sözlük',
        icon: '💬',
        title: `${formattedName} hakkında topluluk yorumları ve tartışmalar`,
        snippet: `Kullanıcıların ${formattedName} deneyimleri, soru-cevaplar ve detaylı rehberler...`,
        replies: 84,
        timeAgo: '3 saat önce',
        url: `https://reddit.com/search?q=${encodeURIComponent(query)}`,
      },
    ],
    shorts: [
      {
        title: `${formattedName} Kısa Video İncelemesi 📱`,
        channel: 'Nova Shorts',
        views: '1.5M izlenme',
        thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&h=500&auto=format&fit=crop&q=80',
        url: 'https://youtube.com/shorts',
      },
    ],
  };
}
