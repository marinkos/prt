// -----------------------
// Script for Webinar Form
// -----------------------
(function () {
    'use strict';

    // ------------------------------------
    // SPAM PROTECTION VARIABLES
    // ------------------------------------
    let formLoadTime = Date.now();
    let recaptchaLoaded = false;
    let fieldInteractions = {
        email: false,
        phone: false,
        state: false,
        mouseMovements: 0,
        keystrokes: 0
    };

    // Track human-like behavior
    document.addEventListener('mousemove', function () {
        fieldInteractions.mouseMovements++;
    });

    document.addEventListener('keydown', function () {
        fieldInteractions.keystrokes++;
    });

    // ------------------------------
    // Function to Get URL Parameters
    // ------------------------------
    function getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' +
            '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(
                /\+/g, '%20')) || null;
    }

    // ----------------------
    // Capture UTM Parameters
    // ----------------------
    function populateHiddenFields() {
        var utm_source = getURLParameter('utm_source');
        var utm_medium = getURLParameter('utm_medium');
        var utm_campaign = getURLParameter('utm_campaign');
        var utm_content = getURLParameter('utm_content');

        if (document.getElementById('00NRc0000083yKn')) {
            document.getElementById('00NRc0000083yKn').value = utm_source || '';
        }
        if (document.getElementById('00NRc0000083yW5')) {
            document.getElementById('00NRc0000083yW5').value = utm_medium || '';
        }
        if (document.getElementById('00NRc0000083yhN')) {
            document.getElementById('00NRc0000083yhN').value = utm_campaign || '';
        }
        if (document.getElementById('00NRc0000083pBL')) {
            document.getElementById('00NRc0000083pBL').value = utm_content || '';
        }
    }

    // ---------------------------
    // Enhanced Email Validation
    // ---------------------------
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const disposableDomainsRegex = /\.(10minutemail|guerrillamail|mailinator|tempmail|yopmail|throwaway|temp-mail|guerrillamailblock|sharklasers|grr\.la|guerrilamailblock|pokemail|spam4\.me|bccto\.me|chacuo\.net|dispostable|spambox|spamgourmet)\./i;
        const suspiciousPatterns = /^(test|admin|noreply|no-reply|info|support|contact)@/i;

        return emailRegex.test(email) &&
            !disposableDomainsRegex.test(email) &&
            !suspiciousPatterns.test(email) &&
            email.length >= 5 &&
            email.length <= 254;
    }

    // -----------------------------------
    // Script for Phone Number Formatting
    // -----------------------------------
    function phoneFormat(input) {
        input = input.replace(/\D/g, '');
        input = input.substring(0, 10);
        var size = input.length;
        if (size === 0) {
            input = input;
        } else if (size < 4) {
            input = '(' + input;
        } else if (size < 7) {
            input = '(' + input.substring(0, 3) + ') ' + input.substring(3);
        } else {
            input = '(' + input.substring(0, 3) + ') ' + input.substring(3, 6) + ' - ' + input.substring(6, 10);
        }
        return input;
    }

    // ------------------------------------
    // SPAM DETECTION FUNCTIONS
    // ------------------------------------
    function detectSpam(formElement) {
        const reasons = [];

        // Check honeypot fields (only check fields that should always be empty)
        const honeypotFields = ['website', 'confirm_email'];
        for (let fieldName of honeypotFields) {
            const field = document.getElementById(fieldName);
            if (field && field.value.trim() !== '') {
                reasons.push('honeypot_filled');
                break;
            }
        }

        // Check form submission speed (only catch obvious bots)
        const submissionTime = Date.now();
        const timeSpent = submissionTime - formLoadTime;
        if (timeSpent < 500) {
            reasons.push('too_fast');
        }

        // Check field interactions (require 1 of 3 key fields)
        const interactionCount = [fieldInteractions.email, fieldInteractions.phone, fieldInteractions.state].filter(Boolean).length;
        if (interactionCount === 0) {
            reasons.push('no_interaction');
        }

        // Check for human-like behavior (relaxed)
        if (fieldInteractions.mouseMovements === 0 && fieldInteractions.keystrokes === 0) {
            reasons.push('no_human_behavior');
        }

        // Check email validity (basic validation)
        const email = document.getElementById('email');
        if (email && email.value && !isValidEmail(email.value)) {
            reasons.push('invalid_email');
        }

        // Check for suspicious patterns in form data (require multiple suspicious patterns)
        if (formElement) {
            const formData = new FormData(formElement);
            let suspiciousCount = 0;

            for (let [, value] of formData.entries()) {
                if (typeof value === 'string') {
                    if (value.match(/https?:\/\//i) ||
                        value.match(/\b(viagra|casino|bitcoin|crypto|loan|debt)\b/i) ||
                        value.length > 2000 ||
                        value.match(/(.)\1{20,}/)) {
                        suspiciousCount++;
                    }
                }
            }

            if (suspiciousCount >= 3) {
                reasons.push('suspicious_content');
            }
        }

        return reasons;
    }

    // ------------------------------------
    // Load JSON Data and Initialize Script
    // ------------------------------------
    let jsonData = [];

    function updateInsuranceDropdown(state, insuranceSelect) {
        if (!insuranceSelect) {
            return;
        }

        insuranceSelect.innerHTML = '';

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.text = 'Select';
        insuranceSelect.appendChild(defaultOption);

        if (!state || jsonData.length === 0) {
            insuranceSelect.selectedIndex = 0;
            return;
        }

        const filteredPayors = jsonData
            .filter(item =>
                item.state === state &&
                item.tofu_payor_name &&
                item.tofu_payor_name.trim() !== ''
            )
            .map(item => item.tofu_payor_name);

        const uniquePayors = Array.from(new Set(filteredPayors));
        uniquePayors.sort((a, b) => a.toUpperCase().localeCompare(b.toUpperCase()));

        uniquePayors.forEach(payorName => {
            const option = document.createElement('option');
            option.value = payorName;
            option.text = payorName;
            insuranceSelect.appendChild(option);
        });

        insuranceSelect.selectedIndex = 0;
    }

    function renderRecaptcha() {
        const recaptchaContainer = document.getElementById('recaptcha-container');
        const captchaErrorMessage = document.getElementById('missing_captcha_error_message');
        if (recaptchaContainer && typeof grecaptcha !== "undefined") {
            recaptchaLoaded = true;
            grecaptcha.render(recaptchaContainer, {
                sitekey: '6Ldp-yorAAAAAH7nTspqJRX-wZQ1HKfvJEpV3g8B',
                callback: function () {
                    if (captchaErrorMessage) captchaErrorMessage.style.display = 'none';
                },
                'expired-callback': function () {
                    if (captchaErrorMessage) {
                        captchaErrorMessage.style.display = 'block';
                        captchaErrorMessage.textContent = 'Captcha expired. Please try again.';
                    }
                },
                'error-callback': function () {
                    if (captchaErrorMessage) {
                        captchaErrorMessage.style.display = 'block';
                        captchaErrorMessage.textContent = 'Captcha failed to load. Please refresh.';
                    }
                }
            });
        }
    }

    window.onRecaptchaLoad = function () {
        renderRecaptcha();
    };

    document.addEventListener('DOMContentLoaded', function () {
        const form = document.getElementById('form_wrapper');
        if (!form) {
            return;
        }

        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');
        const stateSelect = document.getElementById('state');
        const insuranceSelect = document.getElementById('00N8b00000EQM3J');

        populateHiddenFields();
        renderRecaptcha();

        // Email validation handlers
        if (emailInput) {
            emailInput.addEventListener('invalid', function () {
                this.setCustomValidity('Please enter a valid email address');
            });

            emailInput.addEventListener('input', function () {
                this.setCustomValidity('');
                fieldInteractions.email = true;
            });

            emailInput.addEventListener('blur', function () {
                if (this.value && !isValidEmail(this.value)) {
                    this.setCustomValidity('Please enter a valid email address from a recognized provider');
                    this.reportValidity();
                }
            });

            emailInput.addEventListener('focus', function () {
                fieldInteractions.email = true;
            });
        }

        // Phone formatting handlers
        if (phoneInput) {
            phoneInput.addEventListener('keyup', function () {
                phoneInput.value = phoneFormat(phoneInput.value);
            });

            phoneInput.addEventListener('focus', function () {
                fieldInteractions.phone = true;
            });

            phoneInput.value = phoneFormat(phoneInput.value);
        }

        // State change handler
        if (stateSelect) {
            stateSelect.addEventListener('change', function () {
                fieldInteractions.state = true;
                updateInsuranceDropdown(this.value, insuranceSelect);
            });
        }

        // Fetch insurance data and populate dropdown
        fetch('https://cdn.prod.fortahealth.com/assets/tofu_payor_status.json')
            .then(response => response.json())
            .then(data => {
                jsonData = data;
                if (stateSelect) {
                    updateInsuranceDropdown(stateSelect.value, insuranceSelect);
                }
            })
            .catch(error => console.error('Error fetching JSON:', error));

        // Submission handler with spam + recaptcha validation
        form.addEventListener('submit', function (event) {
            const spamReasons = detectSpam(form);
            if (spamReasons.length > 0) {
                event.preventDefault();
                console.log('Spam detected:', spamReasons);
                alert('There was an error processing your submission. Please ensure all fields are completed correctly and try again.');
                return;
            }

            if (!recaptchaLoaded || typeof grecaptcha === "undefined") {
                event.preventDefault();
                alert('Please wait for the security verification to load completely.');
                return;
            }

            const recaptchaResponse = grecaptcha.getResponse();
            if (!recaptchaResponse || recaptchaResponse.length === 0) {
                event.preventDefault();
                const captchaErrorMessage = document.getElementById('missing_captcha_error_message');
                if (captchaErrorMessage) {
                    captchaErrorMessage.textContent = 'Please complete the security verification.';
                    captchaErrorMessage.style.display = 'block';
                }
                return;
            }

            event.preventDefault();
            const submitButton = form.querySelector('[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
            }

            fetch(form.action, {
                method: form.method || 'POST',
                body: new FormData(form),
                mode: 'no-cors'
            }).catch(error => {
                console.error('Submission error:', error);
            });

            const formWrapper = document.getElementById('webinarForm');
            const successWrapper = document.getElementById('webinarSuccess');
            if (formWrapper) {
                formWrapper.style.display = 'none';
            }
            if (successWrapper) {
                successWrapper.style.display = 'block';
            }
        });
    });
})();
