import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import MainResponsiveLayout from './main-responsive-layout/MainResponsiveLayout';
import AnalyticsDashboard from './../src/analytics/AnalyticsDashboard';
import './CMSRoute.scss';

const CMSRoute = () => (
  <div className="cms-container">
    <nav className="nav-bar">
      <NavLink to="/" end className={({ isActive }) => `nav-button ${isActive ? 'active' : ''}`}>
        Heartbeat
      </NavLink>
      <NavLink to="/analyticsdashboard" className={({ isActive }) => `nav-button ${isActive ? 'active' : ''}`}>
        Analytics Dashboard
      </NavLink>
    </nav>

    <div className="route-content">
      <Routes>
        <Route path="/" element={<MainResponsiveLayout />} />
        <Route path="/analyticsdashboard" element={<AnalyticsDashboard />} />
      </Routes>
    </div>
  </div>
);

export default CMSRoute;
