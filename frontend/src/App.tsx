import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';

import Capital from './pages/Capital';
import Purchases from './pages/Purchases';
import Suppliers from './pages/Suppliers';
import Workers from './pages/Workers';
import Piecework from './pages/Piecework';
import DailyWages from './pages/DailyWages';
import Expenses from './pages/Expenses';

import Dashboard from './pages/Dashboard';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
};

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/capital" element={<ProtectedRoute><Capital /></ProtectedRoute>} />
            <Route path="/purchases" element={<ProtectedRoute><Purchases /></ProtectedRoute>} />
            <Route path="/suppliers" element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />
            <Route path="/workers" element={<ProtectedRoute><Workers /></ProtectedRoute>} />
            <Route path="/piecework" element={<ProtectedRoute><Piecework /></ProtectedRoute>} />
            <Route path="/daily-wages" element={<ProtectedRoute><DailyWages /></ProtectedRoute>} />
            <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
