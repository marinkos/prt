document.addEventListener('DOMContentLoaded', function() {



    // Create a mapping of variants to their class IDs

    const variantMapping = {

        'yellow': {

            hover: 'w-variant-674b5082-f866-8331-8af3-0290108bb159',

            pressed: 'w-variant-bd444676-cad2-fc89-1dc1-83704c709910'

        },

        'blue': {

            hover: 'w-variant-ac00ad32-c97c-dbd0-5838-b779a417f045',

            pressed: 'w-variant-6ebdb744-0a09-3855-23b4-ef4244eca941'

        }

    };

    // Get all pixel buttons with base variants (yellow, blue, etc.)

    const baseButtons = document.querySelectorAll('[data-wf--pixel-button--variant]');

    

    baseButtons.forEach(button => {

        const variant = button.getAttribute('data-wf--pixel-button--variant');

        

        // Skip if it's already a hover/pressed variant

        if (variant.includes('-hover') || variant.includes('-pressed')) {

            return;

        }

        

        // Get the base color (yellow, blue, etc.)

        const baseColor = variant;

        

        // Check if we have mapping for this variant

        if (!variantMapping[baseColor]) {

            return;

        }

        

        const hoverClass = variantMapping[baseColor].hover;

        const pressedClass = variantMapping[baseColor].pressed;

        

        // Get all elements that should receive variant classes

        const variantElements = [

            button,

            ...button.querySelectorAll('.pixel-grid'),

            ...button.querySelectorAll('.light'),

            ...button.querySelectorAll('.button-middle')

        ];

        

        // Hover state

        button.addEventListener('mouseenter', function() {

            // Only add hover if not currently pressed

            if (!button.classList.contains(pressedClass)) {

                variantElements.forEach(el => {

                    el.classList.add(hoverClass);

                });

            }

        });

        

        button.addEventListener('mouseleave', function() {

            // Remove hover variant from all elements

            variantElements.forEach(el => {

                el.classList.remove(hoverClass);

            });

        });

        

        // Pressed state

        button.addEventListener('mousedown', function() {

            // Remove hover and add pressed to all elements

            variantElements.forEach(el => {

                el.classList.remove(hoverClass);

                el.classList.add(pressedClass);

            });

        });

        

        button.addEventListener('mouseup', function() {

            // Remove pressed from all elements

            variantElements.forEach(el => {

                el.classList.remove(pressedClass);

            });

            // Add back hover if mouse is still over button

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

});

