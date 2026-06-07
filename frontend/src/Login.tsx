import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/Login.css";
import { api } from "./api";

export default function Login() {
  const [idNumber, setIdNumber] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    if (!idNumber || !password) {
      alert("Please enter all fields");
      return;
    }

    try {
      const res = await api.post("/login", {
        idNumber,
        password,
      });

      if (res.data.message === "success" && res.status === 200) {
        localStorage.setItem("token", res.data.token);

        // Admins and normal users now both land on dashboard
        navigate("/dashboard");
      } else {
        alert(res.data.message || "Login failed");
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Login failed";

      alert(message);
      console.log(error);
    }
  };

  return (
    <>
      <h1>Login</h1>

      <div className="login-page">
        <input
          value={idNumber}
          placeholder="ID Number"
          onChange={(e) =>
            setIdNumber(e.target.value.replace(/\D/g, "").slice(0, 13))
          }
          type="text"
        />

        <input
          value={password}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          type="password"
        />

        <button onClick={login}>Login</button>
      </div>
    </>
  );
}