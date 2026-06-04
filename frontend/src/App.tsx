import { Routes, Route } from "react-router-dom";
import Login from "./Login";
import { Dashboard } from "./Dashboard";
import Payment from "./Payment";
import { Transactions } from "./Transactions";
import { Approvals } from './Approvals';
import { AdminCreateUser } from './AdminCreateUser';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/transactions" element={<Transactions />} />
      <Route path="/approvals" element={<Approvals />} />
      <Route path="/admin/create-user" element={<AdminCreateUser />} /> 
    </Routes>
  );
}

export default App;