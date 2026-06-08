import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // FIX: optional chaining instead of manual AND check
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    const cookieToken = req.cookies?.employee_token;

    const token = cookieToken || bearerToken;

    if (!token) {
      return res.status(401).json({
        error: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    req.userId = decoded.id;
    req.is_admin = decoded.is_admin === true;

    next();
  } catch (error) {
    return res.status(403).json({
      error: "Invalid or expired token",
    });
  }
};