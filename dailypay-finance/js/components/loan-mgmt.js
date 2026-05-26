// DailyPay Finance - Loan Management Component

window.renderLoanManagement = function(queryParams = {}) {
    const loans = db.getLoans();
    const users = db.getUsers();
    
    const customers = users.filter(u => u.role === 'customer');
    const agents = users.filter(u => u.role === 'agent');
    
    // Check if customer_id query param was passed to pre-select it
    const preselectedCustomerId = queryParams.customer_id || '';

    // Active/All Loans List Rows
    let loanRowsHTML = '';
    let loanCardsHTML = '';
    if (loans.length === 0) {
        loanRowsHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding:40px;">
                    <div class="empty-state">
                        <i data-lucide="wallet"></i>
                        <h3 class="empty-state-title">No Active Loans</h3>
                        <p class="empty-state-desc">Fill out the loan calculator form to disburse your first loan.</p>
                    </div>
                </td>
            </tr>
        `;
        loanCardsHTML = `
            <div class="empty-state" style="padding:40px 0;">
                <i data-lucide="wallet"></i>
                <h3 class="empty-state-title">No Active Loans</h3>
                <p class="empty-state-desc">Fill out the loan calculator form to disburse your first loan.</p>
            </div>
        `;
    } else {
        loans.forEach(loan => {
            const customer = users.find(u => u.id === loan.customer_id);
            const agent = users.find(u => u.id === loan.agent_id);
            
            const badgeClass = loan.status === 'active' ? 'badge-success' 
                             : loan.status === 'overdue' ? 'badge-error' 
                             : 'badge-info';

            // Calculate percentage paid
            const paidAmount = loan.loan_amount - loan.remaining_balance;
            const paidPct = Math.round((paidAmount / loan.loan_amount) * 100);

            // Desktop Row
            loanRowsHTML += `
                <tr class="loan-row-item" data-id="${loan.id}" data-customer="${customer ? customer.name.toLowerCase() : ''}">
                    <td>
                        <div style="display:flex; flex-direction:column;">
                            <span style="font-weight:600;">${customer ? customer.name : 'Unknown Customer'}</span>
                            <span style="font-size:0.75rem; color:var(--text-muted);">ID: ${loan.id.substring(2, 8)}</span>
                        </div>
                    </td>
                    <td>
                        <div style="display:flex; flex-direction:column;">
                            <span style="font-weight:600;">₹${parseFloat(loan.loan_amount).toLocaleString('en-IN')}</span>
                            <span style="font-size:0.75rem; color:var(--text-muted);">Disbursed: ₹${parseFloat(loan.disbursed_amount).toLocaleString('en-IN')}</span>
                        </div>
                    </td>
                    <td>
                        <div style="display:flex; flex-direction:column;">
                            <span>₹${parseFloat(loan.daily_repayment).toLocaleString('en-IN')} / day</span>
                            <span style="font-size:0.75rem; color:var(--text-muted);">${loan.duration_days} days</span>
                        </div>
                    </td>
                    <td>
                        <div style="display:flex; flex-direction:column; gap:4px; min-width:110px;">
                            <div style="display:flex; justify-content:space-between; font-size:0.75rem;">
                                <span>₹${parseFloat(loan.remaining_balance).toLocaleString('en-IN')} left</span>
                                <span style="font-weight:600; color:var(--primary);">${paidPct}% paid</span>
                            </div>
                            <div class="progress-bar-container" style="margin:0;">
                                <div class="progress-bar-fill" style="width: ${paidPct}%;"></div>
                            </div>
                            <span style="font-size:0.75rem; color:var(--text-muted);">${loan.remaining_days} days left</span>
                        </div>
                    </td>
                    <td>
                        <span class="badge ${badgeClass}">${loan.status}</span>
                    </td>
                    <td>
                        <select class="form-control agent-reassign-select" data-loan-id="${loan.id}" style="padding:6px 12px; font-size:0.8rem; height:auto; width:auto;">
                            <option value="">Unassigned</option>
                            ${agents.map(a => `<option value="${a.id}" ${loan.agent_id === a.id ? 'selected' : ''}>${a.name}</option>`).join('')}
                        </select>
                    </td>
                    <td>
                        <div style="display:flex; gap:6px;">
                            <button class="btn btn-outline btn-sm status-toggle-btn" data-loan-id="${loan.id}" data-current-status="${loan.status}">
                                Toggle Status
                            </button>
                        </div>
                    </td>
                </tr>
            `;

            // Mobile Card
            loanCardsHTML += `
                <div class="loan-mobile-card loan-row-item" data-id="${loan.id}" data-customer="${customer ? customer.name.toLowerCase() : ''}">
                    <div class="card-header-row">
                        <div style="display:flex; flex-direction:column;">
                            <span style="font-weight:600; font-size:0.95rem;">${customer ? customer.name : 'Unknown Customer'}</span>
                            <span style="font-size:0.7rem; color:var(--text-muted);">ID: ${loan.id.substring(2, 8)}</span>
                        </div>
                        <span class="badge ${badgeClass}">${loan.status}</span>
                    </div>
                    
                    <div class="card-content-grid">
                        <div class="card-item">
                            <span class="card-item-label">Principal</span>
                            <span class="card-item-value" style="font-size:0.85rem;">₹${parseFloat(loan.loan_amount).toLocaleString('en-IN')}</span>
                            <span style="font-size:0.7rem; color:var(--text-muted);">Net: ₹${parseFloat(loan.disbursed_amount).toLocaleString('en-IN')}</span>
                        </div>
                        <div class="card-item">
                            <span class="card-item-label">Daily Due</span>
                            <span class="card-item-value" style="font-size:0.85rem;">₹${parseFloat(loan.daily_repayment).toLocaleString('en-IN')}/day</span>
                            <span style="font-size:0.7rem; color:var(--text-muted);">${loan.duration_days} Days</span>
                        </div>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:4px; border-top:1px dashed var(--border-color); padding-top:8px;">
                        <div style="display:flex; justify-content:space-between; font-size:0.75rem;">
                            <span style="color:var(--text-secondary);">Repaid Progress:</span>
                            <span style="font-weight:600; color:var(--indigo-primary);">${paidPct}% (${parseFloat(loan.loan_amount - loan.remaining_balance).toLocaleString('en-IN')} paid)</span>
                        </div>
                        <div class="progress-bar-container" style="margin:4px 0;">
                            <div class="progress-bar-fill" style="width: ${paidPct}%;"></div>
                        </div>
                        <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-muted);">
                            <span>Bal: ₹${parseFloat(loan.remaining_balance).toLocaleString('en-IN')}</span>
                            <span>${loan.remaining_days} days left</span>
                        </div>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:6px; border-top:1px dashed var(--border-color); padding-top:10px;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-size:0.75rem; font-weight:600; color:var(--text-secondary);">Agent:</span>
                            <select class="form-control agent-reassign-select" data-loan-id="${loan.id}" style="padding:6px 10px; font-size:0.8rem; height:auto; width:auto; margin:0;">
                                <option value="">Unassigned</option>
                                ${agents.map(a => `<option value="${a.id}" ${loan.agent_id === a.id ? 'selected' : ''}>${a.name}</option>`).join('')}
                            </select>
                        </div>
                        <div style="display:flex; gap:6px; margin-top:4px;">
                            <button class="btn btn-outline btn-sm status-toggle-btn" data-loan-id="${loan.id}" data-current-status="${loan.status}" style="width:100%; justify-content:center;">
                                Toggle Status
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    // Generate options for customer select list
    let customerOptionsHTML = '<option value="">Select a Customer</option>';
    customers.forEach(c => {
        // Only allow loan disbursal to customers with approved KYC status (highly recommended)
        const isApproved = c.kyc_status === 'approved';
        const suffix = isApproved ? '' : ' (KYC Pending)';
        customerOptionsHTML += `<option value="${c.id}" ${preselectedCustomerId === c.id ? 'selected' : ''} ${!isApproved ? 'disabled' : ''}>${c.name}${suffix}</option>`;
    });

    return `
        <div class="page-header">
            <h1 class="page-title">Loan Management</h1>
        </div>

        <div class="dashboard-layout">
            <!-- Left Side: Active Loans List -->
            <div class="content-box">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:10px;">
                    <h3 class="section-title" style="margin-bottom:0;">Disbursed Loans Registry</h3>
                    <input type="text" id="loan-search" class="form-control" placeholder="Search by customer..." style="width:200px; padding:6px 12px; font-size:0.85rem;">
                </div>
                
                <!-- Table View (Desktop only) -->
                <div class="table-responsive desktop-only">
                    <table class="fintech-table">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Loan Principal</th>
                                <th>Daily Due</th>
                                <th>Repayment Progress</th>
                                <th>Status</th>
                                <th>Collection Agent</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="loan-table-body">
                            ${loanRowsHTML}
                        </tbody>
                    </table>
                </div>

                <!-- Cards View (Mobile only) -->
                <div class="mobile-only" id="loan-cards-container" style="padding-bottom: 30px;">
                    ${loanCardsHTML}
                </div>
            </div>

            <!-- Right Side: Loan Disbursal Calculator -->
            <div class="content-box">
                <h3 class="section-title">Disburse New Loan</h3>
                <form id="disburse-loan-form">
                    <div class="form-group">
                        <label class="form-label" for="loan-customer">Select Customer</label>
                        <select id="loan-customer" class="form-control" required>
                            ${customerOptionsHTML}
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="loan-agent">Assign Collection Agent</label>
                        <select id="loan-agent" class="form-control">
                            <option value="">Unassigned</option>
                            ${agents.map(a => `<option value="${a.id}">${a.name}</option>`).join('')}
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="loan-amount">Loan Amount (₹)</label>
                        <input type="number" id="loan-amount" class="form-control" placeholder="e.g. 100000" min="1000" step="500" required>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="loan-comm">Commission Rate (%)</label>
                            <input type="number" id="loan-comm" class="form-control" value="10" min="1" max="50" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="loan-duration">Duration (Days)</label>
                            <input type="number" id="loan-duration" class="form-control" value="100" min="10" max="2000" required>
                        </div>
                    </div>

                    <!-- Live Calculator Display Box -->
                    <div style="background-color: var(--input-bg); padding:16px; border-radius: var(--border-radius-md); border:1px solid var(--border-color); margin:16px 0; display:flex; flex-direction:column; gap:10px;">
                        <span style="font-size:0.75rem; font-weight:var(--font-weight-bold); color:var(--text-muted); text-transform:uppercase;">Live Calculator</span>
                        <div style="display:flex; justify-content:space-between; font-size:0.85rem;">
                            <span style="color:var(--text-secondary);">Deducted Commission:</span>
                            <strong style="color: var(--error);" id="calc-comm-amt">₹0</strong>
                        </div>
                        <div style="display:flex; justify-content:space-between; font-size:0.85rem;">
                            <span style="color:var(--text-secondary);">Net Disbursed Amount:</span>
                            <strong style="color: var(--success);" id="calc-disb-amt">₹0</strong>
                        </div>
                        <div style="display:flex; justify-content:space-between; font-size:0.85rem;">
                            <span style="color:var(--text-secondary);">Daily Installment (₹/day):</span>
                            <strong style="color: var(--primary);" id="calc-daily-pay">₹0</strong>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary btn-block">Confirm Disbursal & Pay</button>
                </form>
            </div>
        </div>
    `;
}

// Event Bindings Hook
window.init_loans = function(queryParams) {
    const form = document.getElementById('disburse-loan-form');
    const loanAmtInput = document.getElementById('loan-amount');
    const commRateInput = document.getElementById('loan-comm');
    const durationInput = document.getElementById('loan-duration');
    
    const calcCommAmt = document.getElementById('calc-comm-amt');
    const calcDisbAmt = document.getElementById('calc-disb-amt');
    const calcDailyPay = document.getElementById('calc-daily-pay');

    // Search Filter
    const searchInput = document.getElementById('loan-search');
    const rows = document.querySelectorAll('.loan-row-item');
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            const query = e.target.value.toLowerCase().trim();
            rows.forEach(row => {
                const customerName = row.getAttribute('data-customer');
                if (customerName.includes(query)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }

    // Live calculations function
    const updateCalculations = () => {
        const amount = parseFloat(loanAmtInput.value) || 0;
        const rate = parseFloat(commRateInput.value) || 0;
        const duration = parseInt(durationInput.value) || 1;

        const commission = amount * (rate / 100);
        const disbursed = Math.max(0, amount - commission);
        const dailyPay = amount / duration;

        calcCommAmt.innerText = `₹${commission.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
        calcDisbAmt.innerText = `₹${disbursed.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
        calcDailyPay.innerText = `₹${dailyPay.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
    };

    if (loanAmtInput) loanAmtInput.addEventListener('input', updateCalculations);
    if (commRateInput) commRateInput.addEventListener('input', updateCalculations);
    if (durationInput) durationInput.addEventListener('input', updateCalculations);

    // Initial calc execution
    updateCalculations();

    // Form Submission
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const customerId = document.getElementById('loan-customer').value;
            const agentId = document.getElementById('loan-agent').value;
            const loanAmount = parseFloat(loanAmtInput.value);
            const commissionRate = parseFloat(commRateInput.value);
            const durationDays = parseInt(durationInput.value);

            if (!customerId) {
                alert('Please select a customer.');
                return;
            }

            try {
                loanService.add({
                    customer_id: customerId,
                    agent_id: agentId || null,
                    loan_amount: loanAmount,
                    commission_rate: commissionRate,
                    duration_days: durationDays
                });

                alert('Loan disbursed and logged successfully!');
                navigateTo('/dashboard');
            } catch (err) {
                alert(`Error: ${err.message}`);
            }
        });
    }

    // Agent Reassignment Selector handler
    const agentSelects = document.querySelectorAll('.agent-reassign-select');
    agentSelects.forEach(select => {
        select.addEventListener('change', (e) => {
            const loanId = select.getAttribute('data-loan-id');
            const agentId = select.value;
            
            loanService.assignAgent(loanId, agentId || null);
            alert('Collection Agent assignment updated successfully.');
            navigateTo('/loans');
        });
    });

    // Loan Status toggling helper
    const statusBtns = document.querySelectorAll('.status-toggle-btn');
    statusBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const loanId = btn.getAttribute('data-loan-id');
            const currentStatus = btn.getAttribute('data-current-status');
            
            // Loop statuses: active -> overdue -> active
            const nextStatus = currentStatus === 'active' ? 'overdue' 
                             : currentStatus === 'overdue' ? 'completed' 
                             : 'active';

            loanService.updateStatus(loanId, nextStatus);
            alert(`Loan status updated to ${nextStatus}!`);
            navigateTo('/loans');
        });
    });
};
