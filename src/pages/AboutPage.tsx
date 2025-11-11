import { motion } from 'framer-motion';
import { 
  Users, 
  Target, 
  Eye, 
  Heart, 
  Award, 
  ArrowLeft,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Globe
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const AboutPage = () => {
  const teamMembers = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      avatar: 'https://i.pravatar.cc/150?img=1',
      bio: 'Passionate about creating sustainable marketplaces that bring communities together.',
      linkedin: '#',
      twitter: '#'
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      avatar: 'https://i.pravatar.cc/150?img=2',
      bio: 'Tech enthusiast focused on building scalable and secure platforms.',
      linkedin: '#',
      twitter: '#'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Design',
      avatar: 'https://i.pravatar.cc/150?img=3',
      bio: 'Designer who believes in creating intuitive and beautiful user experiences.',
      linkedin: '#',
      twitter: '#'
    },
    {
      name: 'David Kim',
      role: 'Head of Community',
      avatar: 'https://i.pravatar.cc/150?img=4',
      bio: 'Community builder dedicated to fostering safe and positive interactions.',
      linkedin: '#',
      twitter: '#'
    }
  ];

  const values = [
    {
      icon: Users,
      title: 'Community First',
      description: 'We believe in the power of community and strive to create platforms that bring people together in meaningful ways.'
    },
    {
      icon: Heart,
      title: 'Trust & Safety',
      description: 'Your safety and security are our top priorities. We implement robust measures to protect our users and their transactions.'
    },
    {
      icon: Globe,
      title: 'Sustainability',
      description: 'We promote sustainable consumption by encouraging the reuse and sharing of items, reducing waste and environmental impact.'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We are committed to delivering the best possible experience through continuous innovation and user feedback.'
    }
  ];

  const milestones = [
    {
      year: '2023',
      title: 'Company Founded',
      description: 'SharinGo was founded with a vision to create a better marketplace experience.'
    },
    {
      year: '2024',
      title: 'Platform Launch',
      description: 'We launched our beta platform with core marketplace and communication features.'
    },
    {
      year: '2024',
      title: '10K Users',
      description: 'Reached our first major milestone of 10,000 active users.'
    },
    {
      year: '2024',
      title: 'Mobile App',
      description: 'Launched our mobile application for iOS and Android.'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Active Users' },
    { number: '100K+', label: 'Items Listed' },
    { number: '25K+', label: 'Successful Transactions' },
    { number: '4.9', label: 'User Rating' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div className="flex items-center space-x-4 mb-8">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-4xl font-bold text-gray-900">About SharinGo</h1>
          </div>
          <div className="text-center max-w-4xl mx-auto">
            <p className="text-xl text-gray-600 leading-relaxed">
              We're building the future of community-driven marketplaces, where buying, selling, and sharing 
              items is not just a transaction, but a way to connect with your neighbors and build stronger communities.
            </p>
          </div>
        </motion.div>

        {/* Mission & Vision */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-16"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center space-x-3 mb-4">
                  <Target className="h-8 w-8 text-primary" />
                  <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  To create a sustainable, community-driven marketplace that makes it easy and safe for people 
                  to buy, sell, and share items while building meaningful connections within their local communities.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <div className="flex items-center space-x-3 mb-4">
                  <Eye className="h-8 w-8 text-primary" />
                  <h2 className="text-2xl font-bold text-gray-900">Our Vision</h2>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  A world where every community has a thriving local marketplace that promotes sustainability, 
                  reduces waste, and strengthens the bonds between neighbors through shared experiences and mutual support.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-16"
        >
          <Card>
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Impact</h2>
                <p className="text-gray-600">Numbers that tell our story</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                    <div className="text-gray-600">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">The principles that guide everything we do</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <value.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                    <p className="text-gray-600 text-sm">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600">The people behind SharinGo</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6 text-center">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-20 h-20 rounded-full mx-auto mb-4"
                    />
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                    <p className="text-primary font-medium mb-3">{member.role}</p>
                    <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
                    <div className="flex justify-center space-x-2">
                      <Button variant="ghost" size="icon" asChild>
                        <a href={member.linkedin}>
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <a href={member.twitter}>
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                          </svg>
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600">Key milestones in our story</p>
          </div>
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
              >
                <div className="flex-1">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <span className="text-2xl font-bold text-primary">{milestone.year}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="w-4 h-4 bg-primary rounded-full mx-8 flex-shrink-0"></div>
                <div className="w-32 flex-shrink-0"></div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Get in Touch</h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Have questions about SharinGo or want to work with us? We'd love to hear from you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contact Us
                </Button>
                <Button variant="outline">
                  <Phone className="mr-2 h-4 w-4" />
                  Call Us
                </Button>
                <Button variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Email Us
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;
