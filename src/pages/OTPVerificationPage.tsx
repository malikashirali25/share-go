import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';

const OTPVerificationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyOTP, resendOTP } = useAuth();
  
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const userId = Number.parseInt(searchParams.get('userId') || '0');
  const email = searchParams.get('email');
  const type = searchParams.get('type') || 'login'; // login, register, reset

  useEffect(() => {
    if (!userId || !email) {
      navigate('/login');
    }
  }, [userId, email, navigate]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 4) {
      setError('Please enter all 4 digits');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // For password reset flow, we just verify the OTP and navigate to reset password page
      if (type === 'reset') {
        // Just validate the OTP is correct format, then navigate
        // The actual OTP verification will happen during password reset
        navigate(`/reset-password?userId=${userId}&otp=${otpCode}&email=${encodeURIComponent(email || '')}`, { replace: true });
      } else {
        // For login/register, verify OTP and auto-login
        const response = await verifyOTP(userId, otpCode);
        
        // Check if user was automatically logged in
        if (response?.data?.user && response?.data?.accessToken) {
          // User is now logged in, redirect immediately
          navigate('/dashboard', { replace: true });
        } else {
          // Show success message for manual navigation
          setIsSuccess(true);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError('');

    try {
      await resendOTP(userId);
      setResendTimer(60); // 60 seconds cooldown
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <Card>
            <CardContent className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mb-6"
              >
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {type === 'reset' ? 'Code Verified!' : 'Email Verified!'}
              </h2>
              
              <p className="text-gray-600 mb-6">
                {type === 'reset' 
                  ? 'Your code has been verified. You can now reset your password.'
                  : 'Your email has been successfully verified. You can now continue.'
                }
              </p>
              
              <Button 
                onClick={() => {
                  if (type === 'login') {
                    navigate('/dashboard');
                  } else if (type === 'register') {
                    navigate('/dashboard');
                  } else if (type === 'reset') {
                    navigate(`/reset-password?email=${email}&token=temp_token`);
                  }
                }}
                className="w-full"
                size="lg"
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

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
              onClick={() => navigate('/login')}
              className="absolute left-4 top-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div className="mt-8">
              <CardTitle className="text-2xl font-bold text-gray-900">
                {type === 'reset' ? 'Verify Your Email' : 'Verify Your Phone'}
              </CardTitle>
              <CardDescription className="mt-2">
                {type === 'reset' 
                  ? `We've sent a 4-digit code to ${email}`
                  : "We've sent a 4-digit code via SMS to your phone number"
                }
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <Label>Enter Verification Code</Label>
                <div className="flex justify-center space-x-3">
                  {otp.map((digit, index) => (
                    <Input
                      key={`otp-input-${index}`}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 text-center text-lg font-semibold"
                      required
                    />
                  ))}
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
                    Verifying...
                  </>
                ) : (
                  type === 'reset' ? 'Verify & Continue' : 'Verify Code'
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">
                  Didn't receive the code?
                </p>
                
                {resendTimer > 0 ? (
                  <div className="flex items-center justify-center space-x-2 text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">
                      Resend in {resendTimer}s
                    </span>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResend}
                    disabled={isResending}
                    className="text-sm"
                  >
                    {isResending ? 'Sending...' : 'Resend Code'}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default OTPVerificationPage;


