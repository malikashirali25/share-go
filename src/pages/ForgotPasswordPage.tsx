import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sendPasswordResetEmail } = useAuth();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if user is admin from location state
  const isAdmin = location.state?.isAdmin || false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await sendPasswordResetEmail(email);
      // Navigate to OTP verification page with userId and email
      navigate(`/verify-otp?userId=${response.userId}&email=${encodeURIComponent(email)}&type=reset`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <Card>
          <CardHeader className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(isAdmin ? '/admin/login' : '/login')}
              className="absolute left-4 top-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div className="mt-8">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Forgot Password?
              </CardTitle>
              <CardDescription className="mt-2">
                {isAdmin ? 'Admin' : 'User'} - Enter your email to receive a 4-digit OTP code
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md"
                >
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP Code'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;


