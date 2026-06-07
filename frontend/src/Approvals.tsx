import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/Approvals.css";
import { api } from "./api";

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
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  const checkAdminAndFetch = async () => {
    try {
      const meRes = await api.get("/me");

      if (!meRes.data.is_admin) {
        alert("Admin access only");
        navigate("/dashboard");
        return;
      }

      const res = await api.get("/admin/pending-payments");
      setPayments(res.data.payments);
    } catch (error: any) {
      if (error?.response?.status === 403) {
        alert("Admin access required");
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const approvePayment = async (id: number) => {
    try {
      await api.put(`/admin/approve-payment/${id}`, {});
      alert("Payment approved");
      checkAdminAndFetch();
    } catch (error) {
      alert("Approval failed");
    }
  };

  const rejectPayment = async (id: number) => {
    try {
      await api.put(`/admin/reject-payment/${id}`, {});
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