import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, LogIn } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
  const { isLoggedIn } = useAuth();

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4 py-16 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-xl text-center space-y-6"
      >
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Welcome
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Sign in to open your dashboard, or go there directly if you are already signed in.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          {isLoggedIn ? (
            <Button asChild size="lg" className="gap-2">
              <Link to="/dashboard">
                <LayoutDashboard className="h-5 w-5" />
                Go to dashboard
              </Link>
            </Button>
          ) : (
            <Button asChild size="lg" className="gap-2">
              <Link to="/login">
                <LogIn className="h-5 w-5" />
                Log in
              </Link>
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LandingPage;
