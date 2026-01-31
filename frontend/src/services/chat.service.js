import api from '../api/Api.js';

/**
 * Chat service for TripFusion chatbot
 */
export const chatService = {
  /**
   * Send a message to the chatbot
   * @param {string} message - User message
   * @param {string} sessionId - Session ID (UUID)
   * @returns {Promise<Object>} - Response from chatbot
   */
  sendMessage: async (message, sessionId) => {
    try {
      const response = await api.post('/chat/chat', {
        message,
        sessionId,
      });
      return response.data;
    } catch (error) {
      console.error('Chat API Error:', error);
      throw error;
    }
  },

  /**
   * Get session history
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} - Session history
   */
  getSessionHistory: async (sessionId) => {
    try {
      const response = await api.get(`/chat/session/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Get Session Error:', error);
      throw error;
    }
  },

  /**
   * Delete/clear session
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} - Deletion result
   */
  deleteSession: async (sessionId) => {
    try {
      const response = await api.delete(`/chat/session/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Delete Session Error:', error);
      throw error;
    }
  },
};

