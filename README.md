```markdown
# International Payments Portal

## Overview

This project is a secure international payments portal developed for an internal banking system. **Admins** can create users and approve/reject payments. **Regular users** can submit payments and view their transaction history. The application focuses on security best practices such as password hashing, JWT authentication, input validation, and environment variable protection.

The system is built using a modern web stack with a React frontend, Node.js and Express backend, and a MySQL database.

---

# Tech Stack

**Frontend**
- React
- Vite

**Backend**
- Node.js
- Express

**Database**
- MySQL

**Security**
- bcrypt (password hashing)
- JSON Web Tokens (JWT)
- RegEx input validation
- dotenv for environment variables

---

# Project Structure

```
project-root
│
├── backend
│   ├── server.js
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── Services/
│   │   ├── authServices.js
│   │   └── validation.js
│   ├── .env.example
│
├── frontend
│   ├── src/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Payment.tsx
│   │   ├── Transactions.tsx
│   │   ├── Approvals.tsx
│   │   ├── AdminCreateUser.tsx
│   │   └── styles/
│
├── README.md
├── .gitignore
```

---

# Installation Guide

## 1. Clone the Repository

```
git clone https://github.com/your-username/your-repository-name.git
cd your-repository-name
```

---

# Install Dependencies

## Backend

Navigate to the backend folder and install dependencies:

```
cd backend
npm install
```

## Frontend

Navigate to the frontend folder and install dependencies:

```
cd frontend
npm install
```

---

# Environment Variables

The project uses environment variables for database credentials and security keys.

The repository contains a template file called `.env.example`.

You must rename this file to `.env`.

```
.env.example → .env
```

After renaming, edit the `.env` file and insert your own configuration values.

Example `.env` file:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=international_payments
PORT=5000
SECRET_KEY=mysecretkey
FRONTEND_ORIGIN=http://localhost:5173
NODE_ENV=development
```

Important:
The real `.env` file is not included in the repository because it contains sensitive information.

---

# Complete Database Setup

Open MySQL and run the following commands IN ORDER.

## Step 1: Create Database

```sql
CREATE DATABASE international_payments;
USE international_payments;
```

## Step 2: Create Users Table

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  Full_name VARCHAR(225) NOT NULL UNIQUE,
  id_number INT NOT NULL UNIQUE,
  account_number INT NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);
```

## Step 3: Create Transactions Table

```sql
CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  payment_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  payee_account_number VARCHAR(50) NOT NULL,
  swift_code VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Step 4: Add user_id to Transactions (Foreign Key)

```sql
ALTER TABLE transactions 
ADD COLUMN user_id INT NOT NULL,
ADD CONSTRAINT fk_transactions_users
FOREIGN KEY (user_id) REFERENCES users(id);
```

## #NEW_UPDATE!! Step 5: Fix ID Columns for 13-digit IDs

```sql
ALTER TABLE users MODIFY id_number VARCHAR(20) NOT NULL;
ALTER TABLE users MODIFY account_number VARCHAR(20) NOT NULL;
```

## #NEW_UPDATE!! Step 6: Add Admin Role Column

```sql
ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
```

## #NEW_UPDATE!! Step 7: Add Payment Status Column

```sql
ALTER TABLE transactions 
ADD COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending';
```

## #NEW_UPDATE!! Step 8: Make First User an Admin

```sql
UPDATE users SET is_admin = TRUE WHERE id = 1;
```

## Step 9: Verify Table Structures

```sql
DESCRIBE users;
DESCRIBE transactions;
```

---

# Running the Application

## Start the Backend Server

Navigate to the backend folder and run:

```
nodemon server.js
```

The backend server will run on:

```
http://localhost:5000
```

## Start the Frontend

Navigate to the frontend folder and run:

```
npm run dev
```

The frontend application will run on:

```
http://localhost:5173
```

---

# Application Flow

## Regular User Flow

1. User logs in with ID number and password
2. User submits an international payment
3. Payment status is set to "pending"
4. User can view their transactions with status

## Admin Flow

1. Admin logs in (user with is_admin = TRUE)
2. Admin sees additional buttons: "Approve Payments" and "Create New User"
3. Admin can approve or reject pending payments from all users
4. Admin can create new user accounts (no self-registration)

---

# #NEW_UPDATE!! New Features

## Admin Approval System
- Payments require admin approval before processing
- Admin sees all pending payments from all users
- Admin can approve or reject with one click
- Users see real-time status updates on their transactions

## Admin User Management
- Only admins can create new user accounts
- No self-registration (meets banking requirements)
- Full RegEx validation on user creation

## Transaction Status Tracking
- Status: pending → approved OR rejected
- Users can track their payment status in real-time

## Role-Based Access Control
- Admin-only routes protected on backend and frontend
- Regular users cannot access admin pages
- API endpoints validate admin status via middleware

---

# Security Features

- Password hashing using bcrypt (10 salt rounds)
- JWT authentication with 5-hour expiration
- Input validation using RegEx (both frontend and backend)
- Rate limiting (100 requests per 15 minutes)
- Helmet.js security headers
- CORS restricted to frontend origin
- Sensitive configuration stored in environment variables
- `.env` excluded from GitHub using `.gitignore`
- Admin-only routes protected by middleware

---

# RegEx Validation Rules

| Field | RegEx | Rule |
|-------|------|------|
| Full name | `/^[A-Za-z\s]{2,50}$/` | Letters/spaces only, 2-50 chars |
| ID Number | `/^\d{13}$/` | Exactly 13 digits |
| Account Number | `/^\d{6,20}$/` | 6-20 digits |
| Password | `/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/` | Min 8 chars, 1 letter, 1 number |
| SWIFT Code | `/^[A-Z]{6}[A-Z0-9]{3,5}$/` | 9-11 chars, first 6 letters |
| Amount | `> 0` | Must be positive |

---

# API Endpoints

| Method | Endpoint | Protected | Role |
|--------|----------|-----------|------|
| POST | `/login` | No | Anyone |
| POST | `/payment` | Yes | User |
| GET | `/transactions` | Yes | User |
| GET | `/dashboard` | Yes | User |
| GET | `/me` | Yes | User |
| GET | `/admin/pending-payments` | Yes | Admin |
| PUT | `/admin/approve-payment/:id` | Yes | Admin |
| PUT | `/admin/reject-payment/:id` | Yes | Admin |
| POST | `/admin/create-user` | Yes | Admin |

---

# Testing the System

## Test Admin Account
1. After database setup, run: `UPDATE users SET is_admin = TRUE WHERE id = 1;`
2. Login with user id=1
3. Admin buttons should appear on dashboard

## Test Payment Flow
1. Login as regular user
2. Submit a payment
3. Login as admin
4. Approve the payment
5. Login as regular user again
6. Check transaction status changed to "approved"

## Test User Creation
1. Login as admin
2. Click "Create New User"
3. Fill in user details
4. User is created and can now login

---

# Development Notes

- Do not upload `.env` to GitHub
- Always use `.env.example` as the template
- Ensure MySQL is running before starting the backend server
- First user must be manually set as admin via SQL
- All payments start with "pending" status

---

# Troubleshooting

## Duplicate Entry Error
Run: `ALTER TABLE users MODIFY id_number VARCHAR(20);`

## No Pending Payments Showing
Run: `UPDATE transactions SET status = 'pending';`

## Admin Buttons Not Showing
Run: `UPDATE users SET is_admin = TRUE WHERE id = 1;` then logout and login again

## Transactions Not Showing
Check: `SELECT * FROM transactions WHERE user_id = [your_user_id];`

---

# Authors

International Payments Portal
Group Development Project

Nhlulo Baloye-https://github.com/nhlulobaloy – Employee Portal Frontend & Authentication
**Person 2** – Backend API & Database
**Person 3** – Admin Features & Approval System


---

# Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Initial | Basic login, signup, payments |
| 2.0 | #NEW_UPDATE!! | Added admin approval system, status tracking, role-based access control |

---

# License

Educational Project – Banking System Simulation
```

---

**Copy everything above and paste into your README.md file. Done.**
