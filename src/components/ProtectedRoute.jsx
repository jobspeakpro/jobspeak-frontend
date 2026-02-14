// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { isAuthed, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>; // Or null/spinner
  }

  if (!isAuthed) {
    console.log("ProtectedRoute: Not authed, redirecting to /signin");
    return <Navigate to="/signin" replace />;
  }

  return children;
}

