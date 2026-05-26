// DailyPay Finance - Collection Agent Dashboard

window.renderAgentDashboard = function() {
    const currentUser = db.getCurrentUser();
    if (!currentUser) return '';

    const loans = db.getLoans();
    const users = db.getUsers();
    const payments = db.getPayments();
    
    // Filter loans assigned to this agent
    const assignedLoans = loans.filter(l => l.agent_id === currentUser.id && l.status !== 'completed');
    
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Calculate Agent Stats for Today
    let totalAssignedAmountToday = 0;
    let totalCollectedAmountToday = 0;
    
    const customerList = [];

    assignedLoans.forEach(loan => {
        const customer = users.find(u => u.id === loan.customer_id);
        if (!customer) return;

        // Check if customer already paid today
        const paidToday = payments.some(p => p.loan_id === loan.id && p.payment_date === todayStr);
        const paymentToday = payments.find(p => p.loan_id === loan.id && p.payment_date === todayStr);

        totalAssignedAmountToday += parseFloat(loan.daily_repayment);
        if (paidToday) {
            totalCollectedAmountToday += parseFloat(paymentToday.amount);
        }

        customerList.push({
            loanId: loan.id,
            customerId: customer.id,
            name: customer.name,
            phone: customer.phone,
            address: customer.address,
            avatar: customer.avatar_url,
            dailyDue: loan.daily_repayment,
            remainingBalance: loan.remaining_balance,
            remainingDays: loan.remaining_days,
            paidToday,
            receiptNumber: paidToday ? paymentToday.receipt_number : null,
            transactionRef: paidToday ? paymentToday.transaction_ref : null,
            paymentMethod: paidToday ? paymentToday.payment_method : null
        });
    });

    const pendingAmountToday = Math.max(0, totalAssignedAmountToday - totalCollectedAmountToday);

    // Generate Customer list HTML
    let customerListHTML = '';
    if (customerList.length === 0) {
        customerListHTML = `
            <div class="empty-state">
                <i data-lucide="users"></i>
                <h3 class="empty-state-title">No Assigned Customers</h3>
                <p class="empty-state-desc">You don't have any customers assigned for collections today.</p>
            </div>
        `;
    } else {
        customerList.forEach(c => {
            const statusClass = c.paidToday ? 'badge-success' : 'badge-warning';
            const statusText = c.paidToday ? 'Paid Today' : 'Pending';
            
            customerListHTML += `
                <div class="customer-agent-card" data-name="${c.name.toLowerCase()}" style="background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--border-radius-lg); padding: 16px; margin-bottom: 16px; display:flex; flex-direction:column; gap:12px; box-shadow: var(--card-shadow);">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <img src="${c.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop'}" alt="${c.name}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;">
                            <div style="display:flex; flex-direction:column;">
                                <span style="font-weight:600; font-size:0.95rem;">${c.name}</span>
                                <span style="font-size:0.75rem; color:var(--text-muted);">+91 ${c.phone}</span>
                            </div>
                        </div>
                        <span class="badge ${statusClass}">${statusText}</span>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:4px; font-size:0.8rem; border-top:1px dashed var(--border-color); border-bottom:1px dashed var(--border-color); padding: 8px 0; color:var(--text-secondary);">
                        <div style="display:flex; justify-content:space-between;">
                            <span>Daily Installment:</span>
                            <strong style="color:var(--text-primary);">₹${parseFloat(c.dailyDue).toLocaleString('en-IN')}</strong>
                        </div>
                        <div style="display:flex; justify-content:space-between;">
                            <span>Remaining Balance:</span>
                            <strong>₹${parseFloat(c.remainingBalance).toLocaleString('en-IN')} (${c.remainingDays} days)</strong>
                        </div>
                        <div style="display:flex; justify-content:space-between;">
                            <span>Address:</span>
                            <span style="max-width: 70%; text-align:right; font-size:0.75rem;">${c.address}</span>
                        </div>
                    </div>

                    <div>
                        ${c.paidToday ? `
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-size:0.75rem; color:var(--text-muted);">Receipt: ${c.receiptNumber} (${c.paymentMethod.toUpperCase()})</span>
                                <button class="btn btn-outline btn-sm view-receipt-btn" data-loan-id="${c.loanId}" data-receipt="${c.receiptNumber}">
                                    <i data-lucide="file-text" style="width:14px; height:14px;"></i> View Receipt
                                </button>
                            </div>
                        ` : `
                            <button class="btn btn-primary btn-block record-collection-btn" data-loan-id="${c.loanId}" data-name="${c.name}" data-due="${c.dailyDue}">
                                <i data-lucide="plus-circle"></i> Collect ₹${parseFloat(c.dailyDue).toLocaleString('en-IN')}
                            </button>
                        `}
                    </div>
                </div>
            `;
        });
    }

    return `
        <div class="page-header">
            <div>
                <h1 class="page-title" style="font-size:1.35rem;">Agent Portal</h1>
                <p style="font-size:0.8rem; color:var(--text-secondary);">Logged in: ${currentUser.name}</p>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="window.location.hash='#/'" style="padding: 6px 12px; font-size:0.8rem;">
                <i data-lucide="refresh-cw" style="width:14px; height:14px;"></i> Refresh
            </button>
        </div>

        <!-- Mini Stats Grid -->
        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:12px; margin-bottom:20px;">
            <div style="background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--border-radius-md); padding:12px; display:flex; flex-direction:column; text-align:center;">
                <span style="font-size:0.7rem; color:var(--text-secondary); font-weight:600;">ASSIGNED</span>
                <span style="font-size:1.15rem; font-weight:800; color:var(--primary); margin-top:4px;">${customerList.length}</span>
            </div>
            <div style="background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--border-radius-md); padding:12px; display:flex; flex-direction:column; text-align:center;">
                <span style="font-size:0.7rem; color:var(--text-secondary); font-weight:600;">COLLECTED</span>
                <span style="font-size:1.15rem; font-weight:800; color:var(--success); margin-top:4px;">₹${totalCollectedAmountToday.toLocaleString('en-IN')}</span>
            </div>
            <div style="background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--border-radius-md); padding:12px; display:flex; flex-direction:column; text-align:center;">
                <span style="font-size:0.7rem; color:var(--text-secondary); font-weight:600;">PENDING</span>
                <span style="font-size:1.15rem; font-weight:800; color:var(--warning); margin-top:4px;">₹${pendingAmountToday.toLocaleString('en-IN')}</span>
            </div>
        </div>

        <!-- Search Bar -->
        <div class="search-filter-row">
            <div class="search-wrapper">
                <i data-lucide="search"></i>
                <input type="text" id="agent-cust-search" class="form-control search-input" placeholder="Search assigned customers...">
            </div>
        </div>

        <!-- List Section -->
        <div>
            <h3 class="section-title">My Tasks Today</h3>
            <div id="agent-customers-list">
                ${customerListHTML}
            </div>
        </div>

        <!-- Collection Capture Modal -->
        <div class="modal-overlay" id="agent-collect-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Record Payment Collection</h3>
                    <button class="modal-close" id="agent-collect-close-btn">&times;</button>
                </div>
                <div class="modal-body" style="padding-top:10px;">
                    <div style="text-align:center; margin-bottom:16px;">
                        <span style="font-size:0.85rem; color:var(--text-secondary);">Collecting repayment from</span>
                        <h4 style="font-size:1.25rem; font-weight:700; color:var(--text-primary);" id="ac-cust-name"></h4>
                        <div style="font-size:1.75rem; font-weight:800; color:var(--primary); margin-top:6px;" id="ac-due-display"></div>
                    </div>

                    <!-- Payment Mode Switcher -->
                    <div style="display:flex; border:1px solid var(--border-color); border-radius:var(--border-radius-md); overflow:hidden; margin-bottom:16px;">
                        <button class="btn btn-outline btn-block active-mode-btn" id="mode-qr-btn" style="border:none; border-radius:0; padding:10px 0; font-size:0.85rem; background-color: var(--nav-indicator);">
                            <i data-lucide="qr-code"></i> UPI QR Code
                        </button>
                        <button class="btn btn-outline btn-block" id="mode-cash-btn" style="border:none; border-radius:0; padding:10px 0; font-size:0.85rem;">
                            <i data-lucide="banknote"></i> Cash Received
                        </button>
                    </div>

                    <!-- UPI QR panel -->
                    <div id="collect-qr-panel" class="upi-checkout-box" style="padding:16px;">
                        <p style="font-size:0.8rem; color:var(--text-secondary);">Ask customer to scan to pay using any UPI App</p>
                        <div class="upi-qr-image" style="width:140px; height:140px; margin: 12px 0;">
                            <!-- CSS Simulated high fidelity QR Code with purple fintech outline -->
                            <div style="width:100%; height:100%; border:2px solid var(--primary); border-radius:8px; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; background-color:#fff;">
                                <div style="width:20px; height:20px; background-color:var(--primary); border-radius:4px; z-index:2; display:flex; align-items:center; justify-content:center; color:#fff; font-size:0.6rem; font-weight:800;">DP</div>
                                <div style="position:absolute; width:120px; height:120px; opacity:0.8; background-image: radial-gradient(var(--bg-primary) 2px, transparent 2px), radial-gradient(var(--bg-primary) 2px, transparent 2px); background-size: 8px 8px; background-position: 0 0, 4px 4px;"></div>
                            </div>
                        </div>
                        <span style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">upi://pay?pa=dailypay@icici&am=100</span>
                        <div class="upi-logo-row">
                            <img src="https://upipayments.co.in/wp-content/uploads/2019/04/UPI-logo.png" style="height:14px;" alt="UPI">
                        </div>
                    </div>

                    <!-- Cash Collection panel -->
                    <div id="collect-cash-panel" style="display:none; background-color: var(--input-bg); padding:16px; border:1px solid var(--border-color); border-radius: var(--border-radius-md); text-align:center;">
                        <i data-lucide="hand-coins" style="width:36px; height:36px; color:var(--success); margin-bottom:8px;"></i>
                        <p style="font-size:0.85rem; font-weight:600; color:var(--text-primary);">Physical Cash Collection</p>
                        <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">Ensure you have collected the physical banknotes from the customer before confirming.</p>
                    </div>

                    <form id="agent-collection-confirm-form" style="margin-top:16px;">
                        <input type="hidden" id="ac-loan-id">
                        <input type="hidden" id="ac-amount">
                        <input type="hidden" id="ac-method" value="qr">
                        
                        <div class="form-group" style="margin-bottom:12px;">
                            <label class="form-label" for="ac-ref">Transaction Reference / Remark</label>
                            <input type="text" id="ac-ref" class="form-control" placeholder="e.g. UPI Ref ID or cash remark">
                        </div>

                        <button type="submit" class="btn btn-success btn-block">
                            Confirm Collection (Received)
                        </button>
                    </form>
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

// Agent Page Event Bindings Hook
window.init_agent_dashboard = function() {
    const searchInput = document.getElementById('agent-cust-search');
    const cards = document.querySelectorAll('.customer-agent-card');
    
    // Search filtering
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            const query = e.target.value.toLowerCase().trim();
            cards.forEach(card => {
                const name = card.getAttribute('data-name');
                if (name.includes(query)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // Capture Modal controls
    const recordButtons = document.querySelectorAll('.record-collection-btn');
    const collectOverlay = document.getElementById('agent-collect-overlay');
    const collectCloseBtn = document.getElementById('agent-collect-close-btn');
    const confirmForm = document.getElementById('agent-collection-confirm-form');
    
    const acCustName = document.getElementById('ac-cust-name');
    const acDueDisplay = document.getElementById('ac-due-display');
    const acLoanId = document.getElementById('ac-loan-id');
    const acAmount = document.getElementById('ac-amount');
    const acMethod = document.getElementById('ac-method');
    const acRef = document.getElementById('ac-ref');

    // Payment Mode buttons
    const modeQrBtn = document.getElementById('mode-qr-btn');
    const modeCashBtn = document.getElementById('mode-cash-btn');
    const qrPanel = document.getElementById('collect-qr-panel');
    const cashPanel = document.getElementById('collect-cash-panel');

    if (modeQrBtn && modeCashBtn) {
        modeQrBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modeQrBtn.style.backgroundColor = 'var(--nav-indicator)';
            modeCashBtn.style.backgroundColor = '';
            qrPanel.style.display = 'flex';
            cashPanel.style.display = 'none';
            acMethod.value = 'qr';
        });

        modeCashBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modeCashBtn.style.backgroundColor = 'var(--nav-indicator)';
            modeQrBtn.style.backgroundColor = '';
            qrPanel.style.display = 'none';
            cashPanel.style.display = 'block';
            acMethod.value = 'cash';
        });
    }

    recordButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const loanId = btn.getAttribute('data-loan-id');
            const name = btn.getAttribute('data-name');
            const due = btn.getAttribute('data-due');

            acCustName.innerText = name;
            acDueDisplay.innerText = `₹${parseFloat(due).toLocaleString('en-IN')}`;
            acLoanId.value = loanId;
            acAmount.value = due;
            acRef.value = '';
            
            // Default to QR payment option
            if (modeQrBtn) modeQrBtn.click();

            collectOverlay.classList.add('active');
        });
    });

    if (collectCloseBtn) {
        collectCloseBtn.addEventListener('click', () => {
            collectOverlay.classList.remove('active');
        });
    }

    // Submit collection confirmation
    if (confirmForm) {
        confirmForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const loanId = acLoanId.value;
            const amount = parseFloat(acAmount.value);
            const method = acMethod.value;
            const ref = acRef.value.trim();

            const currentUser = db.getCurrentUser();

            try {
                const payment = paymentService.collect({
                    loan_id: loanId,
                    amount: amount,
                    collected_by: currentUser.id,
                    payment_method: method,
                    transaction_ref: ref || undefined
                });

                collectOverlay.classList.remove('active');
                alert(`Collection recorded! Receipt: ${payment.receipt_number}`);
                
                // Refresh
                navigateTo('/agent-dashboard');
            } catch (err) {
                alert(`Error: ${err.message}`);
            }
        });
    }

    // Receipt Modal controls
    const viewReceiptBtns = document.querySelectorAll('.view-receipt-btn');
    const receiptOverlay = document.getElementById('receipt-modal-overlay');
    const receiptCloseBtn = document.getElementById('receipt-modal-close-btn');
    const receiptDoneBtn = document.getElementById('receipt-done-btn');
    const receiptPrintBtn = document.getElementById('receipt-print-btn');
    const receiptBody = document.getElementById('receipt-modal-body');

    viewReceiptBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const loanId = btn.getAttribute('data-loan-id');
            const receiptNo = btn.getAttribute('data-receipt');
            
            const loans = db.getLoans();
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
            
            // Basic print emulation
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
