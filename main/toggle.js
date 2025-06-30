// Theme Toggle Script
// Handles switching between light and dark themes using collector data

class ThemeToggle {
    constructor() {
        this.currentTheme = 'light';
        this.toggleButton = null;
        this.themes = {};
        this.transitionDuration = 0.5;
        this.transitionEase = 'power1.out';
        this.init();
    }
    
    init() {
        // Get toggle button
        this.toggleButton = document.querySelector('[data-theme-toggle-button]');
        if (!this.toggleButton) {
            console.error('❌ Theme toggle button not found');
            return;
        }
        
        // Get transition settings from script tag if available
        const scriptTag = document.querySelector('[data-theme-toggle-script]');
        if (scriptTag) {
            this.transitionDuration = parseFloat(scriptTag.getAttribute('duration')) || 0.5;
            this.transitionEase = scriptTag.getAttribute('ease') || 'power1.out';
        }
        
        // Wait for collector to gather theme data
        this.waitForCollector();
    }
    
    waitForCollector() {
        // Check if collector has run and gathered theme data
        if (window.themeCollector && window.themeCollector.collectVariables) {
            this.setupThemes();
        } else {
            // Wait a bit and try again
            setTimeout(() => this.waitForCollector(), 100);
        }
    }
    
    setupThemes() {
        // Get current CSS variables from the page
        const root = document.documentElement;
        const styles = window.getComputedStyle(root);
        
        // Collect all theme variables
        const themeVars = {};
        for (let i = 0; i < styles.length; i++) {
            const property = styles[i];
            if (property.startsWith('--_theme')) {
                const value = styles.getPropertyValue(property);
                themeVars[property] = value;
            }
        }
        
        console.log('🎨 Collected theme variables:', themeVars);
        
        // Create light theme (current state)
        this.themes.light = { ...themeVars };
        
        // Create dark theme with better color mapping
        this.themes.dark = {};
        Object.entries(themeVars).forEach(([property, value]) => {
            if (property.includes('bg-color')) {
                // Map light background to dark background
                this.themes.dark[property] = this.getDarkBackground(value);
            } else if (property.includes('txt-color')) {
                // Map dark text to light text
                this.themes.dark[property] = this.getLightText(value);
            } else {
                // Keep other variables the same
                this.themes.dark[property] = value;
            }
        });
        
        console.log('🎭 Generated themes:', this.themes);
        
        // Load saved theme
        this.loadTheme();
        
        // Add click event
        this.toggleButton.addEventListener('click', () => this.toggle());
        
        // Add keyboard support
        this.toggleButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggle();
            }
        });
        
        console.log('✅ Theme toggle initialized with dynamic themes');
    }
    
    getDarkBackground(lightColor) {
        // Better dark background mapping
        const colorMap = {
            '#f4f4f4': '#14161a', // Light gray to dark blue-gray
            '#ffffff': '#0a0a0a', // White to very dark
            '#fafafa': '#1a1a1a', // Very light gray to dark gray
            'rgb(244, 244, 244)': 'rgb(20, 22, 26)',
            'rgb(255, 255, 255)': 'rgb(10, 10, 10)',
            'rgb(250, 250, 250)': 'rgb(26, 26, 26)'
        };
        
        return colorMap[lightColor] || this.invertColor(lightColor);
    }
    
    getLightText(darkColor) {
        // Better light text mapping
        const colorMap = {
            '#14161a': '#f4f4f4', // Dark blue-gray to light gray
            '#000000': '#ffffff', // Black to white
            '#333333': '#cccccc', // Dark gray to light gray
            'rgb(20, 22, 26)': 'rgb(244, 244, 244)',
            'rgb(0, 0, 0)': 'rgb(255, 255, 255)',
            'rgb(51, 51, 51)': 'rgb(204, 204, 204)'
        };
        
        return colorMap[darkColor] || this.invertColor(darkColor);
    }
    
    loadTheme() {
        // Check localStorage for saved theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme && this.themes[savedTheme]) {
            console.log(`📱 Loading saved theme: ${savedTheme}`);
            this.setTheme(savedTheme, false); // No animation on load
        } else {
            // Always start with light theme by default
            console.log('📱 No saved theme preference, starting with light theme');
            this.setTheme('light', false); // No animation on load
        }
    }
    
    setTheme(theme, animate = true) {
        if (!this.themes[theme]) {
            console.error(`❌ Theme "${theme}" not found`);
            return;
        }
        
        this.currentTheme = theme;
        const root = document.documentElement;
        
        console.log(`🎨 Applying theme "${theme}":`, this.themes[theme]);
        
        if (animate && typeof gsap !== 'undefined') {
            // Use GSAP for smooth transitions
            const body = document.body;
            const themeData = this.themes[theme];
            
            gsap.to(body, {
                backgroundColor: themeData['--_theme---bg-color'],
                color: themeData['--_theme---txt-color'],
                duration: this.transitionDuration,
                ease: this.transitionEase
            });
            
            // Also animate CSS variables
            Object.entries(themeData).forEach(([property, value]) => {
                gsap.to(root, {
                    [property]: value,
                    duration: this.transitionDuration,
                    ease: this.transitionEase
                });
            });
        } else {
            // Apply immediately without animation
            Object.entries(this.themes[theme]).forEach(([property, value]) => {
                root.style.setProperty(property, value);
                console.log(`   Set ${property} = ${value}`);
            });
            
            // Apply directly to body
            const body = document.body;
            if (this.themes[theme]['--_theme---bg-color']) {
                body.style.backgroundColor = this.themes[theme]['--_theme---bg-color'];
            }
            if (this.themes[theme]['--_theme---txt-color']) {
                body.style.color = this.themes[theme]['--_theme---txt-color'];
            }
        }
        
        // Update data-theme attribute
        root.setAttribute('data-theme', theme);
        console.log(`   Set data-theme = "${theme}"`);
        
        // Update button state
        this.updateButton();
        
        // Save to localStorage
        localStorage.setItem('theme', theme);
        
        console.log(`🎭 Theme switched to: ${theme}`);
    }
    
    toggle() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        console.log(`🔄 Toggling from ${this.currentTheme} to ${newTheme}`);
        this.setTheme(newTheme, true); // Always animate on toggle
    }
    
    updateButton() {
        if (!this.toggleButton) return;
        
        const lightsOnDiv = this.toggleButton.querySelector('.lights-on');
        if (lightsOnDiv) {
            // When in light mode: show "lights off" (to go dark)
            // When in dark mode: show "lights on" (to go light)
            const newText = this.currentTheme === 'light' ? 'lights off' : 'lights on';
            lightsOnDiv.textContent = newText;
            console.log(`💡 Button text updated to: "${newText}" (theme: ${this.currentTheme})`);
        } else {
            console.warn('⚠️ .lights-on div not found in toggle button');
        }
        
        // Update aria-pressed
        this.toggleButton.setAttribute('aria-pressed', this.currentTheme === 'dark');
        
        // Update aria-label
        const newLabel = this.currentTheme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';
        this.toggleButton.setAttribute('aria-label', newLabel);
    }
    
    invertColor(color) {
        // Simple color inversion - you can customize this logic
        if (color.includes('rgb')) {
            // Handle RGB colors
            const rgb = color.match(/\d+/g);
            if (rgb && rgb.length >= 3) {
                const r = 255 - parseInt(rgb[0]);
                const g = 255 - parseInt(rgb[1]);
                const b = 255 - parseInt(rgb[2]);
                return `rgb(${r}, ${g}, ${b})`;
            }
        } else if (color.includes('#')) {
            // Handle hex colors
            const hex = color.replace('#', '');
            const r = (255 - parseInt(hex.substr(0, 2), 16)).toString(16).padStart(2, '0');
            const g = (255 - parseInt(hex.substr(2, 2), 16)).toString(16).padStart(2, '0');
            const b = (255 - parseInt(hex.substr(4, 2), 16)).toString(16).padStart(2, '0');
            return `#${r}${g}${b}`;
        }
        
        // Fallback: return original color
        return color;
    }
}

// Initialize theme toggle when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ThemeToggle();
    });
} else {
    new ThemeToggle();
}

// Export for debugging
window.themeToggle = ThemeToggle;
  