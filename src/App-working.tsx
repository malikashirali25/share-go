import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ContactProvider } from './contexts/ContactContext';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import BrowseAds from './pages/BrowseAds';
import HowItWorksPage from './pages/HowItWorksPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import PostAd from './pages/PostAd';
import AdDetails from './pages/AdDetails';
import Messages from './pages/Messages';
import Calls from './pages/Calls';
import Emails from './pages/Emails';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import AdminUsers from './pages/AdminUsers';
import AdminAds from './pages/AdminAds';
import AdminReports from './pages/AdminReports';
import FAQPage from './pages/FAQPage';
import AboutPage from './pages/AboutPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import ProtectedRoute from './components/ProtectedRoute';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import OfflinePage from './components/OfflinePage';
import { useNetworkStatus } from './hooks/useNetworkStatus';

const App = () => {
  const isOffline = useNetworkStatus();

  // Temporarily disable offline detection for development
  // if (isOffline) {
  //   return <OfflinePage />;
  // }

  return (
    <AuthProvider>
      <ThemeProvider>
        <ContactProvider>
          <Router>
            <div className="min-h-screen bg-white dark:bg-slate-900">
              <Header />
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/browse" element={<BrowseAds />} />
                <Route path="/browse-ads" element={<BrowseAds />} />
                <Route path="/ads" element={<BrowseAds />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                
                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/ads" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/messages" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/calls" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/emails" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/notifications" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/settings" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/analytics" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/users" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/reports" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/post-ad" element={
                  <ProtectedRoute>
                    <PostAd />
                  </ProtectedRoute>
                } />
                <Route path="/ad/:id" element={<AdDetails />} />
              </Routes>
              <Footer />
              <PWAInstallPrompt />
            </div>
          </Router>
        </ContactProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
