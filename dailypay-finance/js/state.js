// DailyPay Finance - State Management Engine

const STORAGE_KEYS = {
    USERS: 'dp_users',
    LOANS: 'dp_loans',
    PAYMENTS: 'dp_payments',
    LOGS: 'dp_logs',
    CURRENT_USER: 'dp_current_user'
};

// Seed Mock Data Helper
function seedData() {
    // 1. Seed Users
    const defaultUsers = [
        {
            id: 'u-admin-1',
            phone: '9999999999',
            name: 'Raj Patel',
            role: 'admin',
            avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop',
            kyc_status: 'approved',
            address: 'Head Office, DailyPay Tower, Bandra East, Mumbai',
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'u-agent-1',
            phone: '8888888888',
            name: 'Suresh Kumar',
            role: 'agent',
            avatar_url: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=100&auto=format&fit=crop',
            kyc_status: 'approved',
            address: 'Transit Colony, Sector 4, Noida',
            created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'u-agent-2',
            phone: '8888888889',
            name: 'Vikram Singh',
            role: 'agent',
            avatar_url: 'https://images.unsplash.com/photo-1590086782957-93c06ef21604?w=100&auto=format&fit=crop',
            kyc_status: 'approved',
            address: 'New Colony, Gali 7, Jaipur',
            created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'u-cust-1',
            phone: '7777777777',
            name: 'Amit Sharma',
            role: 'customer',
            avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop',
            kyc_status: 'approved',
            address: 'Flat 402, Sector 15, Noida, UP',
            id_proof_url: 'Aadhar_Amit.jpg',
            created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'u-cust-2',
            phone: '7777777778',
            name: 'Priya Patel',
            role: 'customer',
            avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop',
            kyc_status: 'approved',
            address: 'Shop 12, Main Bazar, Ahmedabad, Gujarat',
            id_proof_url: 'PAN_Priya.jpg',
            created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'u-cust-3',
            phone: '7777777779',
            name: 'Ramesh Gupta',
            role: 'customer',
            avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop',
            kyc_status: 'pending',
            address: 'Gali No 2, Sadar Bazar, Delhi',
            id_proof_url: 'Aadhar_Ramesh.jpg',
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'u-cust-4',
            phone: '7777777780',
            name: 'Karan Malhotra',
            role: 'customer',
            avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop',
            kyc_status: 'approved',
            address: '12A, Mall Road, Shimla, HP',
            id_proof_url: 'Aadhar_Karan.jpg',
            created_at: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];

    // 2. Seed Loans
    const defaultLoans = [
        {
            id: 'l-loan-1',
            customer_id: 'u-cust-1',
            agent_id: 'u-agent-1',
            loan_amount: 100000,
            commission_rate: 10,
            commission_amount: 10000,
            disbursed_amount: 90000,
            daily_repayment: 1000, // repays 1000 daily
            duration_days: 100,
            remaining_balance: 65000,
            remaining_days: 65,
            status: 'active',
            created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'l-loan-2',
            customer_id: 'u-cust-2',
            agent_id: 'u-agent-2',
            loan_amount: 50000,
            commission_rate: 10,
            commission_amount: 5000,
            disbursed_amount: 45000,
            daily_repayment: 500,
            duration_days: 100,
            remaining_balance: 15000,
            remaining_days: 30,
            status: 'active',
            created_at: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'l-loan-3',
            customer_id: 'u-cust-4',
            agent_id: 'u-agent-1',
            loan_amount: 80000,
            commission_rate: 12,
            commission_amount: 9600,
            disbursed_amount: 70400,
            daily_repayment: 800,
            duration_days: 100,
            remaining_balance: 72000,
            remaining_days: 90,
            status: 'overdue', // overdue loan
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];

    // 3. Seed Payments
    const defaultPayments = [];
    const seedPaymentDays = 30;
    
    // Generate historic collections for the last 30 days
    let receiptCounter = 1001;
    for (let i = seedPaymentDays; i >= 1; i--) {
        const dateStr = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        // Loan 1 payments (regular daily payments)
        if (i <= 35) {
            defaultPayments.push({
                id: `p-l1-${i}`,
                loan_id: 'l-loan-1',
                collected_by: 'u-agent-1',
                amount: 1000,
                payment_date: dateStr,
                payment_method: 'qr',
                transaction_ref: `TXN${Math.floor(1000000000 + Math.random() * 9000000000)}`,
                receipt_number: `REC${receiptCounter++}`,
                created_at: `${dateStr}T11:00:00.000Z`
            });
        }
        
        // Loan 2 payments
        if (i <= 70) {
            defaultPayments.push({
                id: `p-l2-${i}`,
                loan_id: 'l-loan-2',
                collected_by: 'u-agent-2',
                amount: 500,
                payment_date: dateStr,
                payment_method: 'cash',
                transaction_ref: `TXN${Math.floor(1000000000 + Math.random() * 9000000000)}`,
                receipt_number: `REC${receiptCounter++}`,
                created_at: `${dateStr}T14:30:00.000Z`
            });
        }
    }

    // Add some collections for today
    const todayStr = new Date().toISOString().split('T')[0];
    defaultPayments.push({
        id: `p-l1-today`,
        loan_id: 'l-loan-1',
        collected_by: 'u-agent-1',
        amount: 1000,
        payment_date: todayStr,
        payment_method: 'qr',
        transaction_ref: `TXN${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        receipt_number: `REC${receiptCounter++}`,
        created_at: `${todayStr}T10:15:00.000Z`
    });

    // 4. Seed logs
    const defaultLogs = [
        {
            id: 'log-1',
            user_id: 'u-admin-1',
            action: 'DISBURSED_LOAN',
            details: { customer: 'Amit Sharma', amount: 100000, agent: 'Suresh Kumar' },
            created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'log-2',
            user_id: 'u-admin-1',
            action: 'DISBURSED_LOAN',
            details: { customer: 'Priya Patel', amount: 50000, agent: 'Vikram Singh' },
            created_at: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'log-3',
            user_id: 'u-admin-1',
            action: 'CUSTOMER_KYC_UPDATE',
            details: { customer: 'Amit Sharma', status: 'approved' },
            created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(defaultLoans));
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(defaultPayments));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(defaultLogs));
}

// Check and Initialize Storage
if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    seedData();
}

// Core DB Accessors
const db = {
    getUsers: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]'),
    saveUsers: (users) => localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users)),
    
    getLoans: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.LOANS) || '[]'),
    saveLoans: (loans) => localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans)),
    
    getPayments: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENTS) || '[]'),
    savePayments: (payments) => localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments)),
    
    getLogs: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS) || '[]'),
    saveLogs: (logs) => localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs)),
    
    getCurrentUser: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || 'null'),
    setCurrentUser: (user) => localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
};

// Activity logger helper
function logActivity(userId, action, details) {
    const logs = db.getLogs();
    const newLog = {
        id: `log-${Date.now()}`,
        user_id: userId,
        action,
        details,
        created_at: new Date().toISOString()
    };
    logs.unshift(newLog);
    db.saveLogs(logs);
}

// Authentication Logic
const authService = {
    login: (phone, otp) => {
        // Quick verification: any user with matching phone, OTP is always 123456
        if (otp !== '123456') {
            throw new Error('Invalid OTP code. Use 123456 for demo.');
        }
        
        const users = db.getUsers();
        const user = users.find(u => u.phone === phone);
        
        if (!user) {
            throw new Error('Phone number not registered.');
        }
        
        db.setCurrentUser(user);
        logActivity(user.id, 'USER_LOGIN', { name: user.name, role: user.role });
        return user;
    },
    
    logout: () => {
        const user = db.getCurrentUser();
        if (user) {
            logActivity(user.id, 'USER_LOGOUT', { name: user.name });
        }
        db.setCurrentUser(null);
    }
};

// Business Logic Services
const customerService = {
    add: (customerData) => {
        const users = db.getUsers();
        const existing = users.find(u => u.phone === customerData.phone);
        if (existing) {
            throw new Error('Phone number already exists!');
        }

        const newCustomer = {
            id: `u-${Date.now()}`,
            role: 'customer',
            kyc_status: customerData.kyc_status || 'pending',
            created_at: new Date().toISOString(),
            avatar_url: customerData.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop',
            ...customerData
        };

        users.push(newCustomer);
        db.saveUsers(users);

        const currentAdmin = db.getCurrentUser();
        logActivity(currentAdmin ? currentAdmin.id : 'system', 'CUSTOMER_CREATED', { name: newCustomer.name, phone: newCustomer.phone });
        return newCustomer;
    },
    
    updateKYC: (customerId, status) => {
        const users = db.getUsers();
        const idx = users.findIndex(u => u.id === customerId);
        if (idx !== -1) {
            users[idx].kyc_status = status;
            db.saveUsers(users);
            const currentAdmin = db.getCurrentUser();
            logActivity(currentAdmin ? currentAdmin.id : 'system', 'CUSTOMER_KYC_UPDATE', { customer: users[idx].name, status });
        }
    }
};

const loanService = {
    add: (loanData) => {
        const loans = db.getLoans();
        
        // Calculate disbursement fields
        const amount = parseFloat(loanData.loan_amount);
        const commRate = parseFloat(loanData.commission_rate || 10);
        const commissionAmount = amount * (commRate / 100);
        const disbursedAmount = amount - commissionAmount;
        const duration = parseInt(loanData.duration_days || 100);
        const dailyPay = amount / duration; // standard equal installments

        const newLoan = {
            id: `l-${Date.now()}`,
            customer_id: loanData.customer_id,
            agent_id: loanData.agent_id || null,
            loan_amount: amount,
            commission_rate: commRate,
            commission_amount: commissionAmount,
            disbursed_amount: disbursedAmount,
            daily_repayment: dailyPay,
            duration_days: duration,
            remaining_balance: amount,
            remaining_days: duration,
            status: 'active',
            created_at: new Date().toISOString()
        };

        loans.push(newLoan);
        db.saveLoans(loans);

        const currentAdmin = db.getCurrentUser();
        const users = db.getUsers();
        const customer = users.find(u => u.id === loanData.customer_id);
        logActivity(currentAdmin ? currentAdmin.id : 'system', 'DISBURSED_LOAN', { 
            customer: customer ? customer.name : 'Unknown', 
            amount 
        });
        return newLoan;
    },
    
    assignAgent: (loanId, agentId) => {
        const loans = db.getLoans();
        const idx = loans.findIndex(l => l.id === loanId);
        if (idx !== -1) {
            loans[idx].agent_id = agentId;
            db.saveLoans(loans);
            const currentAdmin = db.getCurrentUser();
            const users = db.getUsers();
            const agent = users.find(u => u.id === agentId);
            logActivity(currentAdmin ? currentAdmin.id : 'system', 'LOAN_AGENT_ASSIGNED', { 
                loanId, 
                agent: agent ? agent.name : 'Unassigned' 
            });
        }
    },

    updateStatus: (loanId, status) => {
        const loans = db.getLoans();
        const idx = loans.findIndex(l => l.id === loanId);
        if (idx !== -1) {
            loans[idx].status = status;
            db.saveLoans(loans);
        }
    }
};

const paymentService = {
    collect: (collectionData) => {
        const loans = db.getLoans();
        const loanIdx = loans.findIndex(l => l.id === collectionData.loan_id);
        
        if (loanIdx === -1) {
            throw new Error('Loan record not found.');
        }

        const loan = loans[loanIdx];
        const collectAmount = parseFloat(collectionData.amount);

        if (loan.remaining_balance <= 0) {
            throw new Error('This loan has already been fully repaid.');
        }

        // Calculate days paid (approximate based on daily amount)
        const daysPaid = Math.min(loan.remaining_days, Math.round(collectAmount / loan.daily_repayment));

        // Deduct balance and remaining days
        loan.remaining_balance = Math.max(0, loan.remaining_balance - collectAmount);
        loan.remaining_days = Math.max(0, loan.remaining_days - daysPaid);

        if (loan.remaining_balance <= 0) {
            loan.status = 'completed';
            loan.closed_at = new Date().toISOString();
        }

        loans[loanIdx] = loan;
        db.saveLoans(loans);

        // Add payment transaction record
        const payments = db.getPayments();
        const receiptNo = `REC${1000 + payments.length + 1}`;
        const newPayment = {
            id: `p-${Date.now()}`,
            loan_id: loan.id,
            collected_by: collectionData.collected_by || 'direct-upi',
            amount: collectAmount,
            payment_date: new Date().toISOString().split('T')[0],
            payment_method: collectionData.payment_method || 'qr',
            transaction_ref: collectionData.transaction_ref || `TXN${Math.floor(1000000000 + Math.random() * 9000000000)}`,
            receipt_number: receiptNo,
            created_at: new Date().toISOString()
        };

        payments.unshift(newPayment);
        db.savePayments(payments);

        const users = db.getUsers();
        const customer = users.find(u => u.id === loan.customer_id);
        logActivity(collectionData.collected_by || 'system', 'PAYMENT_COLLECTED', { 
            customer: customer ? customer.name : 'Unknown', 
            amount: collectAmount, 
            receiptNumber: receiptNo 
        });

        return newPayment;
    }
};

// Analytics Engine
const analyticsService = {
    getDashboardMetrics: () => {
        const users = db.getUsers();
        const loans = db.getLoans();
        const payments = db.getPayments();
        
        const activeLoans = loans.filter(l => l.status === 'active');
        const overdueLoans = loans.filter(l => l.status === 'overdue');
        const customers = users.filter(u => u.role === 'customer');
        
        const todayStr = new Date().toISOString().split('T')[0];
        
        // Sum total collected today
        const totalCollectedToday = payments
            .filter(p => p.payment_date === todayStr)
            .reduce((sum, p) => sum + parseFloat(p.amount), 0);

        // Sum pending collections (active loans daily repayments that haven't paid today)
        // If a customer has paid today, they are not pending today.
        const loansPaidToday = new Set(
            payments.filter(p => p.payment_date === todayStr).map(p => p.loan_id)
        );
        const pendingCollections = activeLoans
            .filter(l => !loansPaidToday.has(l.id))
            .reduce((sum, l) => sum + parseFloat(l.daily_repayment), 0);

        // Profit = sum of commission of all disbursed loans
        const totalProfit = loans.reduce((sum, l) => sum + parseFloat(l.commission_amount), 0);

        // Overdue count
        const overdueCount = overdueLoans.length;

        // Daily collections data for last 7 days
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            const formattedLabel = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            
            const collected = payments
                .filter(p => p.payment_date === dateStr)
                .reduce((sum, p) => sum + parseFloat(p.amount), 0);
            
            last7Days.push({ label: formattedLabel, value: collected });
        }

        // Monthly profit trend (past 6 months)
        // For simplicity, we aggregate commissions of loans disbursed in each month
        const monthlyProfit = [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthVal = date.getMonth();
            const yearVal = date.getFullYear();
            const monthLabel = `${monthNames[monthVal]} ${yearVal.toString().substring(2)}`;
            
            const profit = loans
                .filter(l => {
                    const loanDate = new Date(l.created_at);
                    return loanDate.getMonth() === monthVal && loanDate.getFullYear() === yearVal;
                })
                .reduce((sum, l) => sum + parseFloat(l.commission_amount), 0);

            monthlyProfit.push({ label: monthLabel, value: profit });
        }

        return {
            totalCustomers: customers.length,
            activeLoans: activeLoans.length,
            totalCollectedToday,
            pendingCollections,
            totalProfit,
            overdueCustomers: overdueCount,
            last7Days,
            monthlyProfit
        };
    },

    getAgentPerformance: () => {
        const users = db.getUsers();
        const loans = db.getLoans();
        const payments = db.getPayments();
        
        const agents = users.filter(u => u.role === 'agent');
        
        return agents.map(agent => {
            // Loans assigned to this agent
            const agentLoans = loans.filter(l => l.agent_id === agent.id);
            const activeCount = agentLoans.filter(l => l.status === 'active').length;
            const overdueCount = agentLoans.filter(l => l.status === 'overdue').length;
            
            // Total collections logged by this agent
            const totalCollected = payments
                .filter(p => p.collected_by === agent.id)
                .reduce((sum, p) => sum + parseFloat(p.amount), 0);

            return {
                id: agent.id,
                name: agent.name,
                phone: agent.phone,
                avatar_url: agent.avatar_url,
                assignedLoans: agentLoans.length,
                activeCount,
                overdueCount,
                totalCollected
            };
        });
    }
};

// Export Reports Service (Helper to generate CSV format and trigger download)
const reportService = {
    exportToCSV: (filename, data, headers) => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += headers.join(",") + "\r\n";
        
        data.forEach(row => {
            const rowContent = headers.map(header => {
                const val = row[header] !== undefined ? row[header] : '';
                // Escape quotes and wrap in quotes if has comma
                const escaped = ('' + val).replace(/"/g, '""');
                return escaped.includes(',') || escaped.includes('\n') ? `"${escaped}"` : escaped;
            }).join(",");
            csvContent += rowContent + "\r\n";
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

// Bind states and services to global window scope
window.db = db;
window.logActivity = logActivity;
window.authService = authService;
window.customerService = customerService;
window.loanService = loanService;
window.paymentService = paymentService;
window.analyticsService = analyticsService;
window.reportService = reportService;
