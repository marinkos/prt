document.addEventListener('DOMContentLoaded', function() {



    // Create mappings for both button types

    const buttonConfigs = {

        // Large pixel buttons

        'pixel-button': {

            selector: '[data-wf--pixel-button--variant]',

            variants: {

                'yellow': {

                    hover: 'w-variant-674b5082-f866-8331-8af3-0290108bb159',

                    pressed: 'w-variant-bd444676-cad2-fc89-1dc1-83704c709910'

                },

                'blue': {

                    hover: 'w-variant-ac00ad32-c97c-dbd0-5838-b779a417f045',

                    pressed: 'w-variant-6ebdb744-0a09-3855-23b4-ef4244eca941'

                }

            },

            elementSelectors: ['.pixel-grid', '.light', '.button-middle']

        },

        // Small pixel buttons

        'small-button': {

            selector: '[data-wf--small-button--variant]',

            variants: {

                'base': {

                    hover: 'w-variant-f9956f97-b6b2-0bcc-5c80-2816469cb898',

                    pressed: 'w-variant-db4e5dd9-a545-03dd-e16b-bc96aa0fc9f9'

                },

                'blue': {

                    hover: 'w-variant-a6d2d869-fc50-8e44-0084-518fa5623bfe',

                    pressed: 'w-variant-36d8dfc7-d071-70b6-f1ad-88829fe670a0'

                },

                'yellow': {

                    hover: 'w-variant-ad02b9c2-406f-e1ae-b91d-73bffea85415',

                    pressed: 'w-variant-5918a9f3-2243-04b7-f4da-82da57743b1e'

                }

            },

            elementSelectors: ['.small-pixel-grid', '.small-middle', '.small-corner', '.small-pixel-end']

        }

    };

    // Function to handle button interactions

    function setupButtonInteractions(config) {

        const buttons = document.querySelectorAll(config.selector);

        

        buttons.forEach(button => {

            const variant = button.getAttribute(config.selector.match(/\[(.*?)\]/)[1]);

            

            // Skip if it's already a hover/pressed variant

            if (variant.includes('-hover') || variant.includes('-pressed')) {

                return;

            }

            

            // Get the base color/type

            const baseVariant = variant;

            

            // Check if we have mapping for this variant

            if (!config.variants[baseVariant]) {

                return;

            }

            

            const hoverClass = config.variants[baseVariant].hover;

            const pressedClass = config.variants[baseVariant].pressed;

            

            // Get all elements that should receive variant classes

            const variantElements = [

                button,

                ...config.elementSelectors.flatMap(selector => 

                    [...button.querySelectorAll(selector)]

                )

            ];

            

            // Hover state

            button.addEventListener('mouseenter', function() {

                if (!button.classList.contains(pressedClass)) {

                    variantElements.forEach(el => {

                        el.classList.add(hoverClass);

                    });

                }

            });

            

            button.addEventListener('mouseleave', function() {

                variantElements.forEach(el => {

                    el.classList.remove(hoverClass);

                });

            });

            

            // Pressed state

            button.addEventListener('mousedown', function() {

                variantElements.forEach(el => {

                    el.classList.remove(hoverClass);

                    el.classList.add(pressedClass);

                });

            });

            

            button.addEventListener('mouseup', function() {

                variantElements.forEach(el => {

                    el.classList.remove(pressedClass);

                });

                if (this.matches(':hover')) {

                    variantElements.forEach(el => {

                        el.classList.add(hoverClass);

                    });

                }

            });

            

            // Handle case where mouse is released outside the button

            button.addEventListener('mouseleave', function() {

                variantElements.forEach(el => {

                    el.classList.remove(pressedClass);

                    el.classList.remove(hoverClass);

                });

            });

        });

    }

    // Setup interactions for both button types

    Object.values(buttonConfigs).forEach(config => {

        setupButtonInteractions(config);

    });

});
