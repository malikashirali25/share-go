import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, LayoutDashboard, Sparkles } from 'lucide-react';
import { Button, ButtonProps } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '@/utils/cn';

interface SmartAuthButtonProps extends Omit<ButtonProps, 'asChild'> {
  /** Text for logged-in users - defaults to 'Go to Dashboard' */
  loggedInText?: string;
  /** Text for guest users - defaults to 'Get Started Free' */
  guestText?: string;
  /** URL for guest users - defaults to '/signup' */
  guestUrl?: string;
  /** URL for logged-in users - defaults to '/dashboard' */
  loggedInUrl?: string;
  /** Show animated sparkles icon for guest button */
  showSparkles?: boolean;
  /** Show animated arrow icon */
  showArrow?: boolean;
}

const SmartAuthButton = ({
  loggedInText = 'Go to Dashboard',
  guestText = 'Get Started Free',
  guestUrl = '/signup',
  loggedInUrl = '/dashboard',
  showSparkles = true,
  showArrow = true,
  className,
  ...props
}: SmartAuthButtonProps) => {
  const { isLoggedIn } = useAuth();

  // Default classes for SmartAuthButton behavior
  const defaultClasses = 'group shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300';
  
  // Merge default classes with custom className using tailwind-merge
  const mergedClassName = cn(defaultClasses, className);

  // Determine the destination URL and content based on auth status
  const destinationUrl = isLoggedIn ? loggedInUrl : guestUrl;
  const buttonText = isLoggedIn ? loggedInText : guestText;

  return (
    <Button asChild className={mergedClassName} {...props}>
      <Link to={destinationUrl}>
        {!isLoggedIn && showSparkles && (
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="mr-2 h-5 w-5" />
          </motion.div>
        )}
        {isLoggedIn && <LayoutDashboard className="mr-2 h-5 w-5" />}
        {buttonText}
        {showArrow && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
      </Link>
    </Button>
  );
};

export default SmartAuthButton;
