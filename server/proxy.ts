import { Request, Response } from 'express';
import * as cheerio from 'cheerio';
import { extractYouTubeId, isYouTubeUrl } from './youtube.js';
import { renderYouTubeAppHtml } from './youtubeRenderer.js';
import { scanUrlSecurity, renderSecurityWarningHtml, sanitizeAndShieldHtml } from './security.js';

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 NovaBrowser/54.0';

// Global lightweight in-memory cookie jar per domain
const DOMAIN_COOKIE_JAR: Map<string, Map<string, string>> = new Map();

function getDomainCookies(hostname: string): string {
  const cookies: string[] = [];
  for (const [domain, jar] of DOMAIN_COOKIE_JAR.entries()) {
    if (hostname.endsWith(domain) || domain.endsWith(hostname)) {
      for (const [k, v] of jar.entries()) {
        cookies.push(`${k}=${v}`);
      }
    }
  }
  return cookies.join('; ');
}

function storeDomainCookies(hostname: string, setCookieHeaders: string[] | string | null) {
  if (!setCookieHeaders) return;
  const list = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
  let domain = hostname;
  try {
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      domain = parts.slice(-2).join('.');
    }
  } catch {}

  let jar = DOMAIN_COOKIE_JAR.get(domain);
  if (!jar) {
    jar = new Map();
    DOMAIN_COOKIE_JAR.set(domain, jar);
  }

  for (const header of list) {
    const parts = header.split(';')[0];
    if (parts) {
      const eqIdx = parts.indexOf('=');
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

export function normalizeUrl(rawUrl: string): string {
  let url = (rawUrl || '').trim();
  if (!url) return '';

  // Filter out internal nova:// schemas
  if (url.startsWith('nova://')) {
    return url;
  }

  // Unwrap Google redirect URLs (e.g. https://www.google.com/url?q=https://poki.com&...)
  if (url.includes('google.') && url.includes('/url?')) {
    try {
      const u = new URL(url);
      const targetParam = u.searchParams.get('q') || u.searchParams.get('url');
      if (targetParam && /^https?:\/\//i.test(targetParam)) {
        return targetParam;
      }
    } catch {}
  }

  if (!/^https?:\/\//i.test(url)) {
    // If it looks like a domain name or localhost
    if (/^[\w.-]+\.[a-zA-Z]{2,}(\/.*)?$/i.test(url) || /^localhost(:\d+)?(\/.*)?$/i.test(url)) {
      url = `https://${url}`;
    } else {
      url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
    }
  }
  return url;
}

export async function handleProxyRequest(req: Request, res: Response): Promise<void> {
  let targetRaw = (req.query.url as string) || '';
  const bypassShield = req.query.bypass_shield === '1';

  // If URL parameter was missing but a search query parameter exists (e.g. from standard form GET submission)
  if (!targetRaw && req.query.q) {
    targetRaw = `https://www.google.com/search?q=${encodeURIComponent(req.query.q as string)}`;
  }

  // Re-assemble any extra query parameters if Express split unencoded target URL query strings
  if (targetRaw && Object.keys(req.query).length > 1) {
    const extraParams = new URLSearchParams();
    for (const [k, v] of Object.entries(req.query)) {
      if (k !== 'url' && k !== 'bypass_shield' && k !== 'bypass_domain') {
        extraParams.append(k, String(v));
      }
    }
    const extraStr = extraParams.toString();
    if (extraStr && !targetRaw.includes(extraStr)) {
      targetRaw += (targetRaw.includes('?') ? '&' : '?') + extraStr;
    }
  }

  if (!targetRaw) {
    res.status(400).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Nova Proxy</title><meta charset="utf-8"/></head>
        <body style="font-family:system-ui;padding:40px;background:#0f172a;color:#f8fafc;text-align:center;">
          <h2>Hata: Geçerli bir web adresi belirtilmedi</h2>
          <p>Lütfen geçerli bir URL (örnek: https://wikipedia.org) girin.</p>
        </body>
      </html>
    `);
    return;
  }

  const targetUrl = normalizeUrl(targetRaw);

  // NovaShield: Perform Real-Time Deep Cybersecurity & Malware Scan
  if (!bypassShield) {
    const scanResult = scanUrlSecurity(targetUrl);
    if (!scanResult.isSafe || scanResult.threatLevel === 'dangerous' || scanResult.threatLevel === 'blocked') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.removeHeader('X-Frame-Options');
      res.removeHeader('Content-Security-Policy');
      res.setHeader('X-Frame-Options', 'ALLOWALL');
      res.status(403).send(renderSecurityWarningHtml(targetUrl, scanResult));
      return;
    }
  }

  // If this is any YouTube URL (video watch, search, trending, home), render our responsive HD YouTube web app
  if (isYouTubeUrl(targetUrl)) {
    const ytVideoId = extractYouTubeId(targetUrl);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.send(renderYouTubeAppHtml(targetUrl, ytVideoId));
    return;
  }

  try {
    const parsedTarget = new URL(targetUrl);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const storedCookies = getDomainCookies(parsedTarget.hostname);
    const clientCookies = (req.headers['cookie'] as string) || '';
    const mergedCookies = [storedCookies, clientCookies].filter(Boolean).join('; ');

    const forwardHeaders: Record<string, string> = {
      'User-Agent': USER_AGENT,
      Accept: (req.headers['accept'] as string) || 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': (req.headers['accept-language'] as string) || 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
      Referer: `${parsedTarget.origin}/`,
      Origin: parsedTarget.origin,
      'Sec-Fetch-Dest': (req.headers['sec-fetch-dest'] as string) || 'document',
      'Sec-Fetch-Mode': (req.headers['sec-fetch-mode'] as string) || 'navigate',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
    };

    if (mergedCookies) {
      forwardHeaders['Cookie'] = mergedCookies;
    }

    // If client requested range (for audio/video)
    if (req.headers['range']) {
      forwardHeaders['range'] = req.headers['range'] as string;
    }

    const upstreamRes = await fetch(targetUrl, {
      method: req.method === 'POST' ? 'POST' : 'GET',
      headers: forwardHeaders,
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeout);

    const contentType = upstreamRes.headers.get('content-type') || 'text/html';
    const finalUrl = upstreamRes.url || targetUrl;
    const finalParsed = new URL(finalUrl);

    // Save set-cookie headers
    const setCookie = upstreamRes.headers.get('set-cookie');
    if (setCookie) {
      storeDomainCookies(finalParsed.hostname, setCookie);
    }

    // Strip framing blockers & CORS constraints
    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');
    res.removeHeader('Content-Security-Policy-Report-Only');
    res.removeHeader('Cross-Origin-Embedder-Policy');
    res.removeHeader('Cross-Origin-Opener-Policy');
    res.removeHeader('Cross-Origin-Resource-Policy');

    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('X-Nova-Resolved-Url', finalUrl);

    // Forward status code (handle 206 Partial Content, 200, 304, etc.)
    if (upstreamRes.status === 206) {
      res.status(206);
      const contentRange = upstreamRes.headers.get('content-range');
      if (contentRange) res.setHeader('Content-Range', contentRange);
    } else {
      res.status(upstreamRes.status);
    }

    // If it's not HTML (e.g. image, css, video, audio, font, json, pdf, stream, wasm, data)
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      res.setHeader('Content-Type', contentType);
      const buffer = Buffer.from(await upstreamRes.arrayBuffer());
      res.send(buffer);
      return;
    }

    // Process HTML
    const htmlText = await upstreamRes.text();
    const $ = cheerio.load(htmlText);

    // 1. Remove CSP meta tags and anti-frame tags
    $('meta[http-equiv="Content-Security-Policy"]').remove();
    $('meta[http-equiv="content-security-policy"]').remove();
    $('meta[http-equiv="X-Frame-Options"]').remove();

    // 2. Remove Subresource Integrity (SRI) hashes which fail when scripts are fetched through proxies
    $('*[integrity]').removeAttr('integrity');
    $('*[crossorigin]').removeAttr('crossorigin');

    // 3. Remove frame-busting scripts & dangerous object replacements
    $('script').each((_, el) => {
      const scriptContent = $(el).html() || '';
      if (
        scriptContent.includes('top.location') ||
        scriptContent.includes('window.top') ||
        scriptContent.includes('parent.location') ||
        scriptContent.includes('frameElement') ||
        scriptContent.includes('self !== top') ||
        scriptContent.includes('top !== self') ||
        scriptContent.includes('window.self !== window.top') ||
        scriptContent.includes('window.top.location')
      ) {
        // Neutralize framebusting code while preserving functions
        const neutralized = scriptContent
          .replace(/if\s*\(\s*(?:window\.)?(?:self|top)\s*!==?\s*(?:window\.)?(?:top|self)\s*\)/g, 'if (false)')
          .replace(/(?:window\.)?top\.location\s*=/g, '/* top.location = */ void ')
          .replace(/(?:window\.)?parent\.location\s*=/g, '/* parent.location = */ void ');
        $(el).html(neutralized);
      }
    });

    // 4. Ensure base tag exists
    $('base').remove();
    $('head').prepend(`<base href="${finalUrl}">`);

    // 4.1 Convert relative asset links (images, scripts, styles, media, fonts, iframes) to absolute URLs
    $('img[src]').each((_, el) => {
      const src = $(el).attr('src');
      if (src && !src.startsWith('data:') && !src.startsWith('blob:') && !src.startsWith('http://') && !src.startsWith('https://')) {
        try { $(el).attr('src', new URL(src, finalUrl).toString()); } catch {}
      }
    });
    $('img[srcset]').each((_, el) => {
      const srcset = $(el).attr('srcset');
      if (srcset) {
        try {
          const parts = srcset.split(',').map(part => {
            const [url, size] = part.trim().split(/\s+/);
            if (url && !url.startsWith('data:') && !url.startsWith('blob:') && !url.startsWith('http://') && !url.startsWith('https://')) {
              return `${new URL(url, finalUrl).toString()} ${size || ''}`.trim();
            }
            return part.trim();
          });
          $(el).attr('srcset', parts.join(', '));
        } catch {}
      }
    });
    $('link[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (href && !href.startsWith('data:') && !href.startsWith('blob:') && !href.startsWith('http://') && !href.startsWith('https://')) {
        try { $(el).attr('href', new URL(href, finalUrl).toString()); } catch {}
      }
    });
    $('script[src]').each((_, el) => {
      const src = $(el).attr('src');
      if (src && !src.startsWith('data:') && !src.startsWith('blob:') && !src.startsWith('http://') && !src.startsWith('https://')) {
        try { $(el).attr('src', new URL(src, finalUrl).toString()); } catch {}
      }
    });
    $('source[src]').each((_, el) => {
      const src = $(el).attr('src');
      if (src && !src.startsWith('data:') && !src.startsWith('blob:') && !src.startsWith('http://') && !src.startsWith('https://')) {
        try { $(el).attr('src', new URL(src, finalUrl).toString()); } catch {}
      }
    });
    $('video[poster]').each((_, el) => {
      const poster = $(el).attr('poster');
      if (poster && !poster.startsWith('data:') && !poster.startsWith('blob:') && !poster.startsWith('http://') && !poster.startsWith('https://')) {
        try { $(el).attr('poster', new URL(poster, finalUrl).toString()); } catch {}
      }
    });

    // 4.2 Convert nested iframes / game player frames to proxy URLs to bypass CDN frame blocking
    $('iframe[src], embed[src]').each((_, el) => {
      const src = $(el).attr('src');
      if (src && !src.startsWith('data:') && !src.startsWith('blob:') && !src.startsWith('/api/proxy')) {
        try {
          const resolved = new URL(src, finalUrl).toString();
          $(el).attr('src', `/api/proxy?url=${encodeURIComponent(resolved)}`);
        } catch {}
      }
    });

    // 5. Rewrite hyperlinks
    $('a').each((_, el) => {
      const href = $(el).attr('href');
      if (!href) return;

      if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }

      try {
        const resolved = new URL(href, finalUrl).toString();
        $(el).attr('data-nova-url', resolved);
        $(el).attr('href', `/api/proxy?url=${encodeURIComponent(resolved)}`);
        $(el).attr('target', '_self');
      } catch {
        // Leave
      }
    });

    // 6. Rewrite forms
    $('form').each((_, el) => {
      const action = $(el).attr('action');
      try {
        const resolved = new URL(action || '', finalUrl).toString();
        $(el).attr('data-nova-action', resolved);
        $(el).attr('action', `/api/proxy?url=${encodeURIComponent(resolved)}`);
      } catch {
        // Leave
      }
    });

    // 7. Apply NovaShield Ad, Tracker & Cryptominer Sanitizer
    const shieldResult = sanitizeAndShieldHtml($, finalUrl);
    res.setHeader('X-NovaShield-Blocked-Trackers', String(shieldResult.blockedTrackersCount));

    // 8. Inject Nova Browser Bridge & Universal Ajax Interceptor Script
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
                  if (q && /^https?:\/\//i.test(q)) return q;
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

    $('body').append(bridgeScript);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send($.html());
  } catch (err: any) {
    res.status(500).send(`
      <!DOCTYPE html>
      <html lang="tr">
        <head>
          <meta charset="utf-8">
          <title>Nova Tarayıcı - Sayfa Açılamadı</title>
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
            <h2>⚠️ Sayfaya Ulaşılamadı</h2>
            <p>Hedef web sitesine erişilirken bir hata oluştu veya bağlantı güvenlik politikalarına takıldı.</p>
            <div class="url-badge">${targetUrl}</div>
            <p style="font-size: 12px; color: #64748b;">Hata detayı: ${err?.message || 'Bilinmeyen ağ hatası'}</p>
            <div class="actions">
              <button onclick="location.reload()">🔄 Yeniden Dene</button>
              <button class="btn-sec" onclick="window.parent.postMessage({type:'NOVA_DIRECT_OPEN', url:'${targetUrl}'}, '*')">🚀 Doğrudan Aç (Embed / Direct)</button>
              <button class="btn-sec" onclick="window.parent.postMessage({type:'NOVA_NAVIGATE', url:'https://www.google.com/search?q=' + encodeURIComponent('${targetUrl}')}, '*')">🔍 Google'da Ara</button>
            </div>
          </div>
        </body>
      </html>
    `);
  }
}
