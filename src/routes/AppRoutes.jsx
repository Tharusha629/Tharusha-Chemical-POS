import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

import Dashboard from "../pages/Dashboard";
import Billing from "../pages/Billing";
import Products from "../pages/Products";
import Customers from "../pages/Customers";
import Credit from "../pages/Credit";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout><Dashboard /></MainLayout>} />
      <Route path="/billing" element={<MainLayout><Billing /></MainLayout>} />
      <Route path="/products" element={<MainLayout><Products /></MainLayout>} />
      <Route path="/customers" element={<MainLayout><Customers /></MainLayout>} />
      <Route path="/credit" element={<MainLayout><Credit /></MainLayout>} />
      <Route path="/reports" element={<MainLayout><Reports /></MainLayout>} />
      <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
    </Routes>
  );
}

export default AppRoutes;