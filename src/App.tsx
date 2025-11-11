import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import { ContactProvider } from './contexts/ContactContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AdProvider } from './contexts/AdContext';
import { SocketProvider } from './contexts/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { useFcmRegistration } from './hooks/useFcmRegistration';
import LandingPage from './pages/LandingPage';
import HowItWorksPage from './pages/HowItWorksPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import OTPVerificationPage from './pages/OTPVerificationPage';
import UpdatePasswordPage from './pages/UpdatePasswordPage';
import Dashboard from './pages/Dashboard';
import FindItems from './pages/FindItems';
import ShareItem from './pages/ShareItem';
import ItemDetails from './pages/ItemDetails';
import Messages from './pages/Messages';
import Calls from './pages/Calls';
import Emails from './pages/Emails';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import AboutPage from './pages/AboutPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import CreateProduct from './pages/CreateProduct';
import Products from './pages/Products';
import Addresses from './pages/Addresses';

const AppContent = () => {
  const { isOffline } = useNetworkStatus();
  useFcmRegistration();

  // Show offline page when offline
  // Temporarily disable offline detection for development
  // if (isOffline) {
  //   return <OfflinePage />;
  // }

  console.log('App is rendering, isOffline:', isOffline);
  console.log('FULL APP IS LOADING NOW!');

  return (
    <Router>
      <div className="min-h-screen bg-white dark:bg-slate-900">
        <Header />
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/explore" element={<FindItems />} />
            <Route path="/browse" element={<FindItems />} />
            <Route path="/browse-ads" element={<FindItems />} />
            <Route path="/ads" element={<FindItems />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-otp" element={<OTPVerificationPage />} />
            <Route path="/item/:id" element={<ItemDetails />} />
            <Route path="/product/:nameSlug" element={<ItemDetails />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }>
              <Route path="ads" element={<Products />} />
              <Route path="products" element={<Products />} />
              <Route path="create-product" element={<CreateProduct />} />
              <Route path="addresses" element={<Addresses />} />
              <Route path="messages" element={<Messages />} />
              <Route path="calls" element={<Calls />} />
              <Route path="emails" element={<Emails />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<Settings />} />
              <Route path="update-password" element={<UpdatePasswordPage />} />
            </Route>
            <Route path="/share-item" element={
              <ProtectedRoute>
                <ShareItem />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/edit-item/:itemId" element={
              <ProtectedRoute>
                <ShareItem />
              </ProtectedRoute>
            } />
          </Routes>
        </motion.main>
        <Footer />
      </div>
    </Router>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <ContactProvider>
              <AdProvider>
                <AppContent />
              </AdProvider>
            </ContactProvider>
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;