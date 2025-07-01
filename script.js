// Real user session data
const SESSION_DATA = {
    isLoggedIn: false,
    currentUser: null,
    stats: {
        totalLogins: 0,
        todayLogins: 0,
        activeSessions: 0,
        failedAttempts: 0
    },
    loginHistory: []
};

// State management
let currentHistoryPage = 1;
const historyItemsPerPage = 8;
let historySearchTerm = '';
let historyStatusFilter = 'all';

// Get user's real browser and system information
function getBrowserInfo() {
    const userAgent = navigator.userAgent;
    let browser = "Unknown Browser";
    let os = "Unknown OS";
    
    // Detect browser
    if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) browser = "Chrome";
    else if (userAgent.includes("Firefox")) browser = "Firefox";
    else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) browser = "Safari";
    else if (userAgent.includes("Edg")) browser = "Edge";
    
    // Detect OS
    if (userAgent.includes("Windows")) os = "Windows";
    else if (userAgent.includes("Macintosh")) os = "macOS";
    else if (userAgent.includes("Linux")) os = "Linux";
    else if (userAgent.includes("Android")) os = "Android";
    else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) os = "iOS";
    
    return `${browser} on ${os}`;
}

// Generate avatar based on initials
function generateAvatar(name) {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    const colors = ['3b82f6', '10b981', 'f59e0b', 'ef4444', '8b5cf6', '06b6d4'];
    const color = colors[name.length % colors.length];
    return `https://via.placeholder.com/40x40/${color}/ffffff?text=${initials}`;
}

// Load stored data from localStorage
function loadStoredData() {
    const stored = localStorage.getItem('loginTrackingData');
    if (stored) {
        const data = JSON.parse(stored);
        SESSION_DATA.stats = data.stats || SESSION_DATA.stats;
        SESSION_DATA.loginHistory = data.loginHistory || [];
        SESSION_DATA.isLoggedIn = data.isLoggedIn || false;
        SESSION_DATA.currentUser = data.currentUser || null;
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('loginTrackingData', JSON.stringify(SESSION_DATA));
}

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    loadStoredData();
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    // Check login status and show appropriate page
    if (SESSION_DATA.isLoggedIn) {
        showDashboard();
    } else {
        showLanding();
    }
}

function setupEventListeners() {
    // Landing page buttons
    const signInBtn = document.getElementById('sign-in-btn');
    const getStartedBtn = document.getElementById('get-started-btn');
    
    if (signInBtn) signInBtn.addEventListener('click', handleLogin);
    if (getStartedBtn) getStartedBtn.addEventListener('click', handleLogin);
    
    // Dashboard buttons
    const logoutBtn = document.getElementById('logout-btn');
    const simulateLoginBtn = document.getElementById('simulate-login-btn');
    const simulateLogoutBtn = document.getElementById('simulate-logout-btn');
    const simulateFailedBtn = document.getElementById('simulate-failed-btn');
    const refreshHistoryBtn = document.getElementById('refresh-history-btn');
    const exportHistoryBtn = document.getElementById('export-history-btn');
    
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (simulateLoginBtn) simulateLoginBtn.addEventListener('click', simulateNewLogin);
    if (simulateLogoutBtn) simulateLogoutBtn.addEventListener('click', simulateLogout);
    if (simulateFailedBtn) simulateFailedBtn.addEventListener('click', simulateFailedLogin);
    if (refreshHistoryBtn) refreshHistoryBtn.addEventListener('click', refreshHistory);
    if (exportHistoryBtn) exportHistoryBtn.addEventListener('click', exportHistory);
    
    // Search and filter
    const historySearch = document.getElementById('history-search');
    const historyStatus = document.getElementById('history-status');
    
    if (historySearch) historySearch.addEventListener('input', applyHistoryFilters);
    if (historyStatus) historyStatus.addEventListener('change', applyHistoryFilters);
}

function showLanding() {
    const landing = document.getElementById('landing-page');
    const dashboard = document.getElementById('dashboard-page');
    
    if (landing) landing.style.display = 'block';
    if (dashboard) dashboard.style.display = 'none';
}

function showDashboard() {
    const landing = document.getElementById('landing-page');
    const dashboard = document.getElementById('dashboard-page');
    
    if (landing) landing.style.display = 'none';
    if (dashboard) dashboard.style.display = 'block';
    
    loadUserInfo();
    loadMiniStats();
    loadHistory();
}

function handleLogin() {
    // Prompt for user name and email
    const userName = prompt("Enter your name:") || "Anonymous User";
    const userEmail = prompt("Enter your email:") || "user@example.com";
    
    // Create user session
    SESSION_DATA.currentUser = {
        name: userName,
        email: userEmail,
        avatar: generateAvatar(userName),
        loginTime: new Date().toLocaleString()
    };
    
    SESSION_DATA.isLoggedIn = true;
    
    // Add login event to history
    const loginEvent = {
        id: Date.now(),
        user: SESSION_DATA.currentUser,
        action: "logged in successfully",
        time: "just now",
        success: true,
        ip: "Your IP",
        device: getBrowserInfo(),
        location: "Your Location",
        timestamp: new Date()
    };
    
    SESSION_DATA.loginHistory.unshift(loginEvent);
    SESSION_DATA.stats.totalLogins++;
    SESSION_DATA.stats.todayLogins++;
    SESSION_DATA.stats.activeSessions++;
    
    saveData();
    showDashboard();
    showNotification('Successfully logged in!', 'success');
}

function handleLogout() {
    if (!SESSION_DATA.currentUser) return;
    
    // Add logout event to history
    const logoutEvent = {
        id: Date.now(),
        user: SESSION_DATA.currentUser,
        action: "logged out",
        time: "just now",
        success: true,
        ip: "Your IP",
        device: getBrowserInfo(),
        location: "Your Location",
        timestamp: new Date()
    };
    
    SESSION_DATA.loginHistory.unshift(logoutEvent);
    SESSION_DATA.stats.activeSessions = Math.max(0, SESSION_DATA.stats.activeSessions - 1);
    SESSION_DATA.isLoggedIn = false;
    SESSION_DATA.currentUser = null;
    
    saveData();
    showLanding();
    showNotification('Successfully logged out!', 'info');
}

function loadUserInfo() {
    const user = SESSION_DATA.currentUser;
    if (!user) return;
    
    // Header user info
    const userName = document.getElementById('user-name');
    const userAvatar = document.getElementById('user-avatar');
    
    if (userName) userName.textContent = user.name;
    if (userAvatar) {
        userAvatar.src = user.avatar;
        userAvatar.alt = user.name;
    }
    
    // Current user section in login panel
    const currentUserName = document.getElementById('current-user-name');
    const currentUserEmail = document.getElementById('current-user-email');
    const currentUserAvatar = document.getElementById('current-user-avatar');
    const loginTime = document.getElementById('login-time');
    
    if (currentUserName) currentUserName.textContent = user.name;
    if (currentUserEmail) currentUserEmail.textContent = user.email;
    if (currentUserAvatar) {
        currentUserAvatar.src = user.avatar;
        currentUserAvatar.alt = user.name;
    }
    if (loginTime) loginTime.textContent = user.loginTime;
}

function loadMiniStats() {
    const stats = SESSION_DATA.stats;
    
    const miniTotalUsers = document.getElementById('mini-total-users');
    const miniTodayLogins = document.getElementById('mini-today-logins');
    const miniActiveSessions = document.getElementById('mini-active-sessions');
    const miniFailedAttempts = document.getElementById('mini-failed-attempts');
    
    if (miniTotalUsers) miniTotalUsers.textContent = stats.totalLogins.toLocaleString();
    if (miniTodayLogins) miniTodayLogins.textContent = stats.todayLogins.toLocaleString();
    if (miniActiveSessions) miniActiveSessions.textContent = stats.activeSessions.toLocaleString();
    if (miniFailedAttempts) miniFailedAttempts.textContent = stats.failedAttempts.toLocaleString();
}

function loadHistory() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    
    const filteredHistory = getFilteredHistory();
    const paginatedHistory = paginateHistory(filteredHistory);
    
    if (paginatedHistory.length === 0) {
        historyList.innerHTML = '<div class="empty-state">No login history found. Try logging in or out to see events appear here.</div>';
        return;
    }
    
    historyList.innerHTML = paginatedHistory.map(activity => `
        <div class="history-item">
            <div class="history-avatar">
                <img src="${activity.user.avatar}" alt="${activity.user.name}">
                <div class="history-status ${activity.success ? 'success' : 'failed'}"></div>
            </div>
            <div class="history-content">
                <div>
                    <span class="history-user">${activity.user.name}</span>
                    <span class="history-action"> ${activity.action}</span>
                </div>
                <div class="history-time">${activity.time}</div>
                <div class="history-details">
                    ${activity.ip ? `<div class="history-detail"><i class="fas fa-globe"></i> ${activity.ip}</div>` : ''}
                    ${activity.device ? `<div class="history-detail"><i class="fas fa-desktop"></i> ${activity.device}</div>` : ''}
                    ${activity.location ? `<div class="history-detail"><i class="fas fa-map-marker-alt"></i> ${activity.location}</div>` : ''}
                </div>
            </div>
        </div>
    `).join('');
    
    // Update pagination
    updateHistoryPagination(filteredHistory.length);
}

// Simulation functions for testing
function simulateNewLogin() {
    const loginEvent = {
        id: Date.now(),
        user: {
            name: "Test User",
            email: "test@example.com",
            avatar: generateAvatar("Test User")
        },
        action: "logged in successfully",
        time: "just now",
        success: true,
        ip: "192.168.1.100",
        device: getBrowserInfo(),
        location: "Test Location",
        timestamp: new Date()
    };
    
    SESSION_DATA.loginHistory.unshift(loginEvent);
    SESSION_DATA.stats.totalLogins++;
    SESSION_DATA.stats.todayLogins++;
    SESSION_DATA.stats.activeSessions++;
    
    saveData();
    loadMiniStats();
    loadHistory();
    showNotification('New login simulated successfully!', 'success');
}

function simulateLogout() {
    const logoutEvent = {
        id: Date.now(),
        user: SESSION_DATA.currentUser || {
            name: "Test User",
            email: "test@example.com", 
            avatar: generateAvatar("Test User")
        },
        action: "logged out",
        time: "just now",
        success: true,
        ip: "192.168.1.100",
        device: getBrowserInfo(),
        location: "Test Location",
        timestamp: new Date()
    };
    
    SESSION_DATA.loginHistory.unshift(logoutEvent);
    SESSION_DATA.stats.activeSessions = Math.max(0, SESSION_DATA.stats.activeSessions - 1);
    
    saveData();
    loadMiniStats();
    loadHistory();
    showNotification('Logout simulated successfully!', 'info');
}

function simulateFailedLogin() {
    const failedEvent = {
        id: Date.now(),
        user: {
            name: "Failed User",
            email: "failed@example.com",
            avatar: 'https://via.placeholder.com/40x40/ef4444/ffffff?text=?'
        },
        action: "failed login attempt",
        time: "just now",
        success: false,
        ip: "10.0.0.1",
        device: getBrowserInfo(),
        location: "Unknown Location",
        timestamp: new Date()
    };
    
    SESSION_DATA.loginHistory.unshift(failedEvent);
    SESSION_DATA.stats.failedAttempts++;
    
    saveData();
    loadMiniStats();
    loadHistory();
    showNotification('Failed login simulated!', 'error');
}

function getFilteredHistory() {
    return SESSION_DATA.loginHistory.filter(item => {
        const matchesSearch = !historySearchTerm || 
            item.user.name.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
            item.user.email.toLowerCase().includes(historySearchTerm.toLowerCase());
        
        const matchesStatus = historyStatusFilter === 'all' || 
            (historyStatusFilter === 'success' && item.success) ||
            (historyStatusFilter === 'failed' && !item.success);
        
        return matchesSearch && matchesStatus;
    });
}

function paginateHistory(filteredHistory) {
    const startIndex = (currentHistoryPage - 1) * historyItemsPerPage;
    const endIndex = startIndex + historyItemsPerPage;
    return filteredHistory.slice(startIndex, endIndex);
}

function updateHistoryPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / historyItemsPerPage);
    const pagination = document.getElementById('history-pagination');
    
    if (!pagination) return;
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    pagination.innerHTML = `
        <button class="btn btn-outline btn-sm" ${currentHistoryPage === 1 ? 'disabled' : ''} onclick="changeHistoryPage(${currentHistoryPage - 1})">
            <i class="fas fa-chevron-left"></i>
        </button>
        <span class="page-info-simple">Page ${currentHistoryPage} of ${totalPages}</span>
        <button class="btn btn-outline btn-sm" ${currentHistoryPage === totalPages ? 'disabled' : ''} onclick="changeHistoryPage(${currentHistoryPage + 1})">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
}

function changeHistoryPage(page) {
    const filteredHistory = getFilteredHistory();
    const totalPages = Math.ceil(filteredHistory.length / historyItemsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentHistoryPage = page;
        loadHistory();
    }
}

function applyHistoryFilters() {
    const historySearch = document.getElementById('history-search');
    const historyStatus = document.getElementById('history-status');
    
    historySearchTerm = historySearch ? historySearch.value : '';
    historyStatusFilter = historyStatus ? historyStatus.value : 'all';
    currentHistoryPage = 1; // Reset to first page
    loadHistory();
}

function refreshHistory() {
    const refreshBtn = document.getElementById('refresh-history-btn');
    const icon = refreshBtn ? refreshBtn.querySelector('i') : null;
    
    if (icon) icon.classList.add('spin');
    
    setTimeout(() => {
        loadHistory();
        if (icon) icon.classList.remove('spin');
        showNotification('History refreshed!', 'info');
    }, 1000);
}

function exportHistory() {
    const filteredHistory = getFilteredHistory();
    
    if (filteredHistory.length === 0) {
        showNotification('No data to export!', 'error');
        return;
    }
    
    const csvContent = "data:text/csv;charset=utf-8," + 
        "User,Email,Action,Time,Status,IP Address,Device,Location\n" +
        filteredHistory.map(item => 
            `"${item.user.name}","${item.user.email}","${item.action}","${item.time}","${item.success ? 'Success' : 'Failed'}","${item.ip}","${item.device}","${item.location}"`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "login_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('History exported successfully!', 'success');
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 3000);
}

// CSS for spinning animation
const style = document.createElement('style');
style.textContent = `
    .spin {
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
