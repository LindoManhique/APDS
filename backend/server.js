import dotenv from "dotenv";
dotenv.config({ override: true });

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

import pool from "./config/db.js";
import {
  hashPassword,
  verifyPassword,
  generateToken,
} from "./Services/authServices.js";
import { verifyToken } from "./middleware/authMiddleware.js";

import {
  validateFullName,
  validateIdNumber,
  validateAccountNumber,
  validateSwiftCode,
  validateAmount,
} from "./Services/validation.js";

const app = express();
const PORT = process.env.PORT || 5000;

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const IS_PRODUCTION = process.env.NODE_ENV === "production";

console.log("ENV CHECK LOCKED:", process.env.DB_NAME);

// Needed when deployed behind proxy/load balancer
app.set("trust proxy", 1);

// Force HTTPS in production
app.use((req, res, next) => {
  if (IS_PRODUCTION && req.headers["x-forwarded-proto"] !== "https") {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }

  next();
});

// JSON body limit helps reduce abuse
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// Restricted CORS
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Helmet security headers
const helmetConfig = {
  frameguard: {
    action: "deny",
  },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  hsts: IS_PRODUCTION
    ? {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      }
    : false,
};

if (IS_PRODUCTION) {
  helmetConfig.contentSecurityPolicy.directives.upgradeInsecureRequests = [];
}

app.use(helmet(helmetConfig));

// General rate limit
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests, please try again later.",
  },
});

app.use(globalLimiter);

// Stricter login rate limit
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many login attempts. Please try again later.",
  },
});

// Extra validators
const validatePassword = (password) => {
  return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&.#_-]{8,}$/.test(password);
};

const validatePayeeAccountNumber = (accountNumber) => {
  return /^\d{6,20}$/.test(String(accountNumber));
};

// Admin check middleware
const isAdmin = async (req, res, next) => {
  try {
    const [user] = await pool.execute(
      "SELECT is_admin FROM users WHERE id = ? LIMIT 1",
      [req.userId]
    );

    if (!user[0] || Number(user[0].is_admin) !== 1) {
      return res.status(403).json({
        error: "Admin access required",
      });
    }

    next();
  } catch (error) {
    console.error("Admin check error:", error);
    return res.status(500).json({
      error: "Server error",
    });
  }
};

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "Employee Portal API is running securely",
  });
});

// PUBLIC SIGNUP DISABLED
// Requirement: users must be admin-created only.
app.post("/signup", (req, res) => {
  return res.status(403).json({
    message: "Public signup is disabled. Users must be created by an admin.",
  });
});

// LOGIN
app.post("/login", loginLimiter, async (req, res) => {
  try {
    const { idNumber, password } = req.body;

    if (!idNumber || !password) {
      return res.status(400).json({
        message: "ID number and password are required.",
      });
    }

    if (!validateIdNumber(idNumber)) {
      return res.status(400).json({
        message: "Invalid ID number format.",
      });
    }

    const [result] = await pool.execute(
      `SELECT id, Full_name, id_number, account_number, password, is_admin
       FROM users
       WHERE id_number = ?
       LIMIT 1`,
      [idNumber]
    );

    if (result.length === 0) {
      return res.status(401).json({
        message: "Invalid login details.",
      });
    }

    const user = result[0];

    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return res.status(401).json({
        message: "Invalid login details.",
      });
    }

    const token = generateToken(user);

    // HTTP-only secure cookie helps reduce session theft through XSS
    res.cookie("employee_token", token, {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: "strict",
      maxAge: 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "success",
      token,
      user: {
        id: user.id,
        fullNames: user.Full_name,
        idNumber: user.id_number,
        accountNumber: user.account_number,
        is_admin: Number(user.is_admin) === 1,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      message: "Server error during login.",
    });
  }
});

// LOGOUT
app.post("/logout", verifyToken, (req, res) => {
  res.clearCookie("employee_token", {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "strict",
  });

  return res.status(200).json({
    message: "Logged out successfully.",
  });
});

// CURRENT USER INFO
app.get("/me", verifyToken, async (req, res) => {
  try {
    const [user] = await pool.execute(
      `SELECT id, Full_name, id_number, account_number, is_admin
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [req.userId]
    );

    if (user.length === 0) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json({
      user: {
        id: user[0].id,
        fullNames: user[0].Full_name,
        idNumber: user[0].id_number,
        accountNumber: user[0].account_number,
        is_admin: Number(user[0].is_admin) === 1,
      },
      is_admin: Number(user[0].is_admin) === 1,
    });
  } catch (error) {
    console.error("ME ERROR:", error);
    return res.status(500).json({
      error: "Server error",
    });
  }
});

// DASHBOARD PROTECTED ROUTE
app.get("/dashboard", verifyToken, (req, res) => {
  return res.status(200).json({
    message: `Welcome user ${req.userId}`,
    is_admin: req.is_admin,
  });
});

// ADMIN: CREATE EMPLOYEE USER
app.post("/admin/create-user", verifyToken, isAdmin, async (req, res) => {
  try {
    const { fullNames, idNumber, accountNumber, password, is_admin } = req.body;

    if (!fullNames || !idNumber || !accountNumber || !password) {
      return res.status(400).json({
        error: "All fields are required.",
      });
    }

    if (
      !validateFullName(fullNames) ||
      !validateIdNumber(idNumber) ||
      !validateAccountNumber(accountNumber) ||
      !validatePassword(password)
    ) {
      return res.status(400).json({
        error: "Invalid input detected. Please check all fields.",
      });
    }

    const [existingUser] = await pool.execute(
      `SELECT id
       FROM users
       WHERE id_number = ? OR account_number = ?
       LIMIT 1`,
      [idNumber, accountNumber]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        error: "Duplicate entry detected. ID or account number already exists.",
      });
    }

    const hashedPassword = await hashPassword(password);

    await pool.execute(
      `INSERT INTO users
       (Full_name, id_number, account_number, password, is_admin)
       VALUES (?, ?, ?, ?, ?)`,
      [
        fullNames,
        idNumber,
        accountNumber,
        hashedPassword,
        is_admin === true ? 1 : 0,
      ]
    );

    return res.status(201).json({
      message: "User created successfully.",
    });
  } catch (error) {
    console.error("CREATE USER ERROR:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        error: "Duplicate entry detected.",
      });
    }

    return res.status(500).json({
      error: "Server error during user creation.",
    });
  }
});

// ADMIN: GET ALL USERS
app.get("/admin/users", verifyToken, isAdmin, async (req, res) => {
  try {
    const [users] = await pool.execute(
      `SELECT id, Full_name, id_number, account_number, is_admin
       FROM users
       ORDER BY id ASC`
    );

    return res.status(200).json({
      users,
    });
  } catch (error) {
    console.error("GET USERS ERROR:", error);
    return res.status(500).json({
      error: "Failed to fetch users.",
    });
  }
});

// ADMIN: DELETE USER
app.delete("/admin/users/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        error: "Invalid user ID.",
      });
    }

    if (Number(id) === Number(req.userId)) {
      return res.status(400).json({
        error: "You cannot delete your own admin account.",
      });
    }

    const [result] = await pool.execute("DELETE FROM users WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "User not found.",
      });
    }

    return res.status(200).json({
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    return res.status(500).json({
      error: "Failed to delete user.",
    });
  }
});

// ADMIN: GET PENDING PAYMENTS
app.get("/admin/pending-payments", verifyToken, isAdmin, async (req, res) => {
  try {
    const [payments] = await pool.execute(
      `SELECT t.*, u.Full_name AS user_name
       FROM transactions t
       JOIN users u ON t.user_id = u.id
       WHERE t.status = "pending" OR t.status IS NULL
       ORDER BY t.created_at DESC`
    );

    return res.status(200).json({
      payments,
    });
  } catch (error) {
    console.error("PENDING PAYMENTS ERROR:", error);
    return res.status(500).json({
      error: "Failed to fetch pending payments.",
    });
  }
});

// ADMIN: APPROVE PAYMENT
app.put("/admin/approve-payment/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        error: "Invalid payment ID.",
      });
    }

    await pool.execute(
      `UPDATE transactions
       SET status = "approved"
       WHERE id = ?`,
      [id]
    );

    return res.status(200).json({
      message: "Payment approved.",
    });
  } catch (error) {
    console.error("APPROVE ERROR:", error);
    return res.status(500).json({
      error: "Approval failed.",
    });
  }
});

// ADMIN: REJECT PAYMENT
app.put("/admin/reject-payment/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        error: "Invalid payment ID.",
      });
    }

    await pool.execute(
      `UPDATE transactions
       SET status = "rejected"
       WHERE id = ?`,
      [id]
    );

    return res.status(200).json({
      message: "Payment rejected.",
    });
  } catch (error) {
    console.error("REJECT ERROR:", error);
    return res.status(500).json({
      error: "Rejection failed.",
    });
  }
});

// PAYMENT ROUTE
app.post("/payment", verifyToken, async (req, res) => {
  try {
    const {
      paymentAmount,
      currency,
      provider,
      payeeAccountNumber,
      swiftCode,
    } = req.body;

    if (
      !paymentAmount ||
      !currency ||
      !provider ||
      !payeeAccountNumber ||
      !swiftCode
    ) {
      return res.status(400).json({
        message: "All payment fields are required.",
      });
    }

    if (
      !validateAmount(paymentAmount) ||
      !validatePayeeAccountNumber(payeeAccountNumber) ||
      !validateSwiftCode(swiftCode)
    ) {
      return res.status(400).json({
        message: "Invalid payment input detected.",
      });
    }

    const sql = `
      INSERT INTO transactions
      (payment_amount, currency, provider, payee_account_number, swift_code, user_id, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `;

    await pool.execute(sql, [
      paymentAmount,
      currency,
      provider,
      payeeAccountNumber,
      swiftCode,
      req.userId,
    ]);

    return res.status(200).json({
      message: "Payment submitted successfully.",
    });
  } catch (error) {
    console.error("PAYMENT ERROR:", error);
    return res.status(500).json({
      message: "Payment submission failed.",
    });
  }
});

// USER TRANSACTIONS
app.get("/transactions", verifyToken, async (req, res) => {
  try {
    const sql = `
      SELECT id, payment_amount, currency, provider, payee_account_number, swift_code, created_at, status
      FROM transactions
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;

    const [transactions] = await pool.execute(sql, [req.userId]);

    return res.status(200).json({
      transactions,
    });
  } catch (error) {
    console.error("TRANSACTIONS ERROR:", error);
    return res.status(500).json({
      message: "Failed to fetch transactions.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});