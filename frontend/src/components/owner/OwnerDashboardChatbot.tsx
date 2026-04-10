import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MessageCircle, X, Send, Bot, User, Building, Plus, Users, CreditCard, Calendar, Home, Settings, BarChart3, FileText, Shield, Star } from 'lucide-react';

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

export const OwnerDashboardChatbot: React.FC = () => {
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
        addBotMessage(`Hello! Welcome back, ${user?.fullName || user?.username}! I\'m here to help you manage your properties efficiently. What would you like to do today?`);
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
      if (lowerInput.includes('add') || lowerInput.includes('new') || lowerInput.includes('property')) {
        handleAddPropertyFlow();
      } else if (lowerInput.includes('manage') || lowerInput.includes('properties') || lowerInput.includes('list')) {
        handleManagePropertiesFlow();
      } else if (lowerInput.includes('tenant') || lowerInput.includes('renter')) {
        handleTenantsFlow();
      } else if (lowerInput.includes('revenue') || lowerInput.includes('income') || lowerInput.includes('payment')) {
        handleRevenueFlow();
      } else if (lowerInput.includes('complaint') || lowerInput.includes('maintenance')) {
        handleComplaintsFlow();
      } else if (lowerInput.includes('profile') || lowerInput.includes('account') || lowerInput.includes('setting')) {
        handleProfileFlow();
      } else if (lowerInput.includes('help') || lowerInput.includes('guide') || lowerInput.includes('tutorial')) {
        handleHelpFlow();
      } else if (lowerInput.includes('feature') || lowerInput.includes('what') || lowerInput.includes('dashboard')) {
        handleFeaturesFlow();
      } else {
        addBotMessage('I can help you navigate your owner dashboard. You can ask me about:\n\n' +
          '• Adding new properties\n' +
          '• Managing existing properties\n' +
          '• Tenant management\n' +
          '• Revenue and payments\n' +
          '• Complaints and maintenance\n' +
          '• Profile settings\n\n' +
          'What would you like to do?');
      }
    }, 800);
  };

  const handleAddPropertyFlow = () => {
    addBotMessage('To add a new property, you have two options:\n\n' +
      '1. **Quick Actions**: Click "Add Property" button in the Quick Actions section\n' +
      '2. **Top Right**: Click the "Add New Property" button in the top navigation\n\n' +
      'Both will take you to the property listing form where you can:\n' +
      '• Add property details and photos\n' +
      '• Set rent amount and amenities\n' +
      '• Specify property type and location\n' +
      '• Submit for admin approval\n\n' +
      'Would you like me to take you to the Add Property page?',
      { label: 'Add New Property', path: '/owner/properties/add' }
    );
  };

  const handleManagePropertiesFlow = () => {
    addBotMessage('Manage all your properties from the Properties section:\n\n' +
      '**Available Actions:**\n' +
      '• View all listed properties\n' +
      '• Edit property details\n' +
      '• Update availability status\n' +
      '• Upload new photos\n\n' +
      'Access this from Quick Actions or main navigation.',
      { label: 'Manage Properties', path: '/owner/properties' }
    );
  };

  const handleTenantsFlow = () => {
    addBotMessage('Manage your tenants efficiently:\n\n' +
      '**Tenant Management Features:**\n' +
      '• View all current tenants\n' +
      '• Handle tenant requests\n' +
      '• Send notifications\n' +
      '• Manage occupancy status\n\n' +
      'Keep track of all tenant-related activities in one place!',
      { label: 'Manage Tenants', path: '/owner/tenants' }
    );
  };

  const handleRevenueFlow = () => {
    addBotMessage('Track your property revenue and finances:\n\n' +
      '**Revenue Dashboard Features:**\n' +
      '• Monthly income reports\n' +
      '• Quarterly revenue analysis\n' +
      '• Payment status tracking\n' +
      '• Financial analytics\n\n' +
      'Monitor your rental business performance in real-time!',
      { label: 'View Revenue', path: '/owner/revenue' }
    );
  };

  const handleComplaintsFlow = () => {
    addBotMessage('Handle tenant complaints and maintenance requests:\n\n' +
      '**Complaint Management:**\n' +
      '• View all tenant complaints\n' +
      '• Track maintenance requests\n' +
      '• Update complaint status\n\n' +
      'Provide excellent tenant service by quick issue resolution!',
      { label: 'View Complaints', path: '/owner/activity' }
    );
  };

  const handleProfileFlow = () => {
    addBotMessage('Manage your account and verification:\n\n' +
      '**Profile Settings:**\n' +
      '• Update personal information\n' +
      '• Upload verification documents\n' +
      '• Check verification status\n' +
      '• Update contact details\n\n' +
      'Keep your profile complete and verified for better trust!',
      { label: 'Profile Settings', path: '/owner/profile' }
    );
  };

  const handleHelpFlow = () => {
    addBotMessage('Here\'s a quick guide to your Owner Dashboard:\n\n' +
      '**Getting Started:**\n' +
      '1. **Complete Profile**: Add documents for verification\n' +
      '2. **Add Properties**: List your rental properties\n' +
      '3. **Manage Tenants**: Handle tenant applications and requests\n' +
      '4. **Track Revenue**: Monitor your income\n' +
      '5. **Handle Issues**: Resolve complaints quickly\n\n' +
      '**Quick Tips:**\n' +
      '• Verified profiles get more tenant applications\n' +
      '• Regular updates improve property visibility\n' +
      '• Quick complaint responses boost ratings\n\n' +
      'Need help with any specific task?');
  };

  const handleFeaturesFlow = () => {
    addBotMessage('Your Owner Dashboard includes these powerful features:\n\n' +
      '**🏠 Property Management:**\n' +
      '• List multiple properties\n' +
      '• Edit property details\n' +
      '• Photo galleries\n' +
      '• Availability management\n\n' +
      '**👥 Tenant Management:**\n' +
      '• Tenant database\n' +
      '• Lease tracking\n' +
      '• Communication tools\n\n' +
      '**💰 Revenue Tracking:**\n' +
      '• Income analytics\n' +
      '• Payment monitoring\n' +
      '• Financial reports\n\n' +
      '**🔧 Issue Resolution:**\n' +
      '• Complaint tracking\n' +
      '• Maintenance requests\n' +
      '• Status updates\n\n' +
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
    { text: 'Add Property', action: () => handleAddPropertyFlow() },
    { text: 'Manage Properties', action: () => handleManagePropertiesFlow() },
    { text: 'View Tenants', action: () => handleTenantsFlow() },
    { text: 'Check Revenue', action: () => handleRevenueFlow() },
    { text: 'Handle Complaints', action: () => handleComplaintsFlow() },
    { text: 'Profile Settings', action: () => handleProfileFlow() }
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
            <h3 className="font-semibold">Owner Assistant</h3>
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
            placeholder="Ask about managing properties..."
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
