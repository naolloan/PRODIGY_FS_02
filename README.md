# PRODIGY_FS_02

## 📋 Employee Management System

A full-stack web application to manage employee records with **role-based access control**, **audit logs**, and **secure authentication**. Built using **Node.js**, **Express**, **MySQL**, and **Vanilla JS (frontend)**.

---

### 🚀 Features

* 🔐 **Authentication with JWT**
* 🛡️ **Role-based authorization** (`admin`, `manager`, `user`)
* 📋 **CRUD operations** for employees (admin only)
* 📜 **Audit logging** for create, update, delete actions
* 🧭 **Dashboard** for managers
* 🔍 **Search and filtering**
* 🎯 **RESTful API** architecture

---

### 🏗️ Tech Stack

**Backend:**

* Node.js
* Express
* MySQL
* JWT for auth
* Dotenv
* Custom middleware for auth and permissions

**Frontend:**

* HTML, CSS
* Vanilla JavaScript
* Responsive design

---

### 📁 Project Structure

```
project-root/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── employeeController.js
│   │   └── roleController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── employee.routes.js
│   │   └── role.routes.js
│   ├── utils/
│   │   └── auditLogger.js
│   └── server.js
│
├── frontend/
│   ├── admin.js
│   ├── login.js
│   ├── employees.html
│   ├── employee-form.html
│   └── style.css
│
└── README.md
```

---

### 🛠️ Setup Instructions

1. **Clone the repo:**

   ```bash
   git clone https://github.com/yourusername/employee-management-system.git
   cd employee-management-system
   ```

2. **Configure Environment Variables:**

   Create a `.env` file inside the `backend/` directory:

   ```
   DB_HOST=127.0.0.1
   DB_USER=emp_admin
   DB_PASSWORD=EM-ADMIN
   DB_NAME=employee_management
   JWT_SECRET=your_jwt_secret_key
   PORT=3306
   ```

3. **Install Dependencies:**

   ```bash
   cd backend
   npm install
   ```

4. **Start the Server:**

   ```bash
   npm start
   ```

5. **Frontend:**

   Open the `frontend/` folder with Live Server or directly in the browser:

   ```
   file:///path-to-project/frontend/login.html
   ```

---

### 🧪 API Endpoints

#### 🔑 Auth

| Method | Endpoint          | Access        | Description            |
| ------ | ----------------- | ------------- | ---------------------- |
| POST   | `/api/auth/login` | Public        | Login with credentials |
| GET    | `/api/users/me`   | Authenticated | View current user      |

#### 👥 Employees

| Method | Endpoint             | Access | Description          |
| ------ | -------------------- | ------ | -------------------- |
| GET    | `/api/employees`     | Public | View all employees   |
| GET    | `/api/employees/:id` | Admin  | View single employee |
| POST   | `/api/employees`     | Admin  | Add new employee     |
| PUT    | `/api/employees/:id` | Admin  | Update employee info |
| DELETE | `/api/employees/:id` | Admin  | Delete an employee   |

#### 🧾 Audit Logs

| Method | Endpoint                  | Access  | Description            |
| ------ | ------------------------- | ------- | ---------------------- |
| GET    | `/api/manager/audit-logs` | Manager | View system audit logs |

---

### 🛡️ Roles & Permissions

| Role      | Permissions                               |
| --------- | ----------------------------------------- |
| `admin`   | Full access to manage users and employees |
| `manager` | View dashboards, assign roles, view logs  |
| `user`    | Limited or no access to sensitive routes  |

---

### 🐞 Troubleshooting

* **403 Forbidden?** → Check if your token is expired or role is incorrect.
* **Failed to fetch employee?** → Ensure your JWT is passed as `x-auth-token` in headers.
* **CORS issues?** → Make sure the backend is allowing the frontend’s origin.

---

### 📌 To Do / Future Enhancements

* ✅ Better UI using a frontend framework
* ✅ Password reset & email verification
* 🔄 Export audit logs as CSV
* 🧪 Add test coverage with Jest

---

### 🧑‍💻 Author

**Naol Feyisa** — Internship project at \[Prodigy Info Tech]
