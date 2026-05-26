// DailyPay Finance - React Native State Engine
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
    USERS: 'dp_users',
    LOANS: 'dp_loans',
    PAYMENTS: 'dp_payments',
    LOGS: 'dp_logs',
    CURRENT_USER: 'dp_current_user'
};

// Memory Cache
let stateCache = {
    users: [],
    loans: [],
    payments: [],
    logs: [],
    currentUser: null,
    isLoaded: false
};

// Subscriptions
const listeners = new Set();
export function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function notifyChange() {
    listeners.forEach(l => l());
}

// Seed Mock Data
function getSeedData() {
    const users = [
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
        }
    ];

    const loans = [
        {
            id: 'l-loan-1',
            customer_id: 'u-cust-1',
            agent_id: 'u-agent-1',
            loan_amount: 100000,
            commission_rate: 10,
            commission_amount: 10000,
            disbursed_amount: 90000,
            daily_repayment: 1000,
            duration_days: 100,
            remaining_balance: 65000,
            remaining_days: 65,
            status: 'active',
            created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'l-loan-2',
            customer_id: 'u-cust-2',
            agent_id: 'u-agent-1',
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
        }
    ];

    const payments = [];
    const seedPaymentDays = 15;
    let receiptCounter = 1001;
    for (let i = seedPaymentDays; i >= 1; i--) {
        const dateStr = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        payments.push({
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

    const logs = [
        {
            id: 'log-1',
            user_id: 'u-admin-1',
            action: 'DISBURSED_LOAN',
            details: { customer: 'Amit Sharma', amount: 100000, agent: 'Suresh Kumar' },
            created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];

    return { users, loans, payments, logs };
}

// Hydrate state from AsyncStorage
export async function initializeDatabase() {
    try {
        const storedUsers = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
        const storedLoans = await AsyncStorage.getItem(STORAGE_KEYS.LOANS);
        const storedPayments = await AsyncStorage.getItem(STORAGE_KEYS.PAYMENTS);
        const storedLogs = await AsyncStorage.getItem(STORAGE_KEYS.LOGS);
        const storedCurrentUser = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);

        if (!storedUsers) {
            // Seed
            const seed = getSeedData();
            await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(seed.users));
            await AsyncStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(seed.loans));
            await AsyncStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(seed.payments));
            await AsyncStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(seed.logs));
            
            stateCache.users = seed.users;
            stateCache.loans = seed.loans;
            stateCache.payments = seed.payments;
            stateCache.logs = seed.logs;
        } else {
            stateCache.users = JSON.parse(storedUsers);
            stateCache.loans = JSON.parse(storedLoans || '[]');
            stateCache.payments = JSON.parse(storedPayments || '[]');
            stateCache.logs = JSON.parse(storedLogs || '[]');
        }

        stateCache.currentUser = storedCurrentUser ? JSON.parse(storedCurrentUser) : null;
        stateCache.isLoaded = true;
        notifyChange();
    } catch (err) {
        console.error('AsyncStorage Hydration Failed:', err);
    }
}

// Database helper operations
async function saveToDisk(key, data) {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
        console.error('AsyncStorage write error:', err);
    }
}

export const db = {
    getUsers: () => stateCache.users,
    getLoans: () => stateCache.loans,
    getPayments: () => stateCache.payments,
    getLogs: () => stateCache.logs,
    getCurrentUser: () => stateCache.currentUser,
    isLoaded: () => stateCache.isLoaded
};

export function logActivity(userId, action, details) {
    const newLog = {
        id: `log-${Date.now()}`,
        user_id: userId,
        action,
        details,
        created_at: new Date().toISOString()
    };
    stateCache.logs.unshift(newLog);
    saveToDisk(STORAGE_KEYS.LOGS, stateCache.logs);
    notifyChange();
}

export const authService = {
    login: (phone, otp) => {
        if (otp !== '123456') {
            throw new Error('Invalid OTP pin. Use 123456.');
        }
        const user = stateCache.users.find(u => u.phone === phone);
        if (!user) {
            throw new Error('Number not registered.');
        }
        stateCache.currentUser = user;
        saveToDisk(STORAGE_KEYS.CURRENT_USER, user);
        logActivity(user.id, 'USER_LOGIN', { name: user.name, role: user.role });
        notifyChange();
        return user;
    },
    logout: () => {
        const user = stateCache.currentUser;
        if (user) {
            logActivity(user.id, 'USER_LOGOUT', { name: user.name });
        }
        stateCache.currentUser = null;
        saveToDisk(STORAGE_KEYS.CURRENT_USER, null);
        notifyChange();
    }
};

export const customerService = {
    add: (custData) => {
        const existing = stateCache.users.find(u => u.phone === custData.phone);
        if (existing) {
            throw new Error('Number already exists.');
        }
        const newCust = {
            id: `u-${Date.now()}`,
            role: 'customer',
            kyc_status: custData.kyc_status || 'pending',
            created_at: new Date().toISOString(),
            avatar_url: custData.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop',
            ...custData
        };
        stateCache.users.push(newCust);
        saveToDisk(STORAGE_KEYS.USERS, stateCache.users);
        
        const curUser = stateCache.currentUser;
        logActivity(curUser ? curUser.id : 'system', 'CUSTOMER_CREATED', { name: newCust.name, phone: newCust.phone });
        notifyChange();
        return newCust;
    },
    updateKYC: (id, status) => {
        const idx = stateCache.users.findIndex(u => u.id === id);
        if (idx !== -1) {
            stateCache.users[idx].kyc_status = status;
            saveToDisk(STORAGE_KEYS.USERS, stateCache.users);
            const curUser = stateCache.currentUser;
            logActivity(curUser ? curUser.id : 'system', 'CUSTOMER_KYC_UPDATE', { customer: stateCache.users[idx].name, status });
            notifyChange();
        }
    }
};

export const loanService = {
    add: (loanData) => {
        const amount = parseFloat(loanData.loan_amount);
        const rate = parseFloat(loanData.commission_rate || 10);
        const commissionAmount = amount * (rate / 100);
        const disbursedAmount = amount - commissionAmount;
        const duration = parseInt(loanData.duration_days || 100);
        const dailyPay = amount / duration;

        const newLoan = {
            id: `l-${Date.now()}`,
            customer_id: loanData.customer_id,
            agent_id: loanData.agent_id || null,
            loan_amount: amount,
            commission_rate: rate,
            commission_amount: commissionAmount,
            disbursed_amount: disbursedAmount,
            daily_repayment: dailyPay,
            duration_days: duration,
            remaining_balance: amount,
            remaining_days: duration,
            status: 'active',
            created_at: new Date().toISOString()
        };

        stateCache.loans.push(newLoan);
        saveToDisk(STORAGE_KEYS.LOANS, stateCache.loans);

        const curUser = stateCache.currentUser;
        const customer = stateCache.users.find(u => u.id === loanData.customer_id);
        logActivity(curUser ? curUser.id : 'system', 'DISBURSED_LOAN', {
            customer: customer ? customer.name : 'Unknown',
            amount
        });
        notifyChange();
        return newLoan;
    },
    assignAgent: (loanId, agentId) => {
        const idx = stateCache.loans.findIndex(l => l.id === loanId);
        if (idx !== -1) {
            stateCache.loans[idx].agent_id = agentId;
            saveToDisk(STORAGE_KEYS.LOANS, stateCache.loans);
            const curUser = stateCache.currentUser;
            const agent = stateCache.users.find(u => u.id === agentId);
            logActivity(curUser ? curUser.id : 'system', 'LOAN_AGENT_ASSIGNED', {
                loanId,
                agent: agent ? agent.name : 'Unassigned'
            });
            notifyChange();
        }
    },
    updateStatus: (loanId, status) => {
        const idx = stateCache.loans.findIndex(l => l.id === loanId);
        if (idx !== -1) {
            stateCache.loans[idx].status = status;
            saveToDisk(STORAGE_KEYS.LOANS, stateCache.loans);
            notifyChange();
        }
    }
};

export const paymentService = {
    collect: (collectionData) => {
        const loanIdx = stateCache.loans.findIndex(l => l.id === collectionData.loan_id);
        if (loanIdx === -1) throw new Error('Loan not found.');

        const loan = stateCache.loans[loanIdx];
        const amount = parseFloat(collectionData.amount);

        if (loan.remaining_balance <= 0) throw new Error('Loan already paid.');

        const daysPaid = Math.min(loan.remaining_days, Math.round(amount / loan.daily_repayment));
        loan.remaining_balance = Math.max(0, loan.remaining_balance - amount);
        loan.remaining_days = Math.max(0, loan.remaining_days - daysPaid);

        if (loan.remaining_balance <= 0) {
            loan.status = 'completed';
            loan.closed_at = new Date().toISOString();
        }

        stateCache.loans[loanIdx] = loan;
        saveToDisk(STORAGE_KEYS.LOANS, stateCache.loans);

        const receiptNo = `REC${1000 + stateCache.payments.length + 1}`;
        const newPayment = {
            id: `p-${Date.now()}`,
            loan_id: loan.id,
            collected_by: collectionData.collected_by || 'direct-upi',
            amount,
            payment_date: new Date().toISOString().split('T')[0],
            payment_method: collectionData.payment_method || 'qr',
            transaction_ref: collectionData.transaction_ref || `TXN${Math.floor(1000000000 + Math.random() * 9000000000)}`,
            receipt_number: receiptNo,
            created_at: new Date().toISOString()
        };

        stateCache.payments.unshift(newPayment);
        saveToDisk(STORAGE_KEYS.PAYMENTS, stateCache.payments);

        const customer = stateCache.users.find(u => u.id === loan.customer_id);
        logActivity(collectionData.collected_by || 'system', 'PAYMENT_COLLECTED', {
            customer: customer ? customer.name : 'Unknown',
            amount,
            receiptNumber: receiptNo
        });
        notifyChange();
        return newPayment;
    }
};

export const analyticsService = {
    getDashboardMetrics: () => {
        const activeLoans = stateCache.loans.filter(l => l.status === 'active');
        const overdueLoans = stateCache.loans.filter(l => l.status === 'overdue');
        const customers = stateCache.users.filter(u => u.role === 'customer');
        const todayStr = new Date().toISOString().split('T')[0];

        const totalCollectedToday = stateCache.payments
            .filter(p => p.payment_date === todayStr)
            .reduce((sum, p) => sum + parseFloat(p.amount), 0);

        const loansPaidToday = new Set(
            stateCache.payments.filter(p => p.payment_date === todayStr).map(p => p.loan_id)
        );
        const pendingCollections = activeLoans
            .filter(l => !loansPaidToday.has(l.id))
            .reduce((sum, l) => sum + parseFloat(l.daily_repayment), 0);

        const totalProfit = stateCache.loans.reduce((sum, l) => sum + parseFloat(l.commission_amount), 0);

        return {
            totalCustomers: customers.length,
            activeLoans: activeLoans.length,
            totalCollectedToday,
            pendingCollections,
            totalProfit,
            overdueCustomers: overdueLoans.length
        };
    }
};
