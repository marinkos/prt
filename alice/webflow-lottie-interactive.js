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
      console.log('🚀 Initializing Lottie interactive script...');
      console.log('🔍 Looking for element with ID:', PLAYER_ID);
      
      player = document.getElementById(PLAYER_ID);
      if (!player) {
        console.error(`❌ #${PLAYER_ID} not found`);
        console.log('💡 Make sure your lottie-player has id="interactiveLottie"');
        return;
      }
  
      console.log('✓ Found lottie-player:', player);
      console.log('⏳ Waiting for player to be ready...');
      
      if (player.loaded) {
        console.log('Player already loaded, calling onPlayerReady immediately');
        onPlayerReady();
      } else {
        player.addEventListener('ready', onPlayerReady);
        player.addEventListener('loaded', () => {
          console.log('Player loaded event fired');
          if (!svg) onPlayerReady();
        });
      }
    }
  
    function onPlayerReady() {
      console.log('✅ Player ready event fired');
      
      if (!player.shadowRoot) {
        console.error('❌ Player shadowRoot not found');
        console.log('💡 Trying to find SVG in player directly...');
        svg = player.querySelector('svg');
        if (!svg) {
          console.error('❌ SVG not found in player or shadowRoot');
          return;
        }
      } else {
        console.log('✓ Found shadowRoot');
        svg = player.shadowRoot.querySelector('svg');
        if (!svg) {
          console.error('❌ SVG not found inside lottie-player shadowRoot');
          console.log('💡 Trying to find SVG in player directly...');
          svg = player.querySelector('svg');
          if (!svg) {
            console.error('❌ SVG not found anywhere');
            return;
          }
        }
      }
      
      console.log('✓ SVG found:', svg);
      console.log('📊 SVG groups count:', svg.querySelectorAll('g').length);
  
      player.stop();
      player.seek(0);
      console.log('✓ Player stopped and seeked to 0');
  
      setupHitAreas();
      startIdleLoop();
    }
  
    /* ------------------ HIT AREAS ------------------ */
  
    function setupHitAreas() {
      console.log('🎯 Setting up hit areas...');
      console.log('📋 Config keys:', Object.keys(config));
      
      Object.keys(config).forEach(key => {
        const hitName = config[key].hitLayer;
        console.log(`🔍 Looking for hit layer: ${hitName} (for ${key})`);
        
        const hitEl = findHitLayer(hitName);
  
        if (!hitEl) {
          console.warn(`⚠️ Hit layer not found: ${hitName}`);
          console.log('💡 Available groups in SVG:', Array.from(svg.querySelectorAll('g')).map(g => ({
            id: g.id,
            dataName: g.getAttribute('data-name'),
            className: g.className.baseVal
          })));
          return;
        }
  
        console.log(`✓ Found hit layer for ${key}:`, hitEl);
        hitEl.style.pointerEvents = 'auto';
        hitEl.style.cursor = 'pointer';
  
        hitEl.addEventListener('mouseenter', () => {
          console.log(`🖱️ Mouse enter: ${key}`);
          handleHoverIn(key);
        });
        hitEl.addEventListener('mouseleave', () => {
          console.log(`🖱️ Mouse leave: ${key}`);
          handleHoverOut(key);
        });
        
        console.log(`✓ Hover listeners attached to ${key}`);
      });
      
      console.log('✅ Hit areas setup complete');
    }
  
    function findHitLayer(name) {
      console.log(`  🔎 Searching for: ${name}`);
      
      let found = svg.querySelector(`[id="${name}"]`);
      if (found) {
        console.log(`  ✓ Found by id attribute`);
        return found;
      }
      
      found = svg.querySelector(`[data-name="${name}"]`);
      if (found) {
        console.log(`  ✓ Found by data-name attribute`);
        return found;
      }
      
      found = Array.from(svg.querySelectorAll('g')).find(
        g => g.getAttribute('data-name') === name
      );
      if (found) {
        console.log(`  ✓ Found by iterating groups`);
        return found;
      }
      
      console.log(`  ✗ Not found by any method`);
      return null;
    }
  
    /* ------------------ LOOP LOGIC ------------------ */
  
    function getAutoElements() {
      return Object.keys(config).filter(k => config[k].auto);
    }
  
    function startIdleLoop() {
      console.log('🔄 Starting idle loop...');
      isLooping = true;
      clearTimeout(loopTimeout);
      playNextAuto(0);
    }
  
    function playNextAuto(index) {
      if (!isLooping || hoveredElement) {
        console.log(`⏸️ Loop paused - isLooping: ${isLooping}, hoveredElement: ${hoveredElement}`);
        return;
      }
  
      const autoEls = getAutoElements();
      if (!autoEls.length) {
        console.warn('⚠️ No auto elements found');
        return;
      }
  
      const key = autoEls[index % autoEls.length];
      const [start, end] = config[key].frameRange;
      const duration = frameDuration(start, end);
  
      console.log(`▶️ Playing ${key}: frames ${start}-${end} (${duration}ms)`);
      
      player.seek(start);
      player.play();
  
      loopTimeout = setTimeout(() => {
        console.log(`⏹️ Stopping ${key}`);
        player.stop();
        playNextAuto(index + 1);
      }, duration);
    }
  
    /* ------------------ HOVER ------------------ */
  
    function handleHoverIn(key) {
      console.log(`🎯 Hover IN: ${key}`);
      
      if (hoveredElement === key) {
        console.log(`  ⏭️ Already hovering ${key}, skipping`);
        return;
      }
  
      hoveredElement = key;
      isLooping = false;
      clearTimeout(loopTimeout);
      console.log(`  ⏸️ Stopped idle loop`);
  
      const [start, end] = config[key].frameRange;
      const duration = frameDuration(start, end);
  
      console.log(`  ▶️ Playing ${key}: frames ${start}-${end} (${duration}ms)`);
      player.seek(start);
      player.play();
  
      loopTimeout = setTimeout(() => {
        if (hoveredElement === key) {
          console.log(`  ⏹️ Animation complete for ${key}`);
          player.stop();
        }
      }, duration);
    }
  
    function handleHoverOut(key) {
      console.log(`🎯 Hover OUT: ${key}`);
      
      if (hoveredElement !== key) {
        console.log(`  ⏭️ Not hovering ${key} (hovering ${hoveredElement}), skipping`);
        return;
      }
  
      hoveredElement = null;
      console.log(`  🔄 Resuming idle loop`);
      startIdleLoop();
    }
  
    /* ------------------ UTILS ------------------ */
  
    function frameDuration(start, end) {
      let fps = 60;
      try {
        const lottieData = player.getLottie();
        fps = lottieData?.fr || 60;
        console.log(`  📊 Frame rate: ${fps} fps`);
      } catch (e) {
        console.warn('  ⚠️ Could not get frame rate, using default 60');
      }
      return ((end - start) / fps) * 1000;
    }
  
    if (document.readyState === 'loading') {
      console.log('📄 Document still loading, waiting for DOMContentLoaded...');
      document.addEventListener('DOMContentLoaded', init);
    } else {
      console.log('📄 Document ready, initializing...');
      init();
    }
  })();