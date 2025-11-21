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

                const emailField = form.querySelector('input[type="email"]');
                const userEmail = emailField ? emailField.value : 'anonymous';

                const formLocation = form.getAttribute('data-form-location') || 'body';
                const params = new URLSearchParams(window.location.search);

                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    event: 'lead_form_submit',
                    user_id: userEmail,
                    cta_location: formLocation,
                    utm_source: params.get('utm_source') || '',
                    utm_medium: params.get('utm_medium') || '',
                    utm_campaign: params.get('utm_campaign') || '',
                    utm_term: params.get('utm_term') || '',
                    utm_content: params.get('utm_content') || ''
                });

                console.log('Form successfully submitted → GTM event sent');
            }
        });

        observer.observe(successWrapper, { attributes: true, attributeFilter: ['style'] });
    });

    // Initialize Lucy functionality if available
    if (typeof initLucy === 'function') {
        initLucy();
    }

});