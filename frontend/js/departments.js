let currentDepartmentId = null;

document.addEventListener('DOMContentLoaded', async () => {
  if (!checkAuth()) return;
  await loadDepartments();
  setupEventListeners();
});

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
      <td>
        <button class="btn-edit" data-id="${dept.id}">Edit</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function setupEventListeners() {
  // Back to dashboard button
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }
  
  // Add Department
  document.getElementById('addDeptForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const department = {
      name: document.getElementById('deptName').value,
      description: document.getElementById('deptDesc').value
    };

    try {
      const response = await fetch('http://localhost:3000/api/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(department)
      });

      if (!response.ok) throw new Error('Failed to create department');
      
      document.getElementById('addDeptForm').reset();
      await loadDepartments();
      showSuccess('Department created successfully');
    } catch (err) {
      showError(err.message);
    }
  });

  // Edit Department
  document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-edit')) {
      currentDepartmentId = e.target.dataset.id;
      await showEditModal(currentDepartmentId);
    }
  });

  // Save Edit
  document.getElementById('saveEditDept').addEventListener('click', async () => {
    const department = {
      name: document.getElementById('editDeptName').value,
      description: document.getElementById('editDeptDesc').value
    };

    try {
      const response = await fetch(`http://localhost:3000/api/departments/${currentDepartmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(department)
      });

      if (!response.ok) throw new Error('Failed to update department');
      
      document.getElementById('editDeptModal').style.display = 'none';
      await loadDepartments();
      showSuccess('Department updated successfully');
    } catch (err) {
      showError(err.message);
    }
  });
}

async function showEditModal(id) {
  try {
    const response = await fetch(`http://localhost:3000/api/departments/${id}`);
    if (!response.ok) throw new Error('Failed to load department');
    
    const department = await response.json();
    
    document.getElementById('editDeptName').value = department.name;
    document.getElementById('editDeptDesc').value = department.description || '';
    document.getElementById('editDeptModal').style.display = 'block';
  } catch (err) {
    showError(err.message);
  }
}

// Helper functions
function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

function showError(message) {
  const errorDiv = document.getElementById('errorMessage');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  setTimeout(() => errorDiv.style.display = 'none', 5000);
}

function showSuccess(message) {
  const successDiv = document.getElementById('successMessage');
  successDiv.textContent = message;
  successDiv.style.display = 'block';
  setTimeout(() => successDiv.style.display = 'none', 5000);
}