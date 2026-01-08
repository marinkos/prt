(function () {
    'use strict';
  
    const PLAYER_ID = 'interactiveLottie';
  
    const config = {
      bush: {
        hitLayer: 'hit_bush',
        frameRange: [0, 94],
        auto: true
      },
      bird: {
        hitLayer: 'hit_bird',
        frameRange: [95, 220],
        auto: true
      },
      board: {
        hitLayer: 'hit_board',
        frameRange: [233, 279],
        auto: false // hover only
      }
    };
  
    let player;
    let svg;
    let hoveredElement = null;
    let loopTimeout = null;
    let isLooping = false;
  
    /* ------------------ INIT ------------------ */
  
    function init() {
      player = document.getElementById(PLAYER_ID);
      if (!player) {
        console.error(`❌ #${PLAYER_ID} not found`);
        return;
      }
  
      player.addEventListener('ready', onPlayerReady);
    }
  
    function onPlayerReady() {
      svg = player.shadowRoot.querySelector('svg');
      if (!svg) {
        console.error('❌ SVG not found inside lottie-player');
        return;
      }
  
      player.stop();
      player.seek(0);
  
      setupHitAreas();
      startIdleLoop();
    }
  
    /* ------------------ HIT AREAS ------------------ */
  
    function setupHitAreas() {
      Object.keys(config).forEach(key => {
        const hitName = config[key].hitLayer;
        const hitEl = findHitLayer(hitName);
  
        if (!hitEl) {
          console.warn(`⚠️ Hit layer not found: ${hitName}`);
          return;
        }
  
        hitEl.style.pointerEvents = 'auto';
        hitEl.style.cursor = 'pointer';
  
        hitEl.addEventListener('mouseenter', () => handleHoverIn(key));
        hitEl.addEventListener('mouseleave', () => handleHoverOut(key));
      });
    }
  
    function findHitLayer(name) {
      return (
        svg.querySelector(`[id="${name}"]`) ||
        svg.querySelector(`[data-name="${name}"]`) ||
        Array.from(svg.querySelectorAll('g')).find(
          g => g.getAttribute('data-name') === name
        )
      );
    }
  
    /* ------------------ LOOP LOGIC ------------------ */
  
    function getAutoElements() {
      return Object.keys(config).filter(k => config[k].auto);
    }
  
    function startIdleLoop() {
      isLooping = true;
      clearTimeout(loopTimeout);
      playNextAuto(0);
    }
  
    function playNextAuto(index) {
      if (!isLooping || hoveredElement) return;
  
      const autoEls = getAutoElements();
      if (!autoEls.length) return;
  
      const key = autoEls[index % autoEls.length];
      const [start, end] = config[key].frameRange;
      const duration = frameDuration(start, end);
  
      player.seek(start);
      player.play();
  
      loopTimeout = setTimeout(() => {
        player.stop();
        playNextAuto(index + 1);
      }, duration);
    }
  
    /* ------------------ HOVER ------------------ */
  
    function handleHoverIn(key) {
      if (hoveredElement === key) return;
  
      hoveredElement = key;
      isLooping = false;
      clearTimeout(loopTimeout);
  
      const [start, end] = config[key].frameRange;
      const duration = frameDuration(start, end);
  
      player.seek(start);
      player.play();
  
      loopTimeout = setTimeout(() => {
        if (hoveredElement === key) {
          player.stop();
        }
      }, duration);
    }
  
    function handleHoverOut(key) {
      if (hoveredElement !== key) return;
  
      hoveredElement = null;
      startIdleLoop();
    }
  
    /* ------------------ UTILS ------------------ */
  
    function frameDuration(start, end) {
      const fps = player.getLottie()?.fr || 60;
      return ((end - start) / fps) * 1000;
    }
  
    init();
  })();