import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { getToken } from './utils/auth';

import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import Login from './pages/Login';
import EligibilitySummary from './pages/EligibilitySummary';
import Dashboard from './pages/Dashboard';

const ProtectedRoute = ({ children }) => {
  return getToken() ? children : <Navigate to="/login" replace />;
};

// Redirect to dashboard if logged in
const PublicOnlyRoute = ({ children }) => {
  return !getToken() ? children : <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      {/* UI/UX Pro Max Toast Config */}
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: '#1f2937', // bg-surface-elevated matching
            color: '#f9fafb',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } }
        }} 
      />
      <Routes>
        <Route path="/" element={<PublicOnlyRoute><LandingPage /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        
        <Route path="/eligibility-summary" element={<ProtectedRoute><EligibilitySummary /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
