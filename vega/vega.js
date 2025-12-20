const RIVE_FILE_URL_DESKTOP = 'https://cdn.prod.website-files.com/68791f04ead01339340acbbe/6936de754db85caa025b6e88_mole_dressupV2.riv'
const RIVE_FILE_URL_MOBILE = 'https://cdn.prod.website-files.com/68791f04ead01339340acbbe/6942d5944f95b5535234f011_mole_dressup_mobile.riv'
const MOBILE_BREAKPOINT = 479
const STATE_MACHINE_NAME = 'DressUp'
const DEFAULT_COMBINATION = 'green-googles-watercan'

// Get the appropriate Rive file URL based on screen width
function getRiveFileUrl() {
    return window.innerWidth <= MOBILE_BREAKPOINT ? RIVE_FILE_URL_MOBILE : RIVE_FILE_URL_DESKTOP
}
const BUTTON_SELECTOR = '[data-w-id="67f6784f-661d-7a70-cf0a-5373d2d3cb82"]'
const CLOSE_BUTTON_SELECTOR = '#gameClose'
const POPUP_SELECTOR = '#gamePopup'
const OPEN_POPUP_SELECTOR = '#openPopup'
const PADDING_GLOBAL_SELECTOR = '.padding-global.padding-section-huge'

// State tracking
let currentHat = 'Green'
let currentGlasses = 'Goggles'
let currentTool = 'WaterCan'
let riveInstance = null
let hasReceivedInitialState = false

// Map Rive state names to data attribute format
const mapToDataAttribute = (hat, glasses, tool) => {
    // Convert hat: Pink -> pink, Yellow -> yellow, Green -> green
    const hatLower = hat.toLowerCase()

    // Convert glasses: Goggles -> googles, Cayeye -> cateye, Sunnies -> sunnies
    let glassesLower = glasses.toLowerCase()
    if (glassesLower === 'cayeye') glassesLower = 'cateye'

    // Convert tool: Flower -> flower, Cocktail -> cocktail, WaterCan -> watercan
    const toolLower = tool.toLowerCase()

    return `${hatLower}-${glassesLower}-${toolLower}`
}

// Show the correct mole image based on combination using is-active class
function showMoleImage(combination) {
    const allImages = document.querySelectorAll('.mole-image')
    if (allImages.length === 0) return

    // Remove is-active class from all images
    allImages.forEach(img => {
        img.classList.remove('is-active')
    })

    // Add is-active class to the matching image
    const targetImage = document.querySelector(`[data-mole-combination="${combination}"]`)
    if (targetImage) {
        targetImage.classList.add('is-active')
    } else {
        // Check for similar combinations (case-insensitive)
        const availableCombinations = Array.from(allImages).map(img => img.getAttribute('data-mole-combination'))
        const lowerCombination = combination.toLowerCase()
        const similar = availableCombinations.filter(comb => comb && comb.toLowerCase() === lowerCombination)
        if (similar.length > 0) {
            const similarImage = document.querySelector(`[data-mole-combination="${similar[0]}"]`)
            if (similarImage) {
                similarImage.classList.add('is-active')
            }
        }
    }
}

// Update mole image when state changes
function updateMoleImage() {
    const combination = mapToDataAttribute(currentHat, currentGlasses, currentTool)
    showMoleImage(combination)
}

// Handle popup open
function handlePopupOpen() {
    const popup = document.querySelector(POPUP_SELECTOR)
    if (popup) {
        popup.style.display = 'flex'
    }

    // Add game-over class to .padding-global
    const paddingGlobal = document.querySelector(PADDING_GLOBAL_SELECTOR)
    if (paddingGlobal) {
        paddingGlobal.classList.add('game-over')
    }

    // Reset button text to default
    const buttonWrapper = document.querySelector(BUTTON_SELECTOR)
    if (buttonWrapper) {
        const buttonText = buttonWrapper.querySelector('.button-middle > div')
        if (buttonText) {
            buttonText.textContent = 'Insert a coin'
        }
    }

    // Check if this is the first time opening the popup
    const isFirstOpen = !sessionStorage.getItem('popupOpened')

    if (isFirstOpen) {
        // First time opening - reset state to default and show default image
        currentHat = 'Green'
        currentGlasses = 'Goggles'
        currentTool = 'WaterCan'
        hasReceivedInitialState = false

        // Mark popup as opened in sessionStorage
        sessionStorage.setItem('popupOpened', 'true')

        // Add is-active class to default image
        setTimeout(() => {
            const allImages = document.querySelectorAll('.mole-image')
            allImages.forEach(img => {
                img.classList.remove('is-active')
            })

            const defaultImage = document.querySelector(`[data-mole-combination="${DEFAULT_COMBINATION}"]`)
            if (defaultImage) {
                defaultImage.classList.add('is-active')
            }
        }, 100)
    } else {
        // Subsequent opens - keep current state and show current image
        setTimeout(() => {
            updateMoleImage()
        }, 100)
    }
}

// Handle popup close
function handlePopupClose() {
    const popup = document.querySelector(POPUP_SELECTOR)
    if (popup) {
        popup.style.display = 'none'
    }

    // Update button text
    const buttonWrapper = document.querySelector(BUTTON_SELECTOR)
    if (buttonWrapper) {
        const buttonText = buttonWrapper.querySelector('.button-middle > div')
        if (buttonText) {
            buttonText.textContent = 'go again'
        }
    }

    // Ensure mole image shows current state
    updateMoleImage()
}

// Set up popup open handler
function setupPopupOpenHandler() {
    const openButton = document.querySelector(OPEN_POPUP_SELECTOR)
    if (openButton) {
        openButton.addEventListener('click', handlePopupOpen)
    } else {
        setTimeout(setupPopupOpenHandler, 500)
    }
}

// Set up popup close handler
function setupPopupCloseHandler() {
    const closeButton = document.querySelector(CLOSE_BUTTON_SELECTOR)
    if (closeButton) {
        closeButton.addEventListener('click', handlePopupClose)
    } else {
        setTimeout(setupPopupCloseHandler, 500)
    }
}

function init() {
    const container = document.getElementById('rive-container')
    if (!container) return

    const canvas = document.createElement('canvas')
    const isMobile = window.innerWidth <= MOBILE_BREAKPOINT
    // Set canvas dimensions based on device type
    canvas.width = isMobile ? 320 : 944
    canvas.height = isMobile ? 462 : 681
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.display = 'block'
    canvas.style.cursor = 'pointer'
    
    container.innerHTML = ''
    container.appendChild(canvas)

    riveInstance = new rive.Rive({
        src: getRiveFileUrl(),
        canvas: canvas,
        autoplay: true,
        stateMachines: STATE_MACHINE_NAME,
        automaticallyHandleEvents: true,
        onLoad: () => {
            setTimeout(() => {
                if (!hasReceivedInitialState) {
                    showMoleImage(DEFAULT_COMBINATION)
                }
            }, 100)
        },
        onLoadError: () => { },
        onStateChange: (event) => {
            if (event?.data && Array.isArray(event.data)) {
                const states = event.data
                hasReceivedInitialState = true

                states.forEach(state => {
                    if (typeof state === 'string') {
                        if (state.includes('Hat_')) {
                            currentHat = state.replace('Hat_', '')
                        } else if (state.includes('Glasses_')) {
                            currentGlasses = state.replace('Glasses_', '')
                        } else if (state.includes('Tool_')) {
                            currentTool = state.replace('Tool_', '')
                        }
                    }
                })

                updateMoleImage()
            }
        }
    })
}

// Show default image on page load (before Rive initializes)
function showDefaultImage() {
    setTimeout(() => {
        const allImages = document.querySelectorAll('.mole-image')
        allImages.forEach(img => {
            img.classList.remove('is-active')
        })

        const defaultImage = document.querySelector(`[data-mole-combination="${DEFAULT_COMBINATION}"]`)
        if (defaultImage) {
            defaultImage.classList.add('is-active')
        }
    }, 50)
}

// Clear session storage on page reload
sessionStorage.removeItem('popupOpened')

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        showDefaultImage()
        init()
        setupPopupOpenHandler()
        setupPopupCloseHandler()
    })
} else {
    showDefaultImage()
    init()
    setupPopupOpenHandler()
    setupPopupCloseHandler()
}
