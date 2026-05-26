// DailyPay Finance - Login UI Component

window.renderLogin = function() {
    return `
        <div class="login-container">
            <div class="login-box">
                <div class="login-header">
                    <div class="login-logo">
                        <i data-lucide="indian-rupee"></i>
                    </div>
                    <h2 class="login-title">DailyPay Finance</h2>
                    <p class="login-subtitle">Daily Micro-Loan Collection Manager</p>
                </div>

                <!-- Step 1: Phone Number Input -->
                <div id="phone-section">
                    <div class="form-group">
                        <label class="form-label" for="login-phone">Enter Mobile Number</label>
                        <div class="search-wrapper" style="margin-bottom:0;">
                            <i data-lucide="phone" style="left:14px; top:50%;"></i>
                            <input type="tel" id="login-phone" class="form-control search-input" placeholder="e.g. 9999999999" maxlength="10" required>
                        </div>
                    </div>
                    <button class="btn btn-primary btn-block" id="send-otp-btn" style="margin-top: 20px;">
                        Get OTP Pin <i data-lucide="arrow-right"></i>
                    </button>
                </div>

                <!-- Step 2: OTP Entry Panel (Hidden Initially) -->
                <div id="otp-section" style="display: none;">
                    <p class="login-subtitle" style="text-align: center; margin-bottom: 12px;" id="otp-display-msg">
                        Enter 6-digit OTP sent to <strong id="phone-display"></strong>
                    </p>
                    
                    <div class="otp-box">
                        <input type="text" class="otp-input" maxlength="1" data-index="0" autofocus>
                        <input type="text" class="otp-input" maxlength="1" data-index="1">
                        <input type="text" class="otp-input" maxlength="1" data-index="2">
                        <input type="text" class="otp-input" maxlength="1" data-index="3">
                        <input type="text" class="otp-input" maxlength="1" data-index="4">
                        <input type="text" class="otp-input" maxlength="1" data-index="5">
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 0.8rem;">
                        <span style="color: var(--text-muted);">Haven't received?</span>
                        <a href="javascript:void(0);" id="resend-otp-btn" style="color: var(--primary); font-weight: 600; text-decoration: none;">Resend OTP</a>
                    </div>
                    
                    <button class="btn btn-primary btn-block" id="verify-otp-btn">
                        Verify & Access
                    </button>
                    <button class="btn btn-secondary btn-block" id="back-to-phone-btn" style="margin-top: 10px;">
                        Edit Mobile Number
                    </button>
                </div>

                <!-- Step 3: Demo Quick Login Pills -->
                <div class="demo-credentials">
                    <h3 class="demo-title">Quick Test Accounts</h3>
                    <div>
                        <span class="demo-pill" data-phone="9999999999" data-role="Admin">Admin</span>
                        <span class="demo-pill" data-phone="8888888888" data-role="Agent 1">Collection Agent</span>
                        <span class="demo-pill" data-phone="7777777777" data-role="Customer">Customer</span>
                    </div>
                    <p style="font-size:0.7rem; color: var(--text-muted); margin-top:8px;">
                        * Simulates OTP. Code for all accounts is <strong>123456</strong>
                    </p>
                </div>

                <div id="login-error-msg" style="color: var(--error); font-size: 0.85rem; font-weight: 600; text-align: center; margin-top: 16px; display: none;"></div>
            </div>
        </div>
    `;
}

// Attach Page Event Listeners
window.init_login = function() {
    const phoneSection = document.getElementById('phone-section');
    const otpSection = document.getElementById('otp-section');
    const loginPhone = document.getElementById('login-phone');
    const phoneDisplay = document.getElementById('phone-display');
    const sendOtpBtn = document.getElementById('send-otp-btn');
    const verifyOtpBtn = document.getElementById('verify-otp-btn');
    const backToPhoneBtn = document.getElementById('back-to-phone-btn');
    const errorMsg = document.getElementById('login-error-msg');
    const otpInputs = document.querySelectorAll('.otp-input');
    const demoPills = document.querySelectorAll('.demo-pill');

    let currentPhone = '';

    // Show message banner
    function showError(msg) {
        errorMsg.innerText = msg;
        errorMsg.style.display = 'block';
        setTimeout(() => {
            errorMsg.style.display = 'none';
        }, 5000);
    }

    // Step 1: Send OTP code trigger
    const triggerSendOTP = () => {
        const phone = loginPhone.value.trim();
        if (phone.length !== 10 || isNaN(phone)) {
            showError('Please enter a valid 10-digit mobile number.');
            return;
        }
        
        // Simulating the OTP delivery
        currentPhone = phone;
        phoneDisplay.innerText = `+91 ${phone}`;
        phoneSection.style.display = 'none';
        otpSection.style.display = 'block';
        errorMsg.style.display = 'none';
        
        // Autofocus first input
        otpInputs[0].focus();
    };

    if (sendOtpBtn) sendOtpBtn.addEventListener('click', triggerSendOTP);

    // Edit Phone click handler
    if (backToPhoneBtn) {
        backToPhoneBtn.addEventListener('click', () => {
            otpSection.style.display = 'none';
            phoneSection.style.display = 'block';
            errorMsg.style.display = 'none';
            otpInputs.forEach(input => input.value = '');
        });
    }

    // OTP Input Focus Jump Controls
    otpInputs.forEach((input, index) => {
        input.addEventListener('keyup', (e) => {
            const val = e.target.value;
            
            if (e.key === 'Backspace' || e.key === 'Delete') {
                if (index > 0) {
                    otpInputs[index - 1].focus();
                    otpInputs[index - 1].select();
                }
                return;
            }
            
            if (val.length === 1) {
                if (index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                }
            }
        });

        input.addEventListener('focus', (e) => {
            e.target.select();
        });
    });

    // Verify OTP Button trigger
    const triggerVerifyOTP = () => {
        let code = '';
        otpInputs.forEach(input => code += input.value.trim());
        
        if (code.length !== 6) {
            showError('Please enter the full 6-digit OTP code.');
            return;
        }

        try {
            const user = authService.login(currentPhone, code);
            if (user.role === 'admin') {
                navigateTo('/dashboard');
            } else if (user.role === 'agent') {
                navigateTo('/agent-dashboard');
            } else {
                navigateTo('/customer-dashboard');
            }
        } catch (err) {
            showError(err.message);
            // Clear inputs
            otpInputs.forEach(input => input.value = '');
            otpInputs[0].focus();
        }
    };

    if (verifyOtpBtn) verifyOtpBtn.addEventListener('click', triggerVerifyOTP);

    // Quick Test accounts handler
    demoPills.forEach(pill => {
        pill.addEventListener('click', () => {
            const phone = pill.getAttribute('data-phone');
            loginPhone.value = phone;
            
            // Auto click get OTP
            triggerSendOTP();
            
            // Pre-fill default code
            const demoCode = '123456';
            otpInputs.forEach((input, index) => {
                input.value = demoCode[index];
            });

            // Fast redirect simulation
            setTimeout(() => {
                triggerVerifyOTP();
            }, 600);
        });
    });
};
