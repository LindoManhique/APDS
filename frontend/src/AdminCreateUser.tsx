import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./styles/AdminCreateUser.css";

export const AdminCreateUser = () => {
  const [fullNames, setFullNames] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const checkAdmin = async () => {
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const res = await axios.get("http://localhost:5000/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.data.is_admin) {
          alert("Admin access only");
          navigate("/dashboard");
        }
      } catch (error) {
        navigate("/login");
      }
    };
    checkAdmin();
  }, []);

  const createUser = async () => {
    if (!fullNames || !idNumber || !accountNumber || !password) {
      alert("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const nameRegex = /^[A-Za-z\s]{2,50}$/;
    if (!nameRegex.test(fullNames)) {
      alert("Full names must contain only letters and spaces (2-50 characters)");
      return;
    }

    const idRegex = /^\d{13}$/;
    if (!idRegex.test(idNumber)) {
      alert("ID Number must be 13 digits");
      return;
    }

    const accountRegex = /^\d{6,10}$/;
    if (!accountRegex.test(accountNumber)) {
      alert("Account Number must be 6-10 digits");
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      alert("Password must be at least 8 characters with at least 1 letter and 1 number");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/admin/create-user",
        { fullNames, idNumber, accountNumber, password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("User created successfully");
      setFullNames("");
      setIdNumber("");
      setAccountNumber("");
      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      alert(error?.response?.data?.error || "Creation failed");
    }
  };

  return (
    <div className="admin-create-page">
      <div className="admin-create-card">
        <h1>Create New User</h1>
        <p>(Admin Only)</p>

        <input
          placeholder="Full Names"
          value={fullNames}
          onChange={(e) => setFullNames(e.target.value)}
        />

        <input
          placeholder="ID Number (13 digits)"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, '').slice(0,13))}
          type="text"
        />

        <input
          placeholder="Account Number (6-10 digits)"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0,10))}
          type="text"
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

        <button onClick={createUser}>Create User</button>
        <button onClick={() => navigate("/dashboard")}>Back</button>
      </div>
    </div>
  );
};