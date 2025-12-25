import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import MainResponsiveLayout from './main-responsive-layout/MainResponsiveLayout';
import AnalyticsDashboard from './analytics/AnalyticsDashboard';
import QuarterlyDashboard from './analytics/QuarterlyOpenInterest/QuarterlyDashboard';
import WakeLockKeeper from './nasdaq/WakeLockKeeper'
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
      <NavLink to="/quarterlydashboard" className={({ isActive }) => `nav-button ${isActive ? 'active' : ''}`}>
        Quarterly Dashboard
      </NavLink>
    </nav>

    <div className="route-content">
      <Routes>
        <Route path="/" element={<MainResponsiveLayout />} />
        <Route path="/analyticsdashboard" element={<AnalyticsDashboard />} />
        <Route path="/quarterlydashboard" element={<QuarterlyDashboard />} />
      </Routes>
    </div>
   <WakeLockKeeper/>
  </div>
);

export default CMSRoute;
