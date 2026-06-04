import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/SignUp.css";
import axios from "axios";

function SignUp() {
  const [fullNames, setFullNames] = useState<string>("");
  const [idNumber, setIdNumber] = useState<string | "">("");
  const [accountNumber, setAccountNumber] = useState<string | "">("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const navigate = useNavigate();

  const submitForm = async () => {
    const data = { fullNames, idNumber, accountNumber, password };
    try {
      
      if (!basicValidation()) return;
      const res = await axios.post(`http://localhost:5000/signup`, data);
      setFullNames("");
      setIdNumber("");
      setAccountNumber("");
      setPassword("");
      setConfirmPassword("")
      alert("Account created succesfully, Please login");
    } catch (error: any) {
      if (error) {
        alert(error);
      }
    }
  };

  const loginPage = () => {
    navigate("/Login");
  };

  //AI GENERATED REGEX please don't edit
  const basicValidation = () => {
    if (!(fullNames && idNumber && password && accountNumber)) {
      alert("Please enter all fields");
      return false;
    }
// Add to basicValidation:
if (password !== confirmPassword) {
    alert("Passwords do not match");
    return false;
}
    // Name: letters and spaces only, 2-50 chars
    const nameRegex = /^[A-Za-z\s]{2,50}$/;
    if (!nameRegex.test(fullNames)) {
      alert(
        "Full names must contain only letters and spaces (2-50 characters)",
      );
      return false;
    }

    // ID Number: exactly 13 digits (South African ID)
    const idRegex = /^\d{13}$/;
    if (!idRegex.test(idNumber)) {
      alert("ID Number must be 13 digits");
      return false;
    }

    // Account Number: 6-10 digits
    const accountRegex = /^\d{6,10}$/;
    if (!accountRegex.test(accountNumber)) {
      alert("Account Number must be 6-10 digits");
      return false;
    }

    // Password: min 8 chars, at least 1 letter and 1 number
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      alert(
        "Password must be at least 8 characters with at least 1 letter and 1 number",
      );
      return false;
    }

    return true;
  };

  return (
    <>
      <h1 className="register-name">Registration page</h1>
      <div className="registration-page">
        <input
          placeholder="Full names"
          value={fullNames}
          onChange={(e) => setFullNames(e.target.value)}
        />
        <input
          placeholder="ID Number"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
          type="number"
        />
        <input
          placeholder="Account Number"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          type="number"
        />
        <input
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
        />

        <input
    placeholder="Confirm Password"
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    type="password"
/>

        <button onClick={submitForm}>Register</button>
        <button onClick={loginPage}>Login here</button>
      </div>
    </>
  );
}

export default SignUp;
