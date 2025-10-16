// Global variables - declare these at the top
let jsonData = [];
let isScriptInitialized = false;


// -----------------------
// Script for GCLID Capture
// -----------------------
window.addEventListener('DOMContentLoaded', function () {
    var gclid = getURLParameter('gclid');
    //console.log('GCLID from URL:', gclid); // Log the GCLID value
    if (gclid) {
        var gclidField = document.getElementById("00N8b00000GjstL");
        if (gclidField) {
            gclidField.value = gclid;
            // console.log('GCLID field updated with value:', gclidField.value); // Confirm the field is updated
        } else {
            // console.log('GCLID field not found'); // Log if the hidden field is not found
        }
    } else {
        // console.log('No GCLID found in URL'); // Log if GCLID is not present in URL
    }
});

// -------------------------
// Script for State Dropdown
// -------------------------
const select = document.getElementById("select");
const state2 = document.getElementById("input-field-1");
select.addEventListener("change", function () {
    state2.value = select.value;
});

// -----------------------
// Script for ASD Dropdown
// -----------------------
const asd = document.getElementById("asd");
const asdInput = document.getElementById("00N8b00000EQM2f");
asd.addEventListener("change", function () {
    asdInput.value = asd.value;
});

// -------------------------
// Script for Type Dropdowns
// -------------------------
const type = document.getElementById("type");
const typeInput = document.getElementById("00N8b00000Bz6ey");
type.addEventListener("change", function () {
    typeInput.value = type.value;
});

const type2 = document.getElementById("type2");
const type2Input = document.getElementById("00NRc00000KXQa0");
type2.addEventListener("change", function () {
    type2Input.value = type2.value;
});

// -------------------
// Script for Zip Code
// -------------------
const zipInput = document.getElementById('zip');
zipInput.addEventListener('input', function () {
    if (this.value.length > this.maxLength) {
        this.value = this.value.slice(0, this.maxLength);
    }
});

// --------------
// Script for Age
// --------------
const ageInput = document.getElementById('00N8b00000EQM2a');
ageInput.addEventListener('input', function () {
    if (this.value.length > this.maxLength) {
        this.value = this.value.slice(0, this.maxLength);
    }
});

// ---------------------------
// Script for Email Validation
// ---------------------------
const emailInput = document.getElementById('email');
emailInput.addEventListener('invalid', function () {
    this.setCustomValidity('Please enter a valid email');
});

emailInput.addEventListener('input', function () {
    this.setCustomValidity('');
});

// -----------------------------------
// Script for Phone Number Formatting
// -----------------------------------
const phoneInput = document.getElementById('phone');
phoneInput.addEventListener('keyup', function () {
    phoneInput.value = phoneFormat(phoneInput.value);
});

// Format the phone number on page load
phoneInput.value = phoneFormat(phoneInput.value);

// Function to format text to look like a phone number
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
    var utm_domain = getURLParameter('utm_domain');

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
    if (document.getElementById('00NRc00000D4OSr')) {
        document.getElementById('00NRc00000D4OSr').value = utm_domain || '';
    }
}

document.addEventListener('DOMContentLoaded', populateHiddenFields);

// ------------------------------------
// Load JSON Data and Initialize Script
// ------------------------------------
document.addEventListener('DOMContentLoaded', function() {
    fetch('https://cdn.prod.fortahealth.com/assets/tofu_payor_status.json')
        .then(response => response.json())
        .then(data => {
            jsonData = data;
            if (!isScriptInitialized) {
                initializeScript();
                isScriptInitialized = true;
            }
        })
        .catch(error => console.error('Error fetching JSON:', error));
});

// Keep this function for when reCAPTCHA loads
function onRecaptchaLoad() {
    // Render reCAPTCHA first
    let recaptchaContainer = document.getElementById('recaptcha-container');
    let captchaErrorMessage = document.getElementById('missing_captcha_error_message');
    
    if (recaptchaContainer && typeof grecaptcha !== "undefined") {
        // Check if already rendered
        if (!recaptchaContainer.hasChildNodes()) {
            grecaptcha.render(recaptchaContainer, { 
                sitekey: '6Ldp-yorAAAAAH7nTspqJRX-wZQ1HKfvJEpV3g8B',
                callback: function(token) {
                    if (captchaErrorMessage) captchaErrorMessage.style.display = 'none';
                },
                'expired-callback': function() {
                    if (captchaErrorMessage) {
                        captchaErrorMessage.style.display = 'block';
                        captchaErrorMessage.textContent = 'Captcha expired. Please try again.';
                    }
                },
                'error-callback': function() {
                    if (captchaErrorMessage) {
                        captchaErrorMessage.style.display = 'block';
                        captchaErrorMessage.textContent = 'Captcha failed to load. Please refresh.';
                    }
                }
            });
        }
    }
    
    // Then load JSON and initialize script
    fetch('https://cdn.prod.fortahealth.com/assets/tofu_payor_status.json')
        .then(response => response.json())
        .then(data => {
            jsonData = data;
            if (!isScriptInitialized) {
                initializeScript();
                isScriptInitialized = true;
            }
        })
        .catch(error => console.error('Error fetching JSON:', error));
}

function initializeScript() {
    // ---------------------
    // Variable Declarations
    // ---------------------
    const insuranceSelect = document.getElementById("InsuranceSelect");
    const insuranceName = document.getElementById("insuranceName");
    const insuranceName2 = document.getElementById("insuranceName2");
    const insurance = document.getElementById("insurance");
    const insurance2 = document.getElementById("insurance2");
    const primaryInsuranceInput = document.getElementById("00N8b00000EQM3J");
    const secondaryInsuranceInput = document.getElementById("00NRc00000KXXrJ");
    const type = document.getElementById("type");
    const type2 = document.getElementById("type2");
    const formSales = document.getElementById("form_wrapper");
    const select = document.getElementById("select");
    const statePrimary = document.getElementById('statePrimary');
    const stateSecondary = document.getElementById('stateSecondary');
    const asd = document.getElementById('asd');
    const ageInput = document.getElementById('00N8b00000EQM2a');

    let recaptchaContainer = document.getElementById('recaptcha-container');
    let captchaErrorMessage = document.getElementById('missing_captcha_error_message');
    if (recaptchaContainer && typeof grecaptcha !== "undefined") {
        grecaptcha.render(recaptchaContainer, { 
            sitekey: '6Ldp-yorAAAAAH7nTspqJRX-wZQ1HKfvJEpV3g8B',
            callback: function(token) {
                if (captchaErrorMessage) captchaErrorMessage.style.display = 'none';
            },
            'expired-callback': function() {
                if (captchaErrorMessage) {
                    captchaErrorMessage.style.display = 'block';
                    captchaErrorMessage.textContent = 'Captcha expired. Please try again.';
                }
            },
            'error-callback': function() {
                if (captchaErrorMessage) {
                    captchaErrorMessage.style.display = 'block';
                    captchaErrorMessage.textContent = 'Captcha failed to load. Please refresh.';
                }
            }
        });
    }

    // ------------------------
    // Reset Form Functionality
    // ------------------------
    function resetForm() {
        insuranceName.classList.add("is-hidden");
        insuranceName2.classList.add("is-hidden");
        insurance.value = "";
        insurance2.value = "";
        type.value = "";
        type2.value = "";
        primaryInsuranceInput.value = "";
        secondaryInsuranceInput.value = "";

        insurance.removeAttribute("required");
        type.removeAttribute("required");
        insurance2.removeAttribute("required");
        type2.removeAttribute("required");
    }

    // --------------------------------------
    // Event Listener for Insurance Selection
    // --------------------------------------
    insuranceSelect.addEventListener("change", function () {
        resetForm();
        const selection = insuranceSelect.value.trim();

        if (selection === 'Yes, primary only') {
            insuranceName.classList.remove("is-hidden");
            insurance.setAttribute("required", "required");
            type.setAttribute("required", "required");

            // Auto-fill statePrimary and stateSecondary with main state
            statePrimary.value = select.value;
            stateSecondary.value = select.value;
        } else if (selection === 'Yes, primary & secondary') {
            insuranceName.classList.remove("is-hidden");
            insuranceName2.classList.remove("is-hidden");
            insurance.setAttribute("required", "required");
            type.setAttribute("required", "required");
            insurance2.setAttribute("required", "required");
            type2.setAttribute("required", "required");

            // Auto-fill statePrimary and stateSecondary with main state
            statePrimary.value = select.value;
            stateSecondary.value = select.value;
        }
    });

    // ---------------------------------------
    // Event Listener for Main State Selection
    // ---------------------------------------
    select.addEventListener('change', function () {
        const selectedState = this.value;

        // Auto-fill statePrimary and stateSecondary with main state
        if (statePrimary) statePrimary.value = selectedState;
        if (stateSecondary) stateSecondary.value = selectedState;

        // Optionally, update the insurance dropdowns based on the new state and existing type selections
        const type1 = type.value;
        const type2Value = type2.value;
        updateInsuranceDropdowns(statePrimary.value, type1, 'insurance');
        updateInsuranceDropdowns(stateSecondary.value, type2Value, 'insurance2');
    });

    // ------------------------------------------
    // Functions to Find Insurance Data from JSON
    // ------------------------------------------
    function findInsuranceData(state, insuranceName) {
        return jsonData.find(item =>
            item.state === state &&
            item.tofu_payor_name === insuranceName
        );
    }

    // ------------------------------------------
    // Update Hidden Fields for Primary Insurance
    // --------------------------------------------------
    function updatePrimaryInsuranceFields(state, insuranceName) {
        const insuranceData = findInsuranceData(state, insuranceName);
        if (insuranceData) {
            document.getElementById('00NRc00000OHqQz').value = insuranceData.final_forta_bay; // Primary Insurance Bay
            document.getElementById('00NRc00000OHo1Z').value = insuranceData.inn_oon_designation; // Primary Insurance Status
            primaryInsuranceInput.value = insuranceData.payor_name; // Set to payor_name
        } else {
            // Clear hidden fields if no matching data is found
            document.getElementById('00NRc00000OHqQz').value = '';
            document.getElementById('00NRc00000OHo1Z').value = '';
            primaryInsuranceInput.value = '';
        }
    }

    // --------------------------------------------
    // Update Hidden Fields for Secondary Insurance
    // --------------------------------------------
    function updateSecondaryInsuranceFields(state, insuranceName) {
        const insuranceData = findInsuranceData(state, insuranceName);
        if (insuranceData) {
            document.getElementById('00NRc00000OHWu6').value = insuranceData.final_forta_bay; // Secondary Insurance Bay
            document.getElementById('00NRc00000OHuZR').value = insuranceData.inn_oon_designation; // Secondary Insurance Status
            secondaryInsuranceInput.value = insuranceData.payor_name; // Set to payor_name
        } else {
            // Clear hidden fields if no matching data is found
            document.getElementById('00NRc00000OHWu6').value = '';
            document.getElementById('00NRc00000OHuZR').value = '';
            secondaryInsuranceInput.value = '';
        }
    }

    // -----------------------------------------
    // Event Listeners for Insurance Name Fields
    // -----------------------------------------
    insurance.addEventListener("change", function () {
        const selectedState = statePrimary.value;
        updatePrimaryInsuranceFields(selectedState, this.value);
    });

    insurance2.addEventListener("change", function () {
        const selectedState = stateSecondary.value;
        updateSecondaryInsuranceFields(selectedState, this.value);
    });

    // -----------------------------------------------------
    // Event Listener for Changes in Primary Insurance State
    // -----------------------------------------------------
    statePrimary.addEventListener('change', function () {
        const selectedState = this.value;
        const selectedType = type.value;
        updateInsuranceDropdowns(selectedState, selectedType, 'insurance');

        // Reset insurance dropdown to 'Select provider'
        insurance.selectedIndex = 0;
        primaryInsuranceInput.value = '';
    });

    // -------------------------------------------------------
    // Event Listener for Changes in Secondary Insurance State
    // -------------------------------------------------------
    stateSecondary.addEventListener('change', function () {
        const selectedState = this.value;
        const selectedType = type2.value;
        updateInsuranceDropdowns(selectedState, selectedType, 'insurance2');

        // Reset insurance2 dropdown to 'Select provider'
        insurance2.selectedIndex = 0;
        secondaryInsuranceInput.value = '';
    });

    // ----------------------------------------------------
    // Event Listener for Changes in Primary Insurance Type
    // ----------------------------------------------------
    type.addEventListener("change", function () {
        const selectedState = statePrimary.value;
        const selectedType = this.value;
        updateInsuranceDropdowns(selectedState, selectedType, 'insurance');

        // Reset insurance dropdown to 'Select provider'
        insurance.selectedIndex = 0;
        primaryInsuranceInput.value = '';
    });

    // ------------------------------------------------------
    // Event Listener for Changes in Secondary Insurance Type
    // ------------------------------------------------------
    type2.addEventListener("change", function () {
        const selectedState = stateSecondary.value;
        const selectedType = this.value;
        updateInsuranceDropdowns(selectedState, selectedType, 'insurance2');

        // Reset insurance2 dropdown to 'Select provider'
        insurance2.selectedIndex = 0;
        secondaryInsuranceInput.value = '';
    });

    // --------------------------------------------------
    // Update Insurance Dropdowns Based on State and Type
    // --------------------------------------------------
    function updateInsuranceDropdowns(state, type, insuranceId) {
        const payorNames = filterPayors(state, type);
        const insuranceDropdown = document.getElementById(insuranceId);

        //console.log(`Populating ${insuranceId} with payors:`, payorNames); // Debugging line

        // Clear current options
        insuranceDropdown.innerHTML = '';

        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.text = 'Select provider';
        insuranceDropdown.appendChild(defaultOption);

        // Filter out entries with null or empty 'tofu_payor_name' and sort alphabetically
        const filteredPayors = payorNames.filter(payor => payor.tofu_payor_name && payor.tofu_payor_name.trim() !== '');
        filteredPayors.sort((a, b) => {
            const nameA = a.tofu_payor_name.toUpperCase();
            const nameB = b.tofu_payor_name.toUpperCase();
            return nameA.localeCompare(nameB);
        });

        // Add new options
        filteredPayors.forEach(payor => {
            const option = document.createElement('option');
            option.value = payor.tofu_payor_name;
            option.text = payor.tofu_payor_name;
            insuranceDropdown.appendChild(option);
        });

        //console.log(`${insuranceId} options:`, insuranceDropdown.innerHTML); // Debugging line

        // Ensure default option is selected
        insuranceDropdown.selectedIndex = 0;

        // Clear corresponding hidden fields
        if (insuranceId === 'insurance') {
            primaryInsuranceInput.value = '';
            document.getElementById('00NRc00000OHqQz').value = '';
            document.getElementById('00NRc00000OHo1Z').value = '';
        } else {
            secondaryInsuranceInput.value = '';
            document.getElementById('00NRc00000OHWu6').value = '';
            document.getElementById('00NRc00000OHuZR').value = '';
        }
    }

    // -------------------------------------------------
    // Function to Filter Payors Based on State and Type
    // -------------------------------------------------
    function filterPayors(state, type) {
        if (type === 'Yes') {
            return jsonData.filter(item =>
                item.state === state &&
                (item.payor_type === 'Medicaid' || item.payor_type === 'MCO') &&
                item.tofu_payor_name != null &&
                item.tofu_payor_name.trim() !== ''
            );
        } else if (type === 'No') {
            return jsonData.filter(item =>
                item.state === state &&
                (item.payor_type === 'Commercial' || item.payor_type === 'Government Plan') &&
                item.tofu_payor_name != null &&
                item.tofu_payor_name.trim() !== ''
            );
        }
        return [];
    }

    // --------------------------
    // Main Form Submission Logic
    // --------------------------
    formSales.addEventListener('submit', function (event) {

        // Update hidden fields before submission
        const statePrimaryValue = statePrimary.value;
        const insurancePrimary = insurance.value;
        if (insurancePrimary) {
            updatePrimaryInsuranceFields(statePrimaryValue, insurancePrimary);
        }

        const stateSecondaryValue = stateSecondary.value;
        const insuranceSecondary = insurance2.value;
        if (insuranceSecondary) {
            updateSecondaryInsuranceFields(stateSecondaryValue, insuranceSecondary);
        }

        // Gather values from form fields
        const asdDiagnosis = asd.value.trim();
        const hasInsurance = insuranceSelect.value;
        const childAge = parseInt(ageInput.value, 10);
        const state = select.value; // User's residential state
        const insuranceProvider = insurance.value;
        const mqlStatusField = document.getElementById('00NRc00000Nxa1C'); // Hidden MQL Status field

        // Diagnosis Disqualify States
        const diagnosisDisqualifyStates = ["AK", "CA", "IA", "HI", "LA", "MA", "MT", "NM", "NY", "OR"];

        // Get primary insurance's TOFU Status using the correct state
        const insuranceData = findInsuranceData(statePrimaryValue, insuranceProvider);
        const tofuStatus = insuranceData ? insuranceData.tofu_status : null;

        if (typeof grecaptcha !== "undefined" && !grecaptcha.getResponse()) {
            let captchaErrorMessage = document.getElementById('missing_captcha_error_message');
            if (captchaErrorMessage) {
                captchaErrorMessage.textContent = 'Please complete the CAPTCHA.';
                captchaErrorMessage.style.display = 'block';
            }
            event.preventDefault();
            return;
        }

// --------------------------------------
// Redirect Logic Based on Business Rules
// --------------------------------------
let returnURL = '';
let mqlStatus = '';

// DISQUALIFY if "Does your child have health insurance?" is "No"
if (hasInsurance === 'No') {
    returnURL = "https://www.fortahealth.com/thank-you-2";
    mqlStatus = "DQ - No Insurance";
}
// DISQUALIFY if primary insurance's TOFU Status is "Disqualify" (regardless of secondary)
else if (tofuStatus === "Disqualify") {
    returnURL = "https://www.fortahealth.com/thank-you-2";
    mqlStatus = "DQ - Insurance not supported";
}
// MQL - Check Diagnosis (PASS case)
else if (
    asdDiagnosis.toLowerCase() === "no, evaluation scheduled" || 
    // insurance type is unfortunately a variable called type which is Yes for mediciad/mco and No for commercial
    (asdDiagnosis.toLowerCase() === "no, iep only" && state.toLowerCase() === "ca" && type.value.toLowerCase() === "yes")
) {
    returnURL = "https://www.fortahealth.com/thank-you-intake2"; // Changed from /thank-you-diagnosis
    mqlStatus = "MQL - Check Diagnosis";
}
// DQ - No Diagnosis (FAIL case)
else if (
    ["no", "no, on a waitlist", "no, have non-asd diagnosis"].includes(asdDiagnosis.toLowerCase())
) {
    returnURL = "https://www.fortahealth.com/thank-you-2";
    mqlStatus = "DQ - No Diagnosis";
}
// MQL - Standard Pass if primary insurance's TOFU Status is "Passing"
else if (tofuStatus === "Passing") {
    returnURL = "https://www.fortahealth.com/thank-you-intake2"; // Changed from /thank-you-intake
    mqlStatus = "MQL";
}
// DISQUALIFY based on adjusted ASD diagnosis logic (FAIL case)
else if (
    asdDiagnosis.toLowerCase() !== "yes" &&
    diagnosisDisqualifyStates.includes(state) &&
    asdDiagnosis.toLowerCase().includes('no')
) {
    returnURL = "https://www.fortahealth.com/thank-you-2";
    mqlStatus = "DQ - No Diagnosis";
}
// DISQUALIFY if Age is >99 (FAIL case)
else if (childAge > 99) {
    returnURL = "https://www.fortahealth.com/thank-you-2";
    mqlStatus = "DQ - Age";
} else {
    // Default fallback (FAIL case)
    returnURL = "https://www.fortahealth.com/thank-you-2";
    mqlStatus = "DQ - Other";
}

// Set the MQL Status hidden field
mqlStatusField.value = mqlStatus;

// Set the return URL
document.getElementsByName("retURL")[0].value = returnURL;
});
}