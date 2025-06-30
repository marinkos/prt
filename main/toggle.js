// Theme Toggle Script
// Handles switching between light and dark themes using collector data

class ThemeToggle {
    constructor() {
        this.currentTheme = 'light';
        this.toggleButton = null;
        this.themes = {};
        this.init();
    }
    
    init() {
        // Get toggle button
        this.toggleButton = document.querySelector('[data-theme-toggle-button]');
        if (!this.toggleButton) {
            console.error('❌ Theme toggle button not found');
            return;
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
        
        // Create dark theme by inverting colors
        this.themes.dark = {};
        Object.entries(themeVars).forEach(([property, value]) => {
            if (property.includes('bg-color')) {
                // Invert background color
                this.themes.dark[property] = this.invertColor(value);
            } else if (property.includes('txt-color')) {
                // Invert text color
                this.themes.dark[property] = this.invertColor(value);
            } else {
                // Keep other variables the same or add custom logic
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
    
    loadTheme() {
        // Check localStorage for saved theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme && this.themes[savedTheme]) {
            console.log(`📱 Loading saved theme: ${savedTheme}`);
            this.setTheme(savedTheme);
        } else {
            // Don't automatically switch to dark mode on first load
            // Only use system preference if user has explicitly chosen it before
            console.log('📱 No saved theme preference, staying with default light theme');
            this.setTheme('light');
        }
    }
    
    setTheme(theme) {
        if (!this.themes[theme]) {
            console.error(`❌ Theme "${theme}" not found`);
            return;
        }
        
        this.currentTheme = theme;
        const root = document.documentElement;
        
        console.log(`🎨 Applying theme "${theme}":`, this.themes[theme]);
        
        // Apply theme variables
        Object.entries(this.themes[theme]).forEach(([property, value]) => {
            root.style.setProperty(property, value);
            console.log(`   Set ${property} = ${value}`);
        });
        
        // Also apply directly to body as fallback
        const body = document.body;
        if (this.themes[theme]['--_theme---bg-color']) {
            body.style.backgroundColor = this.themes[theme]['--_theme---bg-color'];
        }
        if (this.themes[theme]['--_theme---txt-color']) {
            body.style.color = this.themes[theme]['--_theme---txt-color'];
        }
        
        // Update data-theme attribute
        root.setAttribute('data-theme', theme);
        console.log(`   Set data-theme = "${theme}"`);
        
        // Verify the changes were applied
        setTimeout(() => {
            const appliedStyles = window.getComputedStyle(root);
            console.log('🔍 Verification - Applied styles:');
            Object.keys(this.themes[theme]).forEach(property => {
                const appliedValue = appliedStyles.getPropertyValue(property);
                console.log(`   ${property}: ${appliedValue}`);
            });
            
            // Check if body is actually using the variables
            const bodyStyles = window.getComputedStyle(body);
            console.log('🔍 Body styles after theme change:');
            console.log(`   Background: ${bodyStyles.backgroundColor}`);
            console.log(`   Color: ${bodyStyles.color}`);
            
            // Check if body has the CSS variable declarations
            const bodyCSS = body.style.cssText;
            console.log('🔍 Body inline styles:', bodyCSS);
            
            // Check if we need to apply variables to body directly
            if (bodyStyles.backgroundColor !== this.themes[theme]['--_theme---bg-color'] || 
                bodyStyles.color !== this.themes[theme]['--_theme---txt-color']) {
                console.log('⚠️ CSS variables not being applied to body, applying directly...');
                body.style.backgroundColor = `var(--_theme---bg-color)`;
                body.style.color = `var(--_theme---txt-color)`;
            }
        }, 100);
        
        // Update button state
        this.updateButton();
        
        // Save to localStorage
        localStorage.setItem('theme', theme);
        
        console.log(`🎭 Theme switched to: ${theme}`);
    }
    
    toggle() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        console.log(`🔄 Toggling from ${this.currentTheme} to ${newTheme}`);
        this.setTheme(newTheme);
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
  