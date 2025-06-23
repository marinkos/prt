// ==========================================
// CONFIGURATION SECTION 
// ==========================================

const CONFIG = {
  // Base pricing
  hourlyRate: 70,
  profitMargin: 0.43,        // profit margin
  weeklyHours: 25,           // Hours per week
  
  // Page complexity (hours per page)
  pageComplexity: {
    'simple': 4,
    'middling': 8,
    'complex': 12
  },
  
  // Template pages take less time
  templateMultiplier: 0.4,   // 40% of unique page time
  
  // Interaction complexity multipliers
  interactions: {
    'static': 1.0,           // No extra time
    'medium': 1.15,          // +15% time
    'complex': 1.5           // +50% time
  },
  
  // CMS setup time (hours)
  cmsHours: {
    'blog': 3,
    'case-studies': 4,
    'team': 2,
    'open-roles': 3,
    'help-center': 5,
    'services': 4,
    'podcast': 4,
    'other': 6
  },
  
  // Integration time (hours)
  integrationHours: {
    'ga': 0.5,
    'mailchimp': 1,
    'hot-jar': 1.5,
    'hubspot': 2,
    'chat': 1,
    'paypal': 3,
    'other': 4
  },
  
  // Timeline pricing adjustments
  timeline: {
    'flexible': 0.9,         // 10% discount
    'standard': 1.0,         // No change
    'rush': 1.4              // 40% premium
  }
};

// ==========================================
// TRACKING CONFIGURATION
// ==========================================
const TRACKING_CONFIG = {
  webhookUrl: 'https://script.google.com/macros/s/AKfycbxE1khcBP3cYMrCQ4lqmYxsKDEYW2dsFLXBPETJarEXw6l6CqKzujku86KHfu0HdCx3/exec',
  enabled: true
};

// ==========================================
// ANIMATION FUNCTIONS
// ==========================================
function animatePriceChange(newValueInK) {
  const element = document.querySelector('#totalQuote');
  const currentValue = parseFloat(element.textContent) || 0;
  
  gsap.fromTo(element, 
    { innerText: currentValue },
    { 
      duration: 0.3,
      innerText: newValueInK,
      ease: "power2.out",
      modifiers: {
        innerText: function(value) {
          return Math.round(value * 10) / 10;
        }
      }
    }
  );
}

// ==========================================
// CALCULATION LOGIC
// ==========================================
function calculateProject() {
  // Get form values
  const complexity = $('input[name="complexity"]:checked').val() || 'simple';
  const uniquePages = parseInt($('input[name="unique"]').val()) || 1;
  const templatePages = parseInt($('input[name="template"]').val()) || 0;
  const interactions = $('input[name="interactions"]:checked').val() || 'static';
  const timeline = $('input[name="timeline"]:checked').val() || 'standard';
  
  // Calculate base hours
  const baseHoursPerPage = CONFIG.pageComplexity[complexity];
  let totalHours = 0;
  
  // Unique pages
  totalHours += uniquePages * baseHoursPerPage;
  
  // Template pages (less work)
  totalHours += templatePages * baseHoursPerPage * CONFIG.templateMultiplier;
  
  // Apply interaction multiplier
  totalHours *= CONFIG.interactions[interactions];
  
  // Add CMS hours
  let cmsHours = 0;
  $('input[name="cms"]:checked').each(function() {
    const cmsType = $(this).val();
    if (cmsType !== 'no' && CONFIG.cmsHours[cmsType]) {
      cmsHours += CONFIG.cmsHours[cmsType];
    }
  });
  totalHours += cmsHours;
  
  // Add integration hours
  let integrationHours = 0;
  $('input[name="integrations"]:checked').each(function() {
    const integrationType = $(this).val();
    if (integrationType !== 'no' && CONFIG.integrationHours[integrationType]) {
      integrationHours += CONFIG.integrationHours[integrationType];
    }
  });
  totalHours += integrationHours;
  
  // Calculate costs
  const baseCost = totalHours * CONFIG.hourlyRate;
  const timelineAdjustment = CONFIG.timeline[timeline];
  const adjustedCost = baseCost * timelineAdjustment;
  const profit = adjustedCost * CONFIG.profitMargin;
  let finalCost = adjustedCost + profit;
  
  // Minimum price floor
  const minimumPrice = 500;
  finalCost = Math.max(finalCost, minimumPrice);
  
  // Calculate timeline
  const weeks = Math.ceil(totalHours / CONFIG.weeklyHours);
  
  return {
    hours: Math.round(totalHours * 10) / 10,
    cost: Math.round(finalCost / 100) * 100,
    costInK: Math.round(finalCost / 100) / 10,
    weeks: weeks,
    breakdown: {
      baseCost: Math.round(baseCost),
      timelineAdjustment: Math.round(adjustedCost - baseCost),
      profit: Math.round(profit),
      totalHours: Math.round(totalHours * 10) / 10
    }
  };
}

// ==========================================
// TRACKING FUNCTIONS (SESSION-BASED)
// ==========================================

// Generate unique session ID
function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Get or create session ID
function getSessionId() {
  if (!window.calculatorSessionId) {
    window.calculatorSessionId = generateSessionId();
  }
  return window.calculatorSessionId;
}

function sendToGoogleSheets(data) {
  if (!TRACKING_CONFIG.enabled) return;
  
  // Add session ID to data
  data.sessionId = getSessionId();
  
  // Convert data to URL parameters
  const params = new URLSearchParams();
  Object.keys(data).forEach(key => {
    const value = Array.isArray(data[key]) ? data[key].join(',') : data[key];
    params.append(key, value);
  });
  
  // Create JSONP request
  const script = document.createElement('script');
  const callbackName = 'trackingCallback_' + Date.now();
  
  // Add callback to global scope temporarily
  window[callbackName] = function(response) {
    console.log('Tracking success:', response);
    document.head.removeChild(script);
    delete window[callbackName];
  };
  
  // Add error handling
  script.onerror = function() {
    console.error('Tracking error: JSONP request failed');
    document.head.removeChild(script);
    delete window[callbackName];
  };
  
  script.src = `${TRACKING_CONFIG.webhookUrl}?${params.toString()}&callback=${callbackName}`;
  document.head.appendChild(script);
}

function trackCalculation(result, triggerType) {
  const data = {
    sessionId: getSessionId(), // Add session ID
    timestamp: new Date().toISOString(),
    triggerType: triggerType,
    complexity: $('input[name="complexity"]:checked').val() || '',
    uniquePages: $('input[name="unique"]').val() || '',
    templatePages: $('input[name="template"]').val() || '',
    interactions: $('input[name="interactions"]:checked').val() || '',
    timeline: $('input[name="timeline"]:checked').val() || '',
    cmsOptions: $('input[name="cms"]:checked').map(function() { return this.value; }).get(),
    integrationOptions: $('input[name="integrations"]:checked').map(function() { return this.value; }).get(),
    estimatedHours: result.hours,
    estimatedCost: result.cost,
    estimatedWeeks: result.weeks,
    referrer: document.referrer || window.location.href
  };
  
  sendToGoogleSheets(data);
  console.log('Tracking data:', data);
}

// ==========================================
// MULTI-TRIGGER TRACKING SETUP
// ==========================================
function setupTracking() {
  let hasTrackedComplete = false;
  let hasAnyInteraction = false;
  
  function isCalculationComplete() {
    const hasComplexity = $('input[name="complexity"]:checked').length > 0;
    const hasUniquePages = parseInt($('input[name="unique"]').val()) > 0;
    const hasInteractions = $('input[name="interactions"]:checked').length > 0;
    
    return hasComplexity && hasUniquePages && hasInteractions;
  }
  
  function checkAndTrack(triggerType) {
    const result = calculateProject();
    
    // Don't track if no meaningful interaction yet
    if (!hasAnyInteraction && result.cost <= 500) return;
    
    const isComplete = isCalculationComplete();
    
    if (isComplete && !hasTrackedComplete) {
      trackCalculation(result, 'complete');
      hasTrackedComplete = true;
    } else if (hasAnyInteraction && result.cost > 500) {
      trackCalculation(result, triggerType);
    }
  }
  
  // 1. Track on page visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && hasAnyInteraction) {
      checkAndTrack('exit');
    }
  });
  
  // 2. Track after significant time spent
  setTimeout(() => {
    if (hasAnyInteraction) {
      checkAndTrack('time_spent');
    }
  }, 30000); // 30 seconds
  
  // 3. Track on scroll away from calculator
  let hasScrolledAway = false;
  window.addEventListener('scroll', () => {
    if (!hasAnyInteraction) return;
    
    const calcElement = document.querySelector('.calc_component');
    if (!calcElement) return;
    
    const rect = calcElement.getBoundingClientRect();
    const isVisible = rect.bottom > 0 && rect.top < window.innerHeight;
    
    if (!isVisible && !hasScrolledAway) {
      hasScrolledAway = true;
      checkAndTrack('scroll_away');
    }
  });
  
  // Return the check function and mark interaction function
  return {
    checkAndTrack: checkAndTrack,
    markInteraction: () => { hasAnyInteraction = true; }
  };
}

// ==========================================
// UPDATE CALCULATION FUNCTION
// ==========================================
function updateCalculation() {
  // Check if user has made any selections
  const hasSelections = $('input[type="radio"]:checked').length > 0 || 
                       $('input[type="checkbox"]:checked').length > 0 ||
                       ($('input[type="number"]').val() && parseInt($('input[type="number"]').val()) > 0);
  
  if (!hasSelections) {
    $('#totalQuote').text('0');
    return;
  }
  
  // Mark that user has interacted
  if (window.trackingSetup) {
    window.trackingSetup.markInteraction();
  }
  
  const result = calculateProject();
  animatePriceChange(result.costInK);
  
  // Track completion
  if (window.trackingSetup) {
    window.trackingSetup.checkAndTrack('interaction');
  }
  
  console.log('Project Calculation:', result);
}

// ==========================================
// INITIALIZATION
// ==========================================
$(document).ready(function() {
  // Initialize tracking
  window.trackingSetup = setupTracking();
  
  // Set initial display to 0
  $('#totalQuote').text('0');
  
  // Handle input changes
  $('input[type="radio"], input[type="checkbox"], input[type="number"]').on('change input', function() {
    updateCalculation();
  });
  
  // Handle custom number input arrows
  $('.answer_arrow').on('click', function() {
    const $input = $(this).siblings('input[type="number"]');
    const isUp = $(this).hasClass('tp');
    const currentVal = parseInt($input.val()) || 0;
    
    let newVal;
    if (isUp) {
      newVal = currentVal + 1;
    } else {
      // Get the min attribute from the input, default to 0
      const minVal = parseInt($input.attr('min')) || 0;
      newVal = Math.max(minVal, currentVal - 1);
    }
    
    $input.val(newVal).trigger('change');
  });
});
