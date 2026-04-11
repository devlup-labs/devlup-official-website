import React, { useState, useEffect } from 'react'; // ✅ added useEffect
import axios from 'axios';
import { useNavigate, useLocation } from "react-router-dom"; // ✅ added useLocation

const Login = ({ setToken }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      alert(location.state.message);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);

    try {
      const res = await axios.post('/api/login', params);

      localStorage.setItem('token', res.data.access_token);
      setToken(res.data.access_token);

      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (err) {
      alert("Invalid Credentials or Server Offline");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
      <form onSubmit={handleSubmit} className="p-8 bg-slate-800 rounded-xl shadow-2xl w-96 border border-slate-700">

        <input 
          type="text"   // ✅ FIXED
          placeholder="UserId"
          required
          className="block w-full mb-4 p-3 rounded bg-slate-700"
          onChange={(e) => setEmail(e.target.value)} 
        />

        <input 
          type="password"
          placeholder="Password"
          required
          className="block w-full mb-6 p-3 rounded bg-slate-700"
          onChange={(e) => setPassword(e.target.value)} 
        />

        <button className="w-full bg-blue-600 p-3 rounded-lg font-bold">
          Login
        </button>

      </form>
    </div>
  );
};

export default Login;