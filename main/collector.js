// Theme Collector - Debug Version
// This script collects elements that need theme switching

console.log('🔍 Theme Collector: Starting collection...');

// Collect all elements with CSS custom properties
function collectThemeElements() {
    const elements = [];
    
    // Get all elements that might have theme-related styles
    const allElements = document.querySelectorAll('*');
    
    allElements.forEach(element => {
        const styles = window.getComputedStyle(element);
        const hasThemeVars = false;
        
        // Check if element uses CSS custom properties
        const cssText = element.style.cssText;
        if (cssText.includes('var(--_theme')) {
            console.log('🎨 Found element with theme variables:', element);
            console.log('   CSS:', cssText);
            elements.push({
                element: element,
                cssText: cssText
            });
        }
        
        // Check computed styles for theme variables
        const computedStyles = {
            backgroundColor: styles.backgroundColor,
            color: styles.color,
            borderColor: styles.borderColor
        };
        
        // Log if any of these are using CSS variables
        Object.entries(computedStyles).forEach(([property, value]) => {
            if (value.includes('var(--_theme')) {
                console.log(`🎨 Found ${property} using theme variable:`, element);
                console.log(`   Value: ${value}`);
            }
        });
    });
    
    return elements;
}

// Collect CSS custom properties from :root
function collectCSSVariables() {
    const root = document.documentElement;
    const styles = window.getComputedStyle(root);
    
    console.log('🎨 CSS Variables found:');
    
    // Get all CSS custom properties
    const cssVars = [];
    for (let i = 0; i < styles.length; i++) {
        const property = styles[i];
        if (property.startsWith('--_theme')) {
            const value = styles.getPropertyValue(property);
            console.log(`   ${property}: ${value}`);
            cssVars.push({ property, value });
        }
    }
    
    return cssVars;
}

// Check for theme toggle button
function checkToggleButton() {
    const toggleButton = document.querySelector('[data-theme-toggle-button]');
    if (toggleButton) {
        console.log('✅ Theme toggle button found:', toggleButton);
        console.log('   Classes:', toggleButton.className);
        console.log('   Attributes:', toggleButton.attributes);
    } else {
        console.log('❌ Theme toggle button not found');
    }
}

// Check current theme state
function checkCurrentTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    console.log('🎭 Current theme:', currentTheme || 'light (default)');
    
    // Check if body has theme-related styles
    const body = document.body;
    const bodyStyles = window.getComputedStyle(body);
    console.log('🎨 Body styles:');
    console.log('   Background:', bodyStyles.backgroundColor);
    console.log('   Color:', bodyStyles.color);
}

// Run all checks
function debugThemeSystem() {
    console.log('=== THEME SYSTEM DEBUG ===');
    checkToggleButton();
    checkCurrentTheme();
    collectCSSVariables();
    collectThemeElements();
    console.log('=== END DEBUG ===');
}

// Run debug on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', debugThemeSystem);
} else {
    debugThemeSystem();
}

// Export for use by other scripts
window.themeCollector = {
    debug: debugThemeSystem,
    collectElements: collectThemeElements,
    collectVariables: collectCSSVariables
};

function getColorThemes() {
    const STORAGE_KEYS = {
      THEMES: "colorThemes_data",
      PUBLISH_DATE: "colorThemes_publishDate",
    };
    function getPublishDate() {
      const htmlComment = document.documentElement.previousSibling;
      return htmlComment?.nodeType === Node.COMMENT_NODE
        ? new Date(
            htmlComment.textContent.match(/Last Published: (.+?) GMT/)[1]
          ).getTime()
        : null;
    }
  
    function loadFromStorage() {
      try {
        const storedPublishDate = localStorage.getItem(STORAGE_KEYS.PUBLISH_DATE),
          currentPublishDate = getPublishDate();
        if (
          !currentPublishDate ||
          !storedPublishDate ||
          storedPublishDate !== currentPublishDate.toString()
        )
          return null;
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.THEMES));
      } catch (error) {
        console.warn("Failed to load from localStorage:", error);
        return null;
      }
    }
  
    function saveToStorage(themes) {
      try {
        const publishDate = getPublishDate();
        if (publishDate) {
          //  localStorage.setItem(STORAGE_KEYS.PUBLISH_DATE, publishDate.toString());
          //  localStorage.setItem(STORAGE_KEYS.THEMES, JSON.stringify(themes));
        }
      } catch (error) {
        console.warn("Failed to save to localStorage:", error);
      }
    }
  
    window.colorThemes = {
      themes: {},
      getTheme(themeName = "", brandName = "") {
        if (!themeName)
          return this.getTheme(Object.keys(this.themes)[0], brandName);
        const theme = this.themes[themeName];
        if (!theme) return {};
        if (!theme.brands || Object.keys(theme.brands).length === 0) return theme;
        if (!brandName) return theme.brands[Object.keys(theme.brands)[0]];
        return theme.brands[brandName] || {};
      },
    };
  
    const cachedThemes = loadFromStorage();
    if (cachedThemes) {
      window.colorThemes.themes = cachedThemes;
      document.dispatchEvent(new CustomEvent("colorThemesReady"));
      return;
    }
  
    const firstLink = document.querySelector('link[rel="stylesheet"]');
    if (!firstLink?.href) return null;
    const themeVariables = new Set(),
      themeClasses = new Set(),
      brandClasses = new Set();
    fetch(firstLink.href)
      .then((response) => {
        if (!response.ok)
          throw new Error(`Failed to fetch stylesheet: ${response.statusText}`);
        return response.text();
      })
      .then((cssText) => {
        (cssText.match(/--_theme[\w-]+:\s*[^;]+/g) || []).forEach((variable) =>
          themeVariables.add(variable.split(":")[0].trim())
        );
        (cssText.match(/\.(theme|brand)-[\w-]+/g) || []).forEach((className) => {
          if (className.startsWith(".theme-")) themeClasses.add(className);
          // if (className.startsWith(".brand-")) brandClasses.add(className);
        });
  
        const themeVariablesArray = Array.from(themeVariables);
        function checkClass(themeClass, brandClass = null) {
          let documentClasses = document.documentElement.getAttribute("class");
          document.documentElement.setAttribute("class", "");
          document.documentElement.classList.add(themeClass, brandClass);
          const styleObject = {};
          themeVariablesArray.forEach(
            (variable) =>
              (styleObject[variable] = getComputedStyle(
                document.documentElement
              ).getPropertyValue(variable))
          );
          document.documentElement.setAttribute("class", documentClasses);
          return styleObject;
        }
  
        themeClasses.forEach((themeClassWithDot) => {
          const themeName = themeClassWithDot
            .replace(".", "")
            .replace("theme-", "");
          window.colorThemes.themes[themeName] = { brands: {} };
          brandClasses.forEach((brandClassWithDot) => {
            const brandName = brandClassWithDot.replace(".", "");
            // .replace("brand-", "");
            window.colorThemes.themes[themeName].brands[brandName] = checkClass(
              themeClassWithDot.replace(".", ""),
              brandClassWithDot.replace(".", "")
            );
          });
          if (!brandClasses.size)
            window.colorThemes.themes[themeName] = checkClass(
              themeClassWithDot.replace(".", "")
            );
        });
  
        saveToStorage(window.colorThemes.themes);
        document.dispatchEvent(new CustomEvent("colorThemesReady"));
      })
      .catch((error) => console.error("Error:", error.message));
  }
  window.addEventListener("DOMContentLoaded", (event) => {
    getColorThemes();
  });
  