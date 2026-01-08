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
        auto: true // changed to true so it plays in the loop
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
      
      let animationData = null;
      try {
        animationData = player.getLottie();
        if (!animationData) {
          console.log('⚠️ getLottie() returned null/undefined, trying alternative methods...');
          if (player.lottie) {
            animationData = player.lottie.animationData || player.lottie;
            console.log('✓ Got animation data from player.lottie');
          } else if (player._lottie) {
            animationData = player._lottie.animationData || player._lottie;
            console.log('✓ Got animation data from player._lottie');
          }
        }
        if (animationData) {
          console.log('✓ Got animation data, layers:', animationData?.layers?.length);
        }
      } catch (e) {
        console.error('❌ Could not get animation data:', e);
      }
      
      const layers = animationData?.layers || [];
      const layerGroups = Array.from(svg.querySelectorAll('g'));
      console.log(`📊 Found ${layerGroups.length} groups in SVG, ${layers.length} layers in animation`);
      
      if (layers.length === 0) {
        console.log('⚠️ No layers from animation data, will search SVG groups directly');
      }
      
      Object.keys(config).forEach(key => {
        const hitName = config[key].hitLayer;
        console.log(`🔍 Looking for hit layer: ${hitName} (for ${key})`);
        
        let hitEl = findHitLayerByName(hitName);
        
        if (!hitEl && layers.length > 0) {
          console.log('  Trying to find by layer index from animation data...');
          hitEl = findHitLayerByIndex(hitName, layers, layerGroups);
        }
        
        if (!hitEl) {
          console.log('  Trying broader search in all SVG groups...');
          hitEl = findHitLayerByBroadSearch(hitName, layerGroups);
        }
        
        if (!hitEl) {
          console.warn(`⚠️ Hit layer not found: ${hitName}`);
          console.log('💡 Sample groups (first 20):', Array.from(svg.querySelectorAll('g')).slice(0, 20).map((g, i) => ({
            index: i,
            id: g.id,
            dataName: g.getAttribute('data-name'),
            className: g.className?.baseVal || g.className,
            ariaLabel: g.getAttribute('aria-label'),
            title: g.querySelector('title')?.textContent
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
      console.log(`  🔎 Searching by name: ${name} (exact match)`);
      
      const allElements = svg.querySelectorAll('*');
      console.log(`  📊 Total elements in SVG: ${allElements.length}`);
      
      const allGroups = Array.from(svg.querySelectorAll('g'));
      console.log(`  📊 Total groups in SVG: ${allGroups.length} (including nested)`);
      
      let found = null;
      
      for (let element of allElements) {
        const elementId = element.id || '';
        const elementDataName = element.getAttribute('data-name') || '';
        
        if (elementId === name) {
          console.log(`  ✓ Found by exact id match: "${elementId}"`);
          found = element;
          break;
        }
        
        if (elementDataName === name) {
          console.log(`  ✓ Found by exact data-name match: "${elementDataName}"`);
          found = element;
          break;
        }
      }
      
      if (found) {
        console.log(`  ✓ Element details:`, {
          tag: found.tagName,
          id: found.id,
          dataName: found.getAttribute('data-name'),
          className: found.className?.baseVal || found.className,
          parent: found.parentElement?.tagName
        });
        return found;
      }
      
      console.log(`  ✗ No exact match found for "${name}"`);
      console.log(`  💡 Sample of all element ids/data-names (first 30):`, 
        Array.from(allElements).slice(0, 30).map(el => ({
          tag: el.tagName,
          id: el.id || null,
          dataName: el.getAttribute('data-name') || null
        })).filter(el => el.id || el.dataName)
      );
      
      return null;
    }
    
    function findHitLayerByBroadSearch(name, layerGroups) {
      console.log(`  🔎 Broad search for: ${name}`);
      
      const nameLower = name.toLowerCase();
      const nameParts = name.split('_');
      
      for (let group of layerGroups) {
        const groupId = String(group.id || '').toLowerCase();
        const groupDataName = String(group.getAttribute('data-name') || '').toLowerCase();
        
        let groupClass = '';
        if (group.className) {
          if (typeof group.className === 'string') {
            groupClass = group.className.toLowerCase();
          } else if (group.className.baseVal) {
            groupClass = String(group.className.baseVal).toLowerCase();
          } else {
            groupClass = String(group.className).toLowerCase();
          }
        }
        
        const titleEl = group.querySelector('title');
        const groupTitle = titleEl ? String(titleEl.textContent || '').toLowerCase() : '';
        
        if (groupId.includes(nameLower) || 
            groupDataName.includes(nameLower) ||
            groupClass.includes(nameLower) ||
            groupTitle.includes(nameLower)) {
          console.log(`  ✓ Found by broad search (id: ${group.id}, data-name: ${group.getAttribute('data-name')})`);
          return group;
        }
        
        if (nameParts.length > 1) {
          const allPartsMatch = nameParts.every(part => 
            groupId.includes(part.toLowerCase()) || 
            groupDataName.includes(part.toLowerCase())
          );
          if (allPartsMatch) {
            console.log(`  ✓ Found by matching name parts`);
            return group;
          }
        }
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