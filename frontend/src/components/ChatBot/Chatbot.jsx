import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/useAuth';
import ChatWindow from './ChatWindow';
import { chatService } from '../../services/chat.service';
import { Bot } from 'lucide-react';
import { v4 } from 'uuid';

const Chatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  // Generate or retrieve session ID
  useEffect(() => {
    if (user) {
      // Generate a secure UUID for session 
      const newSessionId = v4();
      setSessionId(newSessionId);
      
      // Try to load existing session history
      loadSessionHistory(newSessionId);
    }
  }, [user]);

  // Load session history on mount
  const loadSessionHistory = async (sessionId) => {
    try {
      const response = await chatService.getSessionHistory(sessionId);
      if (response.success && response.history) {
        setMessages(response.history);
      }
    } catch (error) {
      // Session might not exist yet, which is fine
      console.log('No existing session found');
    }
  };

  // Handle sending messages
  const handleSendMessage = useCallback(
    async (messageText) => {
      if (!sessionId || !messageText.trim()) return;

      // Add user message to UI immediately
      const userMessage = {
        role: 'user',
        content: messageText,
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const response = await chatService.sendMessage(messageText, sessionId);

        if (response.success) {
          // Add bot response
          const botMessage = {
            role: 'model',
            content: response.response,
          };
          setMessages((prev) => [...prev, botMessage]);

          // Update suggestions based on response
          if (response.isRejected) {
            setSuggestions([
              'Best time to visit Hunza?',
              'Show me beach destinations',
            ]);
          } else if (
            typeof response.response === 'string' &&
            (response.response.toLowerCase().includes('package') ||
              response.response.toLowerCase().includes('customize-package'))
          ) {
            setSuggestions([
              'View flight options',
              'Check weather forecast',
              'Find hotels',
            ]);
          }
        } else {
          throw new Error(response.error || 'Failed to get response');
        }
      } catch (error) {
        console.error('Chat error:', error);
        setError(
          'Sorry, I encountered an error. Please try again in a moment.'
        );
        
        // Add error message to chat
        const errorMessage = {
          role: 'model',
          content:
            "I'm having trouble connecting right now. Please try again in a moment, or refresh the page if the issue persists.",
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId]
  );

  // Handle suggestion clicks
  const handleSuggestionClick = useCallback(
    (suggestion) => {
      handleSendMessage(suggestion);
    },
    [handleSendMessage]
  );

  // Clear chat session
  const handleClearSession = async () => {
    if (sessionId) {
      try {
        await chatService.deleteSession(sessionId);
        setMessages([]);
        setError(null);
      } catch (error) {
        console.error('Error clearing session:', error);
      }
    }
  };

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <>
      {/* Chat Toggle Button - Fixed bottom-right with high z-index */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-10 right-8 z-[999] w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-full shadow-2xl shadow-teal-500/40 hover:shadow-teal-500/50 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group "
          aria-label="Open chat"
        >
          <Bot className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          {/* Green online indicator */}
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg"></span>
        </button>
      )}

      {/* Chat Window */}
      <ChatWindow
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        onSuggestionClick={handleSuggestionClick}
        suggestions={suggestions}
      />
    </>
  );
};

export default Chatbot;

