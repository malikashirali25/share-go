import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, 
  Video, 
  PhoneCall, 
  PhoneMissed, 
  PhoneOff,
  Search,
  Filter,
  MoreVertical,
  Clock,
  User
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { mockCalls, mockUsers } from '../data/mockData';
import { useContact } from '../contexts/ContactContext';
import { useAuth } from '../contexts/AuthContext';

const Calls = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const { getUserCalls, createCall, initiateCall, markMissedCallsAsRead } = useContact();
  const { user: currentUser } = useAuth();

  // Mark missed calls as read when component mounts
  useEffect(() => {
    markMissedCallsAsRead();
  }, [markMissedCallsAsRead]);

  const getCallIcon = (call: any) => {
    if (call.status === 'completed') {
      return call.type === 'video' ? Video : Phone;
    } else if (call.status === 'missed') {
      return PhoneMissed;
    } else {
      return PhoneOff;
    }
  };

  const getCallStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'missed':
        return 'text-red-600';
      case 'declined':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get user-specific calls
  const calls = getUserCalls();

  // Convert context calls to display format
  const displayCalls = calls.map(call => {
    // Determine the other user and the direction of the call
    const isOutgoing = call.callerId === currentUser?.id;
    const otherUserId = isOutgoing ? call.receiverId : call.callerId;
    const otherUser = mockUsers.find(u => u.id === otherUserId);
    const direction = isOutgoing ? 'Outgoing' : 'Incoming';

    return {
      ...call,
      otherUser,
      direction,
      isOutgoing
    };
  });

  const filteredCalls = displayCalls.filter(call => {
    const searchMatch = !searchTerm || 
      (call.otherUser?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const typeMatch = filterType === 'all' || 
      (filterType === 'voice' && call.type === 'voice') ||
      (filterType === 'video' && call.type === 'video') ||
      (filterType === 'missed' && call.status === 'missed');
    
    return searchMatch && typeMatch;
  });

  const handleCall = (userId: string, type: 'voice' | 'video') => {
    console.log(`Initiating ${type} call to user ${userId}`);
    initiateCall(userId, type);
  };

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
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Calls</h1>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search calls..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Calls</option>
                  <option value="voice">Voice Calls</option>
                  <option value="video">Video Calls</option>
                  <option value="missed">Missed Calls</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Call History */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          {filteredCalls.length > 0 ? (
            filteredCalls.map((call, index) => {
              // Fallback for user not found
              if (!call.otherUser) {
                return (
                  <motion.div
                    key={call.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="h-6 w-6 text-gray-400" />
                              </div>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">Unknown User</h3>
                              <p className="text-sm text-gray-500">{call.status}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">{formatTime(call.timestamp)}</p>
                            <p className={`text-sm font-medium ${getCallStatusColor(call.status)}`}>
                              {call.status.charAt(0).toUpperCase() + call.status.slice(1)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              }

              const CallIcon = getCallIcon(call);

              return (
                <motion.div
                  key={call.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <img
                              src={call.otherUser.avatar}
                              alt={call.otherUser.name}
                              className="h-12 w-12 rounded-full"
                            />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                              <CallIcon className={`h-3 w-3 ${getCallStatusColor(call.status)}`} />
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {call.otherUser.name}
                            </h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span>{call.direction === 'Incoming' ? 'Incoming' : 'Outgoing'}</span>
                              <span>•</span>
                              <span className="capitalize">{call.type} call</span>
                              {call.duration > 0 && (
                                <>
                                  <span>•</span>
                                  <span>{formatDuration(call.duration)}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-500">{formatTime(call.timestamp)}</p>
                            <p className={`text-sm font-medium ${getCallStatusColor(call.status)}`}>
                              {call.status.charAt(0).toUpperCase() + call.status.slice(1)}
                            </p>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCall(call.otherUser.id, 'voice')}
                            >
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCall(call.otherUser.id, 'video')}
                            >
                              <Video className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-12"
            >
              <PhoneCall className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No calls found</h3>
              <p className="text-gray-600">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Your call history will appear here once you start making calls.'
                }
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Start a new call or manage your contacts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button className="flex items-center justify-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>Voice Call</span>
                </Button>
                <Button variant="outline" className="flex items-center justify-center space-x-2">
                  <Video className="h-4 w-4" />
                  <span>Video Call</span>
                </Button>
                <Button variant="outline" className="flex items-center justify-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Contacts</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Calls;
