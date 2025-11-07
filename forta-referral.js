// ===================================
// REFERRAL FORM - FUNCTIONALITY
// ===================================

// Global variables
let jsonData = [];
let isScriptInitialized = false;

// -----------------------
// Script for GCLID Capture
// -----------------------
window.addEventListener('DOMContentLoaded', function () {
    var gclid = getURLParameter('gclid');
    if (gclid) {
        var gclidField = document.getElementById("00N8b00000GjstL");
        if (gclidField) {
            gclidField.value = gclid;
        }
    }
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

// -----------------------------------
// Script for Phone Number Formatting
// -----------------------------------
document.addEventListener('DOMContentLoaded', function() {
    // Format phone field #phone
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('keyup', function () {
            phoneInput.value = phoneFormat(phoneInput.value);
        });
        phoneInput.addEventListener('input', function () {
            phoneInput.value = phoneFormat(phoneInput.value);
        });
        // Format the phone number on page load if it has a value
        if (phoneInput.value) {
            phoneInput.value = phoneFormat(phoneInput.value);
        }
    }

    // Format phone field #00NRc00000kLFHh (Practice Phone)
    const practicePhoneInput = document.getElementById('00NRc00000kLFHh');
    if (practicePhoneInput) {
        practicePhoneInput.addEventListener('keyup', function () {
            practicePhoneInput.value = phoneFormat(practicePhoneInput.value);
        });
        practicePhoneInput.addEventListener('input', function () {
            practicePhoneInput.value = phoneFormat(practicePhoneInput.value);
        });
        // Format the phone number on page load if it has a value
        if (practicePhoneInput.value) {
            practicePhoneInput.value = phoneFormat(practicePhoneInput.value);
        }
    }

    // Format fax field #00NRc00000kLFJJ (Fax)
    const faxInput = document.getElementById('00NRc00000kLFJJ');
    if (faxInput) {
        faxInput.addEventListener('keyup', function () {
            faxInput.value = phoneFormat(faxInput.value);
        });
        faxInput.addEventListener('input', function () {
            faxInput.value = phoneFormat(faxInput.value);
        });
        // Format the fax number on page load if it has a value
        if (faxInput.value) {
            faxInput.value = phoneFormat(faxInput.value);
        }
    }
});

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

// ---------------------------
// Script for Email Validation
// ---------------------------
document.addEventListener('DOMContentLoaded', function() {
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('invalid', function () {
            this.setCustomValidity('Please enter a valid email');
        });

        emailInput.addEventListener('input', function () {
            this.setCustomValidity('');
        });
    }
});

// City is now a text input, city data no longer needed

// ------------------------------------
// Load JSON Data and Initialize Script
// ------------------------------------
function loadJsonAndInitialize() {
    if (isScriptInitialized) {
        return; // Already initialized, don't run again
    }
    
    // Load insurance data
    fetch('https://cdn.prod.fortahealth.com/assets/tofu_payor_status.json')
        .then(response => response.json())
        .then(data => {
            jsonData = data;
            if (!isScriptInitialized) {
                initializeScript();
                isScriptInitialized = true;
            }
        })
        .catch(error => {
            console.error('Error fetching insurance JSON:', error);
            jsonData = [];
            if (!isScriptInitialized) {
                initializeScript();
                isScriptInitialized = true;
            }
        });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    // Set default "Child Has Health Insurance?" to "Yes"
    const hasInsuranceField = document.getElementById('00N8b00000Bz6et');
    if (hasInsuranceField) {
        hasInsuranceField.value = 'yes';
    }
    
    loadJsonAndInitialize();
});

// Keep this function for when reCAPTCHA loads
function onRecaptchaLoad() {
    loadJsonAndInitialize();
}

// ------------------------
// Initialize Script
// ------------------------
function initializeScript() {
    if (isScriptInitialized) {
        console.log('Referral script already initialized, skipping...');
        return;
    }

    // Get form elements
    const stateSelect = document.getElementById("state");
    const typeSelect = document.getElementById("type");
    const insuranceSelect = document.getElementById("00N8b00000EQM3J");
    const referralForm = document.getElementById("wf-form-Referral-Form") || document.querySelector('form');

    if (!stateSelect || !typeSelect || !insuranceSelect) {
        console.warn('Required form elements not found');
        return;
    }

    // ---------------------------------------
    // Event Listener for State Selection
    // ---------------------------------------
    if (stateSelect) {
        stateSelect.addEventListener('change', function () {
            // Clear and reset insurance dropdown when state changes
            if (insuranceSelect) {
                insuranceSelect.innerHTML = '<option value="">Select one...</option>';
                // Clear insurance hidden fields when state changes
                clearInsuranceFields();
            }
        });
    }

    // ---------------------------------------
    // Event Listener for Type Selection
    // ---------------------------------------
    if (typeSelect) {
        typeSelect.addEventListener('change', function () {
            const selectedState = stateSelect ? stateSelect.value : '';
            const selectedType = this.value;
            
            if (selectedState && selectedType && insuranceSelect) {
                updateInsuranceDropdown(selectedState, selectedType);
            }
        });
    }

    // ---------------------------------------
    // Event Listener for Insurance Selection
    // ---------------------------------------
    if (insuranceSelect) {
        insuranceSelect.addEventListener('change', function () {
            const selectedState = stateSelect ? stateSelect.value : '';
            const selectedInsurance = this.value;
            
            if (selectedState && selectedInsurance) {
                updatePrimaryInsuranceFields(selectedState, selectedInsurance);
            } else {
                clearInsuranceFields();
            }
        });
    }

    // Update insurance dropdown when both state and type are selected
    if (stateSelect && typeSelect) {
        // Check if both are already selected on page load
        const currentState = stateSelect.value;
        const currentType = typeSelect.value;
        if (currentState && currentType) {
            updateInsuranceDropdown(currentState, currentType);
        }
    }

    // ------------------------------------------
    // Form Submission Logic with MQL
    // ------------------------------------------
    if (referralForm) {
        referralForm.addEventListener('submit', function (event) {
            // Update insurance fields before submission
            const selectedState = stateSelect ? stateSelect.value : '';
            const selectedInsurance = insuranceSelect ? insuranceSelect.value : '';
            if (selectedState && selectedInsurance) {
                updatePrimaryInsuranceFields(selectedState, selectedInsurance);
            }

            // Calculate MQL Status
            calculateMQLStatus(event);
        });
    }

    isScriptInitialized = true;
}

// -------------------------------------------------
// Function to Filter Payors Based on State and Type
// -------------------------------------------------
function filterPayors(state, type) {
    if (!jsonData || jsonData.length === 0) {
        console.warn('Insurance data not loaded yet');
        return [];
    }

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

// --------------------------------------------------
// Update Insurance Dropdown Based on State and Type
// --------------------------------------------------
function updateInsuranceDropdown(state, type) {
    const payorNames = filterPayors(state, type);
    const insuranceDropdown = document.getElementById('00N8b00000EQM3J');

    if (!insuranceDropdown) {
        console.warn('Insurance dropdown not found');
        return;
    }

    // Clear current options
    insuranceDropdown.innerHTML = '';

    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.text = 'Select one...';
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

    // Ensure default option is selected
    insuranceDropdown.selectedIndex = 0;
    
    // Clear insurance fields when dropdown is reset
    clearInsuranceFields();
}

// ------------------------------------------
// Functions to Find Insurance Data from JSON
// ------------------------------------------
function findInsuranceData(state, insuranceName) {
    if (!jsonData || jsonData.length === 0) {
        return null;
    }
    return jsonData.find(item =>
        item.state === state &&
        item.tofu_payor_name === insuranceName
    );
}

// ------------------------------------------
// Update Hidden Fields for Primary Insurance
// ------------------------------------------
function updatePrimaryInsuranceFields(state, insuranceName) {
    const insuranceData = findInsuranceData(state, insuranceName);
    if (insuranceData) {
        const bayField = document.getElementById('00NRc00000OHqQz');
        const statusField = document.getElementById('00NRc00000OHo1Z');
        
        if (bayField) {
            bayField.value = insuranceData.final_forta_bay || ''; // Primary Insurance Bay
        }
        if (statusField) {
            statusField.value = insuranceData.inn_oon_designation || ''; // Primary Insurance Status
        }
    } else {
        clearInsuranceFields();
    }
}

// ------------------------------------------
// Clear Insurance Hidden Fields
// ------------------------------------------
function clearInsuranceFields() {
    const bayField = document.getElementById('00NRc00000OHqQz');
    const statusField = document.getElementById('00NRc00000OHo1Z');
    
    if (bayField) bayField.value = '';
    if (statusField) statusField.value = '';
}

// ------------------------------------------
// Calculate Age from Date of Birth
// ------------------------------------------
function calculateAge(birthDate) {
    if (!birthDate) return null;
    
    const today = new Date();
    const birth = new Date(birthDate);
    
    if (isNaN(birth.getTime())) return null;
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age >= 0 ? age : null;
}

// ------------------------------------------
// Calculate MQL Status
// ------------------------------------------
function calculateMQLStatus(event) {
    // Get form field values
    const asdDiagnosisField = document.getElementById('00N8b00000EQM2f');
    const birthDateField = document.getElementById('00N8b00000GjjfI');
    const stateSelect = document.getElementById('state');
    const typeSelect = document.getElementById('type');
    const insuranceSelect = document.getElementById('00N8b00000EQM3J');
    const mqlStatusField = document.getElementById('00NRc00000Nxa1C');
    
    if (!mqlStatusField) {
        console.warn('MQL Status field not found');
        return;
    }
    
    const asdDiagnosis = asdDiagnosisField ? asdDiagnosisField.value.trim() : '';
    const state = stateSelect ? stateSelect.value : '';
    const insuranceProvider = insuranceSelect ? insuranceSelect.value : '';
    const birthDate = birthDateField ? birthDateField.value : '';
    const childAge = calculateAge(birthDate);
    
    // Diagnosis Disqualify States
    const diagnosisDisqualifyStates = ["AK", "CA", "IA", "HI", "LA", "MA", "MT", "NM", "NY", "OR"];
    
    // Get primary insurance's TOFU Status
    const insuranceData = findInsuranceData(state, insuranceProvider);
    const tofuStatus = insuranceData ? insuranceData.tofu_status : null;
    
    // Default: Child has insurance (always "yes" for referral form)
    const hasInsurance = 'yes';
    
    // --------------------------------------
    // MQL Logic Based on Business Rules
    // --------------------------------------
    let mqlStatus = '';
    
    // DISQUALIFY if primary insurance's TOFU Status is "Disqualify"
    if (tofuStatus === "Disqualify") {
        mqlStatus = "DQ - Insurance not supported";
    }
    // MQL - Check Diagnosis (PASS case)
    else if (
        asdDiagnosis.toLowerCase() === "no, evaluation scheduled" || 
        (asdDiagnosis.toLowerCase() === "no, iep only" && state.toLowerCase() === "ca" && typeSelect && typeSelect.value.toLowerCase() === "yes")
    ) {
        mqlStatus = "Dx - Check Eval";
    }
    // DQ - No Diagnosis (FAIL case)
    else if (
        ["no", "no, iep only", "no, on a waitlist", "no, have non-asd diagnosis"].includes(asdDiagnosis.toLowerCase())
    ) {
        mqlStatus = "DQ - No Diagnosis";
    }
    // MQL - Standard Pass if primary insurance's TOFU Status is "Passing"
    else if (tofuStatus === "Passing") {
        mqlStatus = "MQL";
    }
    // DISQUALIFY based on adjusted ASD diagnosis logic (FAIL case)
    else if (
        asdDiagnosis.toLowerCase() !== "yes" &&
        diagnosisDisqualifyStates.includes(state) &&
        asdDiagnosis.toLowerCase().includes('no')
    ) {
        mqlStatus = "DQ - No Diagnosis";
    }
    // DISQUALIFY if Age is >99 (FAIL case)
    else if (childAge !== null && childAge > 99) {
        mqlStatus = "DQ - Age";
    } else {
        // Default fallback (FAIL case)
        mqlStatus = "DQ - Other";
    }
    
    // Set the MQL Status hidden field
    mqlStatusField.value = mqlStatus;
}
