// Syncs share metadata from the active .card-wrapper into #cardPopup before social-share runs.
// Expects .card-icon or .quote-share-icon with data-share-anchor, data-share-title, data-share-text (set in Webflow).

const POPUP_ID = 'cardPopup';

function buildPageUrlWithAnchor(anchorRaw) {
  const base = window.location.href.replace(/#.*$/, '');
  if (anchorRaw == null || String(anchorRaw).trim() === '') {
    try {
      return new URL(base, window.location.href).href;
    } catch {
      return base;
    }
  }
  const id = String(anchorRaw).trim().replace(/^#/, '');
  if (!id) {
    try {
      return new URL(base, window.location.href).href;
    } catch {
      return base;
    }
  }
  try {
    const u = new URL(base, window.location.href);
    u.hash = id;
    return u.href;
  } catch {
    return `${base}#${id}`;
  }
}

function clearShareAttrsOn(el) {
  el.removeAttribute('data-share-url');
  el.removeAttribute('data-share-anchor');
  el.removeAttribute('data-share-title');
  el.removeAttribute('data-share-text');
}

function syncShareToPopup(shareSource) {
  const popup = document.getElementById(POPUP_ID);
  if (!popup || !shareSource) return;

  const anchor = shareSource.dataset.shareAnchor;
  const title = shareSource.dataset.shareTitle;
  const text = shareSource.dataset.shareText;

  clearShareAttrsOn(popup);
  if (anchor && String(anchor).trim() !== '') {
    popup.setAttribute('data-share-anchor', anchor);
  }
  if (title != null && String(title).trim() !== '') {
    popup.setAttribute('data-share-title', title);
  }
  if (text != null && String(text).trim() !== '') {
    popup.setAttribute('data-share-text', text);
  }

  popup.querySelectorAll('[data-social-share], [data-share]').forEach((node) => {
    clearShareAttrsOn(node);
  });

  const fullUrl = buildPageUrlWithAnchor(anchor);
  const linkText = popup.querySelector('.link-text');
  if (linkText) linkText.textContent = fullUrl;
}

function onCardOpenClick(e) {
  const fromIcon = e.target.closest('.card-icon, .quote-share-icon');
  const fromReadMore = e.target.closest('.card-wrapper .button.is-card');
  if (!fromIcon && !fromReadMore) return;
  if (fromIcon) {
    syncShareToPopup(fromIcon);
    return;
  }
  const card = e.target.closest('.card-wrapper');
  if (!card) return;
  const icon = card.querySelector('.card-icon, .quote-share-icon');
  syncShareToPopup(icon);
}

document.addEventListener('click', onCardOpenClick);
