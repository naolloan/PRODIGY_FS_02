document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // Load employees
  loadEmployees();

  // Logout button
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  });

  // Add employee button
  document.getElementById('addEmployeeBtn').addEventListener('click', () => {
    window.location.href = 'add-employee.html';
  });

  // Search functionality
  document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#employeesTable tbody tr');
    
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
  });
});

async function loadEmployees() {
  try {
    const response = await fetch('http://localhost:3000/api/employees', {
      headers: {
        'x-auth-token': localStorage.getItem('token')
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch employees');
    }

    const employees = await response.json();
    renderEmployees(employees);
  } catch (err) {
    console.error('Error loading employees:', err);
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
      <td>${emp.position}</td>
      <td>${emp.department_id || 'N/A'}</td>
      <td>
        <button class="btn-edit" data-id="${emp.id}">Edit</button>
        <button class="btn-delete" data-id="${emp.id}">Delete</button>
      </td>
    `;
    
    row.querySelector('.btn-edit').addEventListener('click', () => {
      window.location.href = `edit-employee.html?id=${emp.id}`;
    });
    
    row.querySelector('.btn-delete').addEventListener('click', () => deleteEmployee(emp.id));
    
    tbody.appendChild(row);
  });
}

async function deleteEmployee(id) {
  if (!confirm('Are you sure you want to delete this employee?')) return;
  
  try {
    const response = await fetch(`http://localhost:3000/api/employees/${id}`, {
      method: 'DELETE',
      headers: {
        'x-auth-token': localStorage.getItem('token')
      }
    });

    if (response.ok) {
      loadEmployees();
    } else {
      throw new Error('Failed to delete employee');
    }
  } catch (err) {
    console.error('Error deleting employee:', err);
    alert('Failed to delete employee');
  }
}