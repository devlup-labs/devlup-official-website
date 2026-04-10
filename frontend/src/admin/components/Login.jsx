import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ setToken }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.append('username', email); // backend expects 'username'
    params.append('password', password);

    try {
      // We use /api prefix because of our Vite proxy config
      const res = await axios.post('/api/login', params);
      localStorage.setItem('token', res.data.access_token);
      setToken(res.data.access_token);
    } catch (err) {
      alert("Invalid Credentials or Server Offline");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
      <form onSubmit={handleSubmit} className="p-8 bg-slate-800 rounded-xl shadow-2xl w-96 border border-slate-700">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">Devlup Admin</h2>
        <input 
          type="email" placeholder="Email" required
          className="block w-full mb-4 p-3 rounded bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="password" placeholder="Password" required
          className="block w-full mb-6 p-3 rounded bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
          onChange={(e) => setPassword(e.target.value)} 
        />
        <button className="w-full bg-blue-600 p-3 rounded-lg font-bold hover:bg-blue-500 transition-all">
           Login
        </button>
      </form>
    </div>
  );
};

export default Login;
