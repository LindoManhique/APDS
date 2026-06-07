import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/Transactions.css";
import { api } from "./api";

interface Transaction {
  id: number;
  payment_amount: string;
  currency: string;
  provider: string;
  payee_account_number: string;
  swift_code: string;
  created_at: string;
  status: string;
}

export const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await api.get("/transactions");
        setTransactions(res.data.transactions);
      } catch (error) {
        console.error(error);
        navigate("/login");
      }
    };

    fetchTransactions();
  }, [navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "green";
      case "rejected":
        return "red";
      case "pending":
        return "orange";
      default:
        return "black";
    }
  };

  return (
    <div className="transactions-page">
      <div className="transactions-card">
        <h1>Your Transactions</h1>

        {transactions.length === 0 ? (
          <p>No transactions found.</p>
        ) : (
          <div className="transactions-list">
            {transactions.map((tx) => (
              <div key={tx.id} className="transaction-item">
                <div className="tx-amount">
                  {tx.payment_amount} {tx.currency}
                </div>

                <div className="tx-details">
                  Provider: {tx.provider}
                  <br />
                  Payee Account: {tx.payee_account_number}
                  <br />
                  SWIFT: {tx.swift_code}
                  <br />
                  Status:{" "}
                  <strong style={{ color: getStatusColor(tx.status) }}>
                    {tx.status.toUpperCase()}
                  </strong>
                  <br />
                  Date: {new Date(tx.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}

        <button onClick={() => navigate("/dashboard")} className="back-button">
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};