import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { isLoggedIn } = useAuth();

  const links = [
    { name: 'Home', href: '/' },
    isLoggedIn
      ? { name: 'Dashboard', href: '/dashboard' }
      : { name: 'Login', href: '/login' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-3"
          >
            <Logo size="medium" showText={true} className="text-white" />
            <p className="text-gray-400 text-sm max-w-md">
              Identity portal shell. Use the links below to navigate the app.
            </p>
          </motion.div>

          <motion.nav
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="flex flex-wrap gap-x-6 gap-y-2"
            aria-label="Footer"
          >
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </motion.nav>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-8 pt-6 border-t border-gray-800 text-center"
        >
          <p className="text-sm text-gray-400">© {currentYear} SharinGo. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
