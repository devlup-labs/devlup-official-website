import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, Home, Users, Mic2, Video, 
  FileText, Clock, LogOut, Plus, Search, X, CheckCircle, Trash2, Edit3, Menu
} from 'lucide-react';

import PodcastForm from './PodcastForm';
import BlogForm from './BlogForm';
import VideoManager from './VideoManager';
import TeamForm from './TeamForm';
import TimelineForm from './TimelineForm';

import { useNavigate } from "react-router-dom";


const Dashboard = ({ token, setToken }) => {
  const navigate = useNavigate();
  const [notification, setNotification] = useState('');
  
const handleLogout = () => {
  localStorage.removeItem("token");
  setToken(null);
  setNotification('Logged out successfully');
  setTimeout(() => {
    navigate("/login");
  }, 1500);
};
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Default false for mobile-first
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile menu toggle
  const [showModal, setShowModal] = useState(false);
  const [items, setItems] = useState([]); 
  const [editingItem, setEditingItem] = useState(null);
  const [selectedTag, setSelectedTag] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [counts, setCounts] = useState({
  home: 0,
  team: 0,
  podcast: 0,
  video: 0,
  blog: 0,
  timeline: 0,
  contact: 0
});

  //  FIX: endpoint mapping
const getEndpoint = () => {
  switch (activeTab) {
    case 'podcast': return 'podcasts';
    case 'blog': return 'blogs';
    case 'video': return 'videos';
    case 'team': return 'team';
    case 'timeline': return 'timeline';
    case 'contact': return 'contact'; 
    default: return `${activeTab}s`;
  }
};

  //  FIX: dynamic helpers
  const getItemId = (item) =>
    item.contact_id ||  
    item.podcast_id ||
    item.blog_id ||
    item.video_id ||
    item.member_id ||
    item.event_id ||
    item.id;

  const getItemTitle = (item) =>
     item.name ||  
    item.podcast_title ||
    item.blog_title ||
    item.video_title ||
    item.member_name ||
    item.event_title ||
   ""; // Default to empty string instead of undefined

  const getItemAuthor = (item) =>
      item.email ||   
    item.podcast_author ||
    item.blog_author ||
    item.member_designation ||
    item.event_subtitle ||
    item.category||
    ""; // Default to empty string


const getTags = (item) =>
  activeTab === "team"
    ? [item.member_designation]
    : activeTab === "video"
    ? [item.category]   //  ADD THIS
    : item.video_tags ||
      item.blog_tags ||
      item.podcast_tags ||
      [];

  // --- API LOGIC ---
  const fetchData = useCallback(async () => {
    //  IMPORTANT FIX: skip home (no API)
    if (activeTab === 'dashboard' || activeTab === 'home') return;

    try {
      const endpoint = getEndpoint();

      const response = await axios.get(`/api/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

        //  FIX: handle all tabs
    setItems(response.data.data || response.data || []);


    } catch (err) {
      console.error("Fetch error:", err);
      setItems([]);
    }
  }, [activeTab, token]);

const fetchCounts = useCallback(async () => {  //  Separate function to fetch counts for dashboard cards
  try {
    const endpoints = [
      { key: "team", url: "team" },
      { key: "podcast", url: "podcasts" },
      { key: "video", url: "videos" },
      { key: "blog", url: "blogs" },
      { key: "timeline", url: "timeline" },
      { key: "contact", url: "contact" }
    ];

    const results = await Promise.all(
      endpoints.map(e =>
        axios.get(`/api/${e.url}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      )
    );

   const newCounts = {
  home: 0, // Home doesn't have an API, so we set it to 0 or you can choose to hide it
};

endpoints.forEach((e, index) => {
  newCounts[e.key] = results[index].data.data?.length ||  results[index].data?.length || 0;
});

    setCounts(newCounts);

  } catch (err) {
    console.error("Count fetch error:", err);
  }
}, [token]);


  useEffect(() => {
  fetchCounts();
}, [fetchCounts]); 

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const deleteItem = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const endpoint = getEndpoint();

      await axios.delete(`/api/${endpoint}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchData();
      fetchCounts(); 
    } catch (err) {
      alert("Failed to delete item.");
    }
  };
const handleEdit = (item) => {
  if (activeTab === "contact") return; // block
  setEditingItem(item);
  setShowModal(true);
};
  const handleAddNew = () => {
  if (activeTab === "contact") return; // block
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
    { id: 'timeline', label: 'Timeline', icon: <Clock size={20} /> },
    { id: 'contact', label: 'Contacts', icon: <FileText size={20} /> }
  ];

 const allTags =
  ['video', 'blog', 'podcast', 'team'].includes(activeTab)
    ? [
        "all",
        ...new Set(
          items.flatMap(item =>
            getTags(item)
              .filter(Boolean)
              .map(tag => tag.trim().toLowerCase()) //  FIX HERE
          )
        )
      ]
    : [];

  //  FILTER LOGIC (SEARCH + TAG)
  const filteredItems = items.filter((item) => {
    const tags = getTags(item).filter(Boolean).map(t => t.toLowerCase());

    const matchesTag =
      selectedTag === "all" ||
      tags.includes(selectedTag.toLowerCase());

    const title = getItemTitle(item)?.toLowerCase() || "";
    const author = getItemAuthor(item)?.toLowerCase() || "";

    const matchesSearch =
      title.includes(searchQuery.toLowerCase()) ||
      author.includes(searchQuery.toLowerCase());

    return matchesTag && matchesSearch;
  });

  // --- UI Components ---
  const StatCard = ({ title, count, icon, color, tabId }) => (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100 flex justify-between items-start transition-transform hover:scale-[1.02] cursor-pointer" onClick={() => setActiveTab(tabId)}>
      <div className="flex-1">
        <p className="text-slate-500 text-xs md:text-sm font-medium uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl md:text-3xl font-bold mt-2 text-slate-800">{count}</h3>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setActiveTab(tabId);
          }}
          className="text-blue-600 text-xs md:text-sm font-semibold mt-3 flex items-center gap-1 hover:underline group"
        >
          Manage <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
        </button>
      </div>
      <div className={`p-2 md:p-3 rounded-lg ${color} bg-opacity-10 text-opacity-100 flex-shrink-0`}>
        {icon}
      </div>
    </div>
  );

  return (
    <div className=" admin-panel flex min-h-screen bg-[#f8fafc]">
      {/* Sidebar - Hidden on mobile by default */}
      <div className={`fixed md:sticky top-0 left-0 h-screen z-40 transition-all duration-300 ${
        isMobileMenuOpen ? 'w-64' : 'w-0 md:w-64'
      } md:w-64 bg-[#0f172a] text-white flex flex-col border-r border-slate-800 overflow-hidden`}>
        <div className="p-6 flex items-center justify-between">
          <h1 className="font-bold text-xl tracking-tight text-blue-400">DEVLUP ADMIN</h1>
          <button 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="md:hidden hover:bg-slate-800 p-1 rounded text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false); // Close menu on mobile after selection
              }}
              className={`w-full flex items-center gap-4 p-3 rounded-lg transition-all ${
                activeTab === item.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => {
              handleLogout();
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-4 p-3 text-red-400 hover:bg-red-500/10 rounded-lg"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main */}
      <main className="flex-1 overflow-y-auto w-full">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 p-3 md:p-4 flex justify-between items-center sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden hover:bg-slate-100 p-2 rounded text-slate-600"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg md:text-xl font-bold text-slate-800 capitalize flex items-center gap-2">
              {navItems.find(n => n.id === activeTab)?.icon} 
              <span className="hidden sm:inline">{activeTab}</span>
            </h2>
          </div>
         <div className="flex items-center gap-2 md:gap-4">
             <div className="hidden sm:flex bg-green-100 text-green-700 px-2 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-medium items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="hidden md:inline">WELCOME BACK, ADMIN!</span>
             </div>
             <div className="w-9 md:w-10 h-9 md:h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm md:text-base font-bold ring-4 ring-blue-50">AD</div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                     <StatCard title="Home Section" count={counts.home} icon={<Home size={20} md:size={24} color="#1d4ed8" />} color="bg-blue-100 text-blue-500" tabId="home" />
        <StatCard title="Team Members" count={counts.team} icon={<Users size={20} md:size={24} color="#16a34a" />} color="bg-green-100 text-green-500" tabId="team" />
        <StatCard title="Podcasts" count={counts.podcast} icon={<Mic2 size={20} md:size={24} color="#7c3aed" />} color="bg-purple-100 text-purple-500" tabId="podcast" />
        <StatCard title="Videos" count={counts.video} icon={<Video size={20} md:size={24} color="#ea580c" />} color="bg-orange-100 text-orange-500" tabId="video" />
        <StatCard title="Blog Posts" count={counts.blog} icon={<FileText size={20} md:size={24} color="#db2777" />} color="bg-pink-100 text-pink-500" tabId="blog" />
        <StatCard title="Timeline Events" count={counts.timeline} icon={<Clock size={20} md:size={24} color="#14b8a6" />} color="bg-teal-100 text-teal-500" tabId="timeline" />
        <StatCard title="Contacts" count={counts.contact} icon={<FileText size={20} md:size={24} color="#ef4444" />} color="bg-red-100 text-red-500" tabId="contact" />
                    </div>
          ): activeTab === 'video' ? (
  <VideoManager 
    items={filteredItems} 
    handleEdit={handleEdit} 
    deleteItem={deleteItem}
      onSync={fetchData} 
  />
) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {/* Controls Section */}
              <div className="p-4 md:p-6 border-b border-slate-100">
                <h3 className="text-base md:text-lg font-bold text-slate-800 uppercase tracking-tight mb-4 md:mb-0">Manage {activeTab}</h3>
                <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center mt-4 md:mt-0">
                  {/* Search */}
                  <div className="relative flex-1 md:flex-none">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full md:w-auto pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  {/* Tag Dropdown & Add Button */}
                  <div className="flex flex-col sm:flex-row gap-2 md:gap-3 w-full md:w-auto ">
                    {/* Tag Dropdown */}
                    {['video', 'blog', 'podcast', 'team'].includes(activeTab) && (
                      <select
                        value={selectedTag}
                        onChange={(e) => setSelectedTag(e.target.value)}
                        className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full md:w-auto bg-slate-50"
                      >
                        {allTags.map(tag => (
                          <option key={tag} value={tag}>
                            {tag.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* Add Button */}
                    {activeTab !== "contact" && (
                      <button 
                        onClick={handleAddNew} 
                        className="bg-blue-600 text-white px-4 md:px-6 py-2 rounded-lg flex items-center justify-center md:justify-start gap-2 font-bold hover:bg-blue-700 transition-all text-sm md:text-base w-full md:w-auto"
                      >
                        <Plus size={18} /> 
                        <span className="md:inline">Add New {activeTab}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="p-4 font-semibold">
                        {activeTab === "contact" ? "Name" : "Title/Name"}
                      </th>

                      <th className="p-4 font-semibold">
                        {activeTab === "contact" ? "Email" : "Author/Role"}
                      </th>

                      {activeTab === "contact" && (
                        <th className="p-4 font-semibold">Query</th>
                      )}

                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredItems.map((item) => (
                      <tr key={getItemId(item)} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-medium text-slate-700 truncate">
                          {getItemTitle(item)}
                        </td>

                        <td className="p-4 text-slate-500 truncate">
                          {getItemAuthor(item)}
                        </td>

                        {/* QUERY ONLY FOR CONTACT */}
                        {activeTab === "contact" && (
                          <td className="p-4 max-w-xs cursor-pointer text-slate-400" title={item.query || ""}>
                            {item.query?.length > 60 
                              ? item.query.slice(0, 60) + "..." 
                              : (item.query || "No message")}
                          </td>
                        )}

                        {/* ACTIONS */}
                        <td className="p-4 text-right flex justify-end gap-2">
                          {/* NO EDIT FOR CONTACT */}
                          {activeTab !== "contact" && (
                            <button 
                              onClick={() => handleEdit(item)} 
                              className="p-2 text-slate-400 hover:text-blue-700 transition-colors"
                            >
                              <Edit3 size={18}/>
                            </button>
                          )}

                          <button 
                            onClick={() => deleteItem(getItemId(item))} 
                            className="p-2 text-slate-400 hover:text-red-800 transition-colors"
                          >
                            <Trash2 size={18}/>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-slate-100">
                {filteredItems.map((item) => (
                  <div key={getItemId(item)} className="p-4 hover:bg-slate-50/50 transition-colors">
                    <div className="mb-3">
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                        {activeTab === "contact" ? "Name" : "Title"}
                      </p>
                      <p className="text-base font-medium text-slate-700 mt-1">{getItemTitle(item)}</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                        {activeTab === "contact" ? "Email" : "Author/Role"}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">{getItemAuthor(item)}</p>
                    </div>

                    {/* QUERY ONLY FOR CONTACT */}
                    {activeTab === "contact" && (
                      <div className="mb-4">
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Query</p>
                        <p className="text-sm text-slate-400 mt-1" title={item.query || ""}>
                          {item.query?.length > 60 
                            ? item.query.slice(0, 60) + "..." 
                            : (item.query || "No message")}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 justify-end">
                      {/* NO EDIT FOR CONTACT */}
                      {activeTab !== "contact" && (
                        <button 
                          onClick={() => handleEdit(item)} 
                          className="p-2 text-slate-400 hover:text-blue-700 transition-colors bg-slate-50 rounded-lg"
                        >
                          <Edit3 size={18}/>
                        </button>
                      )}

                      <button 
                        onClick={() => deleteItem(getItemId(item))} 
                        className="p-2 text-slate-400 hover:text-red-800 transition-colors bg-slate-50 rounded-lg"
                      >
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {filteredItems.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  <p>No items found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal - Mobile Responsive */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-lg p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh] md:max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg md:text-xl font-bold text-slate-800">{editingItem ? 'Edit' : 'Add'} {activeTab}</h3>
              <button onClick={() => setShowModal(false)}><X size={24} className="text-slate-400" /></button>
            </div>

            {activeTab === 'podcast' && <PodcastForm token={token} initialData={editingItem} onSuccess={()=>{setShowModal(false);fetchData(); fetchCounts(); }} onCancel={()=>setShowModal(false)} />}
            {activeTab === 'blog' && <BlogForm token={token} initialData={editingItem} onSuccess={()=>{setShowModal(false);fetchData(); fetchCounts(); }} onCancel={()=>setShowModal(false)} />}
            {activeTab === 'team' && <TeamForm token={token} initialData={editingItem} onSuccess={()=>{setShowModal(false);fetchData(); fetchCounts(); }} onCancel={()=>setShowModal(false)} />}
            {activeTab === 'timeline' && <TimelineForm token={token} initialData={editingItem} onSuccess={()=>{setShowModal(false);fetchData(); fetchCounts(); }} onCancel={()=>setShowModal(false)} />}
        
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;