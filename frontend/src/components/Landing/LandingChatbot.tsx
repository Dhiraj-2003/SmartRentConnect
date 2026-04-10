import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Building, Star, Calendar, CreditCard, Shield, Home } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
}

interface QuickAction {
  text: string;
  action: () => void;
}

export const LandingChatbot: React.FC = () => {
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
      // Send welcome message when chatbot opens for the first time
      setTimeout(() => {
        addBotMessage('Hello! Welcome to SmartRentConnect! I\'m here to help you understand our platform. Are you a tenant or property owner?');
      }, 500);
    }
  }, [isOpen, messages.length]);

  const addBotMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'bot',
      timestamp: new Date()
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
      if (lowerInput.includes('tenant') || lowerInput.includes('rent') || lowerInput.includes('looking')) {
        handleTenantFlow();
      } else if (lowerInput.includes('owner') || lowerInput.includes('landlord') || lowerInput.includes('property')) {
        handleOwnerFlow();
      } else if (lowerInput.includes('register') || lowerInput.includes('signup') || lowerInput.includes('sign up')) {
        handleRegistrationFlow();
      } else if (lowerInput.includes('login') || lowerInput.includes('sign in')) {
        handleLoginFlow();
      } else if (lowerInput.includes('feature') || lowerInput.includes('what') || lowerInput.includes('offer')) {
        handleFeaturesFlow();
      } else if (lowerInput.includes('bye') || lowerInput.includes('thank')) {
        addBotMessage('You\'re welcome! Feel free to ask if you need any help. Happy renting! Goodbye!');
      } else {
        addBotMessage('I can help you understand our platform better. You can ask me about:\n\n- Tenant features\n- Owner features\n- How to register\n- How to login\n- What we offer\n\nWhat would you like to know?');
      }
    }, 800);
  };

  const handleTenantFlow = () => {
    addBotMessage('Great! As a tenant, SmartRentConnect offers you amazing features:\n\n' +
      '1. **Property Search**: Browse verified properties with detailed information\n' +
      '2. **Easy Booking**: Book properties online with secure payments\n' +
      '3. **Rating System**: Rate and review properties you\'ve stayed in\n' +
      '4. **Complaint Management**: Raise and track maintenance issues\n' +
      '5. **Payment History**: Track all your rent payments\n' +
      '6. **Property History**: View your complete rental history\n\n' +
      'Would you like to know how to get started as a tenant?');
  };

  const handleOwnerFlow = () => {
    addBotMessage('Excellent! As a property owner, SmartRentConnect provides:\n\n' +
      '1. **Property Management**: List and manage multiple properties\n' +
      '2. **Tenant Management**: Track tenants and their details\n' +
      '3. **Revenue Tracking**: Monitor income and payment history\n' +
      '4. **Complaint Resolution**: Handle tenant maintenance requests\n' +
      '5. **Verification System**: Verified profiles build trust\n' +
      '6. **Analytics**: Detailed reports on occupancy and revenue\n\n' +
      'Ready to start listing your properties?');
  };

  const handleRegistrationFlow = () => {
    addBotMessage('Getting started is easy! Here\'s how to register:\n\n' +
      '1. **Click "Sign Up"** on the top navigation\n' +
      '2. **Choose your role**: Tenant or Property Owner\n' +
      '3. **Fill in your details**: Name, email, phone number\n' +
      '4. **For Owners**: Complete profile verification with documents\n' +
      '5. **Verify your email**: Check your inbox for verification link\n' +
      '6. **Set password**: Create a strong password\n\n' +
      'Once registered, you can immediately start exploring properties (tenants) or listing your properties (owners after verification).');
  };

  const handleLoginFlow = () => {
    addBotMessage('To login to your account:\n\n' +
      '1. **Click "Login"** on the top navigation\n' +
      '2. **Enter your email** and password\n' +
      '3. **Click "Sign In"** to access your dashboard\n\n' +
      'If you forgot your password, click "Forgot Password" and follow the reset instructions sent to your email.\n\n' +
      'Your personalized dashboard will show all relevant features based on your role!');
  };

  const handleFeaturesFlow = () => {
    addBotMessage('SmartRentConnect is a comprehensive rental management platform!\n\n' +
      '**For Tenants:**\n' +
      '1. Search verified properties\n' +
      '2. Online booking & payments\n' +
      '3. Rate & review properties\n' +
      '4. Track rental history\n' +
      '5. Raise maintenance complaints\n\n' +
      '**For Property Owners:**\n' +
      '1. List multiple properties\n' +
      '2. Manage tenant applications\n' +
      '3. Track revenue & payments\n' +
      '4. Handle maintenance requests\n' +
      '5. View analytics & reports\n\n' +
      '**Platform Features:**\n' +
      '1. Secure payment gateway\n' +
      '2. Document verification\n' +
      '3. Real-time notifications\n' +
      '4. Mobile-responsive design\n\n' +
      'Which feature interests you most?');
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

  const quickActions: QuickAction[] = [
    { text: 'Tenant Features', action: () => handleTenantFlow() },
    { text: 'Owner Features', action: () => handleOwnerFlow() },
    { text: 'How to Register', action: () => handleRegistrationFlow() },
    { text: 'How to Login', action: () => handleLoginFlow() },
    { text: 'All Features', action: () => handleFeaturesFlow() }
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 z-50 group"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute right-full mr-3 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Need help? Chat with us!
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
            <h3 className="font-semibold">SmartRent Assistant</h3>
            <p className="text-xs opacity-90">Always here to help!</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
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
      {messages.length <= 2 && (
        <div className="px-4 py-2 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            {quickActions.slice(0, 3).map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  addUserMessage(action.text);
                  simulateTyping(() => action.action(), 500);
                }}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
              >
                {action.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
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
