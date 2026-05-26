// DailyPay Finance - Admin Dashboard UI

window.renderAdminDashboard = function() {
    const metrics = analyticsService.getDashboardMetrics();
    const payments = db.getPayments().slice(0, 5); // recent 5 payments
    const users = db.getUsers();
    const loans = db.getLoans();
    
    // Find overdue loans
    const overdueLoans = loans.filter(l => l.status === 'overdue');
    
    // Get agent performance
    const agentsPerformance = analyticsService.getAgentPerformance();

    // Generate recent payments list HTML
    let paymentsHTML = '';
    if (payments.length === 0) {
        paymentsHTML = `
            <div class="empty-state" style="padding: 20px 0;">
                <i data-lucide="receipt"></i>
                <p class="empty-state-title" style="font-size:0.9rem;">No payments today</p>
            </div>
        `;
    } else {
        payments.forEach(p => {
            const loan = loans.find(l => l.id === p.loan_id);
            const customer = loan ? users.find(u => u.id === loan.customer_id) : null;
            const time = new Date(p.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            paymentsHTML += `
                <div class="payment-mini-item">
                    <div class="payment-mini-meta">
                        <div class="card-icon-container success" style="width:32px; height:32px; margin-bottom:0;">
                            <i data-lucide="arrow-down-left" style="width:16px; height:16px;"></i>
                        </div>
                        <div class="payment-mini-details">
                            <span class="payment-mini-name">${customer ? customer.name : 'Unknown Customer'}</span>
                            <span class="payment-mini-time">${time} • Ref: ${p.transaction_ref.substring(0, 10)}</span>
                        </div>
                    </div>
                    <span class="payment-mini-amount">₹${parseFloat(p.amount).toLocaleString('en-IN')}</span>
                </div>
            `;
        });
    }

    // Generate overdue loans HTML
    let overdueHTML = '';
    if (overdueLoans.length === 0) {
        overdueHTML = `
            <div class="empty-state" style="padding: 20px 0;">
                <i data-lucide="check-circle" style="color: var(--success);"></i>
                <p class="empty-state-title" style="font-size:0.9rem;">All clear! No overdue payments.</p>
            </div>
        `;
    } else {
        overdueLoans.forEach(ol => {
            const customer = users.find(u => u.id === ol.customer_id);
            if (!customer) return;
            overdueHTML += `
                <div style="padding: 12px; border: 1px solid var(--border-color); border-radius: var(--border-radius-md); background-color: var(--input-bg); margin-bottom: 12px; display:flex; flex-direction:column; gap:8px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-weight:600; font-size:0.9rem;">${customer.name}</span>
                        <span class="badge badge-error">Overdue</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--text-secondary);">
                        <span>Due: ₹${parseFloat(ol.daily_repayment).toLocaleString('en-IN')} / day</span>
                        <span>Bal: ₹${parseFloat(ol.remaining_balance).toLocaleString('en-IN')}</span>
                    </div>
                    <div style="display:flex; gap:8px; margin-top:4px;">
                        <button class="btn btn-outline btn-sm btn-block notify-whatsapp-btn" data-phone="${customer.phone}" data-name="${customer.name}" data-due="${ol.daily_repayment}">
                            <i data-lucide="message-square" style="width:14px; height:14px; color:#25D366;"></i> Remind
                        </button>
                        <button class="btn btn-primary btn-sm btn-block collect-quick-btn" data-loan-id="${ol.id}" data-name="${customer.name}">
                            Pay Now
                        </button>
                    </div>
                </div>
            `;
        });
    }

    // Generate agent list HTML
    let agentsHTML = '';
    agentsPerformance.forEach(ap => {
        agentsHTML += `
            <div style="display:flex; align-items:center; justify-content:space-between; padding: 10px 0; border-bottom: 1px solid var(--border-color);">
                <div style="display:flex; align-items:center; gap:10px;">
                    <img src="${ap.avatar_url || 'https://images.unsplash.com/photo-1590086782957-93c06ef21604?w=50&auto=format&fit=crop'}" alt="${ap.name}" style="width:32px; height:32px; border-radius:50%; object-fit:cover;">
                    <div style="display:flex; flex-direction:column;">
                        <span style="font-size:0.85rem; font-weight:600;">${ap.name}</span>
                        <span style="font-size:0.7rem; color:var(--text-muted);">${ap.assignedLoans} Loans Assigned</span>
                    </div>
                </div>
                <div style="text-align:right;">
                    <span style="font-size:0.85rem; font-weight:700; color:var(--success);">₹${parseFloat(ap.totalCollected).toLocaleString('en-IN')}</span>
                    <div style="font-size:0.7rem; color:var(--text-muted);">Collected Today</div>
                </div>
            </div>
        `;
    });

    return `
        <div class="page-header" style="margin-bottom: 20px;">
            <h1 class="page-title">Admin Dashboard</h1>
            <div class="btn-group">
                <button class="btn btn-secondary btn-sm" onclick="window.location.hash='#/reports'">
                    <i data-lucide="file-text"></i> Reports
                </button>
                <button class="btn btn-primary btn-sm" onclick="window.location.hash='#/loans'">
                    <i data-lucide="plus"></i> Disburse Loan
                </button>
            </div>
        </div>

        <!-- BharatPe-style Auto Settlement Bar -->
        <div class="alert-banner" style="background-color: rgba(52, 211, 153, 0.05); border-color: rgba(52, 211, 153, 0.15); margin-bottom: 24px; padding: 12px 18px; border-radius: var(--border-radius-md); gap: 12px; box-shadow: none;">
            <div class="alert-icon" style="background-color: rgba(52, 211, 153, 0.1); color: #34d399; width: 32px; height: 32px;">
                <i data-lucide="shield-check" style="width: 16px; height: 16px;"></i>
            </div>
            <div class="alert-body" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                <div>
                    <h4 class="alert-title" style="font-size:0.85rem; margin-bottom:1px;">Merchant Auto-Settlement Active</h4>
                    <p class="alert-desc" style="font-size:0.75rem; color: var(--text-secondary);">Daily collections are automatically settled to **HDFC Bank A/c ••••5102** every night.</p>
                </div>
                <span class="badge badge-success" style="font-size:0.6rem; padding: 3px 8px;">Active</span>
            </div>
        </div>

        <!-- Metrics Grid -->
        <div class="metrics-grid">
            <div class="dashboard-card">
                <div class="card-icon-container primary">
                    <i data-lucide="users"></i>
                </div>
                <span class="card-title">Total Customers</span>
                <span class="card-value">${metrics.totalCustomers}</span>
                <span class="card-trend trend-up">
                    <i data-lucide="trending-up" style="width:14px; height:14px;"></i> +12% this month
                </span>
            </div>
            
            <div class="dashboard-card">
                <div class="card-icon-container success">
                    <i data-lucide="indian-rupee"></i>
                </div>
                <span class="card-title">Collected Today</span>
                <span class="card-value">₹${metrics.totalCollectedToday.toLocaleString('en-IN')}</span>
                <span class="card-trend trend-up">
                    <i data-lucide="trending-up" style="width:14px; height:14px;"></i> Live tracking
                </span>
            </div>

            <div class="dashboard-card">
                <div class="card-icon-container warning">
                    <i data-lucide="hourglass"></i>
                </div>
                <span class="card-title">Pending Today</span>
                <span class="card-value">₹${metrics.pendingCollections.toLocaleString('en-IN')}</span>
                <span class="card-trend trend-down">
                    <i data-lucide="clock" style="width:14px; height:14px;"></i> Awaiting collection
                </span>
            </div>

            <div class="dashboard-card">
                <div class="card-icon-container error">
                    <i data-lucide="alert-octagon"></i>
                </div>
                <span class="card-title">Overdue Accounts</span>
                <span class="card-value">${metrics.overdueCustomers}</span>
                <span class="card-trend trend-down" style="color: var(--error);">
                    <i data-lucide="alert-triangle" style="width:14px; height:14px;"></i> Action required
                </span>
            </div>
        </div>

        <!-- Dashboard Layout columns -->
        <div class="dashboard-layout">
            <!-- Left Side: Graph and collections timeline -->
            <div>
                <div class="content-box">
                    <h3 class="section-title">Collection Analytics (Daily Trend)</h3>
                    <div class="chart-container">
                        <canvas id="collection-chart"></canvas>
                    </div>
                </div>

                <div class="content-box">
                    <h3 class="section-title">Live Collections Timeline</h3>
                    <div class="info-list">
                        ${paymentsHTML}
                    </div>
                </div>
            </div>

            <!-- Right Side: Overdue list & Agent performance -->
            <div>
                <div class="content-box">
                    <h3 class="section-title">Overdue Collection Alerts</h3>
                    ${overdueHTML}
                </div>

                <div class="content-box">
                    <h3 class="section-title">Collection Agents</h3>
                    <div style="display:flex; flex-direction:column; gap:4px;">
                        ${agentsHTML}
                    </div>
                </div>
            </div>
        </div>

        <!-- Quick Payment Modal (Hidden by default) -->
        <div class="modal-overlay" id="quick-collect-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Record Overdue Collection</h3>
                    <button class="modal-close" id="quick-collect-close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:16px;">
                        Enter payment details for <strong id="quick-collect-cust-name"></strong>.
                    </p>
                    <form id="quick-collect-form">
                        <input type="hidden" id="quick-collect-loan-id">
                        <div class="form-group">
                            <label class="form-label">Payment Amount (₹)</label>
                            <input type="number" id="quick-collect-amount" class="form-control" placeholder="Enter amount" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Payment Method</label>
                            <select id="quick-collect-method" class="form-control">
                                <option value="qr">UPI / QR Code</option>
                                <option value="cash">Cash Collection</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Transaction reference (Optional)</label>
                            <input type="text" id="quick-collect-ref" class="form-control" placeholder="TXN reference code">
                        </div>
                        <button type="submit" class="btn btn-primary btn-block" style="margin-top:12px;">Confirm Collection</button>
                    </form>
                </div>
            </div>
        </div>
    `;
}

// Chart Initializer Hook
window.init_dashboard = function() {
    const metrics = analyticsService.getDashboardMetrics();
    
    // Initialize Chart.js
    const ctx = document.getElementById('collection-chart');
    if (!ctx) return;

    const labels = metrics.last7Days.map(item => item.label);
    const dataValues = metrics.last7Days.map(item => item.value);

    // Get primary colors from body class / CSS variables
    const isDark = document.body.classList.contains('dark-theme');
    const gridColor = isDark ? '#212437' : '#eef1f6';
    const textLabelColor = isDark ? '#959dad' : '#6c738a';

    // Create a beautiful gradient
    const chartCtx = ctx.getContext('2d');
    const gradient = chartCtx.createLinearGradient(0, 0, 0, 240);
    gradient.addColorStop(0, 'rgba(108, 92, 231, 0.4)');
    gradient.addColorStop(1, 'rgba(108, 92, 231, 0.0)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Collections (₹)',
                data: dataValues,
                borderColor: '#6c5ce7',
                borderWidth: 3,
                backgroundColor: gradient,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#6c5ce7',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    padding: 12,
                    backgroundColor: isDark ? '#171926' : '#ffffff',
                    titleColor: isDark ? '#f1f3f9' : '#1e202c',
                    bodyColor: '#6c5ce7',
                    borderColor: '#6c5ce7',
                    borderWidth: 1,
                    titleFont: { family: 'Outfit', size: 13, weight: 'bold' },
                    bodyFont: { family: 'Outfit', size: 14, weight: 'bold' },
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return 'Collected: ₹' + context.raw.toLocaleString('en-IN');
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: gridColor,
                        drawBorder: false
                    },
                    ticks: {
                        color: textLabelColor,
                        font: { family: 'Outfit', size: 11 }
                    }
                },
                y: {
                    grid: {
                        color: gridColor,
                        drawBorder: false
                    },
                    ticks: {
                        color: textLabelColor,
                        font: { family: 'Outfit', size: 11 },
                        callback: function(value) {
                            return '₹' + value.toLocaleString('en-IN');
                        }
                    }
                }
            }
        }
    });

    // Notify Reminders Handler
    const notifyBtns = document.querySelectorAll('.notify-whatsapp-btn');
    notifyBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const phone = btn.getAttribute('data-phone');
            const name = btn.getAttribute('data-name');
            const due = btn.getAttribute('data-due');
            
            // Simulating API integration
            alert(`Reminder sent successfully!\n\nTo: ${name}\nPhone: +91 ${phone}\nMessage: "Dear ${name}, your daily repayment of ₹${due} for DailyPay Finance is due today. Please pay via UPI or keep cash ready. Thank you."`);
        });
    });

    // Quick Collection Form Modal Trigger
    const collectBtns = document.querySelectorAll('.collect-quick-btn');
    const overlay = document.getElementById('quick-collect-overlay');
    const closeBtn = document.getElementById('quick-collect-close-btn');
    const form = document.getElementById('quick-collect-form');
    const custNameDisplay = document.getElementById('quick-collect-cust-name');
    const loanIdInput = document.getElementById('quick-collect-loan-id');
    const amountInput = document.getElementById('quick-collect-amount');

    collectBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const loanId = btn.getAttribute('data-loan-id');
            const name = btn.getAttribute('data-name');
            
            custNameDisplay.innerText = name;
            loanIdInput.value = loanId;
            amountInput.value = '';
            overlay.classList.add('active');
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            overlay.classList.remove('active');
        });
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const loanId = loanIdInput.value;
            const amount = parseFloat(amountInput.value);
            const method = document.getElementById('quick-collect-method').value;
            const ref = document.getElementById('quick-collect-ref').value;
            
            const currentAdmin = db.getCurrentUser();

            try {
                paymentService.collect({
                    loan_id: loanId,
                    amount: amount,
                    collected_by: currentAdmin.id,
                    payment_method: method,
                    transaction_ref: ref || undefined
                });

                alert('Collection recorded successfully!');
                overlay.classList.remove('active');
                
                // Re-render and initialize
                navigateTo('/dashboard');
            } catch (err) {
                alert(`Error: ${err.message}`);
            }
        });
    }
};
