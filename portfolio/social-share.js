// Social share: Web Share API when available; otherwise opens network URLs or copies link.
// Markup: data-social-share="native|x|twitter|linkedin|facebook|reddit|telegram|whatsapp|copy|email"
//   • x — same as twitter (X intent)
//   • copy — copy resolved share URL to clipboard; optional data-share-copied-label (default “Copied!”)
//   (alias: data-share="…" if data-social-share is omitted)
// Optional (innermost wins on the control or an ancestor):
//   data-share-url — page URL (hash stripped before applying anchor)
//   data-share-anchor — fragment id for a section (e.g. pricing or #pricing)
//   data-share-text — explicit body line (wins over data-share-content)
//   data-share-title — title for native / email subject
//   data-share-content — copy taken from DOM (see below)
//
// On the share button only (not inherited from ancestors):
//   data-share-width / data-share-height — size of the window for linkedin|facebook (e.g. 600 or 480px)
//
// data-share-content — share text from a block’s text:
//   • On a paragraph/card body: <p data-share-content>…</p> (empty attribute = this element’s text).
//   • With several cards: put the block inside the same wrapper as the share button; the first
//     [data-share-content] inside that wrapper is used (walk goes up from the button, never onto
//     <body>, so another card’s block is not picked).
//   • Several blocks in one card: point the button with data-share-content="#id" (or .class) at
//     the exact element to quote.
//
// LinkedIn “Cannot display preview”: the shared URL must be public and return Open Graph tags
// (og:title, og:image, og:url). Password-protected, draft, or blocked pages won’t preview.
// Refresh LinkedIn’s cache: https://www.linkedin.com/post-inspector/

function normalizeAbsoluteShareUrl(href) {
  const trimmed = String(href).trim();
  if (!trimmed) {
    try {
      return new URL(window.location.href).href;
    } catch {
      return window.location.href;
    }
  }
  try {
    return new URL(trimmed, window.location.href).href;
  } catch {
    return trimmed;
  }
}

function applyShareAnchor(baseHref, anchorRaw) {
  if (anchorRaw == null) return baseHref;
  const trimmed = String(anchorRaw).trim();
  if (!trimmed) return baseHref;
  const id = trimmed.replace(/^#/, '');
  if (!id) return baseHref;
  try {
    const u = new URL(baseHref, window.location.href);
    u.hash = id;
    return u.toString();
  } catch {
    return baseHref;
  }
}

function resolveShareContent(shareEl) {
  const raw = shareEl.dataset.shareContent;
  if (raw !== undefined && String(raw).trim() !== '') {
    try {
      const node = document.querySelector(String(raw).trim());
      if (node) return node.innerText.trim();
    } catch (_) {
      /* invalid selector */
    }
    return '';
  }
  let n = shareEl.parentElement;
  while (n && n !== document.body) {
    const block = n.querySelector('[data-share-content]');
    if (block) return block.innerText.trim();
    n = n.parentElement;
  }
  return '';
}

function parseShareDimension(raw) {
  if (raw == null || raw === '') return null;
  const n = parseInt(String(raw).replace(/px$/i, '').trim(), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function resolveContext(el) {
  let url;
  let title;
  let text;
  let anchor;
  let n = el;
  while (n && n !== document.documentElement) {
    const d = n.dataset;
    if (url === undefined && d.shareUrl !== undefined && String(d.shareUrl).trim() !== '') {
      url = d.shareUrl;
    }
    if (
      title === undefined &&
      d.shareTitle !== undefined &&
      String(d.shareTitle).trim() !== ''
    ) {
      title = d.shareTitle;
    }
    if (text === undefined && d.shareText !== undefined && String(d.shareText).trim() !== '') {
      text = d.shareText;
    }
    if (
      anchor === undefined &&
      d.shareAnchor !== undefined &&
      String(d.shareAnchor).trim() !== ''
    ) {
      anchor = d.shareAnchor;
    }
    n = n.parentElement;
  }
  if (text === undefined) {
    text = resolveShareContent(el);
  }
  const baseHref =
    url !== undefined && String(url).length
      ? String(url)
      : window.location.href.replace(/#.*$/, '');
  return {
    url: normalizeAbsoluteShareUrl(applyShareAnchor(baseHref, anchor)),
    title: title !== undefined ? title : document.title,
    text: text !== undefined ? text : '',
    width: parseShareDimension(el.dataset.shareWidth),
    height: parseShareDimension(el.dataset.shareHeight),
  };
}

function encodeParams(obj) {
  return new URLSearchParams(obj).toString();
}

function openUrl(href, ctx, usePopupSize) {
  const w =
    usePopupSize && ctx && ctx.width != null ? ctx.width : null;
  const h =
    usePopupSize && ctx && ctx.height != null ? ctx.height : null;
  const parts = [];
  if (w != null) parts.push(`width=${w}`);
  if (h != null) parts.push(`height=${h}`);
  if (parts.length) {
    parts.push('scrollbars=yes', 'resizable=yes');
  }
  const features =
    parts.length > 0 ? parts.join(',') : 'noopener,noreferrer';
  const win = window.open(href, '_blank', features);
  if (win) {
    try {
      win.opener = null;
    } catch (_) {
      /* ignore */
    }
  }
}

async function shareNative(ctx) {
  if (navigator.share) {
    try {
      await navigator.share({
        title: ctx.title,
        text: ctx.text,
        url: ctx.url,
      });
    } catch (e) {
      if (e && e.name !== 'AbortError') console.warn('navigator.share failed', e);
    }
  } else {
    await copyLink(ctx.url);
  }
}

const COPY_FEEDBACK_MS = 2000;

async function copyLink(url) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url);
    } else {
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    return true;
  } catch (e) {
    console.warn('copy failed', e);
    return false;
  }
}

function showCopyFeedback(el) {
  if (!el) return;
  const label =
    (el.dataset.shareCopiedLabel && String(el.dataset.shareCopiedLabel).trim()) ||
    'Copied!';
  const origKey = '__shareCopyOriginalHtml';
  if (el[origKey] === undefined) {
    el[origKey] = el.innerHTML;
  }
  if (el.__shareCopyRestoreTimer) {
    clearTimeout(el.__shareCopyRestoreTimer);
  }
  el.textContent = label;
  el.__shareCopyRestoreTimer = setTimeout(() => {
    el.__shareCopyRestoreTimer = null;
    if (el[origKey] !== undefined) {
      el.innerHTML = el[origKey];
    }
  }, COPY_FEEDBACK_MS);
}

function shareTwitter(ctx) {
  const params = { url: ctx.url };
  const tweetText = [ctx.title, ctx.text].filter(Boolean).join('\n\n').trim();
  if (tweetText) params.text = tweetText;
  openUrl(`https://twitter.com/intent/tweet?${encodeParams(params)}`, ctx, false);
}

function shareLinkedIn(ctx) {
  const u = encodeURIComponent(ctx.url);
  const title = (ctx.title || '').trim();
  const summary = (ctx.text || '').trim();
  // share-offsite only accepts url; shareArticle can pass title/summary (LinkedIn may normalize/ignore).
  let href = `https://www.linkedin.com/shareArticle?mini=true&url=${u}`;
  if (title) href += `&title=${encodeURIComponent(title)}`;
  if (summary) href += `&summary=${encodeURIComponent(summary)}`;
  openUrl(href, ctx, true);
}

function shareFacebook(ctx) {
  const u = encodeURIComponent(ctx.url);
  let href = `https://www.facebook.com/sharer/sharer.php?u=${u}`;
  const quote = [ctx.title, ctx.text].filter(Boolean).join('\n\n').trim();
  if (quote) {
    href += `&quote=${encodeURIComponent(quote)}`;
  }
  openUrl(href, ctx, true);
}

function shareEmail(ctx) {
  const subject = encodeURIComponent(ctx.title);
  const body = encodeURIComponent(
    [ctx.text, ctx.url].filter(Boolean).join('\n\n')
  );
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

function shareWhatsapp(ctx) {
  const line =
    [ctx.title, ctx.text, ctx.url].filter(Boolean).join('\n\n').trim() || ctx.url;
  const href = `https://wa.me/?text=${encodeURIComponent(line)}`;
  openUrl(href, ctx, false);
}

function shareReddit(ctx) {
  const params = {
    url: ctx.url,
    title: ctx.title || ctx.text || '',
  };
  openUrl(
    `https://www.reddit.com/submit?${encodeParams(params)}`,
    ctx,
    false
  );
}

function shareTelegram(ctx) {
  const msg = [ctx.title, ctx.text].filter(Boolean).join('\n\n').trim();
  const params = { url: ctx.url };
  if (msg) params.text = msg;
  openUrl(
    `https://t.me/share/url?${encodeParams(params)}`,
    ctx,
    false
  );
}

const handlers = {
  native: (ctx) => shareNative(ctx),
  x: (ctx) => shareTwitter(ctx),
  twitter: (ctx) => shareTwitter(ctx),
  linkedin: (ctx) => shareLinkedIn(ctx),
  facebook: (ctx) => shareFacebook(ctx),
  reddit: (ctx) => shareReddit(ctx),
  telegram: (ctx) => shareTelegram(ctx),
  whatsapp: (ctx) => shareWhatsapp(ctx),
  email: (ctx) => shareEmail(ctx),
};

async function onClick(e) {
  const target = e.target.closest('[data-social-share], [data-share]');
  if (!target) return;
  const kind = (
    target.dataset.socialShare ||
    target.dataset.share ||
    ''
  ).toLowerCase();
  if (kind === 'copy') {
    e.preventDefault();
    const ctx = resolveContext(target);
    const ok = await copyLink(ctx.url);
    if (ok) showCopyFeedback(target);
    return;
  }
  const fn = handlers[kind];
  if (!fn) return;
  e.preventDefault();
  const ctx = resolveContext(target);
  fn(ctx);
}

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('click', onClick);
});
