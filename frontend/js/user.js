// Logout button
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
});

function renderEmployees(employees) {
  const tbody = document.querySelector('#employeesTable tbody');
  tbody.innerHTML = '';

  employees.forEach(employee => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${employee.id}</td>
      <td>${employee.first_name} ${emp.last_name}</td>
      <td>${employee.email}</td>
      <td>${employee.department_name || '-'}</td>
      <td>${employee.position || '-'}</td>
    `;
    tbody.appendChild(tr);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  // Load data (no role check needed)
  await loadEmployees();
  await loadDepartments();
  document.getElementById('logoutBtn').addEventListener('click', logout);
});

async function loadEmployees() {
  const response = await fetch('http://localhost:3000/api/employees');
  const employees = await response.json();
  
  const tbody = document.querySelector('#employeesTable tbody');
  tbody.innerHTML = '';
  
  employees.forEach(employee => {
    const row = `
      <tr>
        <td>${employee.id}</td>
        <td>${employee.first_name} ${employee.last_name}</td>
        <td>${employee.email}</td>
        <td>${employee.department_name || '-'}</td>
        <td>${employee.position || '-'}</td>
      </tr>
    `;
    tbody.insertAdjacentHTML('beforeend', row);
  });
}

async function loadDepartments() {
  try {
    const response = await fetch('http://localhost:3000/api/departments', {
      headers: { 'x-auth-token': localStorage.getItem('token') }
    });
    
    if (!response.ok) throw new Error('Failed to load departments');
    
    const departments = await response.json();
    renderDepartments(departments);
  } catch (err) {
    showError(err.message);
  }
}

function renderDepartments(departments) {
  const tbody = document.querySelector('#departmentsTable tbody');
  tbody.innerHTML = '';

  departments.forEach(dept => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${dept.id}</td>
      <td>${dept.name}</td>
      <td>${dept.description || '-'}</td>
    `;
    tbody.appendChild(tr);
  });
}


