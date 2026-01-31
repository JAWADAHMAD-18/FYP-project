import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import SuggestionChips from './SuggestionChips';
import { X, Minimize2, Maximize2, Bot } from 'lucide-react';


const ChatWindow = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  isLoading,
  onSuggestionClick,
  suggestions,
}) => {
  const messagesContainerRef = useRef(null);
  const messageRefs = useRef({});
  const chatWindowRef = useRef(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Smart scroll: Scroll to the START of the new message
  useEffect(() => {
    if (messages.length > 0 && !isMinimized && messagesContainerRef.current) {
      // Small delay to ensure DOM has updated
      const timeoutId = setTimeout(() => {
        const lastMessageIndex = messages.length - 1;
        const lastMessageRef = messageRefs.current[lastMessageIndex];
        
        if (lastMessageRef) {
          // Scroll to the top of the last message so user can start reading immediately
          lastMessageRef.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [messages, isMinimized]);

  // Prevent body scroll when chat is open on mobile
  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={chatWindowRef}
      className={`fixed z-[999] transition-all duration-300 ease-out ${
        isMinimized
          ? 'bottom-10 right-8 w-80 h-16'
          : 'top-20 left-0 right-0 bottom-0 md:top-20 md:bottom-10 md:right-8 md:left-auto md:w-96 md:max-w-md md:h-[calc(100vh-120px)]'
      } ${
        isOpen
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
      }`}
      style={{
        boxShadow:
          '0 20px 60px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div className="h-full flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center relative">
              <Bot className="w-6 h-6" />
              {/* Green online indicator */}
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-teal-600"></span>
            </div>
            <div>
              <h3 className="font-bold text-sm">TripFusion Assistant</h3>
              <p className="text-xs text-teal-100">
                {isLoading ? 'Typing...' : 'Online'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              aria-label={isMinimized ? 'Maximize' : 'Minimize'}
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4" />
              ) : (
                <Minimize2 className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        {!isMinimized && (
          <>
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto px-4 py-4 bg-gradient-to-b from-gray-50 to-white"
            >
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center mb-4">
                    <Bot className="w-10 h-10 text-teal-600" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    Welcome to TripFusion! 🌍
                  </h4>
                  <p className="text-sm text-gray-600 max-w-xs leading-relaxed">
                    Hi! I am your TripFusion travel assistant. How can I help you plan your perfect journey today? 🌍
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      ref={(el) => {
                        if (el) messageRefs.current[index] = el;
                      }}
                    >
                      <MessageBubble
                        message={msg.content}
                        isUser={msg.role === 'user'}
                      />
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3 mb-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-md">
                        <Bot className="w-5 h-5 text-teal-600 animate-pulse" />
                      </div>
                      <div className="flex items-center gap-1 bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"
                            style={{ animationDelay: '0.1s' }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"
                            style={{ animationDelay: '0.2s' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Suggestion Chips */}
            {showSuggestions && (
              <SuggestionChips
                suggestions={suggestions}
                onSuggestionClick={onSuggestionClick}
                hasMessages={messages.length > 0}
                onDismiss={() => setShowSuggestions(false)}
              />
            )}

            {/* Input */}
            <ChatInput
              onSendMessage={onSendMessage}
              isLoading={isLoading}
              disabled={false}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;

