import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function AdminApp() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  return (
    <Routes>

      {/* LOGIN (NO CONDITION HERE) */}
      <Route
        path="login"
        element={<Login setToken={setToken} />}
      />

      {/* DASHBOARD (ONLY PROTECTED HERE) */}
      <Route
        path="dashboard"
        element={
          <ProtectedRoute>
            <Dashboard token={token} setToken={setToken} />
          </ProtectedRoute>
        }
      />

      {/* DEFAULT → ALWAYS GO TO LOGIN */}
      <Route
        path="*"
        element={<Navigate to="/admin/login" replace />}
      />

    </Routes>
  );
}

export default AdminApp;