import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Shield, Lock, Eye, Database, User, Mail } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const PrivacyPage = () => {
  const sections = [
    {
      title: '1. Information We Collect',
      content: `We collect information you provide directly to us, such as when you create an account, post an ad, or contact us. This may include:
      • Personal information (name, email address, phone number)
      • Profile information (avatar, location, bio)
      • Content you post (ads, messages, photos)
      • Communication data (messages, calls, emails)
      • Payment information (processed by third-party providers)
      • Device information (IP address, browser type, operating system)
      • Usage data (pages visited, features used, time spent)`
    },
    {
      title: '2. How We Use Your Information',
      content: `We use the information we collect to:
      • Provide, maintain, and improve our services
      • Process transactions and send related information
      • Send technical notices, updates, and support messages
      • Respond to your comments and questions
      • Communicate with you about products, services, and events
      • Monitor and analyze trends and usage
      • Detect, prevent, and address technical issues
      • Ensure platform safety and security`
    },
    {
      title: '3. Information Sharing and Disclosure',
      content: `We may share your information in the following circumstances:
      • With other users when you post ads or communicate
      • With service providers who assist us in operating our platform
      • When required by law or to protect our rights
      • In connection with a business transfer or merger
      • With your consent or at your direction
      We do not sell, trade, or otherwise transfer your personal information to third parties for marketing purposes.`
    },
    {
      title: '4. Data Security',
      content: `We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.`
    },
    {
      title: '5. Data Retention',
      content: `We retain your information for as long as necessary to provide our services and fulfill the purposes outlined in this Privacy Policy. We may retain certain information for longer periods for legitimate business purposes, legal compliance, or dispute resolution.`
    },
    {
      title: '6. Your Rights and Choices',
      content: `You have the right to:
      • Access your personal information
      • Correct inaccurate or incomplete information
      • Delete your account and associated data
      • Object to processing of your information
      • Withdraw consent where applicable
      • Data portability
      • Opt out of marketing communications
      You can exercise these rights by contacting us or using the settings in your account.`
    },
    {
      title: '7. Cookies and Tracking Technologies',
      content: `We use cookies and similar tracking technologies to enhance your experience on our platform. These technologies help us:
      • Remember your preferences and settings
      • Analyze how you use our services
      • Provide personalized content and advertisements
      • Ensure platform security
      You can control cookie settings through your browser preferences.`
    },
    {
      title: '8. Third-Party Services',
      content: `Our platform may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to read their privacy policies before providing any personal information.`
    },
    {
      title: '9. International Data Transfers',
      content: `Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards to protect your information.`
    },
    {
      title: '10. Children\'s Privacy',
      content: `Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.`
    },
    {
      title: '11. California Privacy Rights',
      content: `If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA), including:
      • The right to know what personal information we collect
      • The right to know whether we sell or disclose personal information
      • The right to say no to the sale of personal information
      • The right to access your personal information
      • The right to equal service and price
      For more information about your California privacy rights, please contact us.`
    },
    {
      title: '12. European Union (GDPR) Rights',
      content: `If you are in the European Union, you have rights under the General Data Protection Regulation (GDPR), including:
      • Right of access to your personal data
      • Right to rectification of inaccurate data
      • Right to erasure ("right to be forgotten")
      • Right to restrict processing
      • Right to data portability
      • Right to object to processing
      • Rights related to automated decision-making
      To exercise these rights, please contact us.`
    },
    {
      title: '13. Changes to This Privacy Policy',
      content: `We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. We encourage you to review this Privacy Policy periodically for any changes.`
    },
    {
      title: '14. Contact Us',
      content: `If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
      Email: privacy@shareandgo.com
      Address: 123 Market Street, San Francisco, CA 94105
      Phone: +1 (555) 123-4567
      Data Protection Officer: dpo@shareandgo.com`
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-6">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <Shield className="h-8 w-8 text-primary" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Last Updated</h2>
                  <p className="text-gray-600">January 15, 2024</p>
                </div>
              </div>
              <p className="text-gray-700">
                This Privacy Policy explains how SharinGo collects, uses, and protects your information 
                when you use our platform. Your privacy is important to us, and we are committed to 
                protecting your personal information.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Privacy Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Lock className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Secure Data</h3>
                <p className="text-sm text-gray-600">
                  We use industry-standard encryption to protect your information
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Eye className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Transparent</h3>
                <p className="text-sm text-gray-600">
                  We clearly explain what data we collect and how we use it
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Database className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Your Control</h3>
                <p className="text-sm text-gray-600">
                  You can access, update, or delete your data at any time
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Privacy Sections */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.05 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Data Rights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-12"
        >
          <Card>
            <CardHeader>
              <CardTitle>Your Data Rights</CardTitle>
              <CardDescription>
                You have control over your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <User className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Access Your Data</h4>
                      <p className="text-sm text-gray-600">
                        Download a copy of all your personal information
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Update Information</h4>
                      <p className="text-sm text-gray-600">
                        Correct or update your personal details anytime
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Database className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Delete Account</h4>
                      <p className="text-sm text-gray-600">
                        Permanently remove your account and all associated data
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Privacy Settings</h4>
                      <p className="text-sm text-gray-600">
                        Control who can see your information and activity
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="mt-12"
        >
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Questions About Privacy?
              </h3>
              <p className="text-gray-600 mb-4">
                If you have any questions about our Privacy Policy or data practices, please contact us.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button>
                  <Shield className="mr-2 h-4 w-4" />
                  Contact Privacy Team
                </Button>
                <Button variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPage;



