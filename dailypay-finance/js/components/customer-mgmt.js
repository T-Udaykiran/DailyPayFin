// DailyPay Finance - Customer Management Component

window.renderCustomerManagement = function() {
    const users = db.getUsers();
    const customers = users.filter(u => u.role === 'customer');

    let customerRowsHTML = '';
    let customerCardsHTML = '';
    if (customers.length === 0) {
        customerRowsHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px;">
                    <div class="empty-state">
                        <i data-lucide="users"></i>
                        <h3 class="empty-state-title">No Customers Found</h3>
                        <p class="empty-state-desc">Click "Add Customer" to register a new client.</p>
                    </div>
                </td>
            </tr>
        `;
        customerCardsHTML = `
            <div class="empty-state" style="padding: 40px 0;">
                <i data-lucide="users"></i>
                <h3 class="empty-state-title">No Customers Found</h3>
                <p class="empty-state-desc">Click "Add Customer" to register a new client.</p>
            </div>
        `;
    } else {
        customers.forEach(cust => {
            const badgeClass = cust.kyc_status === 'approved' ? 'badge-success' 
                             : cust.kyc_status === 'pending' ? 'badge-warning' 
                             : 'badge-error';
            
            // Desktop Row
            customerRowsHTML += `
                <tr class="customer-row-item" data-id="${cust.id}" data-name="${cust.name.toLowerCase()}" data-phone="${cust.phone}">
                    <td>
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <img src="${cust.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop'}" alt="${cust.name}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;">
                            <div style="display: flex; flex-direction: column;">
                                <span style="font-weight: 600;">${cust.name}</span>
                                <span style="font-size: 0.75rem; color: var(--text-muted);">${cust.address.substring(0, 30)}...</span>
                            </div>
                        </div>
                    </td>
                    <td>+91 ${cust.phone}</td>
                    <td>
                        <span class="badge ${badgeClass}">${cust.kyc_status}</span>
                    </td>
                    <td>
                        <span style="font-size:0.85rem;">${new Date(cust.created_at).toLocaleDateString('en-IN')}</span>
                    </td>
                    <td>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn-outline btn-sm kyc-toggle-btn" data-id="${cust.id}" data-status="${cust.kyc_status === 'approved' ? 'pending' : 'approved'}">
                                Toggle KYC
                            </button>
                            <button class="btn btn-primary btn-sm create-loan-btn" data-id="${cust.id}">
                                Disburse
                            </button>
                        </div>
                    </td>
                </tr>
            `;

            // Mobile Card
            customerCardsHTML += `
                <div class="customer-mobile-card customer-row-item" data-id="${cust.id}" data-name="${cust.name.toLowerCase()}" data-phone="${cust.phone}">
                    <div class="card-header-row">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <img src="${cust.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop'}" alt="${cust.name}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">
                            <span style="font-weight: 600; font-size: 0.95rem;">${cust.name}</span>
                        </div>
                        <span class="badge ${badgeClass}">${cust.kyc_status}</span>
                    </div>
                    <div class="card-content-grid">
                        <div class="card-item">
                            <span class="card-item-label">Mobile</span>
                            <span class="card-item-value">+91 ${cust.phone}</span>
                        </div>
                        <div class="card-item">
                            <span class="card-item-label">Join Date</span>
                            <span class="card-item-value">${new Date(cust.created_at).toLocaleDateString('en-IN')}</span>
                        </div>
                    </div>
                    <div class="card-item" style="border-top: 1px dashed var(--border-color); padding-top: 8px;">
                        <span class="card-item-label">Address</span>
                        <span class="card-item-value" style="font-size: 0.8rem; font-weight: normal; color: var(--text-secondary);">${cust.address}</span>
                    </div>
                    <div class="card-action-row">
                        <button class="btn btn-outline btn-sm kyc-toggle-btn" data-id="${cust.id}" data-status="${cust.kyc_status === 'approved' ? 'pending' : 'approved'}">
                            Toggle KYC
                        </button>
                        <button class="btn btn-primary btn-sm create-loan-btn" data-id="${cust.id}">
                            Disburse
                        </button>
                    </div>
                </div>
            `;
        } );
    }

    return `
        <div class="page-header">
            <h1 class="page-title">Customer Management</h1>
            <button class="btn btn-primary btn-sm" id="add-customer-trigger-btn">
                <i data-lucide="plus"></i> Add Customer
            </button>
        </div>

        <div class="content-box">
            <!-- Search & Filters -->
            <div class="search-filter-row">
                <div class="search-wrapper">
                    <i data-lucide="search"></i>
                    <input type="text" id="cust-search" class="form-control search-input" placeholder="Search by name, phone, etc.">
                </div>
            </div>

            <!-- Table View (Desktop only) -->
            <div class="table-responsive desktop-only">
                <table class="fintech-table">
                    <thead>
                        <tr>
                            <th>Customer Name</th>
                            <th>Mobile Number</th>
                            <th>KYC Status</th>
                            <th>Join Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="customer-table-body">
                        ${customerRowsHTML}
                    </tbody>
                </table>
            </div>

            <!-- Cards View (Mobile only) -->
            <div class="mobile-only" id="customer-cards-container" style="padding-bottom: 60px;">
                ${customerCardsHTML}
            </div>
        </div>

        <!-- Floating Add Button for Mobile -->
        <button class="fab" id="add-customer-fab">
            <i data-lucide="plus"></i>
        </button>

        <!-- Add Customer Modal -->
        <div class="modal-overlay" id="add-customer-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Register New Customer</h3>
                    <button class="modal-close" id="add-customer-close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="add-customer-form">
                        <!-- Profile Photo Picker -->
                        <div class="form-group">
                            <label class="form-label">Profile Photo</label>
                            <div class="avatar-upload-container">
                                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop" id="avatar-preview" class="avatar-preview-img">
                                <div class="avatar-upload-text">Upload Profile Photo</div>
                                <div class="avatar-upload-subtext">JPG, PNG up to 2MB</div>
                                <input type="file" id="avatar-input" class="avatar-file-input" accept="image/*">
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="cust-name">Full Name</label>
                            <input type="text" id="cust-name" class="form-control" placeholder="e.g. Amit Sharma" required>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="cust-phone">Mobile Number</label>
                            <input type="tel" id="cust-phone" class="form-control" placeholder="e.g. 7777777777" maxlength="10" required>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="cust-address">Address Details</label>
                            <textarea id="cust-address" class="form-control" placeholder="Enter complete home or work address" rows="3" required></textarea>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label" for="cust-kyc">KYC Status</label>
                                <select id="cust-kyc" class="form-control">
                                    <option value="approved">Approved</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="id-proof-input">ID Proof Document</label>
                                <input type="file" id="id-proof-input" class="form-control" style="padding: 8px;" accept=".jpg,.png,.pdf">
                            </div>
                        </div>

                        <button type="submit" class="btn btn-primary btn-block" style="margin-top: 12px;">Register Customer</button>
                    </form>
                </div>
            </div>
        </div>
    `;
}

// Page Specific Event binding
window.init_customers = function() {
    const searchInput = document.getElementById('cust-search');
    const rows = document.querySelectorAll('.customer-row-item');
    const overlay = document.getElementById('add-customer-overlay');
    const closeBtn = document.getElementById('add-customer-close-btn');
    const triggerBtn = document.getElementById('add-customer-trigger-btn');
    const fabBtn = document.getElementById('add-customer-fab');
    const form = document.getElementById('add-customer-form');
    const avatarInput = document.getElementById('avatar-input');
    const avatarPreview = document.getElementById('avatar-preview');
    
    let uploadedAvatarBase64 = '';

    // Search Filtering logic
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            const query = e.target.value.toLowerCase().trim();
            rows.forEach(row => {
                const name = row.getAttribute('data-name');
                const phone = row.getAttribute('data-phone');
                if (name.includes(query) || phone.includes(query)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }

    // Modal display toggles
    const openModal = () => {
        form.reset();
        avatarPreview.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop';
        uploadedAvatarBase64 = '';
        overlay.classList.add('active');
    };

    if (triggerBtn) triggerBtn.addEventListener('click', openModal);
    if (fabBtn) fabBtn.addEventListener('click', openModal);
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            overlay.classList.remove('active');
        });
    }

    // Base64 file reader for avatar upload
    if (avatarInput) {
        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    avatarPreview.src = event.target.result;
                    uploadedAvatarBase64 = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Form submission
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('cust-name').value.trim();
            const phone = document.getElementById('cust-phone').value.trim();
            const address = document.getElementById('cust-address').value.trim();
            const kycStatus = document.getElementById('cust-kyc').value;

            if (phone.length !== 10 || isNaN(phone)) {
                alert('Please enter a valid 10-digit mobile number.');
                return;
            }

            try {
                const newCust = customerService.add({
                    name,
                    phone,
                    address,
                    kyc_status: kycStatus,
                    avatar_url: uploadedAvatarBase64 || undefined
                });

                overlay.classList.remove('active');
                alert(`Customer ${name} registered successfully!`);
                
                // Prompt user to immediately create a loan
                const proceedToLoan = confirm('Would you like to disburse a loan to this customer immediately?');
                if (proceedToLoan) {
                    navigateTo(`/loans?customer_id=${newCust.id}`);
                } else {
                    navigateTo('/customers');
                }
            } catch (err) {
                alert(`Error: ${err.message}`);
            }
        });
    }

    // KYC Toggle Button Handler
    const kycBtns = document.querySelectorAll('.kyc-toggle-btn');
    kycBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            const targetStatus = btn.getAttribute('data-status');
            
            customerService.updateKYC(id, targetStatus);
            alert(`KYC status updated to ${targetStatus}!`);
            navigateTo('/customers');
        });
    });

    // Create Loan disburse shortcut
    const createLoanBtns = document.querySelectorAll('.create-loan-btn');
    createLoanBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            navigateTo(`/loans?customer_id=${id}`);
        });
    });
};
