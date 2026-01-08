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
      
      const container = document.getElementById(PLAYER_ID);
      if (!container) {
        console.error(`❌ #${PLAYER_ID} not found`);
        console.log('💡 Make sure your lottie-player has id="interactiveLottie"');
        return;
      }

      console.log('✓ Found container:', container);
      console.log('  - Tag name:', container.tagName);
      console.log('  - Classes:', container.className);
      
      if (container.tagName === 'LOTTIE-PLAYER') {
        player = container;
        console.log('✓ Container is lottie-player');
      } else {
        player = container.querySelector('lottie-player');
        if (!player) {
          console.error('❌ lottie-player not found inside container');
          console.log('💡 Available children:', Array.from(container.children).map(c => c.tagName));
          return;
        }
        console.log('✓ Found lottie-player inside container:', player);
      }

      console.log('⏳ Waiting for player to be ready...');
      console.log('  - Player loaded:', player.loaded);
      console.log('  - Player ready:', player.ready);
      
      const tryInit = () => {
        if (player.shadowRoot && player.shadowRoot.querySelector('svg')) {
          console.log('SVG is available, initializing...');
          onPlayerReady();
        } else {
          console.log('SVG not ready yet, will retry...');
        }
      };
      
      if (player.loaded) {
        console.log('Player already loaded');
        setTimeout(tryInit, 200);
      } else {
        console.log('Player not loaded yet, waiting for events...');
        
        player.addEventListener('ready', () => {
          console.log('✅ Player ready event received');
          setTimeout(tryInit, 100);
        });
        
        player.addEventListener('loaded', () => {
          console.log('✅ Player loaded event received');
          setTimeout(tryInit, 100);
        });
        
        setTimeout(() => {
          if (!svg) {
            console.log('⏰ Timeout waiting for ready event, trying anyway...');
            tryInit();
          }
        }, 3000);
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
      
      let animationData;
      try {
        animationData = player.getLottie();
        console.log('✓ Got animation data, layers:', animationData?.layers?.length);
      } catch (e) {
        console.error('❌ Could not get animation data:', e);
      }
      
      const layers = animationData?.layers || [];
      const layerGroups = Array.from(svg.querySelectorAll('g'));
      console.log(`📊 Found ${layerGroups.length} groups in SVG, ${layers.length} layers in animation`);
      
      Object.keys(config).forEach(key => {
        const hitName = config[key].hitLayer;
        console.log(`🔍 Looking for hit layer: ${hitName} (for ${key})`);
        
        let hitEl = findHitLayerByName(hitName);
        
        if (!hitEl && layers.length > 0) {
          console.log('  Trying to find by layer index from animation data...');
          hitEl = findHitLayerByIndex(hitName, layers, layerGroups);
        }
        
        if (!hitEl) {
          console.warn(`⚠️ Hit layer not found: ${hitName}`);
          console.log('💡 Sample groups (first 10):', Array.from(svg.querySelectorAll('g')).slice(0, 10).map((g, i) => ({
            index: i,
            id: g.id,
            dataName: g.getAttribute('data-name'),
            className: g.className?.baseVal || g.className,
            ariaLabel: g.getAttribute('aria-label')
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
  
    function findHitLayerByName(name) {
      console.log(`  🔎 Searching by name: ${name}`);
      
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
        g => g.getAttribute('data-name') === name || g.id === name
      );
      if (found) {
        console.log(`  ✓ Found by iterating groups`);
        return found;
      }
      
      return null;
    }
    
    function findHitLayerByIndex(hitLayerName, layers, layerGroups) {
      console.log(`  🔎 Searching by layer index for: ${hitLayerName}`);
      
      const hitLayerIndex = layers.findIndex(layer => layer.nm === hitLayerName);
      if (hitLayerIndex === -1) {
        console.log(`  ✗ Layer "${hitLayerName}" not found in animation layers`);
        console.log(`  💡 Available layer names (first 20):`, layers.slice(0, 20).map(l => l.nm).filter(Boolean));
        return null;
      }
      
      console.log(`  ✓ Found layer "${hitLayerName}" at index ${hitLayerIndex} in animation data`);
      
      const svgIndex = layers.length - 1 - hitLayerIndex;
      console.log(`  📍 Looking for SVG group at index ${svgIndex} (reverse order)`);
      
      if (layerGroups[svgIndex]) {
        console.log(`  ✓ Found group at index ${svgIndex}`);
        return layerGroups[svgIndex];
      }
      
      console.log(`  ⚠️ Group not found at expected index, trying nearby indices...`);
      for (let offset = 1; offset <= 5; offset++) {
        if (layerGroups[svgIndex + offset]) {
          console.log(`  ✓ Found group at index ${svgIndex + offset} (offset: +${offset})`);
          return layerGroups[svgIndex + offset];
        }
        if (layerGroups[svgIndex - offset]) {
          console.log(`  ✓ Found group at index ${svgIndex - offset} (offset: -${offset})`);
          return layerGroups[svgIndex - offset];
        }
      }
      
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