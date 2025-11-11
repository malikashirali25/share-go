import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, FileText } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const TermsPage = () => {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: `By accessing and using SharinGo ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.`
    },
    {
      title: '2. Description of Service',
      content: `SharinGo is a community-driven marketplace platform that allows users to buy, sell, and share items with other users. The platform includes communication tools such as messaging, voice calls, and email integration to facilitate transactions and community building.`
    },
    {
      title: '3. User Accounts',
      content: `To access certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your password and for all activities that occur under your account.`
    },
    {
      title: '4. User Conduct',
      content: `You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:
      • Post false, misleading, or deceptive content
      • Violate any applicable laws or regulations
      • Infringe on the rights of others
      • Spam or send unsolicited communications
      • Attempt to gain unauthorized access to the Service
      • Use the Service for any commercial purpose without our express written consent`
    },
    {
      title: '5. Prohibited Items',
      content: `The following items are prohibited from being listed on our platform:
      • Illegal items or services
      • Weapons, ammunition, or explosives
      • Drugs, alcohol, or tobacco products
      • Stolen goods
      • Items that infringe on intellectual property rights
      • Adult content or services
      • Live animals
      • Items that promote discrimination or hate speech`
    },
    {
      title: '6. Transactions and Payments',
      content: `SharinGo does not process payments directly. All transactions are conducted between users. We are not responsible for payment disputes, refunds, or any financial transactions between users. Users are responsible for their own payment methods and transaction security.`
    },
    {
      title: '7. Safety and Security',
      content: `While we strive to maintain a safe platform, users are responsible for their own safety when meeting in person. We recommend:
      • Meeting in public places
      • Bringing a friend when possible
      • Trusting your instincts
      • Reporting suspicious behavior immediately
      We are not liable for any incidents that occur during in-person meetings.`
    },
    {
      title: '8. Privacy Policy',
      content: `Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.`
    },
    {
      title: '9. Intellectual Property',
      content: `The Service and its original content, features, and functionality are and will remain the exclusive property of SharinGo and its licensors. The Service is protected by copyright, trademark, and other laws.`
    },
    {
      title: '10. Termination',
      content: `We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will cease immediately.`
    },
    {
      title: '11. Disclaimer',
      content: `The information on this Service is provided on an "as is" basis. To the fullest extent permitted by law, this Company excludes all representations, warranties, conditions and terms relating to our Service and the use of this Service.`
    },
    {
      title: '12. Limitation of Liability',
      content: `In no event shall SharinGo, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.`
    },
    {
      title: '13. Governing Law',
      content: `These Terms shall be interpreted and governed by the laws of the State of California, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.`
    },
    {
      title: '14. Changes to Terms',
      content: `We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.`
    },
    {
      title: '15. Contact Information',
      content: `If you have any questions about these Terms of Service, please contact us at:
      Email: legal@shareandgo.com
      Address: 123 Market Street, San Francisco, CA 94105
      Phone: +1 (555) 123-4567`
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
            <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Last Updated</h2>
                  <p className="text-gray-600">January 15, 2024</p>
                </div>
              </div>
              <p className="text-gray-700">
                These Terms of Service ("Terms") govern your use of SharinGo's website and services. 
                By using our platform, you agree to be bound by these terms.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Terms Sections */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.05 }}
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

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-12"
        >
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Questions About These Terms?
              </h3>
              <p className="text-gray-600 mb-4">
                If you have any questions about our Terms of Service, please don't hesitate to contact us.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  Contact Legal Team
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

export default TermsPage;



