import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function AdminApp() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  return (
    <div className="admin-panel">
      {!token ? (
        <Login setToken={setToken} />
      ) : (
        <Dashboard token={token} setToken={setToken} />
      )}
    </div>
  );
}

export default AdminApp;
