// DailyPay Finance - Customer Dashboard Component

window.renderCustomerDashboard = function() {
    const currentUser = db.getCurrentUser();
    if (!currentUser) return '';

    const loans = db.getLoans();
    const payments = db.getPayments();
    const users = db.getUsers();

    // Find active or overdue loan for this customer
    const activeLoan = loans.find(l => l.customer_id === currentUser.id && l.status !== 'completed');
    
    let loanContentHTML = '';
    let hasActiveLoan = !!activeLoan;

    if (!hasActiveLoan) {
        loanContentHTML = `
            <div class="content-box text-center" style="padding: 40px 20px; text-align:center;">
                <i data-lucide="info" style="width:48px; height:48px; color:var(--text-muted); margin-bottom:16px;"></i>
                <h3 class="section-title">No Active Loan Accounts</h3>
                <p style="color:var(--text-secondary); max-width:400px; margin: 0 auto 20px;">
                    You do not have any active loans. Please contact our administrative office to request a new micro-loan disbursement.
                </p>
                <div style="background-color: var(--input-bg); border: 1px solid var(--border-color); border-radius: var(--border-radius-md); padding:16px; display:inline-block; text-align:left;">
                    <span style="font-size:0.8rem; font-weight:600; color:var(--text-secondary);">Office Contact Details:</span>
                    <div style="margin-top:6px; font-size:0.85rem;">
                        <strong>Phone:</strong> +91 9999999999<br>
                        <strong>Email:</strong> support@dailypayfinance.com
                    </div>
                </div>
            </div>
        `;
    } else {
        const todayStr = new Date().toISOString().split('T')[0];
        const paidToday = payments.some(p => p.loan_id === activeLoan.id && p.payment_date === todayStr);
        const paymentToday = payments.find(p => p.loan_id === activeLoan.id && p.payment_date === todayStr);

        const paidAmount = activeLoan.loan_amount - activeLoan.remaining_balance;
        const paidPct = Math.round((paidAmount / activeLoan.loan_amount) * 100);

        // Past payment history specific to this loan
        const historyPayments = payments.filter(p => p.loan_id === activeLoan.id);
        
        let timelineHTML = '';
        if (historyPayments.length === 0) {
            timelineHTML = `
                <div class="empty-state" style="padding: 20px 0;">
                    <i data-lucide="calendar"></i>
                    <p class="empty-state-title" style="font-size:0.9rem;">No payments made yet</p>
                </div>
            `;
        } else {
            historyPayments.forEach(p => {
                const date = new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                const time = new Date(p.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                timelineHTML += `
                    <div class="statement-item cust-view-receipt-link" data-loan-id="${activeLoan.id}" data-receipt="${p.receipt_number}">
                        <div class="statement-avatar success">
                            <i data-lucide="arrow-down-left" style="width:20px; height:20px;"></i>
                        </div>
                        <div class="statement-details">
                            <div class="statement-title">Installment Repayment</div>
                            <div class="statement-meta">${date} • Receipt: ${p.receipt_number}</div>
                        </div>
                        <div class="statement-value-col">
                            <div class="statement-amount credit">₹${parseFloat(p.amount).toLocaleString('en-IN')}</div>
                            <div class="statement-status success">SUCCESS</div>
                        </div>
                    </div>
                `;
            });
        }

        loanContentHTML = `
            <!-- Payment Status alert banner -->
            ${paidToday ? `
                <div class="alert-banner" style="background-color: rgba(52, 211, 153, 0.08); border-color: rgba(52, 211, 153, 0.2); margin-bottom:20px;">
                    <div class="alert-icon" style="background-color: rgba(52, 211, 153, 0.12); color: #34d399;">
                        <i data-lucide="check-circle-2"></i>
                    </div>
                    <div class="alert-body">
                        <h4 class="alert-title" style="color: var(--text-primary);">Installment Completed!</h4>
                        <p class="alert-desc">Today's daily due of ₹${parseFloat(paymentToday.amount).toLocaleString('en-IN')} has been settled successfully.</p>
                    </div>
                </div>
            ` : `
                <div class="alert-banner" style="background-color: rgba(251, 191, 36, 0.08); border-color: rgba(251, 191, 36, 0.2); margin-bottom:20px;">
                    <div class="alert-icon" style="background-color: rgba(251, 191, 36, 0.12); color: #fbbf24;">
                        <i data-lucide="clock"></i>
                    </div>
                    <div class="alert-body">
                        <h4 class="alert-title">Daily Repayment Pending</h4>
                        <p class="alert-desc">Daily due: ₹${parseFloat(activeLoan.daily_repayment).toLocaleString('en-IN')} is pending. Tap below to clear it.</p>
                    </div>
                </div>
            `}

            <!-- GPay / PhonePe Circular Actions Grid -->
            <div class="fintech-action-grid">
                <div class="fintech-action-item" id="act-scan-pay">
                    <div class="fintech-action-icon-circle primary">
                        <i data-lucide="qr-code"></i>
                    </div>
                    <span class="fintech-action-label">Scan QR</span>
                </div>
                <div class="fintech-action-item" id="act-repay">
                    <div class="fintech-action-icon-circle purple">
                        <i data-lucide="wallet"></i>
                    </div>
                    <span class="fintech-action-label">Repay Due</span>
                </div>
                <div class="fintech-action-item" id="act-bank">
                    <div class="fintech-action-icon-circle success">
                        <i data-lucide="banknote"></i>
                    </div>
                    <span class="fintech-action-label">Passbook</span>
                </div>
                <div class="fintech-action-item" id="act-support">
                    <div class="fintech-action-icon-circle error">
                        <i data-lucide="help-circle"></i>
                    </div>
                    <span class="fintech-action-label">Support</span>
                </div>
            </div>

            <div class="dashboard-layout">
                <!-- Left Column: Linked card and active repayment desk -->
                <div>
                    <!-- PhonePe Mock Linked Bank Card -->
                    <div class="bank-card">
                        <div class="bank-card-header">
                            <span class="bank-name">HDFC BANK</span>
                            <div class="bank-status-badge">
                                <i data-lucide="shield-check" style="width:12px; height:12px;"></i> UPI ACTIVE
                            </div>
                        </div>
                        <div class="bank-chip"></div>
                        <div class="bank-card-number">•••• •••• •••• 5102</div>
                        <div class="bank-card-footer">
                            <span class="bank-holder-name">${currentUser.name}</span>
                            <span style="font-size:0.6rem; letter-spacing:1px; opacity:0.8;">PRIMARY ACCOUNT</span>
                        </div>
                    </div>

                    <!-- Repayment Desk Card -->
                    <div class="content-box">
                        <h3 class="section-title" style="display:flex; align-items:center; gap:8px;">
                            <i data-lucide="credit-card" style="color:var(--indigo-primary);"></i> Daily Repayment Desk
                        </h3>
                        <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:18px;">
                            Repay your daily installment. You can modify the amount to pay in advance.
                        </p>
                        
                        <div style="background-color: var(--input-bg); padding:20px; border:1px solid var(--border-color); border-radius:var(--border-radius-md); display:flex; flex-direction:column; gap:16px;">
                            <div class="form-group" style="margin-bottom:0;">
                                <label class="form-label" style="color: var(--text-muted); font-size:0.75rem;">Enter Repayment Amount (₹)</label>
                                <input type="number" id="cust-pay-amount" class="form-control" value="${activeLoan.daily_repayment}" min="10" max="${activeLoan.remaining_balance}" style="font-size:1.6rem; font-weight:800; color:var(--indigo-primary); text-align:center; padding:10px; background-color:var(--bg-secondary);">
                            </div>
                            <button class="btn btn-primary btn-block" id="customer-pay-now-trigger-btn" style="padding:14px; font-size:1rem; border-radius:var(--border-radius-md);">
                                <i data-lucide="shield-check"></i> Pay via Razorpay Gateway
                            </button>
                            
                            <div style="border-top:1px solid var(--border-color); margin-top:6px; padding-top:16px; display:flex; flex-direction:column; align-items:center; gap:8px;">
                                <span style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">Or Scan BharatPe UPI QR Code</span>
                                <div class="upi-qr-image" style="width:120px; height:120px; border:1px solid var(--border-color); display:flex; align-items:center; justify-content:center; background-color:#fff; border-radius:10px;">
                                    <div style="width:24px; height:24px; background-color:var(--indigo-primary); border-radius:6px; z-index:2; display:flex; align-items:center; justify-content:center; color:#fff; font-size:0.7rem; font-weight:800; position:absolute;">₹</div>
                                    <div style="position:absolute; width:100px; height:100px; opacity:0.85; background-image: radial-gradient(#000 1.5px, transparent 1.5px); background-size: 6px 6px;"></div>
                                </div>
                                <span id="cust-upi-string" style="font-size:0.65rem; color:var(--text-muted); font-weight:600; max-width:260px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">upi://pay?pa=dailypay@icici&am=${activeLoan.daily_repayment}</span>
                                <button class="btn btn-success btn-sm btn-block" id="customer-upi-scan-success-btn">
                                    Simulate UPI App Scan Success
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right Column: Passbook Summary & Statements History -->
                <div>
                    <!-- Loan summary statistics card -->
                    <div class="content-box">
                        <h3 class="section-title">Installment Passbook</h3>
                        
                        <!-- Premium Progress Slider -->
                        <div style="background-color: var(--input-bg); border: 1px solid var(--border-color); border-radius: var(--border-radius-md); padding:20px; display:flex; flex-direction:column; align-items:center; text-align:center; margin-bottom:20px;">
                            <span style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">Repayment Progress</span>
                            <div style="font-size:2.4rem; font-weight:800; color:#34d399; margin-top:8px;">${paidPct}%</div>
                            <span style="font-size:0.8rem; color:var(--text-secondary); margin-top:2px;">₹${paidAmount.toLocaleString('en-IN')} paid out of ₹${parseFloat(activeLoan.loan_amount).toLocaleString('en-IN')}</span>
                            <div class="progress-bar-container" style="height:8px; margin-top:14px; background-color: var(--border-color);">
                                <div class="progress-bar-fill" style="width: ${paidPct}%; background: linear-gradient(90deg, #6366f1 0%, #34d399 100%);"></div>
                            </div>
                        </div>

                        <div class="info-list">
                            <div class="info-list-item">
                                <span class="info-label">Outstanding Balance</span>
                                <span class="info-value" style="color:var(--error-hsl); font-size:1.1rem; font-weight:800;">₹${parseFloat(activeLoan.remaining_balance).toLocaleString('en-IN')}</span>
                            </div>
                            <div class="info-list-item">
                                <span class="info-label">Daily Repayment Due</span>
                                <span class="info-value">₹${parseFloat(activeLoan.daily_repayment).toLocaleString('en-IN')} / day</span>
                            </div>
                            <div class="info-list-item">
                                <span class="info-label">Tenure Days Remaining</span>
                                <span class="info-value" style="color:#fbbf24;">${activeLoan.remaining_days} days left</span>
                            </div>
                            <div class="info-list-item">
                                <span class="info-label">Total Loan Term</span>
                                <span class="info-value">${activeLoan.duration_days} days</span>
                            </div>
                            <div class="info-list-item">
                                <span class="info-label">Principal Received (Net)</span>
                                <span class="info-value">₹${parseFloat(activeLoan.disbursed_amount).toLocaleString('en-IN')} (Commission: 10%)</span>
                            </div>
                        </div>
                    </div>

                    <!-- Payment Timeline -->
                    <div class="content-box">
                        <h3 class="section-title">Repayment Statements</h3>
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            ${timelineHTML}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Profile summary details
    const kycBadge = currentUser.kyc_status === 'approved' ? 'badge-success' : 'badge-warning';

    return `
        <!-- Custom GPay/PhonePe App Header -->
        <div class="page-header" style="border-bottom:1px solid var(--border-color); padding-bottom:16px; margin-bottom:24px;">
            <div style="display:flex; align-items:center; gap:14px;">
                <img class="user-avatar" src="${currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop'}" style="border-color: var(--indigo-primary); width:46px; height:46px;">
                <div>
                    <h1 class="page-title" style="font-size:1.35rem; margin-bottom:2px;">${currentUser.name}</h1>
                    <span style="font-size:0.75rem; color:var(--text-secondary); font-weight:600;">+91 ${currentUser.phone}</span>
                </div>
            </div>
            <div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px;">
                <span class="badge ${kycBadge}">KYC ${currentUser.kyc_status}</span>
                <div style="font-size:0.65rem; font-weight:600; color:var(--text-muted); display:flex; align-items:center; gap:4px;">
                    <i data-lucide="shield-check" style="width:12px; height:12px; color:#34d399;"></i> DailyPay Secures
                </div>
            </div>
        </div>

        ${loanContentHTML}

        <!-- Personal profile section card -->
        <div class="content-box" style="margin-top: 24px;">
            <h3 class="section-title">My Account Profile</h3>
            <div style="display:flex; flex-direction:column; gap:12px; font-size:0.85rem; color:var(--text-secondary);">
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-color); padding-bottom:8px;">
                    <span>Registered Phone Number:</span>
                    <strong style="color:var(--text-primary);">+91 ${currentUser.phone}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-color); padding-bottom:8px;">
                    <span>Home/Store Address:</span>
                    <span style="color:var(--text-primary); text-align:right; max-width:70%;">${currentUser.address}</span>
                </div>
                <div style="display:flex; justify-content:space-between;">
                    <span>Uploaded ID Proof:</span>
                    <strong style="color:var(--indigo-primary);">${currentUser.id_proof_url || 'Verified_Aadhar_Doc.pdf'}</strong>
                </div>
            </div>
        </div>

        <!-- Razorpay Sim Checkout Modal Popup -->
        <div class="modal-overlay" id="razorpay-checkout-overlay" style="z-index: 2000;">
            <!-- Custom Styled Card resembling Razorpay Payment window -->
            <div class="modal-content" style="max-width:380px; background-color:#ffffff; color:#1e293b; border-radius:12px; overflow:hidden;">
                <!-- Razorpay header styling -->
                <div style="background-color:#0f52ba; padding:20px; color:#ffffff; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <div style="font-size:0.7rem; font-weight:600; text-transform:uppercase; letter-spacing:1px; opacity:0.8;">Payment to</div>
                        <h4 style="font-size:1.15rem; font-weight:700;">DailyPay Finance</h4>
                    </div>
                    <img src="https://static-assets-web.razorpay.com/payment-button/pl_G1f07z4dZ6k2T1/rzp_logo.png" style="height:18px;" alt="Razorpay logo">
                </div>

                <div class="modal-body" style="padding:20px; background-color:#f8fafc;" id="rzp-form-body">
                    <!-- Standard Checkout info -->
                    <div style="text-align:center; padding:10px 0; border-bottom:1px dashed #cbd5e1; margin-bottom:16px;">
                        <span style="font-size:0.8rem; color:#64748b;">Daily Repayment Due</span>
                        <h2 style="font-size:2rem; font-weight:800; color:#0f52ba; margin-top:4px;" id="rzp-amount-display"></h2>
                    </div>

                    <!-- Payment methods selection -->
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        <span style="font-size:0.75rem; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:0.5px;">Preferred Payment Methods</span>
                        
                        <label style="display:flex; align-items:center; gap:12px; padding:12px; border:1px solid #cbd5e1; border-radius:8px; background-color:#ffffff; cursor:pointer;">
                            <input type="radio" name="rzp-paymode" value="upi" checked style="accent-color:#0f52ba;">
                            <div style="display:flex; flex-direction:column; gap:2px;">
                                <strong style="font-size:0.85rem;">UPI (GPay / PhonePe / PayTM)</strong>
                                <span style="font-size:0.7rem; color:#64748b;">Instant transfer via UPI app</span>
                            </div>
                        </label>

                        <label style="display:flex; align-items:center; gap:12px; padding:12px; border:1px solid #cbd5e1; border-radius:8px; background-color:#ffffff; cursor:pointer;">
                            <input type="radio" name="rzp-paymode" value="card" style="accent-color:#0f52ba;">
                            <div style="display:flex; flex-direction:column; gap:2px;">
                                <strong style="font-size:0.85rem;">Credit / Debit Card</strong>
                                <span style="font-size:0.7rem; color:#64748b;">Visa, Mastercard, RuPay, Maestro</span>
                            </div>
                        </label>
                    </div>

                    <button class="btn btn-success btn-block" id="rzp-confirm-pay-btn" style="margin-top:20px; padding:12px; background-color:#10b981; border:none; color:#ffffff; font-weight:700; border-radius:8px;">
                        Proceed to Pay
                    </button>
                    <button class="btn btn-outline btn-block" id="rzp-cancel-pay-btn" style="margin-top:8px; padding:10px; border:1px solid #cbd5e1; background:none; font-weight:600; border-radius:8px; font-size:0.85rem;">
                        Cancel
                    </button>
                </div>

                <!-- Simulating banking loading screen -->
                <div class="modal-body" style="padding:40px 20px; text-align:center; display:none; background-color:#ffffff;" id="rzp-loading-body">
                    <div class="loader-spinner" style="border-top-color:#0f52ba; margin:0 auto 20px;"></div>
                    <h4 style="font-size:1.05rem; font-weight:700;">Securing Connection...</h4>
                    <p style="font-size:0.8rem; color:#64748b; margin-top:6px;">Simulating Razorpay Payment Gateway integration. Please do not close this window.</p>
                </div>

                <!-- Simulating Payment Success screen (GPay Checkmark Style) -->
                <div class="modal-body" style="padding:40px 20px; text-align:center; display:none; background-color:#ffffff;" id="rzp-success-body">
                    <div class="gpay-success-circle">
                        <i data-lucide="check"></i>
                    </div>
                    <h4 style="font-size:1.15rem; font-weight:700; color:#065f46;">Payment Successful!</h4>
                    <p style="font-size:0.8rem; color:#64748b; margin-top:6px;">Transaction ID: <span id="rzp-txn-id"></span></p>
                    <p style="font-size:0.8rem; color:#64748b;">Receipt Number: <span id="rzp-receipt-no"></span></p>
                </div>
            </div>
        </div>

        <!-- Receipt Modal Component -->
        <div class="modal-overlay" id="receipt-modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Receipt Details</h3>
                    <button class="modal-close" id="receipt-modal-close-btn">&times;</button>
                </div>
                <div class="modal-body" id="receipt-modal-body">
                    <!-- Loaded dynamically -->
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" id="receipt-print-btn">Print</button>
                    <button class="btn btn-primary" id="receipt-done-btn">Done</button>
                </div>
            </div>
        </div>
    `;
}

// Event Bindings Hook
window.init_customer_dashboard = function() {
    const payTriggerBtn = document.getElementById('customer-pay-now-trigger-btn');
    const rzpOverlay = document.getElementById('razorpay-checkout-overlay');
    const rzpCancelBtn = document.getElementById('rzp-cancel-pay-btn');
    const rzpConfirmBtn = document.getElementById('rzp-confirm-pay-btn');
    
    const rzpFormBody = document.getElementById('rzp-form-body');
    const rzpLoadingBody = document.getElementById('rzp-loading-body');
    const rzpSuccessBody = document.getElementById('rzp-success-body');
    const rzpAmountDisplay = document.getElementById('rzp-amount-display');
    const rzpTxnId = document.getElementById('rzp-txn-id');
    const rzpReceiptNo = document.getElementById('rzp-receipt-no');

    const loans = db.getLoans();
    const currentUser = db.getCurrentUser();
    if (!currentUser) return;
    
    const activeLoan = loans.find(l => l.customer_id === currentUser.id && l.status !== 'completed');

    // Dynamic Pay inputs
    const payAmtInput = document.getElementById('cust-pay-amount');
    const upiStringDisplay = document.getElementById('cust-upi-string');
    const upiSuccessBtn = document.getElementById('customer-upi-scan-success-btn');

    if (payAmtInput && upiStringDisplay && activeLoan) {
        payAmtInput.addEventListener('input', () => {
            let amt = parseFloat(payAmtInput.value) || 0;
            amt = Math.min(amt, activeLoan.remaining_balance);
            upiStringDisplay.innerText = `upi://pay?pa=dailypay@icici&am=${amt}`;
        });
    }

    if (payTriggerBtn && activeLoan && payAmtInput) {
        payTriggerBtn.addEventListener('click', () => {
            const amt = parseFloat(payAmtInput.value) || activeLoan.daily_repayment;
            if (amt <= 0) {
                alert('Please enter a valid payment amount.');
                return;
            }
            rzpAmountDisplay.innerText = `₹${amt.toLocaleString('en-IN')}`;
            rzpFormBody.style.display = 'block';
            rzpLoadingBody.style.display = 'none';
            rzpSuccessBody.style.display = 'none';
            rzpOverlay.classList.add('active');
        });
    }

    if (rzpCancelBtn) {
        rzpCancelBtn.addEventListener('click', () => {
            rzpOverlay.classList.remove('active');
        });
    }

    // Razorpay checkout simulation
    if (rzpConfirmBtn && activeLoan && payAmtInput) {
        rzpConfirmBtn.addEventListener('click', () => {
            const amt = parseFloat(payAmtInput.value) || activeLoan.daily_repayment;
            
            // Switch to loading body
            rzpFormBody.style.display = 'none';
            rzpLoadingBody.style.display = 'block';
            
            // Re-render Lucide icons inside loading body (spinner uses standard animation)
            if (window.lucide) window.lucide.createIcons();

            // Simulate banking gateway delay of 2.2 seconds
            setTimeout(() => {
                try {
                    // Record payment collection
                    const payment = paymentService.collect({
                        loan_id: activeLoan.id,
                        amount: amt,
                        collected_by: 'direct-upi', // directly by customer via UPI / QR Gateway
                        payment_method: 'qr'
                    });

                    // Set success text details
                    rzpTxnId.innerText = payment.transaction_ref;
                    rzpReceiptNo.innerText = payment.receipt_number;

                    // Switch to success body
                    rzpLoadingBody.style.display = 'none';
                    rzpSuccessBody.style.display = 'block';
                    if (window.lucide) window.lucide.createIcons();

                    // Wait 2.5 seconds showing success screen, then refresh dashboard
                    setTimeout(() => {
                        rzpOverlay.classList.remove('active');
                        navigateTo('/customer-dashboard');
                    }, 2500);

                } catch (err) {
                    alert(`Gateway Error: ${err.message}`);
                    rzpOverlay.classList.remove('active');
                }
            }, 2200);
        });
    }

    // Direct UPI Scan Success button simulation
    if (upiSuccessBtn && activeLoan && payAmtInput) {
        upiSuccessBtn.addEventListener('click', () => {
            const amt = parseFloat(payAmtInput.value) || activeLoan.daily_repayment;
            if (amt <= 0) {
                alert('Please enter a valid payment amount.');
                return;
            }

            const confirmPayment = confirm(`Simulate scanning UPI QR code and paying ₹${amt.toLocaleString('en-IN')}?`);
            if (confirmPayment) {
                try {
                    const payment = paymentService.collect({
                        loan_id: activeLoan.id,
                        amount: amt,
                        collected_by: 'direct-upi',
                        payment_method: 'qr'
                    });
                    
                    alert(`UPI Repayment Successful!\nReceipt Number: ${payment.receipt_number}\nAmount Paid: ₹${amt.toLocaleString('en-IN')}`);
                    navigateTo('/customer-dashboard');
                } catch (err) {
                    alert(`Payment Error: ${err.message}`);
                }
            }
        });
    }

    // View receipt link bindings
    const receiptLinks = document.querySelectorAll('.cust-view-receipt-link');
    const receiptOverlay = document.getElementById('receipt-modal-overlay');
    const receiptCloseBtn = document.getElementById('receipt-modal-close-btn');
    const receiptDoneBtn = document.getElementById('receipt-done-btn');
    const receiptPrintBtn = document.getElementById('receipt-print-btn');
    const receiptBody = document.getElementById('receipt-modal-body');

    receiptLinks.forEach(link => {
        link.addEventListener('click', () => {
            const loanId = link.getAttribute('data-loan-id');
            const receiptNo = link.getAttribute('data-receipt');
            
            const users = db.getUsers();
            const payments = db.getPayments();

            const loan = loans.find(l => l.id === loanId);
            const customer = loan ? users.find(u => u.id === loan.customer_id) : null;
            const payment = payments.find(p => p.receipt_number === receiptNo);
            const agent = payment ? users.find(u => u.id === payment.collected_by) : null;

            if (!payment) return;

            receiptBody.innerHTML = `
                <div class="receipt-wrapper">
                    <div class="receipt-header">
                        <div class="receipt-logo">DailyPay Finance</div>
                        <span style="font-size:0.75rem; color:#64748b;">Automated Daily Micro-Loan Receipt</span>
                        <br>
                        <span class="receipt-status">Payment Received</span>
                    </div>

                    <div class="receipt-details-row">
                        <span class="receipt-details-label">Receipt Number:</span>
                        <span class="receipt-details-value">${payment.receipt_number}</span>
                    </div>
                    <div class="receipt-details-row">
                        <span class="receipt-details-label">Date:</span>
                        <span class="receipt-details-value">${new Date(payment.created_at).toLocaleDateString('en-IN')} ${new Date(payment.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div class="receipt-details-row">
                        <span class="receipt-details-label">Customer Name:</span>
                        <span class="receipt-details-value">${customer ? customer.name : 'N/A'}</span>
                    </div>
                    <div class="receipt-details-row">
                        <span class="receipt-details-label">Loan Account ID:</span>
                        <span class="receipt-details-value">${loanId.substring(2, 10)}</span>
                    </div>
                    <div class="receipt-details-row">
                        <span class="receipt-details-label">Collected By:</span>
                        <span class="receipt-details-value">${agent ? agent.name : 'Direct Pay'}</span>
                    </div>
                    <div class="receipt-details-row">
                        <span class="receipt-details-label">Payment Mode:</span>
                        <span class="receipt-details-value" style="text-transform:uppercase;">${payment.payment_method}</span>
                    </div>
                    <div class="receipt-details-row" style="margin-bottom:0;">
                        <span class="receipt-details-label">Ref Reference:</span>
                        <span class="receipt-details-value" style="font-size:0.75rem;">${payment.transaction_ref}</span>
                    </div>

                    <div class="receipt-total">
                        <span>Amount Paid:</span>
                        <span>₹${parseFloat(payment.amount).toLocaleString('en-IN')}</span>
                    </div>

                    <div class="receipt-details-row" style="margin-top:12px; font-size:0.8rem; border-top:1px solid #f1f5f9; padding-top:8px;">
                        <span class="receipt-details-label">Outstanding Loan Bal:</span>
                        <span class="receipt-details-value" style="font-weight:600;">₹${parseFloat(loan.remaining_balance).toLocaleString('en-IN')}</span>
                    </div>

                    <div class="receipt-footer">
                        Thank you for your repayment.<br>
                        Keep your accounts active to unlock higher loan tiers!
                    </div>
                </div>
            `;

            receiptOverlay.classList.add('active');
        });
    });

    const closeReceipt = () => {
        receiptOverlay.classList.remove('active');
    };

    if (receiptCloseBtn) receiptCloseBtn.addEventListener('click', closeReceipt);
    if (receiptDoneBtn) receiptDoneBtn.addEventListener('click', closeReceipt);

    if (receiptPrintBtn) {
        receiptPrintBtn.addEventListener('click', () => {
            const printContent = document.querySelector('.receipt-wrapper').innerHTML;
            const originalContent = document.body.innerHTML;
            
            const w = window.open();
            w.document.write(`
                <html>
                <head><title>Print Receipt</title></head>
                <body style="padding:40px; font-family:sans-serif;">
                    ${printContent}
                </body>
                </html>
            `);
            w.print();
            w.close();
        });
    }
};
