import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MessageCircle, X, Send, Bot, User, Home, CreditCard, MessageCircle as ComplaintIcon, QrCode, Search, Plus, History, Star, Calendar, Shield } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
  action?: {
    label: string;
    path: string;
  };
}

interface QuickAction {
  text: string;
  action: () => void;
}

export const TenantDashboardChatbot: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Send welcome message when chatbot opens
      setTimeout(() => {
        addBotMessage(`Hello! Welcome back, ${user?.fullName || user?.username}! I\'m here to help you manage your rental experience. What would you like to do today?`);
      }, 500);
    }
  }, [isOpen, messages.length]);

  const addBotMessage = (text: string, action?: { label: string; path: string }) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'bot',
      timestamp: new Date(),
      action
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addUserMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const simulateTyping = (callback: () => void, delay: number = 1000) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, delay);
  };

  const handleUserInput = (input: string) => {
    const lowerInput = input.toLowerCase();
    addUserMessage(input);

    simulateTyping(() => {
      if (lowerInput.includes('search') || lowerInput.includes('find') || lowerInput.includes('property')) {
        handleSearchPropertiesFlow();
      } else if (lowerInput.includes('guest') || lowerInput.includes('pass') || lowerInput.includes('visitor')) {
        handleGuestPassFlow();
      } else if (lowerInput.includes('complaint') || lowerInput.includes('issue') || lowerInput.includes('maintenance')) {
        handleComplaintFlow();
      } else if (lowerInput.includes('history') || lowerInput.includes('past') || lowerInput.includes('rental')) {
        handleHistoryFlow();
      } else if (lowerInput.includes('pay') || lowerInput.includes('rent') || lowerInput.includes('payment')) {
        handlePaymentFlow();
      } else if (lowerInput.includes('rate') || lowerInput.includes('review') || lowerInput.includes('rating')) {
        handleRatingFlow();
      } else if (lowerInput.includes('help') || lowerInput.includes('guide') || lowerInput.includes('tutorial')) {
        handleHelpFlow();
      } else if (lowerInput.includes('feature') || lowerInput.includes('what') || lowerInput.includes('dashboard')) {
        handleFeaturesFlow();
      } else {
        addBotMessage('I can help you navigate your tenant dashboard. You can ask me about:\n\n' +
          '· Searching for new properties\n' +
          '· Creating guest passes\n' +
          '· Filing complaints\n' +
          '· Viewing rental history\n' +
          '· Making rent payments\n' +
          '· Rating and reviewing properties\n\n' +
          'What would you like to do?');
      }
    }, 800);
  };

  const handleSearchPropertiesFlow = () => {
    addBotMessage('Find your perfect home with our smart property search:\n\n' +
      '**Search Features:**\n' +
      '· Click on Search Properties button\n' +
      '· On the search page, you can :\n' +
      '  · Advanced filters for location, price, and amenities\n' +
      '  · Real-time availability status\n' +
      '  · Detailed property information and photos\n\n' +
      'Start your search for a new rental property today!',
      { label: 'Search Properties', path: '/properties' }
    );
  };

  const handleGuestPassFlow = () => {
    addBotMessage('Create digital guest passes for your visitors:\n\n' +
      '**Guest Pass Features:**\n' +
      '· Generate QR codes for easy entry\n' +
      '· Set validity dates and times\n' +
      '· Track visitor entry and exit\n' +
      '· Multiple pass types (daily, weekly)\n' +
      '· Instant sharing with visitors\n' +
      '· Security verification at entry\n\n' +
      'No more manual visitor logs - everything is digital and secure!',
      { label: 'Create Guest Pass', path: '/guest-pass' }
    );
  };

  const handleComplaintFlow = () => {
    addBotMessage('Report maintenance issues and track resolutions:\n\n' +
      '**Complaint Management:**\n' +
      '· File maintenance requests\n' +
      '· Upload photos of issues\n' +
      '· Track complaint status in real-time\n' +
      '· Communicate with property owners\n' +
      '· Get resolution updates\n\n' +
      'Quick and efficient issue resolution for better living!',
      { label: 'File Complaint', path: '/complaints' }
    );
  };

  const handleHistoryFlow = () => {
    addBotMessage('View your complete rental journey:\n\n' +
      '**Property History Features:**\n' +
      '· View all past and current properties\n' +
      '· Track rental payment history\n' +
      '· Rate and review properties\n' +
      '· View occupancy dates\n\n' +
      'Your complete rental story in one place!',
      { label: 'Property History', path: '/tenant/history' }
    );
  };

  const handlePaymentFlow = () => {
    addBotMessage('Manage your rent payments easily:\n\n' +
      '**Payment Features:**\n' +
      '· Secure online payments\n' +
      '· Multiple payment methods\n' +
      '· Payment reminders and notifications\n' +
      '· View payment history\n\n' +
      'Never miss a payment with our smart payment system!',
      { label: 'Pay Rent', path: '/payments' }
    );
  };

  const handleRatingFlow = () => {
    addBotMessage('Share your experience and help others:\n\n' +
      '**Rating & Review System:**\n' +
      '· Rate properties you\'ve lived in\n' +
      '· Write detailed reviews\n' +
      '· Update existing reviews\n' +
      '· Help other tenants make informed choices\n' +
      '· Build your rental reputation\n\n' +
      'Your feedback matters to the community!',
      { label: 'Property History', path: '/tenant/history' }
    );
  };

  const handleHelpFlow = () => {
    addBotMessage('Here\'s your tenant dashboard guide:\n\n' +
      '**Getting Started:**\n' +
      '1. **Search Properties**: Find your next home\n' +
      '2. **Create Guest Passes**: Manage visitors easily\n' +
      '3. **File Complaints**: Report issues quickly\n' +
      '4. **View History**: Track your rental journey\n' +
      '5. **Pay Rent**: Secure online payments\n' +
      '6. **Rate Properties**: Share your experience\n\n' +
      '**Quick Tips:**\n' +
      '· Use guest passes for secure visitor entry\n' +
      '· File complaints promptly for quick resolution\n' +
      '· Rate properties to help the community\n' +
      '· Keep track of your payment history\n\n' +
      'Need help with any specific task?');
  };

  const handleFeaturesFlow = () => {
    addBotMessage('Your Tenant Dashboard includes these powerful features:\n\n' +
      '**Home Management:**\n' +
      '· Current property details\n' +
      '· Room/flat information\n' +
      '· Owner contact details\n\n' +
      '**Financial Tools:**\n' +
      '· Rent payment tracking\n' +
      '· Payment history\n' +
      '· Pending payment alerts\n\n' +
      '**Communication:**\n' +
      '· Complaint filing system\n' +
      '· Guest pass management\n' +
      '· Owner messaging\n\n' +
      '**Property Search:**\n' +
      '· Advanced search filters\n' +
      '· Property comparisons\n' +
      '· Saved listings\n\n' +
      'Which feature would you like to explore?');
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      handleUserInput(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleActionClick = (action: { label: string; path: string }) => {
    navigate(action.path);
    addBotMessage(`Great! Taking you to ${action.label} page...`);
    setTimeout(() => {
      setIsOpen(false);
      setMessages([]);
    }, 1000);
  };

  const quickActions: QuickAction[] = [
    { text: 'Search Properties', action: () => handleSearchPropertiesFlow() },
    { text: 'Create Guest Pass', action: () => handleGuestPassFlow() },
    { text: 'File Complaint', action: () => handleComplaintFlow() },
    { text: 'View History', action: () => handleHistoryFlow() },
    { text: 'Pay Rent', action: () => handlePaymentFlow() },
    { text: 'Rate Properties', action: () => handleRatingFlow() }
  ];

  const handleCloseChatbot = () => {
    setIsOpen(false);
    setMessages([]);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 z-50 group"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute right-full mr-3 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Need help? I'm here!
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bot className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">Tenant Assistant</h3>
            <p className="text-xs opacity-90">Helping {user?.fullName || user?.username}</p>
          </div>
        </div>
        <button
          onClick={handleCloseChatbot}
          className="hover:bg-white/20 p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.sender === 'bot' && <Bot className="w-4 h-4 mt-1 flex-shrink-0" />}
                {message.sender === 'user' && <User className="w-4 h-4 mt-1 flex-shrink-0" />}
                <div className="text-sm whitespace-pre-line">{message.text}</div>
              </div>
              
              {message.action && (
                <button
                  onClick={() => handleActionClick(message.action!)}
                  className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{message.action.label}</span>
                </button>
              )}
              
              <div className={`text-xs mt-1 ${message.sender === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 p-3 rounded-2xl">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-2">
          {quickActions.slice(0, 6).map((action, index) => (
            <button
              key={index}
              onClick={() => {
                addUserMessage(action.text);
                simulateTyping(() => action.action(), 500);
              }}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full transition-colors text-center"
            >
              {action.text}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about managing your rental..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-full hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
