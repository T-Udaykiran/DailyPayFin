// DailyPay Finance - Mobile Expo Main Application Entry
import React, { useState, useEffect } from 'react';
import { 
    StyleSheet, 
    Text, 
    View, 
    TextInput, 
    TouchableOpacity, 
    ScrollView, 
    Image, 
    Alert, 
    ActivityIndicator,
    Modal,
    SafeAreaView,
    StatusBar,
    Dimensions
} from 'react-native';
import { 
    User, 
    Wallet, 
    Phone, 
    Lock, 
    TrendingUp, 
    CheckCircle, 
    AlertTriangle, 
    QrCode, 
    FileText, 
    ArrowLeft, 
    LogOut, 
    Plus, 
    RefreshCw, 
    BarChart3,
    BookOpen,
    CircleDot
} from 'lucide-react-native';

// Hydrated store imports
import { 
    initializeDatabase, 
    db, 
    authService, 
    customerService, 
    loanService, 
    paymentService, 
    analyticsService, 
    subscribe 
} from './state';

export default function App() {
    const [currentRoute, setCurrentRoute] = useState('login');
    const [dbLoaded, setDbLoaded] = useState(false);
    const [loginPhone, setLoginPhone] = useState('');
    const [loginOtp, setLoginOtp] = useState(['', '', '', '', '', '']);
    const [otpSent, setOtpSent] = useState(false);
    const [activeTab, setActiveTab] = useState('home'); // home, customers, loans, reports
    
    // Form and modal hooks
    const [kycModalOpen, setKycModalOpen] = useState(false);
    const [quickCollectModalOpen, setQuickCollectModalOpen] = useState(false);
    const [addCustModalOpen, setAddCustModalOpen] = useState(false);
    
    // Recipient loan collection detail hooks
    const [selectedLoanId, setSelectedLoanId] = useState('');
    const [selectedCustomerName, setSelectedCustomerName] = useState('');
    const [collectAmount, setCollectAmount] = useState('');
    const [collectMethod, setCollectMethod] = useState('qr');
    const [collectRef, setCollectRef] = useState('');

    // Add Customer Form Hooks
    const [newCustName, setNewCustName] = useState('');
    const [newCustPhone, setNewCustPhone] = useState('');
    const [newCustAddress, setNewCustAddress] = useState('');
    const [newCustKyc, setNewCustKyc] = useState('approved');

    // Disbursal Loan form hooks
    const [selectedDisburseCust, setSelectedDisburseCust] = useState('');
    const [disburseAmount, setDisburseAmount] = useState('');
    const [disburseRate, setDisburseRate] = useState('10');
    const [disburseDuration, setDisburseDuration] = useState('100');
    const [assignedAgent, setAssignedAgent] = useState('');

    // Customer Payment screen hooks
    const [custPayAmount, setCustPayAmount] = useState('');
    const [custRzpModalOpen, setCustRzpModalOpen] = useState(false);
    const [custPayStep, setCustPayStep] = useState(1); // 1: Form, 2: Loading, 3: Success

    // State Hydration and subscription
    useEffect(() => {
        const init = async () => {
            await initializeDatabase();
            setDbLoaded(true);
            const user = db.getCurrentUser();
            if (user) {
                if (user.role === 'admin') setCurrentRoute('admin');
                else if (user.role === 'agent') setCurrentRoute('agent');
                else setCurrentRoute('customer');
            }
        };

        init();

        const unsubscribe = subscribe(() => {
            // Force component update on state change
            setDbLoaded(false);
            setTimeout(() => setDbLoaded(true), 50);
        });

        return () => unsubscribe();
    }, []);

    // Loader Screen
    if (!dbLoaded) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={styles.loadingText}>Loading DailyPay Database...</Text>
            </View>
        );
    }

    const currentUser = db.getCurrentUser();
    const metrics = analyticsService.getDashboardMetrics();
    const users = db.getUsers();
    const loans = db.getLoans();
    const payments = db.getPayments();

    // Verification handlers
    const handleSendOTP = () => {
        if (loginPhone.length !== 10) {
            Alert.alert('Validation Error', 'Please enter a 10-digit phone number.');
            return;
        }
        setOtpSent(true);
    };

    const handleVerifyOTP = () => {
        const pin = loginOtp.join('');
        if (pin.length !== 6) {
            Alert.alert('Validation Error', 'Please enter 6-digit OTP.');
            return;
        }

        try {
            const user = authService.login(loginPhone, pin);
            setLoginOtp(['', '', '', '', '', '']);
            setOtpSent(false);
            if (user.role === 'admin') {
                setCurrentRoute('admin');
                setActiveTab('home');
            } else if (user.role === 'agent') {
                setCurrentRoute('agent');
            } else {
                setCurrentRoute('customer');
            }
        } catch (err) {
            Alert.alert('Login Failed', err.message);
        }
    };

    const handleQuickLogin = (phone, role) => {
        setLoginPhone(phone);
        setOtpSent(true);
        setLoginOtp(['1', '2', '3', '4', '5', '6']);
        setTimeout(() => {
            try {
                const user = authService.login(phone, '123456');
                setLoginOtp(['', '', '', '', '', '']);
                setOtpSent(false);
                if (user.role === 'admin') {
                    setCurrentRoute('admin');
                    setActiveTab('home');
                } else if (user.role === 'agent') {
                    setCurrentRoute('agent');
                } else {
                    setCurrentRoute('customer');
                }
            } catch (err) {
                Alert.alert('Error', err.message);
            }
        }, 500);
    };

    const handleLogout = () => {
        authService.logout();
        setCurrentRoute('login');
    };

    // Admin Payment collection trigger
    const recordQuickCollection = () => {
        if (!collectAmount || isNaN(collectAmount)) {
            Alert.alert('Error', 'Please enter a valid amount.');
            return;
        }

        try {
            paymentService.collect({
                loan_id: selectedLoanId,
                amount: parseFloat(collectAmount),
                collected_by: currentUser.id,
                payment_method: collectMethod,
                transaction_ref: collectRef || undefined
            });

            Alert.alert('Collection Captured', 'Payment successfully recorded.');
            setQuickCollectModalOpen(false);
        } catch (err) {
            Alert.alert('Error', err.message);
        }
    };

    // Admin customer creator
    const registerCustomer = () => {
        if (!newCustName || !newCustPhone || !newCustAddress) {
            Alert.alert('Error', 'Please fill all mandatory fields.');
            return;
        }
        try {
            customerService.add({
                name: newCustName,
                phone: newCustPhone,
                address: newCustAddress,
                kyc_status: newCustKyc
            });
            Alert.alert('Success', `Customer ${newCustName} registered!`);
            setAddCustModalOpen(false);
            setNewCustName('');
            setNewCustPhone('');
            setNewCustAddress('');
        } catch (err) {
            Alert.alert('Error', err.message);
        }
    };

    // Admin Loan Creator
    const disburseLoan = () => {
        if (!selectedDisburseCust || !disburseAmount || !disburseRate || !disburseDuration) {
            Alert.alert('Error', 'Please complete the disbursal fields.');
            return;
        }
        try {
            loanService.add({
                customer_id: selectedDisburseCust,
                agent_id: assignedAgent || null,
                loan_amount: parseFloat(disburseAmount),
                commission_rate: parseFloat(disburseRate),
                duration_days: parseInt(disburseDuration)
            });
            Alert.alert('Success', 'Loan disbursed and logged!');
            setSelectedDisburseCust('');
            setDisburseAmount('');
            setAssignedAgent('');
        } catch (err) {
            Alert.alert('Error', err.message);
        }
    };

    // Customer payments triggers
    const triggerCustomerRazorpay = () => {
        if (!custPayAmount || isNaN(custPayAmount) || parseFloat(custPayAmount) <= 0) {
            Alert.alert('Error', 'Please enter a valid amount.');
            return;
        }
        setCustPayStep(1);
        setCustRzpModalOpen(true);
    };

    const processCustomerPayment = (loanId) => {
        setCustPayStep(2);
        setTimeout(() => {
            try {
                paymentService.collect({
                    loan_id: loanId,
                    amount: parseFloat(custPayAmount),
                    collected_by: 'direct-upi',
                    payment_method: 'qr'
                });
                setCustPayStep(3);
                setTimeout(() => {
                    setCustRzpModalOpen(false);
                    setCustPayAmount('');
                }, 2000);
            } catch (err) {
                Alert.alert('Error', err.message);
                setCustRzpModalOpen(false);
            }
        }, 2000);
    };

    const processQuickUPIPayment = (loanId) => {
        if (!custPayAmount || isNaN(custPayAmount) || parseFloat(custPayAmount) <= 0) {
            Alert.alert('Error', 'Please enter a valid amount.');
            return;
        }
        Alert.alert(
            'Confirm Pay',
            `Simulate UPI transfer of ₹${custPayAmount}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: () => {
                        try {
                            paymentService.collect({
                                loan_id: loanId,
                                amount: parseFloat(custPayAmount),
                                collected_by: 'direct-upi',
                                payment_method: 'qr'
                            });
                            Alert.alert('Success', 'Repayment recorded!');
                            setCustPayAmount('');
                        } catch (err) {
                            Alert.alert('Error', err.message);
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#07080d" />

            {/* ROUTE 1: Login Portal */}
            {currentRoute === 'login' && (
                <View style={styles.loginContainer}>
                    <ScrollView contentContainerStyle={styles.scrollCenter}>
                        <View style={styles.loginBox}>
                            <View style={styles.loginLogo}>
                                <Text style={styles.logoText}>₹</Text>
                            </View>
                            <Text style={styles.loginTitle}>DailyPay Finance</Text>
                            <Text style={styles.loginSubtitle}>Daily Micro-Loan Collection Manager</Text>

                            {!otpSent ? (
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Mobile Number</Text>
                                    <View style={styles.inputIconRow}>
                                        <Phone size={20} color="#94a3b8" style={styles.inputIcon} />
                                        <TextInput 
                                            style={styles.input} 
                                            placeholder="e.g. 9999999999" 
                                            placeholderTextColor="#5e6475"
                                            keyboardType="phone-pad"
                                            maxLength={10}
                                            value={loginPhone}
                                            onChangeText={setLoginPhone}
                                        />
                                    </View>
                                    <TouchableOpacity style={styles.btnPrimary} onPress={handleSendOTP}>
                                        <Text style={styles.btnText}>Get OTP Pin</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Enter 6-digit OTP code</Text>
                                    <View style={styles.otpRow}>
                                        {loginOtp.map((char, index) => (
                                            <TextInput 
                                                key={index}
                                                style={styles.otpInputCell}
                                                keyboardType="number-pad"
                                                maxLength={1}
                                                value={char}
                                                onChangeText={(val) => {
                                                    const nextPin = [...loginOtp];
                                                    nextPin[index] = val;
                                                    setLoginOtp(nextPin);
                                                }}
                                            />
                                        ))}
                                    </View>
                                    <TouchableOpacity style={styles.btnPrimary} onPress={handleVerifyOTP}>
                                        <Text style={styles.btnText}>Verify & Access</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.btnSecondary} onPress={() => setOtpSent(false)}>
                                        <Text style={styles.btnTextSec}>Edit Phone Number</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            <View style={styles.demoBorder}>
                                <Text style={styles.demoTitle}>Quick Test Login Profiles</Text>
                                <View style={styles.demoRow}>
                                    <TouchableOpacity style={styles.demoPill} onPress={() => handleQuickLogin('9999999999', 'admin')}>
                                        <Text style={styles.demoText}>Admin</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.demoPill} onPress={() => handleQuickLogin('8888888888', 'agent')}>
                                        <Text style={styles.demoText}>Agent</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.demoPill} onPress={() => handleQuickLogin('7777777777', 'customer')}>
                                        <Text style={styles.demoText}>Customer</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            )}

            {/* ROUTE 2: Admin View */}
            {currentRoute === 'admin' && (
                <View style={styles.mainWrapper}>
                    {/* Header */}
                    <View style={styles.appHeader}>
                        <Text style={styles.headerTitle}>DailyPay Admin</Text>
                        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                            <LogOut size={20} color="#f87171" />
                        </TouchableOpacity>
                    </View>

                    {/* Navigation Tabs */}
                    <View style={styles.tabHeader}>
                        <TouchableOpacity style={[styles.tabItem, activeTab === 'home' && styles.tabItemActive]} onPress={() => setActiveTab('home')}>
                            <Text style={[styles.tabText, activeTab === 'home' && styles.tabTextActive]}>Summary</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.tabItem, activeTab === 'customers' && styles.tabItemActive]} onPress={() => setActiveTab('customers')}>
                            <Text style={[styles.tabText, activeTab === 'customers' && styles.tabTextActive]}>Customers</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.tabItem, activeTab === 'loans' && styles.tabItemActive]} onPress={() => setActiveTab('loans')}>
                            <Text style={[styles.tabText, activeTab === 'loans' && styles.tabTextActive]}>Loans</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.tabItem, activeTab === 'reports' && styles.tabItemActive]} onPress={() => setActiveTab('reports')}>
                            <Text style={[styles.tabText, activeTab === 'reports' && styles.tabTextActive]}>Logs</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollBody}>
                        {/* Tab Content A: Summary */}
                        {activeTab === 'home' && (
                            <View style={styles.tabContent}>
                                {/* Grid Cards */}
                                <View style={styles.gridRow}>
                                    <View style={styles.metricCard}>
                                        <Text style={styles.metricLabel}>Collected Today</Text>
                                        <Text style={[styles.metricValue, {color: '#34d399'}]}>₹{metrics.totalCollectedToday.toLocaleString('en-IN')}</Text>
                                    </View>
                                    <View style={styles.metricCard}>
                                        <Text style={styles.metricLabel}>Pending Dues</Text>
                                        <Text style={[styles.metricValue, {color: '#fbbf24'}]}>₹{metrics.pendingCollections.toLocaleString('en-IN')}</Text>
                                    </View>
                                </View>
                                <View style={styles.gridRow}>
                                    <View style={styles.metricCard}>
                                        <Text style={styles.metricLabel}>Profit Earned</Text>
                                        <Text style={[styles.metricValue, {color: '#6366f1'}]}>₹{metrics.totalProfit.toLocaleString('en-IN')}</Text>
                                    </View>
                                    <View style={styles.metricCard}>
                                        <Text style={styles.metricLabel}>Overdue Loans</Text>
                                        <Text style={[styles.metricValue, {color: '#f87171'}]}>{metrics.overdueCustomers}</Text>
                                    </View>
                                </View>

                                {/* Overdue Alert list */}
                                <View style={styles.sectionBox}>
                                    <Text style={styles.secTitle}>Overdue Accounts Actions</Text>
                                    {loans.filter(l => l.status === 'overdue').map((loan, idx) => {
                                        const cust = users.find(u => u.id === loan.customer_id);
                                        return (
                                            <View key={idx} style={styles.overdueCardItem}>
                                                <View>
                                                    <Text style={styles.boldText}>{cust ? cust.name : 'Unknown'}</Text>
                                                    <Text style={styles.mutedText}>Daily Due: ₹{loan.daily_repayment}</Text>
                                                </View>
                                                <TouchableOpacity 
                                                    style={styles.actionBtnCollect}
                                                    onPress={() => {
                                                        setSelectedLoanId(loan.id);
                                                        setSelectedCustomerName(cust ? cust.name : 'Unknown');
                                                        setCollectAmount(loan.daily_repayment.toString());
                                                        setCollectRef('');
                                                        setQuickCollectModalOpen(true);
                                                    }}
                                                >
                                                    <Text style={styles.btnCollectText}>Collect</Text>
                                                </TouchableOpacity>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        )}

                        {/* Tab Content B: Customer list */}
                        {activeTab === 'customers' && (
                            <View style={styles.tabContent}>
                                <TouchableOpacity style={[styles.btnPrimary, {marginBottom: 16}]} onPress={() => setAddCustModalOpen(true)}>
                                    <Plus size={20} color="white" />
                                    <Text style={styles.btnText}>Register New Customer</Text>
                                </TouchableOpacity>

                                <Text style={styles.secTitle}>Active Customer Base</Text>
                                {users.filter(u => u.role === 'customer').map((cust, idx) => (
                                    <View key={idx} style={styles.customerRow}>
                                        <View>
                                            <Text style={styles.boldText}>{cust.name}</Text>
                                            <Text style={styles.mutedText}>+91 {cust.phone}</Text>
                                        </View>
                                        <View style={styles.flexRow}>
                                            <Text style={[styles.badgeText, cust.kyc_status === 'approved' ? styles.badgeGreen : styles.badgeYellow]}>
                                                KYC: {cust.kyc_status}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Tab Content C: Disburse Loan & calculator */}
                        {activeTab === 'loans' && (
                            <View style={styles.tabContent}>
                                <View style={styles.calcBox}>
                                    <Text style={styles.calcTitle}>Live Disbursal Calculator</Text>
                                    
                                    <Text style={styles.calcLabel}>Select Customer</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectRow}>
                                        {users.filter(u => u.role === 'customer').map((c, idx) => (
                                            <TouchableOpacity 
                                                key={idx} 
                                                style={[styles.selectPill, selectedDisburseCust === c.id && styles.selectPillActive]}
                                                onPress={() => setSelectedDisburseCust(c.id)}
                                            >
                                                <Text style={[styles.selectPillText, selectedDisburseCust === c.id && styles.selectPillTextActive]}>{c.name}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>

                                    <Text style={styles.calcLabel}>Loan Principal (₹)</Text>
                                    <TextInput 
                                        style={styles.calcInput}
                                        placeholder="e.g. 100000"
                                        placeholderTextColor="#5e6475"
                                        keyboardType="numeric"
                                        value={disburseAmount}
                                        onChangeText={setDisburseAmount}
                                    />

                                    <View style={styles.flexRowSpace}>
                                        <View style={{width: '48%'}}>
                                            <Text style={styles.calcLabel}>Commission Rate (%)</Text>
                                            <TextInput 
                                                style={styles.calcInput}
                                                value={disburseRate}
                                                keyboardType="numeric"
                                                onChangeText={setDisburseRate}
                                            />
                                        </View>
                                        <View style={{width: '48%'}}>
                                            <Text style={styles.calcLabel}>Duration (Days)</Text>
                                            <TextInput 
                                                style={styles.calcInput}
                                                value={disburseDuration}
                                                keyboardType="numeric"
                                                onChangeText={setDisburseDuration}
                                            />
                                        </View>
                                    </View>

                                    {/* Calculator visualizer */}
                                    <View style={styles.calcPreview}>
                                        <Text style={styles.calcPreviewText}>Net Disbursed: ₹{(parseFloat(disburseAmount) - (parseFloat(disburseAmount) * (parseFloat(disburseRate)/100)) || 0).toLocaleString('en-IN')}</Text>
                                        <Text style={styles.calcPreviewText}>Daily repayment: ₹{(parseFloat(disburseAmount) / parseFloat(disburseDuration) || 0).toLocaleString('en-IN')} / day</Text>
                                    </View>

                                    <TouchableOpacity style={styles.btnPrimary} onPress={disburseLoan}>
                                        <Text style={styles.btnText}>Disburse & Pay Out</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* Tab Content D: Audit logs */}
                        {activeTab === 'reports' && (
                            <View style={styles.tabContent}>
                                <Text style={styles.secTitle}>Audit Logs Feed</Text>
                                {db.getLogs().slice(0, 10).map((log, idx) => (
                                    <View key={idx} style={styles.logCard}>
                                        <Text style={styles.logAction}>{log.action.replace(/_/g, ' ')}</Text>
                                        <Text style={styles.logTime}>{new Date(log.created_at).toLocaleTimeString()}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </ScrollView>
                </View>
            )}

            {/* ROUTE 3: Collection Agent View */}
            {currentRoute === 'agent' && (
                <View style={styles.mainWrapper}>
                    <View style={styles.appHeader}>
                        <Text style={styles.headerTitle}>Collection Agent Portal</Text>
                        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                            <LogOut size={20} color="#f87171" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollBody}>
                        <View style={styles.tabContent}>
                            <Text style={styles.secTitle}>Assigned Dues Today</Text>
                            {loans.filter(l => l.agent_id === currentUser.id && l.status !== 'completed').map((loan, idx) => {
                                const cust = users.find(u => u.id === loan.customer_id);
                                return (
                                    <View key={idx} style={styles.agentTaskCard}>
                                        <View>
                                            <Text style={styles.boldText}>{cust ? cust.name : 'Unknown'}</Text>
                                            <Text style={styles.mutedText}>Due: ₹{loan.daily_repayment}</Text>
                                            <Text style={styles.mutedText}>Bal: ₹{loan.remaining_balance}</Text>
                                        </View>
                                        <TouchableOpacity 
                                            style={styles.actionBtnCollect}
                                            onPress={() => {
                                                setSelectedLoanId(loan.id);
                                                setSelectedCustomerName(cust ? cust.name : 'Unknown');
                                                setCollectAmount(loan.daily_repayment.toString());
                                                setCollectRef('');
                                                setQuickCollectModalOpen(true);
                                            }}
                                        >
                                            <Text style={styles.btnCollectText}>Collect</Text>
                                        </TouchableOpacity>
                                    </View>
                                );
                            })}
                        </View>
                    </ScrollView>
                </View>
            )}

            {/* ROUTE 4: Customer Portal View */}
            {currentRoute === 'customer' && (
                <View style={styles.mainWrapper}>
                    {/* Custom PhonePe/GPay Header */}
                    <View style={styles.appHeader}>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Image 
                                source={{uri: currentUser?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop'}} 
                                style={[styles.userAvatar, {width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: '#6366f1'}]}
                            />
                            <View style={{marginLeft: 10}}>
                                <Text style={[styles.boldText, {fontSize: 14}]}>{currentUser?.name}</Text>
                                <Text style={[styles.mutedText, {fontSize: 10, marginTop: 0}]}>+91 {currentUser?.phone}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                            <LogOut size={18} color="#f87171" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollBody}>
                        {(() => {
                            const activeLoan = loans.find(l => l.customer_id === currentUser.id && l.status !== 'completed');
                            if (!activeLoan) {
                                return (
                                    <View style={[styles.tabContent, styles.center, {padding: 40}]}>
                                        <AlertTriangle size={48} color="#94a3b8" />
                                        <Text style={[styles.boldText, {marginTop: 16, fontSize: 16}]}>No Active Loan Found</Text>
                                        <Text style={styles.mutedText}>Please contact support or admin to request a new loan.</Text>
                                    </View>
                                );
                            }

                            const paidToday = payments.some(p => p.loan_id === activeLoan.id && p.payment_date === new Date().toISOString().split('T')[0]);
                            const paidPct = Math.round(((activeLoan.loan_amount - activeLoan.remaining_balance) / activeLoan.loan_amount) * 100);

                            return (
                                <View style={styles.tabContent}>
                                    {/* Alert banner */}
                                    {paidToday ? (
                                        <View style={[styles.statusBox, styles.statusBoxSuccess, {borderColor: 'rgba(52, 211, 153, 0.2)', backgroundColor: 'rgba(52, 211, 153, 0.08)'}]}>
                                            <CheckCircle size={20} color="#34d399" />
                                            <Text style={[styles.statusBoxText, {color: '#e2e8f0'}]}>Installment Completed! Today's daily due has been settled.</Text>
                                        </View>
                                    ) : (
                                        <View style={[styles.statusBox, styles.statusBoxWarning, {borderColor: 'rgba(251, 191, 36, 0.2)', backgroundColor: 'rgba(251, 191, 36, 0.08)'}]}>
                                            <AlertTriangle size={20} color="#fbbf24" />
                                            <Text style={[styles.statusBoxText, {color: '#e2e8f0'}]}>Daily due: ₹{activeLoan.daily_repayment} is pending.</Text>
                                        </View>
                                    )}

                                    {/* GPay style Circular Quick Actions */}
                                    <View style={styles.actionGridContainer}>
                                        <TouchableOpacity style={styles.actionGridItem} onPress={() => Alert.alert('UPI Scanner', 'BharatPe Merchant QR Code scanner initialized.')}>
                                            <View style={[styles.actionCircle, {backgroundColor: 'rgba(99, 102, 241, 0.15)'}]}>
                                                <QrCode size={20} color="#818cf8" />
                                            </View>
                                            <Text style={styles.actionGridLabel}>Scan QR</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.actionGridItem} onPress={() => {
                                            if (activeLoan) setCustPayAmount(activeLoan.daily_repayment.toString());
                                        }}>
                                            <View style={[styles.actionCircle, {backgroundColor: 'rgba(139, 92, 246, 0.15)'}]}>
                                                <Wallet size={20} color="#a78bfa" />
                                            </View>
                                            <Text style={styles.actionGridLabel}>Repay Due</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.actionGridItem} onPress={() => Alert.alert('Account Details', 'Savings Account: HDFC Bank A/c ••••5102 (Active)')}>
                                            <View style={[styles.actionCircle, {backgroundColor: 'rgba(52, 211, 153, 0.15)'}]}>
                                                <BookOpen size={20} color="#34d399" />
                                            </View>
                                            <Text style={styles.actionGridLabel}>Passbook</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.actionGridItem} onPress={() => Alert.alert('Customer Support', 'Raising ticket... support agent will connect via WhatsApp.')}>
                                            <View style={[styles.actionCircle, {backgroundColor: 'rgba(248, 113, 113, 0.15)'}]}>
                                                <Phone size={20} color="#f87171" />
                                            </View>
                                            <Text style={styles.actionGridLabel}>Support</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* PhonePe Mock Bank Card */}
                                    <View style={styles.bankCard}>
                                        <View style={styles.bankCardHeader}>
                                            <Text style={styles.bankCardName}>HDFC BANK</Text>
                                            <View style={styles.bankStatusBadge}>
                                                <Text style={styles.bankStatusText}>✓ UPI ACTIVE</Text>
                                            </View>
                                        </View>
                                        <View style={styles.bankCardChip}></View>
                                        <Text style={styles.bankCardNumber}>•••• •••• •••• 5102</Text>
                                        <View style={styles.bankCardFooter}>
                                            <Text style={styles.bankCardHolder}>{currentUser.name}</Text>
                                            <Text style={styles.bankCardSecondary}>PRIMARY ACCOUNT</Text>
                                        </View>
                                    </View>

                                    {/* Repayment desk */}
                                    <View style={styles.calcBox}>
                                        <Text style={styles.calcTitle}>Daily Repayment Desk</Text>
                                        <Text style={styles.mutedText}>Modify amount if you want to pay multiple installments in advance:</Text>
                                        
                                        <TextInput 
                                            style={[styles.calcInput, {fontSize: 24, color: '#818cf8', fontWeight: 'bold', textAlign: 'center', marginVertical: 14, height: 50, backgroundColor: '#090a12'}]}
                                            keyboardType="numeric"
                                            value={custPayAmount}
                                            placeholder={`₹${activeLoan.daily_repayment}`}
                                            placeholderTextColor="#5e6475"
                                            onChangeText={setCustPayAmount}
                                        />
 
                                        <TouchableOpacity style={styles.btnPrimary} onPress={triggerCustomerRazorpay}>
                                            <Text style={styles.btnText}>Pay via Razorpay Gateway</Text>
                                        </TouchableOpacity>
 
                                        <TouchableOpacity 
                                            style={[styles.btnSecondary, {marginTop: 10}]}
                                            onPress={() => processQuickUPIPayment(activeLoan.id)}
                                        >
                                            <Text style={styles.btnTextSec}>Scan & Pay (Quick UPI)</Text>
                                        </TouchableOpacity>
                                    </View>
 
                                    {/* Loan summary */}
                                    <View style={[styles.sectionBox, {marginTop: 16}]}>
                                        <Text style={styles.secTitle}>Active Loan Summary</Text>
                                        
                                        {/* Progress bar */}
                                        <View style={styles.progressLabelRow}>
                                            <Text style={styles.boldText}>{paidPct}% Paid</Text>
                                            <Text style={styles.mutedText}>₹{(activeLoan.loan_amount - activeLoan.remaining_balance).toLocaleString('en-IN')} repaid</Text>
                                        </View>
                                        <View style={styles.progressBarBg}>
                                            <View style={[styles.progressBarFill, {width: `${paidPct}%`, backgroundColor: '#34d399'}]} />
                                        </View>
 
                                        <View style={styles.infoRow}>
                                            <Text style={styles.infoLabel}>Outstanding Balance:</Text>
                                            <Text style={[styles.infoValue, {color: '#f87171', fontSize: 14}]}>₹{activeLoan.remaining_balance.toLocaleString('en-IN')}</Text>
                                        </View>
                                        <View style={styles.infoRow}>
                                            <Text style={styles.infoLabel}>Daily repayment:</Text>
                                            <Text style={styles.infoValue}>₹{activeLoan.daily_repayment} / day</Text>
                                        </View>
                                        <View style={styles.infoRow}>
                                            <Text style={styles.infoLabel}>Tenure remaining:</Text>
                                            <Text style={[styles.infoValue, {color: '#fbbf24'}]}>{activeLoan.remaining_days} days left</Text>
                                        </View>
                                    </View>
 
                                    {/* Payment timeline statements list */}
                                    <Text style={styles.secTitle}>Recent Statements</Text>
                                    {payments.filter(p => p.loan_id === activeLoan.id).slice(0, 5).map((pay, idx) => (
                                        <View key={idx} style={styles.statementRowItem}>
                                            <View style={styles.statementAvatarCircle}>
                                                <Text style={styles.statementAvatarText}>₹</Text>
                                            </View>
                                            <View style={styles.statementDetailsBox}>
                                                <Text style={styles.boldText}>Installment Repayment</Text>
                                                <Text style={styles.mutedText}>{pay.payment_date} • Ref: {pay.transaction_ref.substring(0, 10)}</Text>
                                            </View>
                                            <View style={{alignItems: 'flex-end'}}>
                                                <Text style={[styles.boldText, {color: '#34d399'}]}>+₹{pay.amount}</Text>
                                                <Text style={[styles.badgeText, styles.badgeGreen, {fontSize: 8, marginTop: 4, paddingVertical: 1, paddingHorizontal: 4}]}>Success</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            );
                        })()}
                    </ScrollView>
                </View>
            )}

            {/* MODAL 1: Quick Payment collector drawer */}
            <Modal visible={quickCollectModalOpen} transparent animationType="slide">
                <View style={styles.modalBg}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeaderTitle}>Record Collection</Text>
                        <Text style={styles.mutedText}>Confirm payment details for {selectedCustomerName}:</Text>
                        
                        <Text style={styles.modalLabel}>Collection Amount (₹)</Text>
                        <TextInput 
                            style={styles.modalInput}
                            keyboardType="numeric"
                            value={collectAmount}
                            onChangeText={setCollectAmount}
                        />

                        <Text style={styles.modalLabel}>Payment Method</Text>
                        <View style={styles.modalSelectRow}>
                            <TouchableOpacity 
                                style={[styles.selectPill, collectMethod === 'qr' && styles.selectPillActive]}
                                onPress={() => setCollectMethod('qr')}
                            >
                                <Text style={[styles.selectPillText, collectMethod === 'qr' && styles.selectPillTextActive]}>UPI / QR</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.selectPill, collectMethod === 'cash' && styles.selectPillActive]}
                                onPress={() => setCollectMethod('cash')}
                            >
                                <Text style={[styles.selectPillText, collectMethod === 'cash' && styles.selectPillTextActive]}>Cash</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalLabel}>Ref Reference / Remark (Optional)</Text>
                        <TextInput 
                            style={styles.modalInput}
                            placeholder="e.g. TXN ID"
                            placeholderTextColor="#5e6475"
                            value={collectRef}
                            onChangeText={setCollectRef}
                        />

                        <TouchableOpacity style={styles.btnPrimary} onPress={recordQuickCollection}>
                            <Text style={styles.btnText}>Confirm Received</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.btnSecondary} onPress={() => setQuickCollectModalOpen(false)}>
                            <Text style={styles.btnTextSec}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* MODAL 2: Register Customer Form */}
            <Modal visible={addCustModalOpen} transparent animationType="slide">
                <View style={styles.modalBg}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeaderTitle}>Register Customer</Text>
                        
                        <Text style={styles.modalLabel}>Full Name</Text>
                        <TextInput 
                            style={styles.modalInput}
                            placeholder="Amit Sharma"
                            placeholderTextColor="#5e6475"
                            value={newCustName}
                            onChangeText={setNewCustName}
                        />

                        <Text style={styles.modalLabel}>Mobile Number</Text>
                        <TextInput 
                            style={styles.modalInput}
                            placeholder="7777777777"
                            placeholderTextColor="#5e6475"
                            keyboardType="phone-pad"
                            maxLength={10}
                            value={newCustPhone}
                            onChangeText={setNewCustPhone}
                        />

                        <Text style={styles.modalLabel}>Address Details</Text>
                        <TextInput 
                            style={[styles.modalInput, {height: 60}]}
                            placeholder="Enter home/shop address"
                            placeholderTextColor="#5e6475"
                            multiline
                            value={newCustAddress}
                            onChangeText={setNewCustAddress}
                        />

                        <Text style={styles.modalLabel}>KYC Status</Text>
                        <View style={styles.modalSelectRow}>
                            <TouchableOpacity 
                                style={[styles.selectPill, newCustKyc === 'approved' && styles.selectPillActive]}
                                onPress={() => setNewCustKyc('approved')}
                            >
                                <Text style={[styles.selectPillText, newCustKyc === 'approved' && styles.selectPillTextActive]}>Approved</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.selectPill, newCustKyc === 'pending' && styles.selectPillActive]}
                                onPress={() => setNewCustKyc('pending')}
                            >
                                <Text style={[styles.selectPillText, newCustKyc === 'pending' && styles.selectPillTextActive]}>Pending</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.btnPrimary} onPress={registerCustomer}>
                            <Text style={styles.btnText}>Register Customer</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.btnSecondary} onPress={() => setAddCustModalOpen(false)}>
                            <Text style={styles.btnTextSec}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* MODAL 3: Customer Razorpay simulator popup */}
            <Modal visible={custRzpModalOpen} transparent animationType="slide">
                <View style={styles.modalBg}>
                    {(() => {
                        const activeLoan = loans.find(l => l.customer_id === currentUser?.id && l.status !== 'completed');
                        if (!activeLoan) return null;

                        return (
                            <View style={[styles.modalContent, {backgroundColor: '#ffffff'}]}>
                                {/* Header */}
                                <View style={styles.rzpHeader}>
                                    <View>
                                        <Text style={styles.rzpHeaderSub}>Payment to</Text>
                                        <Text style={styles.rzpHeaderTitle}>DailyPay Finance</Text>
                                    </View>
                                    <Text style={styles.rzpLogoText}>Razorpay</Text>
                                </View>

                                {/* Step 1: Confirm Details */}
                                {custPayStep === 1 && (
                                    <View style={styles.rzpBody}>
                                        <Text style={styles.rzpLabel}>repayment due</Text>
                                        <Text style={styles.rzpAmount}>₹{parseFloat(custPayAmount).toLocaleString('en-IN')}</Text>

                                        <View style={styles.rzpPillBox}>
                                            <Text style={styles.rzpPillTitle}>Preferred Pay Mode</Text>
                                            <Text style={styles.rzpPillText}>UPI (GPay / PhonePe / Paytm)</Text>
                                        </View>

                                        <TouchableOpacity 
                                            style={styles.rzpBtnPay} 
                                            onPress={() => processCustomerPayment(activeLoan.id)}
                                        >
                                            <Text style={styles.rzpBtnText}>Pay ₹{parseFloat(custPayAmount).toLocaleString('en-IN')}</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity 
                                            style={styles.rzpBtnCancel} 
                                            onPress={() => setCustRzpModalOpen(false)}
                                        >
                                            <Text style={styles.rzpBtnCancelText}>Cancel Payment</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {/* Step 2: Loading State */}
                                {custPayStep === 2 && (
                                    <View style={[styles.rzpBody, styles.center, {padding: 40}]}>
                                        <ActivityIndicator size="large" color="#0f52ba" />
                                        <Text style={styles.rzpLoadingText}>Securing payment connection...</Text>
                                        <Text style={styles.rzpLoadingSub}>Please do not close or exit the app.</Text>
                                    </View>
                                )}

                                {/* Step 3: Success Screen */}
                                {custPayStep === 3 && (
                                    <View style={[styles.rzpBody, styles.center, {padding: 40}]}>
                                        <CheckCircle size={48} color="#10b981" />
                                        <Text style={styles.rzpSuccessTitle}>Payment Successful!</Text>
                                        <Text style={styles.rzpSuccessSub}>Your collection receipt has been logged.</Text>
                                    </View>
                                )}
                            </View>
                        );
                    })()}
                </View>
            </Modal>
        </SafeAreaView>
    );
}

// React Native Layout stylesheets (Indigo dark theme standard)
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#07080d',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#94a3b8',
        marginTop: 14,
        fontFamily: 'System',
        fontWeight: '600',
    },
    // Login Screen styles
    loginContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    scrollCenter: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    loginBox: {
        backgroundColor: '#131627',
        borderWidth: 1,
        borderColor: '#1e233d',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    loginLogo: {
        width: 56,
        height: 56,
        backgroundColor: '#6366f1',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 16,
    },
    logoText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
    },
    loginTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginBottom: 6,
    },
    loginSubtitle: {
        fontSize: 13,
        color: '#94a3b8',
        textAlign: 'center',
        marginBottom: 24,
    },
    formGroup: {
        width: '100%',
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 6,
    },
    inputIconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#090a12',
        borderWidth: 1.5,
        borderColor: '#1e233d',
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 16,
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        height: 48,
        color: 'white',
        fontSize: 15,
    },
    btnPrimary: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#6366f1',
        height: 48,
        borderRadius: 12,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    btnText: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold',
    },
    btnSecondary: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#1e233d',
        height: 48,
        borderRadius: 12,
        marginTop: 10,
    },
    btnTextSec: {
        color: '#94a3b8',
        fontSize: 14,
        fontWeight: '600',
    },
    otpRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    otpInputCell: {
        width: '14%',
        height: 48,
        backgroundColor: '#090a12',
        borderWidth: 1.5,
        borderColor: '#1e233d',
        borderRadius: 8,
        textAlign: 'center',
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    demoBorder: {
        marginTop: 24,
        paddingTop: 18,
        borderTopWidth: 1,
        borderTopColor: '#1e233d',
        borderStyle: 'dashed',
    },
    demoTitle: {
        fontSize: 10,
        fontWeight: '700',
        color: '#5e6475',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 10,
        textAlign: 'center',
    },
    demoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    demoPill: {
        backgroundColor: '#090a12',
        borderWidth: 1,
        borderColor: '#1e233d',
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    demoText: {
        color: '#94a3b8',
        fontSize: 11,
        fontWeight: '600',
    },

    // Main App styles
    mainWrapper: {
        flex: 1,
        backgroundColor: '#07080d',
    },
    appHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 14,
        backgroundColor: '#0d0f1a',
        borderBottomWidth: 1,
        borderBottomColor: '#1e233d',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        letterSpacing: -0.3,
    },
    logoutBtn: {
        padding: 6,
    },
    tabHeader: {
        flexDirection: 'row',
        backgroundColor: '#0d0f1a',
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#1e233d',
    },
    tabItem: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    tabItemActive: {
        borderBottomWidth: 2,
        borderBottomColor: '#6366f1',
    },
    tabText: {
        color: '#94a3b8',
        fontSize: 13,
        fontWeight: '600',
    },
    tabTextActive: {
        color: '#6366f1',
    },
    scrollBody: {
        flex: 1,
    },
    tabContent: {
        padding: 16,
    },
    gridRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    metricCard: {
        width: '48%',
        backgroundColor: '#131627',
        borderWidth: 1,
        borderColor: '#1e233d',
        borderRadius: 16,
        padding: 16,
    },
    metricLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    metricValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 6,
    },
    secTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: 'white',
        marginVertical: 12,
        letterSpacing: -0.2,
    },
    sectionBox: {
        backgroundColor: '#131627',
        borderWidth: 1,
        borderColor: '#1e233d',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    boldText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    mutedText: {
        color: '#94a3b8',
        fontSize: 12,
        marginTop: 2,
    },
    overdueCardItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#1e233d',
    },
    actionBtnCollect: {
        backgroundColor: '#6366f1',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    btnCollectText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    customerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#131627',
        borderWidth: 1,
        borderColor: '#1e233d',
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
    },
    flexRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    flexRowSpace: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 10,
        overflow: 'hidden',
        textTransform: 'uppercase',
    },
    badgeGreen: {
        backgroundColor: 'rgba(52, 211, 153, 0.15)',
        color: '#34d399',
    },
    badgeYellow: {
        backgroundColor: 'rgba(251, 191, 36, 0.15)',
        color: '#fbbf24',
    },

    // Calc box
    calcBox: {
        backgroundColor: '#131627',
        borderWidth: 1,
        borderColor: '#1e233d',
        borderRadius: 16,
        padding: 18,
    },
    calcTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    calcLabel: {
        color: '#94a3b8',
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginTop: 10,
        marginBottom: 6,
    },
    calcInput: {
        backgroundColor: '#090a12',
        borderWidth: 1,
        borderColor: '#1e233d',
        borderRadius: 10,
        height: 44,
        color: 'white',
        paddingHorizontal: 12,
        fontSize: 14,
        marginBottom: 10,
    },
    selectRow: {
        marginVertical: 4,
    },
    selectPill: {
        backgroundColor: '#090a12',
        borderWidth: 1,
        borderColor: '#1e233d',
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginRight: 8,
    },
    selectPillActive: {
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
    },
    selectPillText: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: '600',
    },
    selectPillTextActive: {
        color: '#6366f1',
    },
    calcPreview: {
        backgroundColor: '#090a12',
        borderRadius: 10,
        padding: 12,
        marginVertical: 12,
    },
    calcPreviewText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        lineHeight: 18,
    },
    logCard: {
        backgroundColor: '#131627',
        borderWidth: 1,
        borderColor: '#1e233d',
        borderRadius: 10,
        padding: 12,
        marginBottom: 8,
    },
    logAction: {
        color: 'white',
        fontWeight: '600',
        fontSize: 13,
    },
    logTime: {
        color: '#5e6475',
        fontSize: 10,
        marginTop: 4,
    },

    // Agent styles
    agentTaskCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#131627',
        borderWidth: 1,
        borderColor: '#1e233d',
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
    },

    // Customer styles
    statusBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 16,
    },
    statusBoxSuccess: {
        backgroundColor: 'rgba(52, 211, 153, 0.08)',
        borderColor: 'rgba(52, 211, 153, 0.2)',
    },
    statusBoxWarning: {
        backgroundColor: 'rgba(251, 191, 36, 0.08)',
        borderColor: 'rgba(251, 191, 36, 0.2)',
    },
    statusBoxText: {
        color: 'white',
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 10,
        flex: 1,
    },
    progressLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: '#090a12',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 14,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#6366f1',
        borderRadius: 4,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#1e233d',
    },
    infoLabel: {
        color: '#94a3b8',
        fontSize: 13,
    },
    infoValue: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 13,
    },
    paymentTimelineItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#131627',
        borderWidth: 1,
        borderColor: '#1e233d',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
    },

    // Modal Drawer styles
    modalBg: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#131627',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '90%',
    },
    modalHeaderTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    modalLabel: {
        color: '#94a3b8',
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginTop: 12,
        marginBottom: 6,
    },
    modalInput: {
        backgroundColor: '#090a12',
        borderWidth: 1,
        borderColor: '#1e233d',
        borderRadius: 10,
        height: 44,
        color: 'white',
        paddingHorizontal: 12,
        fontSize: 14,
    },
    modalSelectRow: {
        flexDirection: 'row',
        marginVertical: 4,
    },

    // Razorpay mock styling
    rzpHeader: {
        backgroundColor: '#0f52ba',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    rzpHeaderSub: {
        color: '#ffffff',
        fontSize: 10,
        opacity: 0.8,
        textTransform: 'uppercase',
    },
    rzpHeaderTitle: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    rzpLogoText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        fontStyle: 'italic',
    },
    rzpBody: {
        backgroundColor: '#f8fafc',
        padding: 20,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
    },
    rzpLabel: {
        color: '#64748b',
        fontSize: 10,
        textTransform: 'uppercase',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    rzpAmount: {
        color: '#0f52ba',
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 10,
    },
    rzpPillBox: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 8,
        padding: 12,
        marginVertical: 14,
    },
    rzpPillTitle: {
        fontSize: 10,
        color: '#64748b',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    rzpPillText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    rzpBtnPay: {
        backgroundColor: '#10b981',
        height: 48,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 3,
    },
    rzpBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 15,
    },
    rzpBtnCancel: {
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 6,
    },
    rzpBtnCancelText: {
        color: '#64748b',
        fontWeight: '600',
        fontSize: 13,
    },
    rzpLoadingText: {
        color: '#0f172a',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 16,
    },
    rzpLoadingSub: {
        color: '#64748b',
        fontSize: 12,
        marginTop: 6,
        textAlign: 'center',
    },
    rzpSuccessTitle: {
        color: '#065f46',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
    },
    rzpSuccessSub: {
        color: '#64748b',
        fontSize: 13,
        marginTop: 6,
        textAlign: 'center',
    },
    
    // GPay / PhonePe style Mobile UI components styling
    actionGridContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#131627',
        borderWidth: 1,
        borderColor: '#1e233d',
        borderRadius: 16,
        padding: 14,
        marginBottom: 16,
    },
    actionGridItem: {
        alignItems: 'center',
        width: '23%',
    },
    actionCircle: {
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    actionGridLabel: {
        color: '#94a3b8',
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    bankCard: {
        backgroundColor: '#16143c',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    bankCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    bankCardName: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 13,
        letterSpacing: 0.5,
    },
    bankStatusBadge: {
        backgroundColor: 'rgba(52, 211, 153, 0.15)',
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 10,
    },
    bankStatusText: {
        color: '#34d399',
        fontSize: 8,
        fontWeight: 'bold',
    },
    bankCardChip: {
        width: 24,
        height: 18,
        backgroundColor: '#e0a910',
        borderRadius: 3,
        marginBottom: 8,
    },
    bankCardNumber: {
        color: 'white',
        fontSize: 15,
        letterSpacing: 2,
        fontFamily: 'System',
        fontWeight: '600',
        marginBottom: 10,
    },
    bankCardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bankCardHolder: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 9,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    bankCardSecondary: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 8,
        fontWeight: '600',
    },
    statementRowItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#131627',
        borderWidth: 1,
        borderColor: '#1e233d',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
    },
    statementAvatarCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(99,102,241,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statementAvatarText: {
        color: '#818cf8',
        fontWeight: 'bold',
        fontSize: 15,
    },
    statementDetailsBox: {
        flex: 1,
        marginLeft: 10,
    },
    userAvatar: {
        backgroundColor: '#1e233d',
    }
});
