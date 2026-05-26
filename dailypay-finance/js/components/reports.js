// DailyPay Finance - Reports & Activity Logs Component

window.renderReports = function() {
    const logs = db.getLogs().slice(0, 10); // Show recent 10 logs
    const users = db.getUsers();
    
    // Generate Activity Logs HTML Rows
    let logsRowsHTML = '';
    let logsCardsHTML = '';
    if (logs.length === 0) {
        logsRowsHTML = `
            <tr>
                <td colspan="4" style="text-align:center; padding:20px; color:var(--text-muted);">No activity recorded yet</td>
            </tr>
        `;
        logsCardsHTML = `
            <div class="empty-state" style="padding:20px 0;">
                <p class="empty-state-desc">No activity recorded yet</p>
            </div>
        `;
    } else {
        logs.forEach(log => {
            const user = users.find(u => u.id === log.user_id);
            const userName = user ? user.name : 'System';
            const userRole = user ? user.role : 'System';
            
            const timestamp = new Date(log.created_at).toLocaleString('en-IN', { 
                day: 'numeric', 
                month: 'short', 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
            });

            // Make details readable
            const detailsStr = Object.entries(log.details || {})
                .map(([k, v]) => `${k}: ${typeof v === 'number' ? '₹' + v.toLocaleString('en-IN') : v}`)
                .join(', ');

            // Desktop Row
            logsRowsHTML += `
                <tr>
                    <td style="font-size:0.8rem; color:var(--text-muted);">${timestamp}</td>
                    <td>
                        <div style="display:flex; flex-direction:column;">
                            <span style="font-weight:600; font-size:0.85rem;">${userName}</span>
                            <span style="font-size:0.7rem; color:var(--text-muted); text-transform:capitalize;">${userRole}</span>
                        </div>
                    </td>
                    <td>
                        <span class="badge ${getLogBadgeClass(log.action)}" style="font-size:0.65rem;">
                            ${log.action.replace(/_/g, ' ')}
                        </span>
                    </td>
                    <td style="font-size:0.8rem; color:var(--text-secondary); max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${detailsStr}">
                        ${detailsStr}
                    </td>
                </tr>
            `;

            // Mobile Card
            logsCardsHTML += `
                <div class="log-mobile-card">
                    <div class="card-header-row" style="padding-bottom: 6px;">
                        <span style="font-size:0.75rem; color:var(--text-muted); font-weight: 500;">${timestamp}</span>
                        <span class="badge ${getLogBadgeClass(log.action)}" style="font-size:0.65rem;">
                            ${log.action.replace(/_/g, ' ')}
                        </span>
                    </div>
                    <div class="card-item">
                        <span class="card-item-label">Operator</span>
                        <span class="card-item-value" style="font-size:0.85rem;">${userName} <span style="font-size:0.7rem; color:var(--text-muted); font-weight:normal;">(${userRole})</span></span>
                    </div>
                    <div class="card-item" style="border-top:1px dashed var(--border-color); padding-top:8px;">
                        <span class="card-item-label">Details</span>
                        <span class="card-item-value" style="font-size:0.8rem; font-weight:normal; color:var(--text-secondary); line-height:1.3;">${detailsStr}</span>
                    </div>
                </div>
            `;
        });
    }

    return `
        <div class="page-header">
            <h1 class="page-title">Reports & Logs</h1>
        </div>

        <div class="dashboard-layout">
            <!-- Left Side: Export Controls & Profits Graph -->
            <div>
                <!-- Export Center -->
                <div class="content-box">
                    <h3 class="section-title">Fintech Export Center</h3>
                    <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:20px;">
                        Download raw spreadsheets to review daily, monthly balances, audit trails, and agent performances.
                    </p>
                    
                    <div style="display:grid; grid-template-columns:1fr; gap:12px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; padding:14px; border:1px solid var(--border-color); border-radius:var(--border-radius-md); background-color:var(--input-bg);">
                            <div style="display:flex; flex-direction:column; gap:2px;">
                                <strong style="font-size:0.9rem;">Daily Collection Report</strong>
                                <span style="font-size:0.75rem; color:var(--text-muted);">List of repayments recorded today</span>
                            </div>
                            <button class="btn btn-primary btn-sm" id="export-daily-btn">
                                <i data-lucide="download"></i> CSV
                            </button>
                        </div>

                        <div style="display:flex; justify-content:space-between; align-items:center; padding:14px; border:1px solid var(--border-color); border-radius:var(--border-radius-md); background-color:var(--input-bg);">
                            <div style="display:flex; flex-direction:column; gap:2px;">
                                <strong style="font-size:0.9rem;">Monthly Disbursal & Commission Sheet</strong>
                                <span style="font-size:0.75rem; color:var(--text-muted);">Aggregated profit commissions by month</span>
                            </div>
                            <button class="btn btn-primary btn-sm" id="export-monthly-btn">
                                <i data-lucide="download"></i> CSV
                            </button>
                        </div>

                        <div style="display:flex; justify-content:space-between; align-items:center; padding:14px; border:1px solid var(--border-color); border-radius:var(--border-radius-md); background-color:var(--input-bg);">
                            <div style="display:flex; flex-direction:column; gap:2px;">
                                <strong style="font-size:0.9rem;">Customer Ledger Registry</strong>
                                <span style="font-size:0.75rem; color:var(--text-muted);">List of all customers with loan balances</span>
                            </div>
                            <button class="btn btn-primary btn-sm" id="export-ledger-btn">
                                <i data-lucide="download"></i> CSV
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Monthly Profit Chart -->
                <div class="content-box">
                    <h3 class="section-title">Monthly Commission Profit Growth</h3>
                    <div class="chart-container" style="height: 240px;">
                        <canvas id="monthly-profit-chart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Right Side: Security Activity Audit Logs -->
            <div>
                <div class="content-box">
                    <h3 class="section-title">Security & Audit Activity Logs</h3>
                    <p style="font-size:0.75rem; color:var(--text-secondary); margin-bottom:12px;">Recent system actions and events</p>
                    
                    <!-- Table View (Desktop only) -->
                    <div class="table-responsive desktop-only">
                        <table class="fintech-table" style="font-size:0.8rem;">
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>Operator</th>
                                    <th>Event</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${logsRowsHTML}
                            </tbody>
                        </table>
                    </div>

                    <!-- Cards View (Mobile only) -->
                    <div class="mobile-only" id="logs-cards-container" style="padding-bottom: 20px;">
                        ${logsCardsHTML}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Helpers
function getLogBadgeClass(action) {
    if (action.includes('LOGIN') || action.includes('LOGOUT')) return 'badge-info';
    if (action.includes('PAYMENT')) return 'badge-success';
    if (action.includes('DISBURSED')) return 'badge-primary';
    if (action.includes('KYC')) return 'badge-warning';
    return 'badge-secondary';
}

// Page Hook Initializer
window.init_reports = function() {
    const metrics = analyticsService.getDashboardMetrics();
    
    // Bar Chart drawing for profit growth
    const ctx = document.getElementById('monthly-profit-chart');
    if (ctx) {
        const labels = metrics.monthlyProfit.map(item => item.label);
        const dataValues = metrics.monthlyProfit.map(item => item.value);

        const isDark = document.body.classList.contains('dark-theme');
        const gridColor = isDark ? '#212437' : '#eef1f6';
        const textLabelColor = isDark ? '#959dad' : '#6c738a';

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Commission Profits (₹)',
                    data: dataValues,
                    backgroundColor: '#0abde3',
                    borderColor: '#0abde3',
                    borderWidth: 1,
                    borderRadius: 6,
                    barThickness: 16
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
                        padding: 10,
                        backgroundColor: isDark ? '#171926' : '#ffffff',
                        titleColor: isDark ? '#f1f3f9' : '#1e202c',
                        bodyColor: '#0abde3',
                        borderColor: '#0abde3',
                        borderWidth: 1,
                        titleFont: { family: 'Outfit', size: 12, weight: 'bold' },
                        bodyFont: { family: 'Outfit', size: 13, weight: 'bold' },
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return 'Commission Profit: ₹' + context.raw.toLocaleString('en-IN');
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
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
    }

    // Bind CSV Export click triggers
    const exportDailyBtn = document.getElementById('export-daily-btn');
    const exportMonthlyBtn = document.getElementById('export-monthly-btn');
    const exportLedgerBtn = document.getElementById('export-ledger-btn');

    if (exportDailyBtn) {
        exportDailyBtn.addEventListener('click', () => {
            const todayStr = new Date().toISOString().split('T')[0];
            const payments = db.getPayments().filter(p => p.payment_date === todayStr);
            const users = db.getUsers();
            
            const exportData = payments.map(p => {
                const loan = db.getLoans().find(l => l.id === p.loan_id);
                const customer = loan ? users.find(u => u.id === loan.customer_id) : null;
                const agent = users.find(u => u.id === p.collected_by);
                
                return {
                    receipt_number: p.receipt_number,
                    payment_date: p.payment_date,
                    customer_name: customer ? customer.name : 'N/A',
                    customer_phone: customer ? customer.phone : 'N/A',
                    amount: p.amount,
                    collected_by: agent ? agent.name : 'Direct Pay (UPI/Gateway)',
                    transaction_ref: p.transaction_ref
                };
            });

            reportService.exportToCSV(
                'daily_collections_report', 
                exportData, 
                ['receipt_number', 'payment_date', 'customer_name', 'customer_phone', 'amount', 'collected_by', 'transaction_ref']
            );
        });
    }

    if (exportMonthlyBtn) {
        exportMonthlyBtn.addEventListener('click', () => {
            const loans = db.getLoans();
            const users = db.getUsers();
            
            const exportData = loans.map(l => {
                const customer = users.find(u => u.id === l.customer_id);
                return {
                    loan_id: l.id,
                    disbursed_date: l.created_at.split('T')[0],
                    customer_name: customer ? customer.name : 'N/A',
                    loan_amount: l.loan_amount,
                    commission_percentage: l.commission_rate,
                    commission_earned: l.commission_amount,
                    net_disbursed: l.disbursed_amount
                };
            });

            reportService.exportToCSV(
                'monthly_disbursal_commissions', 
                exportData, 
                ['loan_id', 'disbursed_date', 'customer_name', 'loan_amount', 'commission_percentage', 'commission_earned', 'net_disbursed']
            );
        });
    }

    if (exportLedgerBtn) {
        exportLedgerBtn.addEventListener('click', () => {
            const loans = db.getLoans();
            const users = db.getUsers();

            const exportData = loans.map(l => {
                const customer = users.find(u => u.id === l.customer_id);
                const agent = users.find(u => u.id === l.agent_id);
                const totalPaid = l.loan_amount - l.remaining_balance;
                
                return {
                    customer_name: customer ? customer.name : 'N/A',
                    customer_phone: customer ? customer.phone : 'N/A',
                    address: customer ? customer.address : 'N/A',
                    loan_amount: l.loan_amount,
                    outstanding_balance: l.remaining_balance,
                    total_repaid: totalPaid,
                    status: l.status,
                    assigned_agent: agent ? agent.name : 'Unassigned'
                };
            });

            reportService.exportToCSV(
                'customer_loan_ledger', 
                exportData, 
                ['customer_name', 'customer_phone', 'address', 'loan_amount', 'outstanding_balance', 'total_repaid', 'status', 'assigned_agent']
            );
        });
    }
};
