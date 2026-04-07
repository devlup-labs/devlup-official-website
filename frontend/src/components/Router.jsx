import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './home/landing_page.jsx';
import SciFiHUD from './home/SciFiHud.jsx';
import Disc from './home/Disc.jsx';
import Loader from './home/loader.jsx';

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/explore" element={<SciFiHUD />} />
        <Route path="/disc" element={<Disc />} />
        <Route path="/loader" element={<Loader />} />
      </Routes>
    </BrowserRouter>
  );
}
