import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
const Home = lazy(() => import('./pages/Home'));
const Properties = lazy(() => import('./pages/Properties'));
const PropertyDetails = lazy(() => import('./pages/PropertyDetails'));
const Residential = lazy(() => import('./pages/Residential'));
const Commercial = lazy(() => import('./pages/Commercial'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

// Dashboards
const BuyerDashboard = lazy(() => import('./pages/BuyerDashboard'));
const BuilderDashboard = lazy(() => import('./pages/BuilderDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center py-40">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Global Layout Wrap
const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <Suspense
              fallback={
                <div className="flex justify-center py-40">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                </div>
              }
            >
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/properties/:id" element={<PropertyDetails />} />
                <Route path="/residential" element={<Residential />} />
                <Route path="/commercial" element={<Commercial />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Buyer Dashboard */}
                <Route
                  path="/buyer"
                  element={
                    <ProtectedRoute allowedRoles={['BUYER']}>
                      <BuyerDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Builder Dashboard */}
                <Route
                  path="/builder"
                  element={
                    <ProtectedRoute allowedRoles={['BUILDER']}>
                      <BuilderDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Admin Dashboard */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
