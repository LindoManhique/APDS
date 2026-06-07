import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/Payment.css";
import { api } from "./api";

function Payment() {
  const [paymentAmount, setPaymentAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [provider] = useState("SWIFT");
  const [payeeAccountNumber, setPayeeAccountNumber] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  const [swiftError, setSwiftError] = useState("");

  const navigate = useNavigate();

  const validateSwiftCodeRealTime = (code: string) => {
    if (!code) {
      setSwiftError("");
      return false;
    }

    if (code.length < 9) {
      setSwiftError(
        `❌ Too short: ${code.length} chars. SWIFT code needs 9-11 characters total`
      );
      return false;
    }

    if (code.length > 11) {
      setSwiftError(
        `❌ Too long: ${code.length} chars. SWIFT code needs 9-11 characters total`
      );
      return false;
    }

    const firstSix = code.substring(0, 6);
    if (!/^[A-Z]{6}$/.test(firstSix)) {
      setSwiftError("❌ First 6 characters must be letters A-Z only");
      return false;
    }

    const lastPart = code.substring(6);
    if (!/^[A-Z0-9]{3,5}$/.test(lastPart)) {
      setSwiftError("❌ Last part must be 3-5 letters or numbers");
      return false;
    }

    setSwiftError("✅ Valid SWIFT code format");
    return true;
  };

  const handleSwiftCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setSwiftCode(value);
    validateSwiftCodeRealTime(value);
  };

  const handlePayment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const amountNum = parseFloat(paymentAmount);

    if (isNaN(amountNum) || amountNum <= 10) {
      alert("❌ Payment amount must be greater than 10");
      return;
    }

    if (!/^[0-9]{6,20}$/.test(payeeAccountNumber)) {
      alert("❌ Account number must be 6-20 digits only");
      return;
    }

    if (!swiftCode) {
      alert("❌ SWIFT code is required");
      return;
    }

    if (swiftCode.length < 9 || swiftCode.length > 11) {
      alert("❌ SWIFT code must be 9-11 characters long");
      return;
    }

    if (!/^[A-Z]{6}$/.test(swiftCode.substring(0, 6))) {
      alert("❌ First 6 characters of SWIFT code must be letters A-Z only");
      return;
    }

    const lastPart = swiftCode.substring(6);
    if (!/^[A-Z0-9]{3,5}$/.test(lastPart)) {
      alert("❌ Last part of SWIFT code must be 3-5 letters or numbers");
      return;
    }

    try {
      const data = {
        paymentAmount: amountNum,
        currency,
        provider,
        payeeAccountNumber,
        swiftCode,
      };

      const res = await api.post("/payment", data);

      alert(res.data.message);

      setPaymentAmount("");
      setCurrency("USD");
      setPayeeAccountNumber("");
      setSwiftCode("");
      setSwiftError("");
    } catch (error: any) {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        alert("Please login first.");
        navigate("/login");
        return;
      }

      alert(error?.response?.data?.message || "Payment failed");
    }
  };

  return (
    <div className="payment-wrapper">
      <div className="payment-card">
        <h1>International Payment</h1>
        <p className="payment-subtitle">
          Send a secure international payment using SWIFT.
        </p>

        <form onSubmit={handlePayment} className="payment-form">
          <label>Payment Amount (must be greater than 10)</label>
          <input
            type="number"
            placeholder="Enter amount (min: 11)"
            value={paymentAmount}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setPaymentAmount(e.target.value)
            }
            required
          />

          <label>Currency</label>
          <select
            value={currency}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setCurrency(e.target.value)
            }
          >
            <option value="USD">USD - United States Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="ZAR">ZAR - South African Rand</option>
          </select>

          <label>Provider</label>
          <input type="text" value={provider} readOnly />

          <label>Payee Account Number (6-20 digits only)</label>
          <input
            type="text"
            placeholder="Enter 6-20 digit account number"
            value={payeeAccountNumber}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setPayeeAccountNumber(e.target.value.replace(/[^0-9]/g, ""))
            }
            required
          />

          <label>SWIFT/BIC Code (9-11 characters)</label>
          <input
            type="text"
            placeholder="Example: FIRNZAJJX"
            value={swiftCode}
            onChange={handleSwiftCodeChange}
            required
          />

          {swiftError && (
            <div
              className="error-message"
              style={{
                color: swiftError.includes("✅") ? "green" : "red",
                fontSize: "12px",
                marginTop: "-10px",
                marginBottom: "10px",
              }}
            >
              {swiftError}
            </div>
          )}

          <button type="submit">Pay Now</button>
          <button type="button" onClick={() => navigate(-1)}>
            Back
          </button>
        </form>
      </div>
    </div>
  );
}

export default Payment;