-- PostgreSQL Database Schema for DailyPay Finance
-- Designed for Supabase compatibility

-- 1. Create Enums
CREATE TYPE user_role AS ENUM ('admin', 'agent', 'customer');
CREATE TYPE kyc_status_type AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE loan_status_type AS ENUM ('active', 'completed', 'overdue');
CREATE TYPE payment_method_type AS ENUM ('upi', 'cash', 'qr');

-- 2. Create Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    role user_role DEFAULT 'customer',
    avatar_url TEXT,
    kyc_status kyc_status_type DEFAULT 'pending',
    address TEXT,
    id_proof_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Loans Table
CREATE TABLE loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
    loan_amount NUMERIC(12, 2) NOT NULL,
    commission_rate NUMERIC(5, 2) DEFAULT 10.00, -- e.g., 10%
    commission_amount NUMERIC(12, 2) NOT NULL, -- e.g., 10,000 for 1,00,000 loan
    disbursed_amount NUMERIC(12, 2) NOT NULL, -- e.g., 90,000
    daily_repayment NUMERIC(12, 2) NOT NULL, -- e.g., 100
    duration_days INT NOT NULL DEFAULT 1000,
    remaining_balance NUMERIC(12, 2) NOT NULL,
    remaining_days INT NOT NULL,
    status loan_status_type DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE
);

-- 4. Create Payments Table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,
    collected_by UUID REFERENCES users(id) ON DELETE SET NULL, -- agent or admin
    amount NUMERIC(12, 2) NOT NULL,
    payment_date DATE DEFAULT CURRENT_DATE,
    payment_method payment_method_type DEFAULT 'qr',
    transaction_ref TEXT UNIQUE,
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Activity Logs Table
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Indices for Optimization
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_loans_customer_id ON loans(customer_id);
CREATE INDEX idx_loans_agent_id ON loans(agent_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_payments_loan_id ON payments(loan_id);
CREATE INDEX idx_payments_collected_by ON payments(collected_by);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);

-- 7. Seed Data Example
-- Admin: Name: Raj Patel, Phone: 9999999999
-- Agent: Name: Suresh Kumar, Phone: 8888888888
-- Customer: Name: Amit Sharma, Phone: 7777777777
