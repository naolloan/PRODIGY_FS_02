// Global variables
let currentUser = null;
let selectedUserId = null;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication and admin status
  await verifyAdminStatus();
  
  // Load initial data
  await loadUsers();
  await loadAuditLogs();
  
  // Setup event listeners
  setupEventListeners();
  
  // Update UI
  updateUserInfo();
});

// Verify user is admin
async function verifyAdminStatus() {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  
  if (!token || !userData) {
    redirectToLogin();
    return;
  }
  
  try {
    currentUser = JSON.parse(userData);
    
    // Additional verification with backend
    const response = await fetch('/api/auth/verify', {
      headers: { 'x-auth-token': token }
    });
    
    if (!response.ok) {
      redirectToLogin();
    }
    
    // Check if admin
    if (currentUser.role !== 'admin') {
      window.location.href = 'index.html';
    }
  } catch (err) {
    console.error('Verification error:', err);
    redirectToLogin();
  }
}

// Load users data
async function loadUsers() {
  try {
    const response = await fetch('/api/admin/users', {
      headers: { 'x-auth-token': localStorage.getItem('token') }
    });
    
    if (!response.ok) throw new Error('Failed to fetch users');
    
    const users = await response.json();
    renderUsers(users);
  } catch (err) {
    showError('Failed to load users: ' + err.message);
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
      <td>
        <button class="btn-edit-role" data-id="${user.id}">Edit Role</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Load audit logs
async function loadAuditLogs(filter = {}) {
  try {
    let url = '/api/admin/audit-logs';
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
      <td>${log.admin_id}</td>
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
  document.querySelectorAll('.admin-nav a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelector('.admin-nav a.active').classList.remove('active');
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
    const response = await fetch(`/api/admin/users/${selectedUserId}/role`, {
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