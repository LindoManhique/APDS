import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./styles/Transactions.css";

interface Transaction {
  id: number;
  payment_amount: string;
  currency: string;
  provider: string;
  payee_account_number: string;
  swift_code: string;
  created_at: string;
}

export const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await axios.get("http://localhost:5000/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTransactions(res.data.transactions);
      } catch (error) {
        console.error(error);
        navigate("/login");
      }
    };

    fetchTransactions();
  }, [token, navigate]);

  const goBack = () => {
    navigate("/dashboard");
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
                <div className="tx-amount">{tx.payment_amount} {tx.currency}</div>
                <div className="tx-details">
                  Provider: {tx.provider}<br />
                  Payee Account: {tx.payee_account_number}<br />
                  SWIFT: {tx.swift_code}<br />
                  Date: {new Date(tx.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
        <button onClick={goBack} className="back-button">Back to Dashboard</button>
      </div>
    </div>
  );
};