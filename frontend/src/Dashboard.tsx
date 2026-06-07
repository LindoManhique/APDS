import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/Dashboard.css";
import { api } from "./api";

export const Dashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  const getUserData = async () => {
    try {
      const res = await api.get("/dashboard");

      if (res.status !== 200) {
        navigate("/login");
      }
    } catch (error) {
      navigate("/login");
    }
  };

  const checkAdminStatus = async () => {
    try {
      const res = await api.get("/me");
      setIsAdmin(res.data.is_admin);
    } catch (error) {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    getUserData();
    checkAdminStatus();
  }, []);

const logout = async () => {
  try {
    await api.post("/logout");
  } catch (error) {
    console.log(error);
  }

  localStorage.removeItem("token");
  navigate("/login");
};
  return (
    <div className="dashboard-page">
      <div className="dashboard-card">
        <h1>Dashboard</h1>
        <p>Welcome to the International Payments Portal.</p>

        <div className="dashboard-buttons">
          <button onClick={() => navigate("/payment")}>Go to Payments</button>
          <button onClick={() => navigate("/transactions")}>
            View My Transactions
          </button>

          {isAdmin && (
            <>
              <button onClick={() => navigate("/approvals")}>
                Approve Payments
              </button>
              <button onClick={() => navigate("/admin/create-user")}>
                Create New User
              </button>
            </>
          )}

          <button onClick={logout}>Logout</button>
        </div>
      </div>
    </div>
  );
};