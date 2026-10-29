/* A Security scripts: the one file Webflow loads (Site settings → Custom code → Footer code, see
 * webflow-footer-code.html). Served from GitHub Pages next to the versioned bundles:
 *   https://dev.marina.al/a-security/app.js        this file (always at this address)
 *   https://dev.marina.al/a-security/vN/<bundle>/  the bundles
 * Loads each bundle only on pages that have its sections, from the version below; `npm run release -- vN`
 * publishes a new version and points this file at it (`--switch` points it at an older one, to roll back).
 * Dev: open any page with ?dev=1 to load the bundles from `npm run dev` on this computer instead
 * (only in your browser; it reloads the page on every save). ?dev=0, or the DEV badge, switches back. */
(() => {
  const VERSION = 'v26';
  const NEEDED = {
    global: () => true,
    home: () => document.querySelector('[data-car-scene], [data-safety-stage], [data-slider], [data-burst-logo]'),
    pursuit: () => document.querySelector('[data-pursuit]'),
  };
  // the folder this file is served from
  const CDN = new URL('.', document.currentScript.src).href;
  const DEV = 'http://127.0.0.1:8790/';
  const KEY = 'a-security-dev';

  const flag = new URLSearchParams(location.search).get('dev');
  let dev = false;
  try {
    if (flag === '1') localStorage.setItem(KEY, '1');
    if (flag === '0') localStorage.removeItem(KEY);
    dev = localStorage.getItem(KEY) === '1';
  } catch (e) {}

  let watching = false;
  const load = (name, fromDev) => {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = fromDev ? `${DEV}${name}/${name}.js` : `${CDN}${VERSION}/${name}/${name}.js`;
    if (fromDev) {
      // dev server not running: fall back to the released version
      script.onerror = () => { console.warn(`[a-security] dev server not reachable, loading ${name} ${VERSION}`); load(name, false); };
      script.onload = () => {
        if (watching) return;
        watching = true;
        new EventSource(`${DEV}esbuild`).addEventListener('change', () => location.reload());
      };
    }
    document.body.append(script);
  };

  const run = () => {
    for (const name in NEEDED) if (NEEDED[name]()) load(name, dev);
    if (dev) {
      const badge = document.createElement('a');
      badge.textContent = 'DEV';
      badge.title = 'Scripts load from this computer (npm run dev). Click to switch back.';
      badge.href = '?dev=0';
      badge.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:2147483647;padding:4px 8px;border-radius:4px;background:#efb814;color:#001e3c;font:700 11px/1 monospace;letter-spacing:1px;text-decoration:none';
      document.body.append(badge);
    }
  };
  // Finsweet filter dropdowns filled from a CMS list (<select fs-list-field> with a Collection List of <option>s):
  // one option per item repeats values, so repeats are removed, and the first option is the label ("Location"),
  // which needs an empty value or Finsweet filters by it and shows nothing. Done here, before Finsweet starts
  // (it starts once the page has loaded; the bundles above load too late for it).
  const tidyFilters = () => {
    for (const select of document.querySelectorAll('select[fs-list-field]')) {
      const seen = new Set();
      [...select.options].forEach((option, i) => {
        if (i === 0) { if (!option.hasAttribute('value')) option.value = ''; return; }
        const text = option.text.trim();
        if (!text || seen.has(text)) (option.closest('.w-dyn-item') || option).remove();
        else seen.add(text);
      });
      select.selectedIndex = 0;
    }
  };

  // in the footer the page is already there; anywhere earlier (head, async), wait for it
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { tidyFilters(); run(); });
  else { tidyFilters(); run(); }
})();
