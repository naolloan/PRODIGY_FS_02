document.addEventListener('DOMContentLoaded', async () => {
  if (!checkAuth()) return;
  
  await loadEmployees();
  setupEventListeners();
});

// Logout button
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
});

async function loadEmployees() {
  try {
    const response = await fetch('http://localhost:3000/api/employees', {
      headers: {
        'x-auth-token': localStorage.getItem('token')
      }
    });

    if (!response.ok) throw new Error('Failed to fetch employees');
    
    const employees = await response.json();
    renderEmployees(employees);
  } catch (err) {
    console.error('Error:', err);
    alert('Failed to load employees');
  }
}

function renderEmployees(employees) {
  const tbody = document.querySelector('#employeesTable tbody');
  tbody.innerHTML = '';

  employees.forEach(emp => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${emp.id}</td>
      <td>${emp.first_name} ${emp.last_name}</td>
      <td>${emp.email}</td>
      <td>${emp.department_id || '-'}</td>
      <td>${emp.position}</td>
      <td class="actions">
        <button class="btn-edit" data-id="${emp.id}">Edit</button>
        <button class="btn-delete" data-id="${emp.id}">Delete</button>
      </td>
    `;

    // Edit Employee button
    row.querySelector('btn-edit').addEventListener('click', () => {
      window.location.href = `edit-employee.html?id=${emp.id}`;
    });

    // Delete Employee button
    row.querySelector('btn-delete').addEventListener('click', () => deleteEmployee(emp.id));

    tbody.appendChild(row);
  });
}

function setupEventListeners() {
  // Add employee button
  document.getElementById('addEmployeeBtn').addEventListener('click', () => {
    window.location.href = 'employee-form.html';
  });

  // Back to dashboard button
  document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  // Back to employees button
  document.getElementById('backBotton').addEventListener('click', () => {
    window.location.href = 'employees.html';
  });

  // Search functionality
  document.getElementById('searchInput').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('#employeesTable tbody tr').forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(term) ? '' : 'none';
    });
  });
}

function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// Delete Employee
async function deleteEmployee(id) {
  if (!confirm('Are you sure you want to delete this employee?')) return;
  
  try {
    const response = await fetch(`/api/employees/${id}`, {
      method: 'DELETE',
      headers: {
        'x-auth-token': localStorage.getItem('token')
      }
    });
    
    if (!response.ok) throw new Error('Delete failed');
    await loadEmployees(); // Refresh list
  } catch (err) {
    console.error('Error:', err);
    showError('Failed to delete employee');
  }
}

// Update Employee
async function updateEmployee(id, data) {
  try {
    const response = await fetch(`/api/employees/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': localStorage.getItem('token')
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('Update failed');
    return await response.json();
  } catch (err) {
    console.error('Error:', err);
    throw err;
  }
}

