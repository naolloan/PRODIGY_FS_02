// Global variables
let currentUser = null;
let selectedUserId = null;

function showLoading(isLoading) {
  const spinner = document.getElementById('currentUser');
  if (spinner) {
    spinner.style.display = isLoading ? 'block' : 'none';
  }
}


// DOM Content Loaded
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1. Verify admin status first
    const isManager = await verifyManagerStatus();
    if (!isManager) return;

    // 2. Then load data
    await Promise.all([
      loadUsers(),
      loadAuditLogs()
    ]);

    // 3. Setup UI
    setupEventListeners();
    updateUserInfo();

  } catch (err) {
    console.error('Manager dashboard init error:', err);
    showError('Failed to initialize dashboard');
    redirectToLogin();
  }
});

// Verify user is Manager
async function verifyManagerStatus() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    redirectToLogin();
    return false;
  }

  try {
    const response = await fetch('http://localhost:3000/api/auth/verify', {
      headers: {
        'x-auth-token': token,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!response.ok || !data.valid) {
      throw new Error(data.message || 'Invalid token');
    }

    // Store fresh user data
    currentUser = data.user;
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Check manager role
    if (data.user.role !== 'manager') {
      window.location.href = 'login.html';
      return false;
    }

    return true;

  } catch (err) {
    console.error('Manager verification failed:', err);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    redirectToLogin();
    return false;
  }
}

// Load users data
async function loadUsers() {
  try {
    showLoading(true); // Show loading indicator
    
    const response = await fetch('http://localhost:3000/api/manager/users', {
      headers: { 
        'x-auth-token': localStorage.getItem('token'),
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401) {
      // Token expired or invalid
      logout();
      return;
    }

    if (response.status === 403) {
      // Not a manager
      window.location.href = 'login.html';
      return;
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch users');
    }

    const users = await response.json();
    renderUsers(users);
    
  } catch (err) {
    console.error('Load users error:', err);
    showError(err.message || 'Failed to load users');
  } finally {
    showLoading(false); // Hide loading indicator
  }
}


// Render users table
function renderUsers(users) {
  const tbody = document.querySelector('#usersTable tbody');
  tbody.innerHTML = '';

  users.forEach(user => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${user.id}</td>
      <td>${user.username}</td>
      <td>${user.email}</td>
      <td class="role-cell">${capitalizeFirstLetter(user.role)}</td>
      <td class="actions">
        ${currentUser.role === 'manager' ? 
          `<button class="btn-edit-role" data-id="${user.id}">Edit Role</button>` : 
          'No permissions'
        }
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Load audit logs
async function loadAuditLogs(filter = {}) {
  try {
    let url = 'http://localhost:3000/api/manager/audit-logs';
    if (filter.action || filter.date) {
      const params = new URLSearchParams();
      if (filter.action) params.append('action', filter.action);
      if (filter.date) params.append('date', filter.date);
      url += `?${params.toString()}`;
    }
    
    const response = await fetch(url, {
      headers: { 'x-auth-token': localStorage.getItem('token') }
    });
    
    if (!response.ok) throw new Error('Failed to fetch audit logs');
    
    const logs = await response.json();
    renderAuditLogs(logs);
  } catch (err) {
    showError('Failed to load audit logs: ' + err.message);
  }
}

// Render audit logs
function renderAuditLogs(logs) {
  const tbody = document.querySelector('#auditTable tbody');
  tbody.innerHTML = '';
  
  logs.forEach(log => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${new Date(log.created_at).toLocaleString()}</td>
      <td>${log.manager_id}</td>
      <td>${log.action.replace('_', ' ')}</td>
      <td>${log.target_user}</td>
      <td>
        ${log.old_value ? `From: ${log.old_value}<br>` : ''}
        ${log.new_value ? `To: ${log.new_value}` : ''}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Setup all event listeners
function setupEventListeners() {
  // Navigation
  document.querySelectorAll('.manager-nav a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelector('.manager-nav a.active').classList.remove('active');
      e.target.classList.add('active');
      
      document.querySelector('section.active-section').classList.remove('active-section');
      document.getElementById(`${e.target.dataset.section}-section`).classList.add('active-section');
    });
  });
  
  // User search
  document.getElementById('userSearch').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    document.querySelectorAll('#usersTable tbody tr').forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
  });
  
  // Refresh buttons
  document.getElementById('refreshUsers').addEventListener('click', loadUsers);
  
  // Role edit buttons
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-edit-role')) {
      selectedUserId = e.target.dataset.id;
      openRoleModal();
    }
  });
  
  // Role modal
  document.getElementById('confirmRoleChange').addEventListener('click', confirmRoleChange);
  document.getElementById('cancelRoleChange').addEventListener('click', closeRoleModal);
  document.querySelector('.modal .close').addEventListener('click', closeRoleModal);
  
  // Audit log filters
  document.getElementById('applyFilters').addEventListener('click', () => {
    const action = document.getElementById('actionFilter').value;
    const date = document.getElementById('dateFilter').value;
    loadAuditLogs({ action, date });
  });
  
  // System settings
  document.getElementById('saveSettings').addEventListener('click', saveSystemSettings);
  
  // Logout
  document.getElementById('logoutBtn').addEventListener('click', logout);
}

// Role modal functions
function openRoleModal() {
  const modal = document.getElementById('roleModal');
  modal.style.display = 'block';
  
  // Set current role as selected
  const currentRole = document.querySelector(`.btn-edit-role[data-id="${selectedUserId}"]`)
    .closest('tr')
    .querySelector('.role-cell').textContent
    .toLowerCase();
    
  document.getElementById('roleSelect').value = currentRole;
}

function closeRoleModal() {
  document.getElementById('roleModal').style.display = 'none';
}

async function confirmRoleChange() {
  const newRole = document.getElementById('roleSelect').value;
  
  try {
    const response = await fetch(`http://localhost:3000/api/manager/users/${selectedUserId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': localStorage.getItem('token')
      },
      body: JSON.stringify({ role: newRole })
    });
    
    if (!response.ok) throw new Error('Failed to update role');
    
    closeRoleModal();
    await loadUsers();
    await loadAuditLogs();
    showSuccess('Role updated successfully');
  } catch (err) {
    showError('Failed to update role: ' + err.message);
  }
}

// System settings
async function saveSystemSettings() {
  showSuccess('Settings saved successfully');
}

// User info and logout
function updateUserInfo() {
  if (currentUser) {
    document.getElementById('currentUser').textContent = 
      `${currentUser.username} (${currentUser.role})`;
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  redirectToLogin();
}

function redirectToLogin() {
  window.location.href = 'login.html';
}

// Helper functions
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function showError(message) {
  console.error(message);
  alert(message);
}

function showSuccess(message) {
  console.log(message);
  alert(message);
}