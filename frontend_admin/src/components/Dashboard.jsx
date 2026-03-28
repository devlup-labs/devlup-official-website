import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, Home, Users, Mic2, Video, 
  FileText, Clock, LogOut, Plus, Search, X, CheckCircle, Trash2, Edit3 
} from 'lucide-react';
import PodcastForm from './PodcastForm';

const Dashboard = ({ token, setToken }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [items, setItems] = useState([]); 
  const [editingItem, setEditingItem] = useState(null);

  // --- API LOGIC ---

  const fetchData = useCallback(async () => {
    if (activeTab === 'dashboard') return;
    try {
      const response = await axios.get(`/api/${activeTab}s`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(response.data.data || []); 
    } catch (err) {
      console.error("Fetch error:", err);
      setItems([]);
    }
  }, [activeTab, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const deleteItem = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`/api/${activeTab}s/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert("Failed to delete item.");
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'home', label: 'Home', icon: <Home size={20} /> },
    { id: 'team', label: 'Team', icon: <Users size={20} /> },
    { id: 'podcast', label: 'Podcast', icon: <Mic2 size={20} /> },
    { id: 'video', label: 'Video', icon: <Video size={20} /> },
    { id: 'blog', label: 'Blog', icon: <FileText size={20} /> },
    { id: 'timeline', label: 'Timeline', icon: <Clock size={20} /> }
  ];

  // --- UI Components ---

  const StatCard = ({ title, count, icon, color, tabId }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex justify-between items-start transition-transform hover:scale-[1.02]">
      <div>
        <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-bold mt-1 text-slate-800">{count}</h3>
        <button 
          onClick={() => setActiveTab(tabId)}
          className="text-blue-600 text-sm font-semibold mt-4 flex items-center gap-1 hover:underline group"
        >
          Manage <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
        </button>
      </div>
      <div className={`p-3 rounded-lg ${color} bg-opacity-10 text-opacity-100`}>
        {icon}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Sidebar */}
      <div className={`bg-[#0f172a] text-white h-screen sticky top-0 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col border-r border-slate-800`}>
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && <h1 className="font-bold text-xl tracking-tight text-blue-400">DEVLUP</h1>}
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="hover:bg-slate-800 p-1 rounded text-slate-400">
            <X size={20} className={isSidebarOpen ? "" : "rotate-45"} />
          </button>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 p-3 rounded-lg transition-all ${
                activeTab === item.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={logout} className="w-full flex items-center gap-4 p-3 text-red-400 hover:bg-red-500/10 rounded-lg">
            <LogOut size={20} />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-bold text-slate-800 capitalize flex items-center gap-2">
            {navItems.find(n => n.id === activeTab)?.icon} {activeTab}
          </h2>
         <div className="flex items-center gap-4">
             <div className="hidden sm:flex bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />WELCOME BACK , ADMIN !
             </div>
             <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold ring-4 ring-blue-50">AD</div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {activeTab === 'dashboard' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard title="Home Section" count="3" icon={<Home size={24} />} color="bg-blue-500 text-blue-500" tabId="home" />
              <StatCard title="Team Members" count="12" icon={<Users size={24} />} color="bg-green-500 text-green-500" tabId="team" />
              <StatCard title="Podcasts" count="8" icon={<Mic2 size={24} />} color="bg-purple-500 text-purple-500" tabId="podcast" />
              <StatCard title="Videos" count="15" icon={<Video size={24} />} color="bg-orange-500 text-orange-500" tabId="video" />
              <StatCard title="Blog Posts" count="24" icon={<FileText size={24} />} color="bg-pink-500 text-pink-500" tabId="blog" />
              <StatCard title="Timeline Events" count="5" icon={<Clock size={24} />} color="bg-teal-500 text-teal-500" tabId="timeline" />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Manage {activeTab}</h3>
                <button onClick={handleAddNew} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-bold hover:bg-blue-700 transition-all">
                  <Plus size={18} /> Add New {activeTab}
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="p-4 font-semibold">Title/Name</th>
                      <th className="p-4 font-semibold">Author/Role</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item) => (
                      <tr key={item.podcast_id || item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-medium text-slate-700">{item.podcast_title || item.name}</td>
                        <td className="p-4 text-slate-500">{item.podcast_author || item.category}</td>
                        <td className="p-4 text-right flex justify-end gap-2">
                          <button onClick={() => handleEdit(item)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit3 size={18}/></button>
                          <button onClick={() => deleteItem(item.podcast_id || item.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">{editingItem ? 'Edit' : 'Add'} {activeTab}</h3>
              <button onClick={() => setShowModal(false)}><X size={24} className="text-slate-400" /></button>
            </div>
            {activeTab === 'podcast' && (
              <PodcastForm 
                token={token} 
                initialData={editingItem} 
                onSuccess={() => { setShowModal(false); fetchData(); }} 
                onCancel={() => setShowModal(false)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;