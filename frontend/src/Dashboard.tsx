import { useEffect, useState } from "react";  // Add useState
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./styles/Dashboard.css";

export const Dashboard = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);  // ADD THIS

  const getUserData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status !== 200) {
        navigate("/login");
      }
    } catch (error) {
      navigate("/login");
    }
  };

  // ADD THIS to check admin status
  const checkAdminStatus = async () => {
    try {
      const res = await axios.get("http://localhost:5000/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsAdmin(res.data.is_admin);
    } catch (error) {
      console.log("Not admin");
    }
  };

  const goToTransactions = () => {
    navigate("/transactions");
  };

  useEffect(() => {
    getUserData();
    checkAdminStatus();  // ADD THIS
  }, []);

  const goToPayments = () => {
    navigate("/payment");
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-card">
        <h1>Dashboard</h1>
        <p>Welcome to the International Payments Portal.</p>

        <div className="dashboard-buttons">
          <button onClick={goToPayments}>Go to Payments</button>
          <button onClick={goToTransactions}>View My Transactions</button>
          
          {/* Only show admin buttons if isAdmin is true */}
          {isAdmin && (
            <>
              <button onClick={() => navigate("/approvals")}>Approve Payments</button>
              <button onClick={() => navigate("/admin/create-user")}>Create New User</button>
            </>
          )}
          
          <button onClick={logout}>Logout</button>
        </div>
      </div>
    </div>
  );
};