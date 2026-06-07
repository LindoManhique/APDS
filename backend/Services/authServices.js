import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// BCrypt automatically generates and stores the salt inside the hash
const SALT_ROUNDS = 12;

export const hashPassword = async (password) => {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  return hashedPassword;
};

export const verifyPassword = async (userPassword, dbPassword) => {
  const isValid = await bcrypt.compare(userPassword, dbPassword);
  return isValid;
};

export const generateToken = (user) => {
  const token = jwt.sign(
    {
      id: user.id,
      is_admin: Number(user.is_admin) === 1,
    },
    process.env.SECRET_KEY,
    {
      expiresIn: "1h",
    }
  );

  return token;
};