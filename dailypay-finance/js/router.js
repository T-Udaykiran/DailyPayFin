// DailyPay Finance - Client-Side Hash Router

// Route Registry
const ROUTES = {
    'login': { render: renderLogin, roles: null },
    'dashboard': { render: renderAdminDashboard, roles: ['admin'] },
    'customers': { render: renderCustomerManagement, roles: ['admin'] },
    'loans': { render: renderLoanManagement, roles: ['admin'] },
    'agent-dashboard': { render: renderAgentDashboard, roles: ['agent'] },
    'customer-dashboard': { render: renderCustomerDashboard, roles: ['customer'] },
    'reports': { render: renderReports, roles: ['admin'] }
};

// Global navigation API
window.navigateTo = function(routeHash) {
    window.location.hash = routeHash;
}

// Global Theme Handler
window.initTheme = function() {
    const savedTheme = localStorage.getItem('dp_theme') || 'dark';
    setTheme(savedTheme);
}

window.setTheme = function(themeName) {
    const body = document.body;
    if (themeName === 'light') {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
    } else {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
    }
    localStorage.setItem('dp_theme', themeName);
}

// Generate the layout wrapper with sidebar, mobile header, and bottom nav tabs
function createLayout(currentUser, pageContentHTML) {
    const role = currentUser.role;
    const name = currentUser.name;
    const avatar = currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop';
    
    // Check theme to initialize toggle button state
    const currentTheme = localStorage.getItem('dp_theme') || 'dark';
    const isDark = currentTheme === 'dark';

    // Sidebar items based on role
    let sidebarNavHTML = '';
    let mobileNavHTML = '';

    if (role === 'admin') {
        sidebarNavHTML = `
            <a href="#/dashboard" class="nav-item ${getActiveClass('dashboard')}">
                <i data-lucide="layout-dashboard"></i> Dashboard
            </a>
            <a href="#/customers" class="nav-item ${getActiveClass('customers')}">
                <i data-lucide="users"></i> Customers
            </a>
            <a href="#/loans" class="nav-item ${getActiveClass('loans')}">
                <i data-lucide="wallet"></i> Loans
            </a>
            <a href="#/reports" class="nav-item ${getActiveClass('reports')}">
                <i data-lucide="trending-up"></i> Reports
            </a>
        `;
        mobileNavHTML = `
            <a href="#/dashboard" class="mobile-nav-item ${getActiveClass('dashboard')}">
                <i data-lucide="layout-dashboard"></i><span>Home</span>
            </a>
            <a href="#/customers" class="mobile-nav-item ${getActiveClass('customers')}">
                <i data-lucide="users"></i><span>Users</span>
            </a>
            <a href="#/loans" class="mobile-nav-item ${getActiveClass('loans')}">
                <i data-lucide="wallet"></i><span>Loans</span>
            </a>
            <a href="#/reports" class="mobile-nav-item ${getActiveClass('reports')}">
                <i data-lucide="trending-up"></i><span>Reports</span>
            </a>
        `;
    } else if (role === 'agent') {
        sidebarNavHTML = `
            <a href="#/agent-dashboard" class="nav-item ${getActiveClass('agent-dashboard')}">
                <i data-lucide="list-todo"></i> Assigned List
            </a>
        `;
        mobileNavHTML = `
            <a href="#/agent-dashboard" class="mobile-nav-item ${getActiveClass('agent-dashboard')}">
                <i data-lucide="list-todo"></i><span>Collections</span>
            </a>
        `;
    } else if (role === 'customer') {
        sidebarNavHTML = `
            <a href="#/customer-dashboard" class="nav-item ${getActiveClass('customer-dashboard')}">
                <i data-lucide="receipt"></i> My Loan
            </a>
        `;
        mobileNavHTML = `
            <a href="#/customer-dashboard" class="mobile-nav-item ${getActiveClass('customer-dashboard')}">
                <i data-lucide="receipt"></i><span>My Loan</span>
            </a>
        `;
    }

    return `
        <div class="app-container">
            <!-- Mobile Header Bar -->
            <header class="app-header">
                <div class="brand-title">DailyPay Finance</div>
                <div class="header-actions">
                    <button class="theme-toggle" id="theme-toggle-mobile" title="Toggle Theme">
                        <i data-lucide="${isDark ? 'sun' : 'moon'}"></i>
                    </button>
                    <button class="btn-icon" id="logout-btn-mobile" title="Logout">
                        <i data-lucide="log-out"></i>
                    </button>
                </div>
            </header>

            <!-- Desktop Sidebar -->
            <aside class="app-sidebar">
                <a href="#/" class="sidebar-logo">
                    <div class="logo-icon">
                        <i data-lucide="indian-rupee"></i>
                    </div>
                    <div class="logo-text">DailyPay</div>
                </a>

                <nav class="sidebar-nav">
                    ${sidebarNavHTML}
                </nav>

                <div class="sidebar-footer">
                    <div class="user-profile-badge">
                        <img src="${avatar}" alt="Avatar" class="user-avatar">
                        <div class="user-info">
                            <span class="user-name">${name}</span>
                            <span class="user-role">${role}</span>
                        </div>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px;">
                        <button class="theme-toggle" id="theme-toggle-desktop" title="Toggle Theme">
                            <i data-lucide="${isDark ? 'sun' : 'moon'}"></i> Theme
                        </button>
                        <button class="btn-icon" id="logout-btn-desktop" title="Logout">
                            <i data-lucide="log-out"></i>
                        </button>
                    </div>
                </div>
            </aside>

            <!-- Main Page Content Section -->
            <main class="main-content">
                ${pageContentHTML}
            </main>

            <!-- Mobile Bottom Tab Navigation -->
            <nav class="mobile-nav-bar">
                ${mobileNavHTML}
            </nav>
        </div>
    `;
}

function getActiveClass(route) {
    const currentHash = window.location.hash || '#/dashboard';
    return currentHash.includes(route) ? 'active' : '';
}

// Main Route Resolver
function handleRoute() {
    const appContainer = document.getElementById('app');
    const currentUser = db.getCurrentUser();
    
    // Parse Hash Route
    let hash = window.location.hash.slice(2) || '';
    
    // Split query params if any (e.g. #/loans?customer=id)
    const queryIdx = hash.indexOf('?');
    let queryParams = {};
    if (queryIdx !== -1) {
        const queryStr = hash.slice(queryIdx + 1);
        hash = hash.slice(0, queryIdx);
        const urlParams = new URLSearchParams(queryStr);
        for (const [key, value] of urlParams.entries()) {
            queryParams[key] = value;
        }
    }

    // Default route assignment depending on role
    if (!currentUser) {
        hash = 'login';
        window.location.hash = '#/login';
    } else if (hash === '' || hash === 'login') {
        if (currentUser.role === 'admin') {
            hash = 'dashboard';
            window.location.hash = '#/dashboard';
        } else if (currentUser.role === 'agent') {
            hash = 'agent-dashboard';
            window.location.hash = '#/agent-dashboard';
        } else {
            hash = 'customer-dashboard';
            window.location.hash = '#/customer-dashboard';
        }
    }

    const routeInfo = ROUTES[hash];

    // Handle 404 or Route Permission block
    if (!routeInfo || (routeInfo.roles && !routeInfo.roles.includes(currentUser.role))) {
        // Redirect to safe fallback
        if (currentUser) {
            if (currentUser.role === 'admin') navigateTo('/dashboard');
            else if (currentUser.role === 'agent') navigateTo('/agent-dashboard');
            else navigateTo('/customer-dashboard');
        } else {
            navigateTo('/login');
        }
        return;
    }

    // Render inside layout
    try {
        const pageContentHTML = routeInfo.render(queryParams);
        
        if (hash === 'login') {
            appContainer.innerHTML = pageContentHTML;
        } else {
            appContainer.innerHTML = createLayout(currentUser, pageContentHTML);
        }

        // Hydrate Lucide Icons
        if (window.lucide) {
            window.lucide.createIcons();
        }

        // Re-attach core global listener events (e.g. logouts, theme selectors)
        attachGlobalEvents();
        
        // Trigger page-specific scripts / hooks (e.g. chart loading)
        const initHookName = `init_${hash.replace('-', '_')}`;
        if (window[initHookName] && typeof window[initHookName] === 'function') {
            window[initHookName](queryParams);
        }

    } catch (err) {
        console.error(err);
        appContainer.innerHTML = `
            <div class="empty-state">
                <i data-lucide="alert-circle"></i>
                <h3 class="empty-state-title">Failed to load view</h3>
                <p class="empty-state-desc">${err.message}</p>
                <button class="btn btn-primary" onclick="window.location.reload()">Reload Page</button>
            </div>
        `;
        if (window.lucide) window.lucide.createIcons();
    }
}

// Global Event Binder
function attachGlobalEvents() {
    // Logout Buttons
    const logoutDesktop = document.getElementById('logout-btn-desktop');
    const logoutMobile = document.getElementById('logout-btn-mobile');
    
    const handleLogout = () => {
        // Clear auth
        localStorage.removeItem('dp_current_user');
        navigateTo('/login');
    };

    if (logoutDesktop) logoutDesktop.addEventListener('click', handleLogout);
    if (logoutMobile) logoutMobile.addEventListener('click', handleLogout);

    // Theme Switchers
    const themeDesktop = document.getElementById('theme-toggle-desktop');
    const themeMobile = document.getElementById('theme-toggle-mobile');

    const handleThemeToggle = () => {
        const currentTheme = localStorage.getItem('dp_theme') || 'dark';
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
        
        // Refresh router to redraw icons (since header displays moon/sun toggle)
        handleRoute();
    };

    if (themeDesktop) themeDesktop.addEventListener('click', handleThemeToggle);
    if (themeMobile) themeMobile.addEventListener('click', handleThemeToggle);
}

// Listen to Hash Changes
window.addEventListener('hashchange', handleRoute);
window.addEventListener('DOMContentLoaded', () => {
    initTheme();
    handleRoute();
});
