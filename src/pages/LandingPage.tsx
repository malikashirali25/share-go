import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import { ArrowRight, CheckCircle, Star, Users, MessageCircle, Phone, Mail, Shield, Zap, Sparkles, TrendingUp, Award, Heart, Clock, Globe, Recycle, Gift, Hand } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { mockTestimonials } from '../data/mockData';
import SmartAuthButton from '../components/SmartAuthButton';

const LandingPage = () => {
  useEffect(() => {
    const updateStepNumbers = () => {
      const stepNumbers = document.querySelectorAll('.step-number');
      const isDark = document.documentElement.classList.contains('dark');
      
      stepNumbers.forEach((element) => {
        const div = element as HTMLElement;
        if (isDark) {
          div.style.backgroundColor = '#f97316'; // orange-500
          div.style.color = '#000000'; // black
          div.style.borderColor = '#fb923c'; // orange-300
        } else {
          div.style.backgroundColor = '#3b82f6'; // blue-600
          div.style.color = '#ffffff'; // white
          div.style.borderColor = '#ffffff'; // white
        }
      });
    };

    // Update on mount
    updateStepNumbers();

    // Watch for theme changes
    const observer = new MutationObserver(updateStepNumbers);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: Recycle,
      title: 'Reduce Waste',
      description: 'Give unused items a second life instead of throwing them away',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Heart,
      title: 'Help Others',
      description: 'Connect people in need with those who can help',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: MessageCircle,
      title: 'Easy Communication',
      description: 'Chat directly with community members in real-time',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Shield,
      title: 'Safe Sharing',
      description: 'All interactions are protected and community-monitored',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Zap,
      title: 'Quick Posting',
      description: 'Share your items in minutes with our simple form',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Join thousands of caring users building a better world',
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Community Members', icon: Users },
    { number: '5K+', label: 'Items Shared', icon: Gift },
    { number: '4.9★', label: 'Community Rating', icon: Star },
    { number: '24h', label: 'Avg Response', icon: Clock }
  ];

  const steps = [
    {
      number: '01',
      title: 'Join Community',
      description: 'Create your account and become part of our sharing community',
      icon: Users
    },
    {
      number: '02',
      title: 'Share or Find',
      description: 'Post items you no longer need or find items you can use',
      icon: Gift
    },
    {
      number: '03',
      title: 'Connect & Chat',
      description: 'Message community members to arrange sharing',
      icon: MessageCircle
    },
    {
      number: '04',
      title: 'Meet & Share',
      description: 'Arrange safe meetups and give items a new home',
      icon: Hand
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          {/* Animated Gradient Backgrounds */}
          <motion.div
            className="absolute inset-0 opacity-5"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear"
            }}
            style={{
              backgroundImage: `radial-gradient(circle at 20% 20%, #3b82f6 0%, transparent 50%), 
                               radial-gradient(circle at 80% 80%, #8b5cf6 0%, transparent 50%)`,
              backgroundSize: '600px 600px'
            }}
          />
          
          {/* Floating Elements */}
          <motion.div
            className="absolute top-20 left-20 w-2 h-2 bg-blue-400/30 rounded-full"
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-40 right-32 w-1 h-1 bg-purple-400/40 rounded-full"
            animate={{
              y: [0, 40, 0],
              x: [0, 20, 0],
              opacity: [0.4, 0.9, 0.4],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
          <motion.div
            className="absolute bottom-32 left-1/3 w-1.5 h-1.5 bg-indigo-400/25 rounded-full"
            animate={{
              y: [0, -25, 0],
              x: [0, -15, 0],
              opacity: [0.25, 0.7, 0.25],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-full px-4 py-2 shadow-sm"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </motion.div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Community Sharing Platform</span>
              </motion.div>

              {/* Main Heading */}
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  <motion.span
                    className="block text-slate-900 dark:text-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    SharinGo
                  </motion.span>
                  <motion.span 
                    className="block text-blue-600 dark:text-blue-400"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    Community
                  </motion.span>
                </h1>
                
                <motion.p 
                  className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  A caring community where <span className="font-semibold text-slate-800 dark:text-slate-200">sharing, helping, and reducing waste</span> meets 
                  <span className="font-semibold text-slate-800 dark:text-slate-200"> meaningful connections</span>. 
                  Give items a second life and help your neighbors.
                </motion.p>
              </div>
              
              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
              >
                <SmartAuthButton 
                  variant="secondary" 
                  className="text-lg px-8 py-6 !bg-blue-600 hover:!bg-blue-700 dark:!bg-blue-600 dark:hover:!bg-blue-700 !text-white dark:!text-white border-0"
                  guestText="Share Your Items"
                  guestUrl="/dashboard/create-product"
                />
                <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 hover:scale-105 transition-all duration-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-800 dark:hover:text-white">
                  <Link to="/explore">
                    <Gift className="mr-2 h-5 w-5" />
                    Find Items
                  </Link>
                </Button>
              </motion.div>
              
              {/* Stats */}
              <motion.div 
                className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                {stats.map((stat, index) => (
                  <motion.div 
                    key={stat.label}
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.4 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="flex items-center justify-center w-12 h-12 bg-white/80 dark:bg-slate-800/80 rounded-xl mx-auto mb-3 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                      <stat.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.number}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
            
            {/* Right Content - Featured Items */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <motion.div 
                className="relative bg-white/90 dark:bg-slate-800/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-slate-200/50 dark:border-slate-700/50"
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                {/* Header */}
                <motion.div 
                  className="flex items-center justify-between mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Gift className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">Recently Shared</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Items shared this week</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                    <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                  </div>
                </motion.div>
                
                {/* Featured Items */}
                <div className="space-y-4">
                  {[
                    { name: "Office Chair", category: "Furniture", status: "Available", interest: "12 people", emoji: "🪑" },
                    { name: "Winter Coat", category: "Clothing", status: "Available", interest: "8 people", emoji: "🧥" },
                    { name: "Books Collection", category: "Education", status: "Available", interest: "15 people", emoji: "📚" }
                  ].map((item, index) => (
                    <motion.div 
                      key={item.name}
                      className="flex items-center space-x-3 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-600/50 rounded-xl border border-slate-200/50 dark:border-slate-600/50"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold text-lg">{item.emoji}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{item.name}</h4>
                        <p className="text-slate-600 dark:text-slate-300 text-xs">{item.category} • {item.status}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-600 dark:text-green-400 font-bold text-sm">{item.interest}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs">interested</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-slate-800 relative overflow-hidden">
        {/* Background */}
        <motion.div
          className="absolute inset-0 opacity-5"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear"
          }}
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%), 
                             radial-gradient(circle at 75% 75%, #8b5cf6 0%, transparent 50%)`,
            backgroundSize: '400px 400px'
          }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Features</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-6">Community Features</h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Everything you need to share, help others, and build a caring community.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 relative overflow-hidden">
        {/* Background */}
        <motion.div
          className="absolute inset-0 opacity-5"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear"
          }}
          style={{
            backgroundImage: `radial-gradient(circle at 20% 20%, #3b82f6 0%, transparent 50%), 
                             radial-gradient(circle at 80% 80%, #8b5cf6 0%, transparent 50%)`,
            backgroundSize: '500px 500px'
          }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">Simple Process</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-6">How Sharing Works</h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Join our community and start sharing in minutes with our simple process.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center group relative"
              >
                <motion.div
                  className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-2xl transition-all duration-300"
                  whileHover={{ y: -10, scale: 1.05 }}
                >
                  {/* Step Icon */}
                  <motion.div 
                    className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg group-hover:shadow-2xl transition-all duration-300"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                  >
                    <step.icon className="w-8 h-8" />
                  </motion.div>
                  
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                    {step.description}
                  </p>
                  
                  {/* Step Number */}
                  <div 
                    className="step-number absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg border-2"
                  >
                    {step.number}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mt-16"
          >
            <SmartAuthButton 
              variant="secondary" 
              className="text-lg px-10 py-6 !bg-blue-600 hover:!bg-blue-700 dark:!bg-blue-600 dark:hover:!bg-blue-700 !text-white dark:!text-white"
              guestText="Get Started Now"
            />
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white dark:bg-slate-800 relative overflow-hidden">
        {/* Background */}
        <motion.div
          className="absolute inset-0 opacity-[0.02]"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear"
          }}
          style={{
            backgroundImage: `radial-gradient(circle at 30% 30%, #64748b 0%, transparent 50%), 
                             radial-gradient(circle at 70% 70%, #94a3b8 0%, transparent 50%)`,
            backgroundSize: '600px 600px'
          }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full px-4 py-2 mb-6">
              <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Testimonials</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-6">What Our Community Says</h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Join thousands of caring community members who trust SharinGo for sharing and helping others.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockTestimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-6">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full mr-4 border-2 border-slate-200 dark:border-slate-600"
                      />
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100">{testimonial.name}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{testimonial.role}</p>
                      </div>
                    </div>
                    
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-5 h-5 ${
                            i < testimonial.rating 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-slate-300 dark:text-slate-600'
                          }`} 
                        />
                      ))}
                    </div>
                    
                    <p className="text-slate-600 dark:text-slate-300 italic group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                      "{testimonial.content}"
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-blue-700 relative overflow-hidden">
        {/* Background */}
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear"
          }}
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #ffffff 0%, transparent 50%), 
                             radial-gradient(circle at 75% 75%, #ffffff 0%, transparent 50%)`,
            backgroundSize: '400px 400px'
          }}
        />
        
        {/* Floating Elements */}
        <motion.div
          className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-16 h-16 bg-white/10 rounded-full"
          animate={{
            y: [0, 20, 0],
            rotate: [0, -180, -360],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/4 w-12 h-12 bg-white/5 rounded-full"
          animate={{
            y: [0, -15, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-8 h-8 bg-white/5 rounded-full"
          animate={{
            y: [0, 15, 0],
            x: [0, -10, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 mb-6"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4 text-white" />
              </motion.div>
              <span className="text-sm font-medium text-white">Join Today</span>
            </motion.div>
            
            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl lg:text-6xl font-bold text-white mb-6"
            >
              Ready to Start{' '}
              <motion.span
                animate={{ y: [0, -5, 0], rotate: [0, 2, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="inline-block"
              >
                Sharing?
              </motion.span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl text-blue-100 mb-8"
            >
              Join thousands of community members and start sharing today.
            </motion.p>
            
            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-8 justify-center"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <SmartAuthButton 
                  size="lg"
                  variant="outline" 
                  className="text-lg px-10 py-6 border-white text-white hover:bg-white hover:text-slate-900 bg-transparent group shadow-lg hover:shadow-xl transition-all duration-300"
                  guestText="Get Started Free"
                />
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Button asChild size="lg" variant="outline" className="text-lg px-10 py-6 border-white text-white hover:bg-white hover:text-slate-900 bg-transparent group shadow-lg hover:shadow-xl transition-all duration-300">
                  <Link to="/explore">
                    <Gift className="mr-2 h-5 w-5" />
                    Find Items
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
            
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="grid grid-cols-3 gap-8 pt-12"
            >
              {[
                { number: '12K+', label: 'Community Members' },
                { number: '2.5K', label: 'Items Shared' },
                { number: '98%', label: 'Success Rate' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                  <div className="text-blue-200">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;