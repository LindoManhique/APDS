import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/Login.css";
import axios from "axios";

export default function login() {
  const [idNumber, setIdNumber] = useState<number>();
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();

  const signup = async () => {
    navigate("/SignUp");
  };

  const login = async () => {
    validation();
    const data = { idNumber, password };

    try {
      const res = await axios.post(`http://localhost:5000/login`, data);
      if (res.data.message === "success" && res.status === 200) {
        const token = res.data.token;
        localStorage.setItem("token", token);
        navigate("/dashboard");
      }
    } catch (error: any) {
      alert(error?.response?.data?.message);
    }
  };
  const validation = () => {
    if (!(idNumber && password)) return alert("Please enter all fields");
  };

  return (
    <>
      <h1>Login</h1>
      <div className="login-page">
        <input
          value={idNumber}
          placeholder="ID Number"
          onChange={(e) => setIdNumber(Number(e.target.value))}
          type="number"
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
