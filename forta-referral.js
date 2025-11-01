// ===================================
// REFERRAL FORM - FUNCTIONALITY
// ===================================

// Global variables
let jsonData = [];
let citiesData = null; // Will store cities data from JSON or fallback
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

    // Format phone field #00NRc00000kLFHh
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

// --------------------------------
// Fallback City Data by State (used if JSON fetch fails)
// --------------------------------
const fallbackCitiesByState = {
    'AL': ['Birmingham', 'Montgomery', 'Mobile', 'Huntsville', 'Tuscaloosa'],
    'AK': ['Anchorage', 'Fairbanks', 'Juneau', 'Sitka', 'Ketchikan'],
    'AZ': ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale', 'Glendale', 'Tempe', 'Peoria', 'Surprise', 'Yuma'],
    'AR': ['Little Rock', 'Fort Smith', 'Fayetteville', 'Jonesboro', 'North Little Rock'],
    'CA': ['Los Angeles', 'San Diego', 'San Jose', 'San Francisco', 'Fresno', 'Sacramento', 'Long Beach', 'Oakland', 'Bakersfield', 'Anaheim', 'Santa Ana', 'Riverside', 'Stockton', 'Irvine', 'Chula Vista', 'Fremont', 'San Bernardino', 'Modesto', 'Fontana', 'Oxnard'],
    'CO': ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood', 'Thornton', 'Arvada', 'Westminster', 'Pueblo', 'Centennial'],
    'CT': ['Bridgeport', 'New Haven', 'Hartford', 'Stamford', 'Waterbury', 'Norwalk', 'Danbury', 'New Britain', 'West Hartford', 'Greenwich'],
    'DE': ['Wilmington', 'Dover', 'Newark', 'Middletown', 'Smyrna'],
    'DC': ['Washington'],
    'FL': ['Jacksonville', 'Miami', 'Tampa', 'Orlando', 'St. Petersburg', 'Hialeah', 'Tallahassee', 'Fort Lauderdale', 'Port St. Lucie', 'Cape Coral'],
    'GA': ['Atlanta', 'Augusta', 'Columbus', 'Savannah', 'Athens', 'Sandy Springs', 'Roswell', 'Macon', 'Johns Creek', 'Albany'],
    'HI': ['Honolulu', 'Hilo', 'Kailua', 'Kaneohe', 'Kapaa'],
    'ID': ['Boise', 'Nampa', 'Meridian', 'Idaho Falls', 'Pocatello'],
    'IL': ['Chicago', 'Aurora', 'Naperville', 'Joliet', 'Rockford', 'Elgin', 'Peoria', 'Champaign', 'Waukegan', 'Cicero'],
    'IN': ['Indianapolis', 'Fort Wayne', 'Evansville', 'South Bend', 'Carmel', 'Fishers', 'Bloomington', 'Hammond', 'Gary', 'Muncie'],
    'IA': ['Des Moines', 'Cedar Rapids', 'Davenport', 'Sioux City', 'Iowa City', 'Waterloo', 'Council Bluffs', 'Ames', 'West Des Moines', 'Dubaque'],
    'KS': ['Wichita', 'Overland Park', 'Kansas City', 'Olathe', 'Topeka', 'Lawrence', 'Shawnee', 'Manhattan', 'Lenexa', 'Salina'],
    'KY': ['Louisville', 'Lexington', 'Bowling Green', 'Owensboro', 'Covington', 'Hopkinsville', 'Richmond', 'Florence', 'Georgetown', 'Henderson'],
    'LA': ['New Orleans', 'Baton Rouge', 'Shreveport', 'Lafayette', 'Lake Charles', 'Kenner', 'Bossier City', 'Monroe', 'Alexandria', 'Houma'],
    'ME': ['Portland', 'Lewiston', 'Bangor', 'South Portland', 'Auburn'],
    'MD': ['Baltimore', 'Frederick', 'Rockville', 'Gaithersburg', 'Bowie', 'Annapolis', 'College Park', 'Salisbury', 'Laurel', 'Greenbelt'],
    'MA': ['Boston', 'Worcester', 'Springfield', 'Lowell', 'Cambridge', 'New Bedford', 'Brockton', 'Quincy', 'Lynn', 'Fall River'],
    'MI': ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Lansing', 'Ann Arbor', 'Flint', 'Dearborn', 'Livonia', 'Troy'],
    'MN': ['Minneapolis', 'St. Paul', 'Rochester', 'Duluth', 'Bloomington', 'Brooklyn Park', 'Plymouth', 'St. Cloud', 'Eagan', 'Woodbury'],
    'MS': ['Jackson', 'Gulfport', 'Southaven', 'Hattiesburg', 'Biloxi', 'Meridian', 'Tupelo', 'Greenville', 'Olive Branch', 'Horn Lake'],
    'MO': ['Kansas City', 'St. Louis', 'Springfield', 'Columbia', 'Independence', 'Lee\'s Summit', 'O\'Fallon', 'St. Joseph', 'St. Charles', 'St. Peters'],
    'MT': ['Billings', 'Missoula', 'Great Falls', 'Bozeman', 'Butte'],
    'NE': ['Omaha', 'Lincoln', 'Bellevue', 'Grand Island', 'Kearney'],
    'NV': ['Las Vegas', 'Henderson', 'Reno', 'North Las Vegas', 'Sparks', 'Carson City'],
    'NH': ['Manchester', 'Nashua', 'Concord', 'Derry', 'Rochester'],
    'NJ': ['Newark', 'Jersey City', 'Paterson', 'Elizabeth', 'Edison', 'Woodbridge', 'Lakewood', 'Toms River', 'Hamilton', 'Trenton'],
    'NM': ['Albuquerque', 'Las Cruces', 'Rio Rancho', 'Santa Fe', 'Roswell'],
    'NY': ['New York', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany', 'New Rochelle', 'Mount Vernon', 'Schenectady', 'Utica'],
    'NC': ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem', 'Fayetteville', 'Cary', 'Wilmington', 'High Point', 'Asheville'],
    'ND': ['Fargo', 'Bismarck', 'Grand Forks', 'Minot', 'West Fargo'],
    'OH': ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton', 'Parma', 'Canton', 'Youngstown', 'Lorain'],
    'OK': ['Oklahoma City', 'Tulsa', 'Norman', 'Broken Arrow', 'Lawton', 'Edmond', 'Moore', 'Midwest City', 'Enid', 'Stillwater'],
    'OR': ['Portland', 'Salem', 'Eugene', 'Gresham', 'Hillsboro', 'Bend', 'Beaverton', 'Medford', 'Springfield', 'Corvallis'],
    'PA': ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading', 'Scranton', 'Bethlehem', 'Lancaster', 'Harrisburg', 'Altoona'],
    'RI': ['Providence', 'Warwick', 'Cranston', 'Pawtucket', 'East Providence'],
    'SC': ['Charleston', 'Columbia', 'North Charleston', 'Mount Pleasant', 'Rock Hill', 'Greenville', 'Summerville', 'Sumter', 'Hilton Head Island', 'Florence'],
    'SD': ['Sioux Falls', 'Rapid City', 'Aberdeen', 'Watertown', 'Brookings'],
    'TN': ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville', 'Murfreesboro', 'Franklin', 'Jackson', 'Johnson City', 'Bartlett'],
    'TX': ['Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi', 'Plano', 'Laredo'],
    'UT': ['Salt Lake City', 'West Valley City', 'Provo', 'West Jordan', 'Orem', 'Sandy', 'Ogden', 'St. George', 'Layton', 'Taylorsville'],
    'VT': ['Burlington', 'Essex', 'South Burlington', 'Colchester', 'Rutland'],
    'VA': ['Virginia Beach', 'Norfolk', 'Chesapeake', 'Richmond', 'Newport News', 'Alexandria', 'Hampton', 'Portsmouth', 'Suffolk', 'Roanoke'],
    'WA': ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Kent', 'Everett', 'Renton', 'Yakima', 'Federal Way'],
    'WV': ['Charleston', 'Huntington', 'Parkersburg', 'Morgantown', 'Wheeling'],
    'WI': ['Milwaukee', 'Madison', 'Green Bay', 'Kenosha', 'Racine', 'Appleton', 'Waukesha', 'Oshkosh', 'Eau Claire', 'Janesville'],
    'WY': ['Cheyenne', 'Casper', 'Laramie', 'Gillette', 'Rock Springs']
};

// --------------------------------
// Function to Update City Dropdown
// --------------------------------
function updateCityDropdown(selectedState) {
    const cityDropdown = document.getElementById('city');
    if (!cityDropdown) {
        console.warn('City dropdown not found');
        return;
    }

    // Clear current options
    cityDropdown.innerHTML = '<option value="">Select a city</option>';

    if (!selectedState) {
        return;
    }

    // Use fetched cities data if available, otherwise fallback to hardcoded data
    let cities = [];
    
    if (citiesData && citiesData[selectedState]) {
        cities = citiesData[selectedState]; // Already sorted from JSON load
    } else if (fallbackCitiesByState[selectedState]) {
        cities = fallbackCitiesByState[selectedState].sort(); // Sort fallback data
        console.warn('Using fallback city data for state:', selectedState);
    }

    // Add cities to dropdown (already sorted if from JSON)
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.text = city;
        cityDropdown.appendChild(option);
    });
}

// --------------------------------
// State Name to Abbreviation Mapping
// --------------------------------
const stateNameToAbbr = {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
    'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'District of Columbia': 'DC', 'Florida': 'FL',
    'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN',
    'Iowa': 'IA', 'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME',
    'Maryland': 'MD', 'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
    'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH',
    'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND',
    'Ohio': 'OH', 'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI',
    'South Carolina': 'SC', 'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
    'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
};

// --------------------------------
// Function to Convert ALL CAPS to Title Case
// --------------------------------
function toTitleCase(str) {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => {
        // Handle hyphenated words
        if (word.includes('-')) {
            return word.split('-').map(part => 
                part.charAt(0).toUpperCase() + part.slice(1)
            ).join('-');
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
}

// --------------------------------
// Load Cities Data from JSON
// --------------------------------
function loadCitiesData() {
    const citiesJsonUrl = 'https://raw.githubusercontent.com/cschoi3/US-states-and-cities-json/refs/heads/master/data.json';
    
    fetch(citiesJsonUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch cities data');
            }
            return response.json();
        })
        .then(data => {
            // Transform data from full state names to abbreviations and convert city names to title case
            citiesData = {};
            
            Object.keys(data).forEach(stateName => {
                const stateAbbr = stateNameToAbbr[stateName];
                if (stateAbbr && data[stateName] && Array.isArray(data[stateName])) {
                    // Convert cities from ALL CAPS to Title Case
                    citiesData[stateAbbr] = data[stateName].map(city => toTitleCase(city));
                    // Sort cities alphabetically
                    citiesData[stateAbbr].sort();
                }
            });
            
            console.log('Cities data loaded and processed successfully');
            
            // Update city dropdown if state is already selected
            const stateSelect = document.getElementById('state');
            if (stateSelect && stateSelect.value) {
                updateCityDropdown(stateSelect.value);
            }
        })
        .catch(error => {
            console.warn('Could not load cities from JSON, using fallback data:', error);
            // Will use fallback data automatically when updateCityDropdown is called
        });
}

// ------------------------------------
// Load JSON Data and Initialize Script
// ------------------------------------
function loadJsonAndInitialize() {
    if (isScriptInitialized) {
        return; // Already initialized, don't run again
    }
    
    // Load both insurance data and cities data in parallel
    Promise.all([
        fetch('https://cdn.prod.fortahealth.com/assets/tofu_payor_status.json')
            .then(response => response.json())
            .then(data => {
                jsonData = data;
            })
            .catch(error => {
                console.error('Error fetching insurance JSON:', error);
                jsonData = [];
            }),
        // Load cities data (will use fallback if fetch fails)
        new Promise((resolve) => {
            loadCitiesData();
            // Don't block initialization if cities fail to load
            setTimeout(resolve, 100);
        })
    ]).then(() => {
        if (!isScriptInitialized) {
            initializeScript();
            isScriptInitialized = true;
        }
    });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', loadJsonAndInitialize);

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
    const citySelect = document.getElementById("city");

    if (!stateSelect || !typeSelect || !insuranceSelect) {
        console.warn('Required form elements not found');
        return;
    }

    // ---------------------------------------
    // Event Listener for State Selection
    // ---------------------------------------
    if (stateSelect) {
        stateSelect.addEventListener('change', function () {
            const selectedState = this.value;
            
            // Update city dropdown based on state
            updateCityDropdown(selectedState);
            
            // Clear and reset insurance dropdown when state changes
            if (insuranceSelect) {
                insuranceSelect.innerHTML = '<option value="">Select one...</option>';
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

    // Update insurance dropdown when both state and type are selected
    if (stateSelect && typeSelect) {
        // Check if both are already selected on page load
        const currentState = stateSelect.value;
        const currentType = typeSelect.value;
        if (currentState && currentType) {
            updateInsuranceDropdown(currentState, currentType);
        }
    }

    // Initialize city dropdown if state is pre-selected
    if (stateSelect && stateSelect.value) {
        updateCityDropdown(stateSelect.value);
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
}
