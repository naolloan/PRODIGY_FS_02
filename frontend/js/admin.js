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
    if (!response.ok) throw new Error('Failed to load employees');
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

  employees.forEach(employee => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${employee.id}</td>
      <td>${employee.first_name} ${employee.last_name}</td>
      <td>${employee.email}</td>
      <td>${employee.department_name || '-'}</td>
      <td>${employee.position || '-'}</td>
      <td class="actions">
        <button class="btn-edit" data-id="${employee.id}">Edit</button>
        <button class="btn-delete" data-id="${employee.id}">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  // Add event listeners to new buttons
  setupEmployeeActions();
}

function setupEventListeners() {
  // Add employee button
  const addEmployeeBtn = document.getElementById('addEmployeeBtn');
  if (addEmployeeBtn) {
    addEmployeeBtn.addEventListener('click', () => {
      window.location.href = 'employee-form.html';
    });
  }

  // Back to dashboard button
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

  // Back to employees button
  const backButton = document.getElementById('backButton'); // Fixed typo from 'backBotton'
  if (backButton) {
    backButton.addEventListener('click', () => {
      window.location.href = 'employees.html';
    });
  }

  // Search functionality
  document.getElementById('searchInput')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('#employeesTable tbody tr').forEach(row => {
      const cells = row.querySelectorAll('td');
      let rowText = '';
      cells.forEach(cell => {
        // Skip the actions cell (last one)
        if (!cell.classList.contains('actions')) {
          rowText += cell.textContent.toLowerCase() + ' ';
        }
      });
      row.style.display = rowText.includes(term) ? '' : 'none';
    });
  });
}

// Setup edit and delete buttons
function setupEmployeeActions() {
  // Edit buttons
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const employeeId = e.target.dataset.id;
      await showEditModal(employeeId);
    });
  });

  // Delete buttons
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const employeeId = e.target.dataset.id;
      await deleteEmployee(employeeId);
    });
  });
}

// Show edit modal with employee data
async function showEditModal(employeeId) {
  try {
    const response = await fetch(`http://localhost:3000/api/employees/${employeeId}`, {
      headers: {
        'x-auth-token': localStorage.getItem('token')
      }
    });

    if (!response.ok) throw new Error('Failed to load employee data');

    // Ensure response has content
    const text = await response.text();
    if (!text) {
      alert('No data returned for this employee.');
      return;
    }

    const employee = JSON.parse(text);

    // Populate form
    document.getElementById('editEmployeeId').value = employee.id;
    document.getElementById('editFirstName').value = employee.first_name;
    document.getElementById('editLastName').value = employee.last_name;
    document.getElementById('editEmail').value = employee.email;

    // Show modal
    document.getElementById('editEmployeeModal').style.display = 'block';
  } catch (err) {
    console.error('Error loading employee:', err);
    alert('Failed to load employee data');
  }
}


// Handle edit form submission
document.getElementById('editEmployeeForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const employeeId = document.getElementById('editEmployeeId').value;
  const updatedData = {
    first_name: document.getElementById('editFirstName').value,
    last_name: document.getElementById('editLastName').value,
    email: document.getElementById('editEmail').value,
    // Add other fields...
  };

  try {
    const response = await fetch(`http://localhost:3000/api/employees/${employeeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': localStorage.getItem('token')
      },
      body: JSON.stringify(updatedData)
    });

    if (!response.ok) throw new Error('Update failed');
    
    // Close modal and refresh list
    document.getElementById('editEmployeeModal').style.display = 'none';
    await loadEmployees();
    alert('Employee updated successfully');
  } catch (err) {
    console.error('Error updating employee:', err);
    alert('Failed to update employee');
  }
});

// Delete employee
async function deleteEmployee(employeeId) {
  if (!confirm('Are you sure you want to delete this employee?')) return;

  try {
    const response = await fetch(`http://localhost:3000/api/employees/${employeeId}`, {
      method: 'DELETE',
      headers: {
        'x-auth-token': localStorage.getItem('token')
      }
    });

    if (!response.ok) throw new Error('Delete failed');
    
    await loadEmployees();
    alert('Employee deleted successfully');
  } catch (err) {
    console.error('Error deleting employee:', err);
    alert('Failed to delete employee');
  }
}

// Close modal when clicking X
document.querySelector('.close-modal').addEventListener('click', () => {
  document.getElementById('editEmployeeModal').style.display = 'none';
});

// Initialize when page loads
document.addEventListener('DOMContentLoaded', async () => {
  await loadEmployees();
  setupEventListeners();
});