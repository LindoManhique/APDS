import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/AdminCreateUser.css";
import { api } from "./api";

export const AdminCreateUser = () => {
  const [fullNames, setFullNames] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [makeAdmin, setMakeAdmin] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await api.get("/me");

        if (!res.data.is_admin) {
          alert("Admin access only");
          navigate("/dashboard");
        }
      } catch (error) {
        navigate("/login");
      }
    };

    checkAdmin();
  }, [navigate]);

  const createUser = async () => {
    if (!fullNames || !idNumber || !accountNumber || !password || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const nameRegex = /^[A-Za-z\s]{2,50}$/;
    if (!nameRegex.test(fullNames)) {
      alert("Full names must contain only letters and spaces");
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

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&.#_-]{8,}$/;
    if (!passwordRegex.test(password)) {
      alert("Password must be at least 8 characters with at least 1 letter and 1 number");
      return;
    }

    try {
      const res = await api.post("/admin/create-user", {
        fullNames,
        idNumber,
        accountNumber,
        password,
        is_admin: makeAdmin,
      });

      alert(res.data.message || "User created successfully");

      setFullNames("");
      setIdNumber("");
      setAccountNumber("");
      setPassword("");
      setConfirmPassword("");
      setMakeAdmin(false);
    } catch (error: any) {
      alert(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Creation failed"
      );
    }
  };

  return (
    <div className="admin-create-page">
      <div className="admin-create-card">
        <h1>Create New User</h1>
        <p>Admin Only</p>

        <input
          placeholder="Full Names"
          value={fullNames}
          onChange={(e) => setFullNames(e.target.value)}
        />

        <input
          placeholder="ID Number (13 digits)"
          value={idNumber}
          onChange={(e) =>
            setIdNumber(e.target.value.replace(/\D/g, "").slice(0, 13))
          }
          type="text"
        />

        <input
          placeholder="Account Number (6-10 digits)"
          value={accountNumber}
          onChange={(e) =>
            setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
          }
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

        <label>
          <input
            type="checkbox"
            checked={makeAdmin}
            onChange={(e) => setMakeAdmin(e.target.checked)}
          />
          Make this user an admin
        </label>

        <button onClick={createUser}>Create User</button>
        <button onClick={() => navigate("/dashboard")}>Back</button>
      </div>
    </div>
  );
};