import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import MainResponsiveLayout from './main-responsive-layout/MainResponsiveLayout';
import AnalyticsDashboard from './../src/analytics/AnalyticsDashboard';
import './CMSRoute.scss';

const CMSRoute = () => (
  <div className="cms-container">
    <nav className="nav-bar">
      <Link to="/" className="nav-button">Heartbeat</Link>
      <Link to="/analyticsdashboard" className="nav-button">Analytics Dashboard</Link>
    </nav>

    <Routes>
      <Route path="/" element={<MainResponsiveLayout />} />
      <Route path="/analyticsdashboard" element={<AnalyticsDashboard />} />
    </Routes>
  </div>
);

export default CMSRoute;
