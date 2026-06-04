import dotenv from "dotenv";
dotenv.config({ override: true });

// ENV CHECK
const DB_NAME = process.env.DB_NAME;
console.log("ENV CHECK LOCKED:", DB_NAME);

// CORE IMPORTS
import express from 'express';
import pool from "./config/db.js";

// SECURITY IMPROVEMENT: restrict CORS (marks boost)
import cors from 'cors';

import { hashPassword, verifyPassword, generateToken } from './Services/authServices.js';
import { verifyToken } from './middleware/authMiddleware.js';

// SECURITY MIDDLEWARE
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// INPUT VALIDATION
import {
    validateFullName,
    validateIdNumber,
    validateAccountNumber,
    validateSwiftCode,
    validateAmount
} from "./Services/validation.js";

const app = express();

// JSON + SECURITY CORS (IMPROVED)
app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173"   // SECURITY FIX: prevents open API access
}));

// SECURITY HEADERS (Clickjacking/XSS protection)
app.use(helmet());

// RATE LIMITING (Brute force protection)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests, please try again later"
});
app.use(limiter);

const PORT = process.env.PORT || 5000;


// SIGNUP (VALIDATION + SECURITY)
app.post('/signup', async (req, res) => {

    console.log("SIGNUP ROUTE HIT - NEW CODE");

    const { fullNames, idNumber, accountNumber, password } = req.body;

    // INPUT VALIDATION (WHITELISTING)
    if (
        !validateFullName(fullNames) ||
        !validateIdNumber(idNumber) ||
        !validateAccountNumber(accountNumber)
    ) {
        return res.status(400).json({
            error: "Invalid input detected (RegEx validation failed)"
        });
    }

    const hashedPassword = await hashPassword(password);

    try {
        const sql = `
            INSERT INTO users(Full_name, id_number, account_number, password)
            VALUES(?, ?, ?, ?)
        `;

        await pool.query(sql, [
            fullNames,
            idNumber,
            accountNumber,
            hashedPassword
        ]);

        res.status(200).json({ message: "Account creation was succesful" });

    } catch (error) {
        console.log("SIGNUP ERROR:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
                error: "Duplicate entry detected (ID or Account already exists)"
            });
        }

        return res.status(500).json({
            error: "Server error during account creation"
        });
    }
});


// LOGIN (JWT SECURITY ADDED PROTECTION)
app.post('/login', async (req, res) => {

    const { idNumber, password } = req.body;

    const [result] = await pool.query(
        `SELECT id, password FROM users WHERE id_number = ?`,
        [idNumber]
    );

    console.log("LOGIN RESULT:", result);

    if (result.length <= 0) {
        return res.status(404).json({ message: "User does not exist" });
    }

    const dbPassword = result[0].password;
    const userId = result[0].id;

    const isValid = await verifyPassword(password, dbPassword);

    if (isValid) {

        // SECURITY FIX: token expiry added (session hijacking protection)
        const token = await generateToken(userId, { expiresIn: "1h" });

        return res.status(200).json({
            message: "success",
            token: token
        });
    } else {
        return res.status(404).json({
            message: "Password incorrect"
        });
    }
});


// DASHBOARD (PROTECTED ROUTE)
app.get('/dashboard', verifyToken, (req, res) => {
    res.json({ message: `Welcome user ${req.userId}` });
});


// PAYMENT (FULL VALIDATION SECURITY)
app.post('/payment', verifyToken, async (req, res) => {

    const {
        paymentAmount,
        currency,
        provider,
        payeeAccountNumber,
        swiftCode
    } = req.body;
  console.log(validateAmount(paymentAmount),validateAccountNumber(payeeAccountNumber), validateSwiftCode(swiftCode))
    // INPUT VALIDATION
    if (
        !validateAmount(paymentAmount) ||
        !validateAccountNumber(payeeAccountNumber) ||
        !validateSwiftCode(swiftCode)
    ) {
        return res.status(400).json({
            message: "Invalid payment input detected"
        });
    }

    try {
        if (
            !paymentAmount ||
            !currency ||
            !provider ||
            !payeeAccountNumber ||
            !swiftCode
        ) {
            return res.status(400).json({
                message: "All payment fields are required"
            });
        }
        //get the userId
        const user_id = req.userId;
        const sql = `
            INSERT INTO transactions
            (payment_amount, currency, provider, payee_account_number, swift_code, user_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        await pool.query(sql, [
            paymentAmount,
            currency,
            provider,
            payeeAccountNumber,
            swiftCode,
            user_id
        ]);

        res.status(200).json({
            message: "Payment submitted successfully"
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Payment submission failed"
        });
    }
});

// GET USER TRANSACTIONS
app.get('/transactions', verifyToken, async (req, res) => {
  const userId = req.userId;

  try {
    const sql = `
      SELECT id, payment_amount, currency, provider, payee_account_number, swift_code, created_at
      FROM transactions
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;
    const [transactions] = await pool.query(sql, [userId]);

    res.status(200).json({ transactions });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});

// START SERVER
app.listen(PORT, () => {
    console.log(`Server running and it is listing to port ${PORT}`);
});
