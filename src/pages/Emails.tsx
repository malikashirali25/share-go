import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Star, 
  StarOff, 
  Archive, 
  Trash2, 
  Reply, 
  ReplyAll, 
  Forward,
  Mail,
  MailOpen,
  Clock,
  Paperclip,
  MoreVertical,
  Send,
  Plus
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { mockEmails, mockUsers } from '../data/mockData';
import { useContact } from '../contexts/ContactContext';

const Emails = () => {
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeUserId, setComposeUserId] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeContent, setComposeContent] = useState('');
  const [composeInitialData, setComposeInitialData] = useState<Partial<Email> & { mode: 'new' | 'reply' | 'forward' }>({ mode: 'new' });
  const { getUserEmails, sendEmail, deleteEmail, markEmailAsRead } = useContact();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get user-specific emails
  const emails = getUserEmails();

  // Convert context emails to display format
  const displayEmails = emails.map(email => {
    const sender = mockUsers.find(user => user.id === email.senderId);
    const receiver = mockUsers.find(user => user.id === email.receiverId);
    const senderName = sender ? sender.name : 'Unknown Sender';
    const receiverName = receiver ? receiver.name : 'Unknown Recipient';
    
    return {
      ...email,
      from: senderName,
      to: receiverName,
      priority: email.priority
    };
  });

  const filteredEmails = displayEmails.filter(email => {
    const searchMatch = !searchTerm || 
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const typeMatch = filterType === 'all' || 
      (filterType === 'unread' && !email.read) ||
      (filterType === 'starred' && email.priority === 'high') ||
      (filterType === 'important' && email.priority === 'high');
    
    return searchMatch && typeMatch;
  });

  const selectedEmailData = selectedEmail ? displayEmails.find(e => e.id === selectedEmail) : null;

  const handleReply = () => {
    if (!selectedEmail) return;
    
    const emailData = displayEmails.find(e => e.id === selectedEmail);
    if (!emailData) return;
    
    // Find the original sender to reply to
    const originalSender = mockUsers.find(user => user.id === emailData.senderId);
    if (!originalSender) return;
    
    setComposeInitialData({
      mode: 'reply',
      senderId: emailData.senderId,
      subject: emailData.subject.startsWith('Re:') ? emailData.subject : `Re: ${emailData.subject}`,
      content: `\n\n--- Original Message ---\nFrom: ${emailData.from}\nSubject: ${emailData.subject}\n\n${emailData.content}`,
      threadId: emailData.threadId
    });
    
    setComposeUserId(emailData.senderId);
    setComposeSubject(emailData.subject.startsWith('Re:') ? emailData.subject : `Re: ${emailData.subject}`);
    setComposeContent(`\n\n--- Original Message ---\nFrom: ${emailData.from}\nSubject: ${emailData.subject}\n\n${emailData.content}`);
    setComposeOpen(true);
  };

  const handleForward = () => {
    if (!selectedEmail) return;
    
    const emailData = displayEmails.find(e => e.id === selectedEmail);
    if (!emailData) return;
    
    setComposeInitialData({
      mode: 'forward',
      subject: emailData.subject.startsWith('Fwd:') ? emailData.subject : `Fwd: ${emailData.subject}`,
      content: `\n\n--- Forwarded Message ---\nFrom: ${emailData.from}\nTo: ${emailData.to}\nSubject: ${emailData.subject}\n\n${emailData.content}`
    });
    
    setComposeUserId('');
    setComposeSubject(emailData.subject.startsWith('Fwd:') ? emailData.subject : `Fwd: ${emailData.subject}`);
    setComposeContent(`\n\n--- Forwarded Message ---\nFrom: ${emailData.from}\nTo: ${emailData.to}\nSubject: ${emailData.subject}\n\n${emailData.content}`);
    setComposeOpen(true);
  };

  const handleDelete = () => {
    if (selectedEmail) {
      deleteEmail(selectedEmail);
      setSelectedEmail(null);
    }
  };

  const handleSendEmail = () => {
    if (!composeUserId || !composeSubject || !composeContent) {
      alert('Please fill in all fields');
      return;
    }

    // Send the email
    sendEmail({
      receiverId: composeUserId,
      subject: composeSubject,
      content: composeContent,
      threadId: composeInitialData.threadId
    });
    
    // Clear the form and close modal
    setComposeInitialData({ mode: 'new' });
    setComposeUserId('');
    setComposeSubject('');
    setComposeContent('');
    setComposeOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Emails</h1>
            <Button onClick={() => {
              setComposeInitialData({ mode: 'new' });
              setComposeUserId('');
              setComposeSubject('');
              setComposeContent('');
              setComposeOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Compose
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: 'calc(100vh - 200px)', maxHeight: 'calc(100vh - 200px)' }}>
          {/* Email List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="h-full">
              <CardContent className="p-0 h-full flex flex-col">
                {/* Search and Filters */}
                <div className="p-4 border-b space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search emails..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">All Emails</option>
                    <option value="unread">Unread</option>
                    <option value="starred">Starred</option>
                    <option value="important">Important</option>
                  </select>
                </div>

                {/* Email List */}
                <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                  {filteredEmails.map((email, index) => (
                    <motion.div
                      key={email.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                      className={`p-4 border-b cursor-pointer ${
                        selectedEmail === email.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                      } ${!email.read ? 'bg-blue-50' : ''}`}
                      onClick={() => {
                        setSelectedEmail(email.id);
                        markEmailAsRead(email.id);
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {email.read ? (
                            <MailOpen className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Mail className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className={`font-semibold truncate ${!email.read ? 'text-gray-900' : 'text-gray-700'}`}>
                              {email.from}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">{formatTime(email.timestamp)}</span>
                              {email.priority === 'high' && (
                                <span className="text-red-500">🔴</span>
                              )}
                            </div>
                          </div>
                          <p className={`text-sm truncate ${!email.read ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                            {email.subject}
                          </p>
                          <p className="text-xs text-gray-500 truncate mt-1">
                            {email.content.substring(0, 100)}...
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Email Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="h-full">
              {selectedEmailData ? (
                <>
                  {/* Email Header */}
                  <div className="p-6 border-b">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                          {selectedEmailData.subject}
                        </h2>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>From: {selectedEmailData.from}</span>
                          <span>To: {selectedEmailData.to}</span>
                          <span>{formatTime(selectedEmailData.timestamp)}</span>
                          <span className={`font-medium ${getPriorityColor(selectedEmailData.priority)}`}>
                            {getPriorityIcon(selectedEmailData.priority)} {selectedEmailData.priority.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon">
                          <Star className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Archive className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleDelete}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={handleReply}>
                        <Reply className="mr-2 h-4 w-4" />
                        Reply
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleReply}>
                        <ReplyAll className="mr-2 h-4 w-4" />
                        Reply All
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleForward}>
                        <Forward className="mr-2 h-4 w-4" />
                        Forward
                      </Button>
                    </div>
                  </div>

                  {/* Email Body */}
                  <div className="p-6 flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {selectedEmailData.content}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select an email</h3>
                    <p className="text-gray-600">Choose an email from the list to read it</p>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Compose Modal */}
        {composeOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => {
              setComposeInitialData({ mode: 'new' });
              setComposeUserId('');
              setComposeSubject('');
              setComposeContent('');
              setComposeOpen(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">
                  {composeInitialData.mode === 'reply' ? 'Reply to Email' : 
                   composeInitialData.mode === 'forward' ? 'Forward Email' : 
                   'Compose Email'}
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <select
                    value={composeUserId}
                    onChange={(e) => setComposeUserId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="" disabled>Select a user...</option>
                    {mockUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Input 
                    placeholder="Subject" 
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                  />
                </div>
                <div>
                  <textarea
                    rows={8}
                    placeholder="Write your message..."
                    value={composeContent}
                    onChange={(e) => setComposeContent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => {
                    setComposeInitialData({ mode: 'new' });
                    setComposeUserId('');
                    setComposeSubject('');
                    setComposeContent('');
                    setComposeOpen(false);
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendEmail}>
                    <Send className="mr-2 h-4 w-4" />
                    Send
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Emails;
