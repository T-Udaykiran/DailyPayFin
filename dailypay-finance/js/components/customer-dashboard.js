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
                    <div class="timeline-item">
                        <div class="timeline-marker success"></div>
                        <div class="timeline-content" style="display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <span class="timeline-time">${date} at ${time}</span>
                                <div class="timeline-title">Repayment Installment Paid</div>
                                <div class="timeline-desc">Receipt: ${p.receipt_number} • ${p.payment_method.toUpperCase()}</div>
                            </div>
                            <div style="text-align:right;">
                                <strong style="color:var(--success); font-size:0.95rem;">₹${parseFloat(p.amount).toLocaleString('en-IN')}</strong>
                                <br>
                                <a href="javascript:void(0);" class="cust-view-receipt-link" data-loan-id="${activeLoan.id}" data-receipt="${p.receipt_number}" style="font-size:0.75rem; color:var(--primary); text-decoration:none; font-weight:600;">View Receipt</a>
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        loanContentHTML = `
            <!-- Payment Status alert card -->
            ${paidToday ? `
                <div class="alert-banner" style="background-color: rgba(16, 172, 132, 0.08); border-color: rgba(16, 172, 132, 0.2); margin-bottom:16px;">
                    <div class="alert-icon" style="background-color: rgba(16, 172, 132, 0.12); color: var(--success);">
                        <i data-lucide="check-circle-2"></i>
                    </div>
                    <div class="alert-body">
                        <h4 class="alert-title" style="color: var(--text-primary);">Today's Installment Received!</h4>
                        <p class="alert-desc">Thank you! Your daily repayment of ₹${parseFloat(paymentToday.amount).toLocaleString('en-IN')} is successfully recorded.</p>
                    </div>
                </div>
            ` : `
                <div class="alert-banner" style="margin-bottom:16px;">
                    <div class="alert-icon">
                        <i data-lucide="alert-triangle"></i>
                    </div>
                    <div class="alert-body">
                        <h4 class="alert-title">Repayment Due Today</h4>
                        <p class="alert-desc">Your daily installment of ₹${parseFloat(activeLoan.daily_repayment).toLocaleString('en-IN')} is pending. Please pay below.</p>
                    </div>
                </div>
            `}

            <!-- Interactive Repayment Desk Card -->
            <div class="content-box" style="margin-bottom: 24px;">
                <h3 class="section-title" style="display:flex; align-items:center; gap:8px;">
                    <i data-lucide="wallet" style="color:var(--primary);"></i> Repayment Desk
                </h3>
                <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:18px;">
                    Make a quick payment. You can pay the exact daily due or input a custom prepayment amount to clear your loan early.
                </p>
                
                <div style="display:grid; grid-template-columns:1fr; gap:20px;">
                    <div style="background-color: var(--input-bg); padding:16px; border:1px solid var(--border-color); border-radius:var(--border-radius-md); display:flex; flex-direction:column; gap:12px;">
                        <div class="form-group" style="margin-bottom:0;">
                            <label class="form-label">Payment Amount (₹)</label>
                            <input type="number" id="cust-pay-amount" class="form-control" value="${activeLoan.daily_repayment}" min="10" max="${activeLoan.remaining_balance}" style="font-size:1.15rem; font-weight:700; color:var(--primary);">
                        </div>
                        <button class="btn btn-primary btn-block" id="customer-pay-now-trigger-btn" style="padding:12px; font-size:0.95rem;">
                            <i data-lucide="shield-check"></i> Pay via Razorpay Gateway
                        </button>
                    </div>

                    <div style="background-color: var(--input-bg); padding:16px; border:1px solid var(--border-color); border-radius:var(--border-radius-md); display:flex; flex-direction:column; align-items:center; text-align:center; gap:10px;">
                        <span style="font-size:0.75rem; font-weight:700; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.5px;">UPI Quick Scan & Pay</span>
                        
                        <div class="upi-qr-image" style="width:110px; height:110px; margin:0;">
                            <div style="width:100%; height:100%; border:2px solid var(--primary); border-radius:8px; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; background-color:#fff;">
                                <div style="width:20px; height:20px; background-color:var(--primary); border-radius:4px; z-index:2; display:flex; align-items:center; justify-content:center; color:#fff; font-size:0.6rem; font-weight:800;">DP</div>
                                <div style="position:absolute; width:90px; height:90px; opacity:0.8; background-image: radial-gradient(var(--bg-primary) 1.5px, transparent 1.5px); background-size: 6px 6px;"></div>
                            </div>
                        </div>
                        
                        <span id="cust-upi-string" style="font-size:0.65rem; color:var(--text-muted); font-weight:600; max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">upi://pay?pa=dailypay@icici&am=${activeLoan.daily_repayment}</span>
                        
                        <button class="btn btn-success btn-sm btn-block" id="customer-upi-scan-success-btn">
                            Simulate UPI Scan Success
                        </button>
                    </div>
                </div>
            </div>

            <!-- Progress & Numbers Layout -->
            <div class="dashboard-layout">
                <!-- Loan details numbers card -->
                <div>
                    <div class="content-box">
                        <h3 class="section-title">Active Loan Summary</h3>
                        
                        <!-- Mini Gauge Visualizer -->
                        <div style="background-color: var(--input-bg); border: 1px solid var(--border-color); border-radius: var(--border-radius-md); padding:20px; display:flex; flex-direction:column; align-items:center; text-align:center; margin-bottom:20px;">
                            <span style="font-size:0.75rem; font-weight:600; color:var(--text-muted); text-transform:uppercase;">Repayment Progress</span>
                            <div style="font-size:2.2rem; font-weight:800; color:var(--primary); margin-top:8px;">${paidPct}%</div>
                            <span style="font-size:0.8rem; color:var(--text-secondary); margin-top:2px;">₹${paidAmount.toLocaleString('en-IN')} out of ₹${parseFloat(activeLoan.loan_amount).toLocaleString('en-IN')} Paid</span>
                            <div class="progress-bar-container" style="max-width:300px; height:10px; margin-top:12px;">
                                <div class="progress-bar-fill" style="width: ${paidPct}%;"></div>
                            </div>
                        </div>

                        <div class="info-list">
                            <div class="info-list-item">
                                <span class="info-label">Outstanding Principal Balance</span>
                                <span class="info-value" style="color:var(--error); font-size:1.1rem;">₹${parseFloat(activeLoan.remaining_balance).toLocaleString('en-IN')}</span>
                            </div>
                            <div class="info-list-item">
                                <span class="info-label">Daily Installment Due</span>
                                <span class="info-value">₹${parseFloat(activeLoan.daily_repayment).toLocaleString('en-IN')}</span>
                            </div>
                            <div class="info-list-item">
                                <span class="info-label">Repayment Tenure Remaining</span>
                                <span class="info-value">${activeLoan.remaining_days} days left</span>
                            </div>
                            <div class="info-list-item">
                                <span class="info-label">Total Loan Tenure</span>
                                <span class="info-value">${activeLoan.duration_days} days</span>
                            </div>
                            <div class="info-list-item">
                                <span class="info-label">Disbursal Net Amount (Received)</span>
                                <span class="info-value">₹${parseFloat(activeLoan.disbursed_amount).toLocaleString('en-IN')} (after 10% commission)</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Payment Timeline History -->
                <div>
                    <div class="content-box">
                        <h3 class="section-title">My Payment Timeline</h3>
                        <div class="timeline">
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
        <div class="page-header">
            <div>
                <h1 class="page-title">DailyPay Customer Portal</h1>
                <p style="font-size:0.8rem; color:var(--text-secondary);">Welcome, ${currentUser.name}</p>
            </div>
            <span class="badge ${kycBadge}">KYC ${currentUser.kyc_status}</span>
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
                    <strong style="color:var(--primary);">${currentUser.id_proof_url || 'Verified_Aadhar_Doc.pdf'}</strong>
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

                <!-- Simulating Payment Success screen -->
                <div class="modal-body" style="padding:40px 20px; text-align:center; display:none; background-color:#ffffff;" id="rzp-success-body">
                    <div style="width:56px; height:56px; border-radius:50%; background-color:#d1fae5; color:#10b981; display:flex; align-items:center; justify-content:center; margin:0 auto 16px;">
                        <i data-lucide="check" style="width:32px; height:32px;"></i>
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
