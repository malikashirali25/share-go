import { motion } from 'framer-motion';
import { Info, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const DemoCredentials = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const credentials = [
    { role: 'Admin', email: 'david.wilson@email.com', password: 'any password' },
    { role: 'User', email: 'sarah.johnson@email.com', password: 'any password' },
    { role: 'User', email: 'mike.chen@email.com', password: 'any password' },
    { role: 'User', email: 'emily.rodriguez@email.com', password: 'any password' }
  ];

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <Card className="shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <div className="p-2 rounded-full bg-primary mr-3">
              <Info className="h-5 w-5 text-white" />
            </div>
            Demo Credentials
          </CardTitle>
          <CardDescription>
            Use these credentials to test different user roles and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {credentials.map((cred, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative rounded-lg border bg-muted hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-4">
                    <div className={`px-3 py-2 rounded-full text-xs font-semibold ${
                      cred.role === 'Admin' 
                        ? 'bg-red-500 text-white' 
                        : 'bg-green-500 text-white'
                    }`}>
                      {cred.role}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {cred.email}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span className="text-foreground">Password:</span> <span className="font-mono bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs">{cred.password}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="opacity-0 group-hover:opacity-100 transition-all duration-300"
                      onClick={() => copyToClipboard(cred.email, `email-${index}`)}
                    >
                      {copied === `email-${index}` ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 bg-primary text-primary-foreground rounded-lg"
          >
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-full bg-primary-foreground/20">
                <Info className="h-4 w-4" />
              </div>
              <p className="text-sm leading-relaxed">
                <strong>Note:</strong> This is a demo application. Any password will work for the above email addresses.
                The admin user has access to the admin dashboard and can manage users, ads, and reports.
              </p>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DemoCredentials;
