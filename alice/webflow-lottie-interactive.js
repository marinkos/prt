(function() {
    'use strict';

    const SELECTOR = '#interactiveLottie, lottie-player, [data-lottie], [data-animation-type="lottie"], [data-w-id][data-animation-type="lottie"], .lottie-animation, #lottie-container, .w-embed';
    
    const config = {
        bush: {
            hitLayer: 'hit_bush',
            frameRange: [0, 94]
        },
        bird: {
            hitLayer: 'hit_bird',
            frameRange: [95, 220]
        },
        board: {
            hitLayer: 'hit_board',
            frameRange: [233, 279]
        }
    };

    let animation = null;
    let hoveredElement = null;
    let loopTimeout = null;
    let isLooping = true;
    let isInitialized = false;

    function init() {
        if (isInitialized) return;
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', findAndInitAnimation);
        } else {
            findAndInitAnimation();
        }
    }

    function findAndInitAnimation() {
        console.log('🔍 Searching for #interactiveLottie animation...');
        
        const targetContainer = document.getElementById('interactiveLottie');
        if (!targetContainer) {
            const retryCount = findAndInitAnimation.retryCount || 0;
            findAndInitAnimation.retryCount = retryCount + 1;
            
            if (retryCount < 10) {
                console.log(`#interactiveLottie not found, retrying... (attempt ${retryCount + 1}/10)`);
                setTimeout(findAndInitAnimation, 1000);
            } else {
                console.error('❌ Could not find #interactiveLottie element after 10 attempts.');
                console.error('💡 Make sure you added id="interactiveLottie" to your Lottie element in Webflow');
            }
            return;
        }
        
        console.log('✓ Found #interactiveLottie container:', targetContainer);
        
        const lottiePlayer = targetContainer.tagName === 'LOTTIE-PLAYER' 
            ? targetContainer 
            : targetContainer.querySelector('lottie-player');
        
        if (lottiePlayer) {
            console.log('Found lottie-player component');
            initLottiePlayer(lottiePlayer);
            return;
        }
        
        if (targetContainer.__lottie) {
            console.log('Found Lottie instance on container.__lottie');
            animation = targetContainer.__lottie;
            setupAnimation();
            return;
        }
        
        const svg = targetContainer.querySelector('svg');
        if (svg) {
            console.log('Found SVG in #interactiveLottie, checking for Lottie instance...');
            findLottieInstance(targetContainer, svg);
            if (animation) return;
        }
        
        const wId = targetContainer.getAttribute('data-w-id');
        if (wId) {
            console.log('Found Webflow element with data-w-id:', wId);
            if (window.Webflow && window.Webflow.require) {
                setTimeout(() => findLottieInstance(targetContainer, svg), 100);
                return;
            }
        }

        if (window.lottie) {
            console.log('window.lottie found, checking registered animations for #interactiveLottie...');
            
            if (typeof window.lottie.getRegisteredAnimations === 'function') {
                const registered = window.lottie.getRegisteredAnimations();
                console.log(`Found ${registered.length} registered Lottie animations`);
                
                for (let anim of registered) {
                    if (anim.wrapper === targetContainer || (svg && anim.renderer && anim.renderer.svgElement === svg)) {
                        console.log('✓ Found matching Lottie instance for #interactiveLottie');
                        animation = anim;
                        setupAnimation();
                        return;
                    }
                    if (anim.renderer && anim.renderer.svgElement && targetContainer.contains(anim.renderer.svgElement)) {
                        console.log('✓ Found Lottie instance by SVG containment');
                        animation = anim;
                        setupAnimation();
                        return;
                    }
                }
            }
            
            if (window.lottie.instances && window.lottie.instances.length > 0) {
                for (let anim of window.lottie.instances) {
                    if (anim.wrapper === targetContainer || (svg && anim.renderer && anim.renderer.svgElement === svg)) {
                        console.log('✓ Found matching Lottie instance in instances array');
                        animation = anim;
                        setupAnimation();
                        return;
                    }
                }
            }
        }

        if (!animation) {
            const retryCount = findAndInitAnimation.retryCount || 0;
            findAndInitAnimation.retryCount = retryCount + 1;
            
            if (retryCount < 10) {
                console.log(`Lottie instance not found for #interactiveLottie, retrying... (attempt ${retryCount + 1}/10)`);
                setTimeout(findAndInitAnimation, 1000);
            } else {
                console.error('❌ Could not find Lottie animation instance for #interactiveLottie after 10 attempts.');
                console.error('💡 TROUBLESHOOTING:');
                console.error('1. Make sure your Lottie animation is embedded in the element with id="interactiveLottie"');
                console.error('2. Check browser console for any Lottie-related errors');
                console.error('3. Try running: window.lottie.getRegisteredAnimations() in console');
                console.error('4. Verify the animation has loaded by checking for SVG inside #interactiveLottie');
            }
        }
    }

    function findLottieInstance(container, svg) {
        if (!container) return;
        
        console.log('🔎 Searching for Lottie instance in container:', container);
        
        if (container.__lottie) {
            console.log('✓ Found Lottie instance at container.__lottie');
            animation = container.__lottie;
            setupAnimation();
            return;
        }

        const possibleProps = ['lottie', '_lottie', 'animation', '_animation', 'animInstance', 'lottieInstance'];
        for (let prop of possibleProps) {
            if (container[prop] && container[prop].totalFrames !== undefined) {
                console.log(`✓ Found Lottie instance at container.${prop}`);
                animation = container[prop];
                setupAnimation();
                return;
            }
        }

        const animId = container.getAttribute('data-animation-id');
        if (animId && window[animId]) {
            console.log(`✓ Found Lottie instance at window.${animId}`);
            animation = window[animId];
            setupAnimation();
            return;
        }

        let element = container;
        let depth = 0;
        while (element && !animation && depth < 5) {
            if (element.__lottie) {
                console.log(`✓ Found Lottie instance at parent element (depth ${depth}).__lottie`);
                animation = element.__lottie;
                setupAnimation();
                return;
            }
            element = element.parentElement;
            depth++;
        }

        if (svg) {
            if (svg.__lottie) {
                console.log('✓ Found Lottie instance at svg.__lottie');
                animation = svg.__lottie;
                setupAnimation();
                return;
            }
            
            if (svg.parentElement && svg.parentElement.__lottie) {
                console.log('✓ Found Lottie instance at svg.parentElement.__lottie');
                animation = svg.parentElement.__lottie;
                setupAnimation();
                return;
            }
            
            let svgParent = svg.parentElement;
            let svgDepth = 0;
            while (svgParent && !animation && svgDepth < 3) {
                if (svgParent.__lottie) {
                    console.log(`✓ Found Lottie instance at SVG parent (depth ${svgDepth}).__lottie`);
                    animation = svgParent.__lottie;
                    setupAnimation();
                    return;
                }
                svgParent = svgParent.parentElement;
                svgDepth++;
            }
        }

        if (window.lottie && typeof window.lottie.getRegisteredAnimations === 'function') {
            const animations = window.lottie.getRegisteredAnimations();
            if (animations && animations.length > 0) {
                console.log(`Checking ${animations.length} registered animations for match...`);
                
                for (let anim of animations) {
                    if (anim.wrapper === container || (svg && anim.renderer && anim.renderer.svgElement === svg)) {
                        console.log('✓ Found matching Lottie instance via getRegisteredAnimations (exact match)');
                        animation = anim;
                        setupAnimation();
                        return;
                    }
                }
                
                if (container.id === 'interactiveLottie') {
                    console.log('⚠ Container #interactiveLottie found, trying to match by SVG containment...');
                    for (let anim of animations) {
                        if (anim.renderer && anim.renderer.svgElement) {
                            const animSvg = anim.renderer.svgElement;
                            if (animSvg === svg || container.contains(animSvg)) {
                                console.log('✓ Found matching Lottie instance by SVG containment');
                                animation = anim;
                                setupAnimation();
                                return;
                            }
                        }
                        if (anim.wrapper && container.contains(anim.wrapper)) {
                            console.log('✓ Found matching Lottie instance by wrapper containment');
                            animation = anim;
                            setupAnimation();
                            return;
                        }
                    }
                    
                    if (svg) {
                        console.log('⚠ Trying to match by SVG structure...');
                        const svgId = svg.id || svg.getAttribute('data-name');
                        for (let anim of animations) {
                            if (anim.renderer && anim.renderer.svgElement) {
                                const animSvg = anim.renderer.svgElement;
                                if (animSvg.id === svgId || animSvg.getAttribute('data-name') === svgId) {
                                    console.log('✓ Found matching Lottie instance by SVG ID/name');
                                    animation = anim;
                                    setupAnimation();
                                    return;
                                }
                            }
                        }
                    }
                    
                    if (animations.length === 1) {
                        console.log('⚠ Only one animation found, using it for #interactiveLottie');
                        animation = animations[0];
                        setupAnimation();
                        return;
                    }
                }
            }
        }
        
        if (window.lottie && window.lottie.instances && window.lottie.instances.length > 0) {
            console.log(`Checking ${window.lottie.instances.length} instances in instances array...`);
            for (let anim of window.lottie.instances) {
                if (anim.wrapper === container || (svg && anim.renderer && anim.renderer.svgElement === svg)) {
                    console.log('✓ Found matching Lottie instance in instances array');
                    animation = anim;
                    setupAnimation();
                    return;
                }
                if (container.id === 'interactiveLottie' && anim.renderer && anim.renderer.svgElement && container.contains(anim.renderer.svgElement)) {
                    console.log('✓ Found matching Lottie instance in instances array by SVG containment');
                    animation = anim;
                    setupAnimation();
                    return;
                }
            }
        }

        if (container.id === 'interactiveLottie') {
            const retryCount = findLottieInstance.retryCount || 0;
            findLottieInstance.retryCount = retryCount + 1;
            
            if (retryCount < 5) {
                console.log(`⚠ Container #interactiveLottie found but instance not accessible, retrying... (attempt ${retryCount + 1}/5)`);
                setTimeout(() => {
                    if (!animation) {
                        const retrySvg = container.querySelector('svg');
                        findLottieInstance(container, retrySvg);
                    }
                }, 1500);
                return;
            } else {
                console.error('❌ Could not find Lottie instance after 5 retries');
                console.error('💡 Try running in console: window.lottie.getRegisteredAnimations()');
                console.error('💡 Then check which animation\'s wrapper matches #interactiveLottie');
            }
        }
        
        if (container.id !== 'interactiveLottie') {
            console.log('⚠ Skipping container (not #interactiveLottie):', container);
            return;
        }
        
        console.log('⚠ Could not find Lottie instance in #interactiveLottie container');
    }

    function initLottiePlayer(player) {
        console.log('Initializing lottie-player...');
        
        if (player.loaded) {
            console.log('lottie-player already loaded');
            handleLottiePlayerReady(player);
        } else {
            player.addEventListener('ready', () => {
                console.log('lottie-player ready event fired');
                handleLottiePlayerReady(player);
            });
            
            player.addEventListener('loaded', () => {
                console.log('lottie-player loaded event fired');
                handleLottiePlayerReady(player);
            });
            
            setTimeout(() => {
                if (!isInitialized) {
                    console.log('lottie-player timeout, trying anyway...');
                    handleLottiePlayerReady(player);
                }
            }, 2000);
        }
    }
    
    function handleLottiePlayerReady(player) {
        if (isInitialized) return;
        
        console.log('Handling lottie-player ready...');
        
        if (player.lottie && player.lottie.totalFrames !== undefined) {
            console.log('Found player.lottie instance');
            animation = player.lottie;
            setupAnimation();
        } else {
            console.log('Using lottie-player API directly');
            setupLottiePlayerInteractions(player);
        }
    }

    function setupLottiePlayerInteractions(player) {
        console.log('Setting up lottie-player interactions...');
        
        let animationData;
        try {
            animationData = player.getLottie();
        } catch (e) {
            console.error('Error getting Lottie data:', e);
        }
        
        if (!animationData) {
            console.log('Animation data not available yet, retrying...');
            setTimeout(() => setupLottiePlayerInteractions(player), 500);
            return;
        }

        console.log('Animation data loaded, layers:', animationData.layers?.length);
        isInitialized = true;
        setupHoverListenersForPlayer(player);
        startLoopingForPlayer(player);
    }

    function setupAnimation() {
        if (!animation) {
            console.error('Animation instance not found');
            return;
        }

        console.log('Lottie animation found!', animation);
        isInitialized = true;

        if (animation.isLoaded !== undefined && !animation.isLoaded) {
            animation.addEventListener('data_ready', onAnimationReady);
        } else {
            onAnimationReady();
        }
    }

    function onAnimationReady() {
        console.log('Animation ready, total frames:', animation.totalFrames);
        setupHoverListeners();
        startLooping();
    }

    function startLooping() {
        isLooping = true;
        if (loopTimeout) {
            clearTimeout(loopTimeout);
        }
        cycleThroughElements(Object.keys(config));
    }

    function cycleThroughElements(elements, startIndex = 0) {
        if (!isLooping && !hoveredElement) return;
        if (elements.length === 0 || !animation) return;

        let currentIndex = startIndex;

        const playNext = () => {
            if (!animation) return;

            if (isLooping && hoveredElement && elements.includes(hoveredElement)) {
                while (elements[currentIndex] === hoveredElement) {
                    currentIndex = (currentIndex + 1) % elements.length;
                }
            }

            const elementKey = elements[currentIndex];
            const { frameRange } = config[elementKey];
            const [startFrame, endFrame] = frameRange;
            const duration = ((endFrame - startFrame) / animation.frameRate) * 1000;

            if (animation.setSegment) {
                animation.setSegment(startFrame, endFrame);
                animation.play();
            } else if (animation.goToAndPlay) {
                animation.goToAndPlay(startFrame, true);
            }

            currentIndex = (currentIndex + 1) % elements.length;

            if (isLooping || hoveredElement) {
                loopTimeout = setTimeout(playNext, duration);
            }
        };

        playNext();
    }

    function startLoopingForPlayer(player) {
        isLooping = true;
        if (loopTimeout) {
            clearTimeout(loopTimeout);
        }
        cycleThroughElementsForPlayer(player, Object.keys(config));
    }

    function cycleThroughElementsForPlayer(player, elements, startIndex = 0) {
        if (!isLooping && !hoveredElement) return;
        if (elements.length === 0) return;

        let currentIndex = startIndex;

        const playNext = () => {
            if (hoveredElement && elements.includes(hoveredElement)) {
                while (elements[currentIndex] === hoveredElement) {
                    currentIndex = (currentIndex + 1) % elements.length;
                }
            }

            const elementKey = elements[currentIndex];
            const { frameRange } = config[elementKey];
            const [startFrame, endFrame] = frameRange;
            const duration = ((endFrame - startFrame) / 60) * 1000;

            player.seek(startFrame);
            player.setDirection(1);
            player.play();

            currentIndex = (currentIndex + 1) % elements.length;

            if (isLooping || hoveredElement) {
                loopTimeout = setTimeout(playNext, duration);
            }
        };

        playNext();
    }

    function setupHoverListeners() {
        if (!animation || !animation.renderer) {
            console.warn('Animation renderer not available, retrying...');
            setTimeout(setupHoverListeners, 500);
            return;
        }

        setTimeout(() => {
            const container = animation.renderer.svgElement?.parentElement || 
                           document.querySelector(SELECTOR);
            const svg = animation.renderer.svgElement || 
                       container?.querySelector('svg');
            
            if (!svg) {
                console.error('SVG not found, retrying...');
                setTimeout(setupHoverListeners, 500);
                return;
            }

            const animationData = animation.animationData || animation.renderer.animationData;
            const layers = animationData?.layers || [];

            const hitLayerIndices = {};
            
            layers.forEach((layer, index) => {
                const layerName = layer.nm;
                if (layerName && layerName.startsWith('hit_')) {
                    const elementKey = layerName.replace('hit_', '');
                    if (config[elementKey]) {
                        hitLayerIndices[elementKey] = index;
                    }
                }
            });

            console.log('Found hit layers:', hitLayerIndices);

            const layerGroups = Array.from(svg.querySelectorAll('g'));
            
            Object.keys(hitLayerIndices).forEach(elementKey => {
                const layerIndex = hitLayerIndices[elementKey];
                const svgIndex = layers.length - 1 - layerIndex;
                
                if (layerGroups[svgIndex]) {
                    const hitElement = layerGroups[svgIndex];
                    
                    hitElement.style.pointerEvents = 'auto';
                    hitElement.style.cursor = 'pointer';
                    
                    hitElement.addEventListener('mouseenter', (e) => {
                        e.stopPropagation();
                        handleHoverIn(elementKey);
                    });
                    
                    hitElement.addEventListener('mouseleave', (e) => {
                        e.stopPropagation();
                        handleHoverOut(elementKey);
                    });
                    
                    console.log(`✓ Hover listener attached to ${elementKey}`);
                } else {
                    console.warn(`Could not find SVG element for ${elementKey}`);
                    attachHoverToGroupBySearch(elementKey, svg);
                }
            });
        }, 1000);
    }

    function setupHoverListenersForPlayer(player) {
        console.log('Setting up hover listeners for lottie-player...');
        
        let svg = player.querySelector('svg');
        if (!svg) {
            const shadowRoot = player.shadowRoot;
            if (shadowRoot) {
                svg = shadowRoot.querySelector('svg');
                console.log('Found SVG in shadow DOM');
            }
        }
        
        if (!svg) {
            const container = player.parentElement;
            if (container) {
                svg = container.querySelector('svg');
            }
        }
        
        if (!svg) {
            console.log('SVG not found, retrying...');
            setTimeout(() => setupHoverListenersForPlayer(player), 500);
            return;
        }

        console.log('SVG found:', svg);
        
        let animationData;
        try {
            animationData = player.getLottie();
        } catch (e) {
            console.error('Error getting animation data:', e);
            setTimeout(() => setupHoverListenersForPlayer(player), 500);
            return;
        }
        
        if (!animationData) {
            console.log('Animation data not available, retrying...');
            setTimeout(() => setupHoverListenersForPlayer(player), 500);
            return;
        }

        const layers = animationData.layers || [];
        console.log('Total layers:', layers.length);

        const hitLayerIndices = {};
        layers.forEach((layer, index) => {
            const layerName = layer.nm;
            if (layerName && layerName.startsWith('hit_')) {
                const elementKey = layerName.replace('hit_', '');
                if (config[elementKey]) {
                    hitLayerIndices[elementKey] = index;
                    console.log(`Found hit layer: ${layerName} -> ${elementKey} at index ${index}`);
                }
            }
        });

        console.log('Hit layer indices:', hitLayerIndices);

        const layerGroups = Array.from(svg.querySelectorAll('g'));
        console.log('Found', layerGroups.length, 'group elements in SVG');

        Object.keys(hitLayerIndices).forEach(elementKey => {
            const layerIndex = hitLayerIndices[elementKey];
            const svgIndex = layers.length - 1 - layerIndex;
            
            console.log(`Looking for ${elementKey}: layerIndex=${layerIndex}, svgIndex=${svgIndex}`);
            
            let hitElement = null;
            
            if (layerGroups[svgIndex]) {
                hitElement = layerGroups[svgIndex];
                console.log(`✓ Found element for ${elementKey} at index ${svgIndex}`);
            } else {
                console.warn(`Could not find element at index ${svgIndex} for ${elementKey}, trying search...`);
                hitElement = findLayerGroupByName(svg, config[elementKey].hitLayer);
            }
            
            if (hitElement) {
                hitElement.style.pointerEvents = 'auto';
                hitElement.style.cursor = 'pointer';
                
                hitElement.addEventListener('mouseenter', (e) => {
                    e.stopPropagation();
                    console.log(`Mouse enter: ${elementKey}`);
                    handleHoverInForPlayer(elementKey, player);
                });
                
                hitElement.addEventListener('mouseleave', (e) => {
                    e.stopPropagation();
                    console.log(`Mouse leave: ${elementKey}`);
                    handleHoverOutForPlayer(elementKey, player);
                });
                
                console.log(`✓ Hover listener attached to ${elementKey}`);
            } else {
                console.error(`✗ Could not find SVG element for ${elementKey}`);
            }
        });
    }
    
    function findLayerGroupByName(svg, layerName) {
        const groups = svg.querySelectorAll('g');
        for (let group of groups) {
            if (group.getAttribute('data-name') === layerName || 
                group.getAttribute('id') === layerName ||
                group.id === layerName) {
                return group;
            }
        }
        return null;
    }

    function attachHoverToGroupBySearch(elementKey, svg) {
        const hitLayerName = config[elementKey].hitLayer;
        const groups = svg.querySelectorAll('g');
        groups.forEach((group) => {
            if (group.getAttribute('data-name') === hitLayerName) {
                group.style.pointerEvents = 'auto';
                group.style.cursor = 'pointer';
                group.addEventListener('mouseenter', () => handleHoverIn(elementKey));
                group.addEventListener('mouseleave', () => handleHoverOut(elementKey));
            }
        });
    }

    function handleHoverIn(elementKey) {
        if (hoveredElement === elementKey || !animation) return;
        
        console.log(`Hover in: ${elementKey}`);
        hoveredElement = elementKey;
        isLooping = false;
        
        if (loopTimeout) {
            clearTimeout(loopTimeout);
            loopTimeout = null;
        }

        const { frameRange } = config[elementKey];
        const [startFrame, endFrame] = frameRange;
        
        if (animation.setSegment) {
            animation.setSegment(startFrame, endFrame);
            animation.play();
        } else if (animation.goToAndPlay) {
            animation.goToAndPlay(startFrame, true);
        }

        const otherElements = Object.keys(config).filter(el => el !== elementKey);
        if (otherElements.length > 0) {
            cycleThroughElements(otherElements);
        }
    }

    function handleHoverOut(elementKey) {
        if (hoveredElement !== elementKey || !animation) return;
        
        console.log(`Hover out: ${elementKey}`);
        
        if (loopTimeout) {
            clearTimeout(loopTimeout);
            loopTimeout = null;
        }

        const { frameRange } = config[elementKey];
        const [startFrame, endFrame] = frameRange;
        const currentFrame = animation.currentFrame || startFrame;
        const remainingFrames = Math.max(0, endFrame - currentFrame);
        const remainingDuration = (remainingFrames / animation.frameRate) * 1000;
        
        setTimeout(() => {
            hoveredElement = null;
            isLooping = true;
            startLooping();
        }, Math.max(remainingDuration, 100));
    }

    function handleHoverInForPlayer(elementKey, player) {
        if (hoveredElement === elementKey) return;
        
        console.log(`Hover in: ${elementKey}`);
        hoveredElement = elementKey;
        isLooping = false;
        
        if (loopTimeout) {
            clearTimeout(loopTimeout);
            loopTimeout = null;
        }

        const { frameRange } = config[elementKey];
        const [startFrame, endFrame] = frameRange;
        
        console.log(`Playing ${elementKey} from frame ${startFrame} to ${endFrame}`);
        
        try {
            player.seek(startFrame);
            player.setDirection(1);
            player.play();
        } catch (e) {
            console.error('Error playing animation:', e);
        }

        const otherElements = Object.keys(config).filter(el => el !== elementKey);
        if (otherElements.length > 0) {
            cycleThroughElementsForPlayer(player, otherElements);
        }
    }

    function handleHoverOutForPlayer(elementKey, player) {
        if (hoveredElement !== elementKey) return;
        
        console.log(`Hover out: ${elementKey}`);
        
        const { frameRange } = config[elementKey];
        const [startFrame, endFrame] = frameRange;
        const currentFrame = player.currentFrame || player.getLottie()?.currentFrame || startFrame;
        const remainingFrames = Math.max(0, endFrame - currentFrame);
        const frameRate = player.getLottie()?.fr || 60;
        const remainingDuration = (remainingFrames / frameRate) * 1000;
        
        if (loopTimeout) {
            clearTimeout(loopTimeout);
            loopTimeout = null;
        }
        
        setTimeout(() => {
            hoveredElement = null;
            isLooping = true;
            startLoopingForPlayer(player);
        }, Math.max(remainingDuration, 100));
    }

    window.debugLottieInteractive = function() {
        console.log('=== LOTTIE INTERACTIVE DEBUG INFO ===');
        console.log('Current SELECTOR:', SELECTOR);
        console.log('Animation instance:', animation);
        console.log('Is initialized:', isInitialized);
        console.log('Hovered element:', hoveredElement);
        console.log('Is looping:', isLooping);
        
        const targetContainer = document.getElementById('interactiveLottie');
        console.log('\n--- #interactiveLottie Container ---');
        if (targetContainer) {
            console.log('✓ Found:', targetContainer);
            console.log('  - Classes:', targetContainer.className);
            console.log('  - Has __lottie:', !!targetContainer.__lottie);
            const svg = targetContainer.querySelector('svg');
            console.log('  - Has SVG:', !!svg);
            if (svg) {
                console.log('  - SVG parent:', svg.parentElement);
            }
        } else {
            console.log('✗ NOT FOUND - Make sure you added id="interactiveLottie"');
        }
        
        console.log('\n--- Checking window.lottie ---');
        if (window.lottie) {
            console.log('✓ window.lottie exists');
            if (typeof window.lottie.getRegisteredAnimations === 'function') {
                const registered = window.lottie.getRegisteredAnimations();
                console.log(`Found ${registered.length} registered animations:`);
                registered.forEach((anim, i) => {
                    console.log(`  Animation ${i + 1}:`, {
                        wrapper: anim.wrapper,
                        wrapperId: anim.wrapper?.id,
                        wrapperClass: anim.wrapper?.className,
                        hasRenderer: !!anim.renderer,
                        svgElement: anim.renderer?.svgElement,
                        matchesTarget: targetContainer && (anim.wrapper === targetContainer || (anim.renderer?.svgElement && targetContainer.contains(anim.renderer.svgElement)))
                    });
                });
            }
        } else {
            console.log('✗ window.lottie does NOT exist');
        }
        
        console.log('\n=== END DEBUG INFO ===');
        console.log('\n💡 MANUAL FIX: If animation is not found automatically, try:');
        console.log('   window.connectLottieInteractive(animationInstance)');
        console.log('   Replace animationInstance with the correct one from getRegisteredAnimations()');
    };

    window.connectLottieInteractive = function(animInstance) {
        if (!animInstance) {
            console.error('Please provide an animation instance');
            console.log('Example: window.connectLottieInteractive(window.lottie.getRegisteredAnimations()[0])');
            return;
        }
        
        if (animInstance.totalFrames === undefined) {
            console.error('This does not appear to be a valid Lottie animation instance');
            return;
        }
        
        console.log('Connecting animation instance:', animInstance);
        animation = animInstance;
        setupAnimation();
    };

    init();
})();

