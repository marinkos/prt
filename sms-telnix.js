// Salesforce configuration
const SF_CONFIG = {
    baseUrl: 'https://cdcrm.my.salesforce.com',
    clientId: '3MVG9sn24bYFReCW50EZORda3GDo4v3H8GC_WiXK72LmKWxffFSzuBd8MGkF3fuLVJ5j8t2s2x.QOYYnmTIIg',
    clientSecret: '87CEC643908330932F90FC4C9826972660872A226B4F0850E0286796B69756F5',
    username: 'webintegration@yatitechnology.com',
    password: '7hb|5:RNZ[k1'
};

let accessToken = '';
let isVerified = false;
let currentPhoneNumber = '';

// Get UI elements
const form = document.getElementById('lpForm');
const formSubmit = document.getElementById('formSubmit');
const phoneInput = document.getElementById('phone');
const codePopup = document.getElementById('codePopup');
const codePhone = document.getElementById('codePhone');
const codeVerifyButton = document.getElementById('codeVerifyButton');
const codeResend = document.getElementById('codeResend');
const codeFail = document.getElementById('codeFail');
const codeSent = document.getElementById('codeSent');

// Format phone number for display
function formatPhoneNumber(phone) {
    phone = phone.replace(/\D/g, '');
    return phone.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4');
}

// Get verification code from inputs
function getVerificationCode() {
    return Array.from(document.querySelectorAll('.verification-code input'))
        .map(input => input.value)
        .join('');
}

// Clear verification code inputs
function clearVerificationInputs() {
    document.querySelectorAll('.verification-code input').forEach(input => {
        input.value = '';
    });
    document.getElementById('digit-1').focus();
}

// Handle sending verification code
async function sendVerificationCode(phoneNumber) {
    if (!accessToken) {
        const params = new URLSearchParams({
            grant_type: 'password',
            client_id: SF_CONFIG.clientId,
            client_secret: SF_CONFIG.clientSecret,
            username: SF_CONFIG.username,
            password: SF_CONFIG.password
        });

        const tokenResponse = await fetch(`${SF_CONFIG.baseUrl}/services/oauth2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        });
        
  			//console.log('Token Response Status:', tokenResponse.status); //Debug
        
        const tokenData = await tokenResponse.json();
        accessToken = tokenData.access_token;
        //console.log('Token Data:', tokenData); //Debug

    }

    const response = await fetch(
    `${SF_CONFIG.baseUrl}/services/data/v62.0/actions/custom/flow/Telnyx_Send_SMS`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: [{
                    phoneNumber,
                    profileId: '49000193-d413-0ede-4c1e-adfac73047fa'
                }]
            })
        }
    );

    return response.json();
}

// Handle code verification
async function verifyCode(phoneNumber, code) {
    if (!accessToken) return;

    const response = await fetch(
    `${SF_CONFIG.baseUrl}/services/data/v62.0/actions/custom/flow/Telnyx_Verify_Code`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: [{
                    phoneNumber,
                    profileId: '49000193-d413-0ede-4c1e-adfac73047fa',
                    code
                }]
            })
        }
    );

    return response.json();
}

// Handle form submission
async function submitForm() {
    const redirectUrl = form.getAttribute('data-redirect');
    const submitEvent = new Event('submit', {
        bubbles: true,
        cancelable: true
    });

    form.dispatchEvent(submitEvent);

    if (redirectUrl) {
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 100);
    }
}

// Handle form submit button click
formSubmit.addEventListener('click', async function(e) {
    e.preventDefault();
    
    if (!isVerified) {
        const phoneNumber = phoneInput.value.replace(/\D/g, '');
        currentPhoneNumber = '+1' + phoneNumber;
        
        try {
            codePopup.style.display = 'flex';
            codePhone.textContent = formatPhoneNumber(phoneNumber);
            
            const result = await sendVerificationCode(currentPhoneNumber);
            
            if (result[0].isSuccess) {
                clearVerificationInputs();
                codeFail.style.display = 'none';
                codeSent.style.display = 'none';
            } else {
                alert('Error sending verification code. Please try again.');
            }
        } catch (error) {
            alert('Error sending verification code. Please try again.');
        }
        return;
    }
    
    await submitForm();
});

// Handle verification button click
codeVerifyButton.addEventListener('click', async function(e) {
    e.preventDefault();
    
    const code = getVerificationCode();
    if (code.length !== 6) {
        codeFail.style.display = 'block';
        return;
    }
    
    try {
        const result = await verifyCode(currentPhoneNumber, code);

        if (!result || !Array.isArray(result) || result.length === 0) {
            codeFail.style.display = 'block';
            return;
        }

        const verificationStatus = result[0]?.outputValues?.Response?.data?.responsex5fcode;

        if (verificationStatus === 'accepted') {
            isVerified = true;
            codePopup.style.display = 'none';
            await submitForm();
        } else {
            codeFail.style.display = 'block';
            clearVerificationInputs();
        }

    } catch (error) {
        codeFail.style.display = 'block';
    }
});

// Handle resend code click
codeResend.addEventListener('click', async function(e) {
    e.preventDefault();
    codeFail.style.display = 'none';
    
    try {
        const result = await sendVerificationCode(currentPhoneNumber);
        
        if (result[0].isSuccess) {
            clearVerificationInputs();
            codeSent.style.display = 'block';
            setTimeout(() => {
                codeSent.style.display = 'none';
            }, 3000);
        } else {
            alert('Error resending code. Please try again.');
        }
    } catch (error) {
        alert('Error resending code. Please try again.');
    }
});

// Handle paste functionality
document.querySelector('#digit-1').addEventListener('paste', function(e) {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').replace(/\D/g, '');
    const inputs = document.querySelectorAll('.verification-code input');
    
    inputs.forEach((input, index) => {
        if (pastedText[index]) {
            input.value = pastedText[index];
        }
    });
    
    if (pastedText.length > 0) {
        inputs[Math.min(pastedText.length, inputs.length - 1)].focus();
    }
});

// Handle code input functionality
const inputs = document.querySelectorAll('.verification-code input');
inputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
        input.value = input.value.replace(/\D/g, '');
        
        if (input.value.length === 1 && index < inputs.length - 1) {
            inputs[index + 1].focus();
        }
    });
    
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && input.value === '' && index > 0) {
            inputs[index - 1].focus();
        }
    });
});

// Set form method to POST on load
document.addEventListener('DOMContentLoaded', function() {
    if (form) {
        form.method = 'POST';
    }
});