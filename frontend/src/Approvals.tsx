import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./styles/Approvals.css";

interface PendingPayment {
  id: number;
  payment_amount: string;
  currency: string;
  payee_account_number: string;
  swift_code: string;
  created_at: string;
  user_name: string;
  status: string;
}

export const Approvals = () => {
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  const checkAdminAndFetch = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      // Check if user is admin
      const meRes = await axios.get("http://localhost:5000/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!meRes.data.is_admin) {
        alert("Admin access only");
        navigate("/dashboard");
        return;
      }

      // Fetch pending payments
      const res = await axios.get("http://localhost:5000/admin/pending-payments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayments(res.data.payments);
    } catch (error: any) {
      if (error?.response?.status === 403) {
        alert("Admin access required");
        navigate("/dashboard");
      } else {
        alert("Failed to fetch pending payments");
      }
    } finally {
      setLoading(false);
    }
  };

  const approvePayment = async (id: number) => {
    try {
      await axios.put(
        `http://localhost:5000/admin/approve-payment/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Payment approved");
      checkAdminAndFetch();
    } catch (error) {
      alert("Approval failed");
    }
  };

  const rejectPayment = async (id: number) => {
    try {
      await axios.put(
        `http://localhost:5000/admin/reject-payment/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Payment rejected");
      checkAdminAndFetch();
    } catch (error) {
      alert("Rejection failed");
    }
  };

  if (loading) {
    return (
      <div className="approvals-page">
        <div className="approvals-card">
          <div className="empty-state">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="approvals-page">
      <div className="approvals-card">
        <h1>Pending Approvals</h1>

        <div className="approvals-list">
          {payments.length === 0 ? (
            <div className="empty-state">No pending payments</div>
          ) : (
            payments.map((p) => (
              <div key={p.id} className="approval-item">
                <p>
                  <strong>User:</strong> {p.user_name}
                </p>
                <p>
                  <strong>Amount:</strong> {p.payment_amount} {p.currency}
                </p>
                <p>
                  <strong>Payee Account:</strong> {p.payee_account_number}
                </p>
                <p>
                  <strong>SWIFT:</strong> {p.swift_code}
                </p>
                <p>
                  <strong>Date:</strong> {new Date(p.created_at).toLocaleString()}
                </p>
                <div className="approval-buttons">
                  <button className="approve" onClick={() => approvePayment(p.id)}>
                    Approve
                  </button>
                  <button className="reject" onClick={() => rejectPayment(p.id)}>
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="back-container">
          <button className="back" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};