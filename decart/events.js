document.addEventListener('DOMContentLoaded', function() {

    /* -----------------------------------------------------------
     * PART 1: UTM Forwarding to platform.decart.ai
     * ----------------------------------------------------------- */
    const urlParams = new URLSearchParams(window.location.search);
    const utmParams = {};

    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
        const value = urlParams.get(param);
        if (value) {
            utmParams[param] = value;
        }
    });

    if (Object.keys(utmParams).length > 0) {
        const platformLinks = document.querySelectorAll('a[href*="platform.decart.ai"]');

        platformLinks.forEach(link => {
            const url = new URL(link.href);
            Object.entries(utmParams).forEach(([key, value]) => {
                url.searchParams.set(key, value);
            });
            link.href = url.toString();
        });
    }


    /* -----------------------------------------------------------
     * PART 2: Click Tracking for CTAs (data-event)
     * ----------------------------------------------------------- */
    const trackableElements = document.querySelectorAll('[data-event]');

    trackableElements.forEach(element => {
        element.addEventListener('click', () => {
            const eventName = element.getAttribute('data-event');
            const ctaLocation = element.getAttribute('data-cta-location');

            const dataLayerObj = {
                event: eventName,
                cta_location: ctaLocation || ''
            };

            if (eventName === 'click_model_link') {
                dataLayerObj.model_name = element.getAttribute('data-model-name') || '';
            }

            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push(dataLayerObj);
        });
    });


    /* -----------------------------------------------------------
     * PART 3: Webflow Form Tracking — ONLY After Successful Submit
     * ----------------------------------------------------------- */
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        const successWrapper = form.parentElement.querySelector('.w-form-done');
        if (!successWrapper) return;

        // Use MutationObserver — Webflow safe
        const observer = new MutationObserver(() => {
            // Check if successWrapper became visible → means successful submission
            if (successWrapper.style.display !== 'none') {

                // Helper function to collect all form field values
                const collectFormData = (formElement) => {
                    const formData = {};
                    
                    // Get all input fields (text, email, tel, etc.)
                    const inputs = formElement.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="hidden"]');
                    inputs.forEach(input => {
                        if (input.name && input.value) {
                            // Convert field names to snake_case for consistency
                            const key = input.name.replace(/-/g, '_').toLowerCase();
                            formData[key] = input.value;
                        }
                    });
                    
                    // Get all select fields
                    const selects = formElement.querySelectorAll('select');
                    selects.forEach(select => {
                        if (select.name && select.value) {
                            const key = select.name.replace(/-/g, '_').toLowerCase();
                            formData[key] = select.value;
                        }
                    });
                    
                    // Get all textarea fields
                    const textareas = formElement.querySelectorAll('textarea');
                    textareas.forEach(textarea => {
                        if (textarea.name && textarea.value) {
                            const key = textarea.name.replace(/-/g, '_').toLowerCase();
                            formData[key] = textarea.value;
                        }
                    });
                    
                    return formData;
                };

                const formData = collectFormData(form);
                const emailField = form.querySelector('input[type="email"]');
                const userEmail = emailField ? emailField.value : 'anonymous';

                const formLocation = form.getAttribute('data-form-location') || form.getAttribute('data-form') || 'body';
                const params = new URLSearchParams(window.location.search);

                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    event: 'lead_form_submit',
                    user_id: userEmail,
                    cta_location: formLocation,
                    ...formData, // Spread all form field values
                    utm_source: params.get('utm_source') || '',
                    utm_medium: params.get('utm_medium') || '',
                    utm_campaign: params.get('utm_campaign') || '',
                    utm_term: params.get('utm_term') || '',
                    utm_content: params.get('utm_content') || ''
                });

                console.log('Form successfully submitted → GTM event sent', formData);
            }
        });

        observer.observe(successWrapper, { attributes: true, attributeFilter: ['style'] });
    });

    // Initialize Lucy functionality if available
    if (typeof initLucy === 'function') {
        initLucy();
    }

});