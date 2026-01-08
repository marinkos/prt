(function () {
    'use strict';
  
    const PLAYER_ID = 'interactiveLottie';
  
    const config = {
      bush: {
        hitLayer: 'hit_bush',
        hitId: '617',
        frameRange: [0, 94],
        auto: false
      },
      bird: {
        hitLayer: 'hit_bird',
        hitId: '616',
        frameRange: [95, 220],
        auto: false
      },
      board: {
        hitLayer: 'hit_board',
        hitId: '619',
        frameRange: [233, 279],
        auto: false
      }
    };
  
    let player;
    let svg;
    let hoveredElement = null;
    let loopTimeout = null;
    let isLooping = false;
    let totalFrames = 0;
    let idleRanges = [];
    let currentIdleRangeIndex = 0;
  
    /* ------------------ INIT ------------------ */
  
    function init() {
      const container = document.getElementById(PLAYER_ID);
      if (!container) {
        return;
      }
      
      if (container.tagName === 'LOTTIE-PLAYER') {
        player = container;
      } else {
        player = container.querySelector('lottie-player');
        if (!player) {
          return;
        }
      }
      
      const tryInit = () => {
        if (player.shadowRoot && player.shadowRoot.querySelector('svg')) {
          onPlayerReady();
        }
      };
      
      if (player.loaded) {
        setTimeout(tryInit, 200);
      } else {
        player.addEventListener('ready', () => {
          setTimeout(tryInit, 100);
        });
        
        player.addEventListener('loaded', () => {
          setTimeout(tryInit, 100);
        });
        
        setTimeout(() => {
          if (!svg) {
            tryInit();
          }
        }, 3000);
      }
    }
  
    function onPlayerReady() {
      if (!player.shadowRoot) {
        svg = player.querySelector('svg');
        if (!svg) {
          return;
        }
      } else {
        svg = player.shadowRoot.querySelector('svg');
        if (!svg) {
          svg = player.querySelector('svg');
          if (!svg) {
            return;
          }
        }
      }
  
      player.stop();
      player.seek(0);
  
      setupHitAreas();
      startIdleLoop();
    }
  
    /* ------------------ HIT AREAS ------------------ */
  
    function setupHitAreas() {
      let animationData = null;
      try {
        animationData = player.getLottie();
        if (!animationData) {
          if (player.lottie) {
            animationData = player.lottie.animationData || player.lottie;
          } else if (player._lottie) {
            animationData = player._lottie.animationData || player._lottie;
          }
        }
        if (animationData) {
          totalFrames = animationData.op || animationData.totalFrames || 0;
          if (totalFrames > 0) {
            idleRanges = calculateIdleRanges();
          }
        }
      } catch (e) {
        // Silent fail
      }
      
      const layers = animationData?.layers || [];
      const layerGroups = Array.from(svg.querySelectorAll('g'));
      
      Object.keys(config).forEach(key => {
        const hitName = config[key].hitLayer;
        const hitId = config[key].hitId;
        
        let hitEl = findHitLayerByName(hitName);
        
        if (!hitEl && hitId) {
          hitEl = findHitLayerByName(hitId);
        }
        
        if (!hitEl && layers.length > 0) {
          hitEl = findHitLayerByIndex(hitName, layers, layerGroups);
        }
        
        if (!hitEl) {
          hitEl = findHitLayerByBroadSearch(hitName, layerGroups);
        }
        
        if (!hitEl) {
          return;
        }
  
        hitEl.style.pointerEvents = 'auto';
        hitEl.style.cursor = 'pointer';
  
        hitEl.addEventListener('mouseenter', () => {
          handleHoverIn(key);
        });
        hitEl.addEventListener('mouseleave', () => {
          handleHoverOut(key);
        });
      });
    }
  
    function findHitLayerByName(name) {
      const allElements = svg.querySelectorAll('*');
      let found = null;
      
      for (let element of allElements) {
        const elementId = element.id || '';
        const elementDataName = element.getAttribute('data-name') || '';
        
        if (elementId === name) {
          found = element;
          break;
        }
        
        if (elementDataName === name) {
          found = element;
          break;
        }
      }
      
      return found;
    }
    
    function findHitLayerByBroadSearch(name, layerGroups) {
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
          return group;
        }
        
        if (nameParts.length > 1) {
          const allPartsMatch = nameParts.every(part => 
            groupId.includes(part.toLowerCase()) || 
            groupDataName.includes(part.toLowerCase())
          );
          if (allPartsMatch) {
            return group;
          }
        }
      }
      
      return null;
    }
    
    function findHitLayerByIndex(hitLayerName, layers, layerGroups) {
      const hitLayerIndex = layers.findIndex(layer => layer.nm === hitLayerName);
      if (hitLayerIndex === -1) {
        return null;
      }
      
      const svgIndex = layers.length - 1 - hitLayerIndex;
      
      if (layerGroups[svgIndex]) {
        return layerGroups[svgIndex];
      }
      
      for (let offset = 1; offset <= 5; offset++) {
        if (layerGroups[svgIndex + offset]) {
          return layerGroups[svgIndex + offset];
        }
        if (layerGroups[svgIndex - offset]) {
          return layerGroups[svgIndex - offset];
        }
      }
      
      return null;
    }
  
    /* ------------------ LOOP LOGIC ------------------ */
  
    function calculateIdleRanges() {
      if (!totalFrames || totalFrames === 0) {
        return [];
      }
  
      const hoverRanges = Object.values(config).map(c => c.frameRange);
      const ranges = [];
      let currentStart = 0;
  
      hoverRanges.sort((a, b) => a[0] - b[0]);
  
      for (const [hoverStart, hoverEnd] of hoverRanges) {
        if (currentStart < hoverStart) {
          ranges.push([currentStart, hoverStart - 1]);
        }
        currentStart = Math.max(currentStart, hoverEnd + 1);
      }
  
      if (currentStart < totalFrames) {
        ranges.push([currentStart, totalFrames - 1]);
      }
  
      return ranges;
    }
  
    function startIdleLoop() {
      isLooping = true;
      clearTimeout(loopTimeout);
      
      if (idleRanges.length === 0) {
        idleRanges = calculateIdleRanges();
      }
      
      if (idleRanges.length === 0) {
        return;
      }
      
      currentIdleRangeIndex = 0;
      playNextIdleRange();
    }
  
    function playNextIdleRange() {
      if (!isLooping || hoveredElement) {
        return;
      }
  
      if (idleRanges.length === 0) {
        return;
      }
  
      const [start, end] = idleRanges[currentIdleRangeIndex];
      const duration = frameDuration(start, end);
      
      player.seek(start);
      player.play();
  
      loopTimeout = setTimeout(() => {
        if (!hoveredElement) {
          currentIdleRangeIndex = (currentIdleRangeIndex + 1) % idleRanges.length;
          playNextIdleRange();
        }
      }, duration);
    }
  
    /* ------------------ HOVER ------------------ */
  
    function handleHoverIn(key) {
      if (hoveredElement === key) {
        return;
      }
  
      hoveredElement = key;
      isLooping = false;
      clearTimeout(loopTimeout);
  
      playHoverSegment(key);
    }
  
    function playHoverSegment(key) {
      if (hoveredElement !== null && hoveredElement !== key) {
        return;
      }
  
      const [start, end] = config[key].frameRange;
      const duration = frameDuration(start, end);
  
      player.seek(start);
      player.play();
  
      loopTimeout = setTimeout(() => {
        if (hoveredElement === key) {
          playHoverSegment(key);
        } else {
          startIdleLoop();
        }
      }, duration);
    }
  
    function handleHoverOut(key) {
      if (hoveredElement !== key) {
        return;
      }
  
      hoveredElement = null;
    }
  
    /* ------------------ UTILS ------------------ */
  
    function frameDuration(start, end) {
      let fps = 30;
      try {
        const lottieData = player.getLottie();
        fps = lottieData?.fr || 30;
      } catch (e) {
        // Silent fail, use default
      }
      return ((end - start) / fps) * 1000;
    }
  
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  })();