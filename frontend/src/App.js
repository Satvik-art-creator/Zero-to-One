import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { getToken, getStudent } from './utils/auth';

import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import Login from './pages/Login';
import EligibilitySummary from './pages/EligibilitySummary';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';

const ProtectedRoute = ({ children }) => {
  return getToken() ? children : <Navigate to="/login" replace />;
};

const PublicOnlyRoute = ({ children }) => {
  return !getToken() ? children : <Navigate to="/dashboard" replace />;
};

const AdminRoute = ({ children }) => {
  const student = getStudent();
  if (!getToken()) return <Navigate to="/login" replace />;
  if (student?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1A1A2E',
            color: '#F1F0FF',
            border: '1px solid rgba(255,255,255,0.08)',
            fontFamily: '"Inter", sans-serif',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            fontSize: '0.875rem',
          },
          success: { iconTheme: { primary: '#10D9A0', secondary: '#1A1A2E' } },
          error: { iconTheme: { primary: '#F87171', secondary: '#1A1A2E' } },
          duration: 3500,
        }}
      />
      <Routes>
        <Route path="/" element={<PublicOnlyRoute><LandingPage /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/eligibility-summary" element={<ProtectedRoute><EligibilitySummary /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
