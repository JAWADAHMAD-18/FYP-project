import api from "../api/Api.js";

export const chatService = {
  sendMessage: async (message, sessionId) => {
    try {
      const response = await api.post("/chat/chat", {
        message,
        sessionId,
      });
      return response.data;
    } catch (error) {
      console.error("Chat API Error:", error);
      throw error;
    }
  },

  getSessionHistory: async (sessionId) => {
    try {
      const response = await api.get(`/chat/session/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error("Get Session Error:", error);
      throw error;
    }
  },

  deleteSession: async (sessionId) => {
    try {
      const response = await api.delete(`/chat/session/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error("Delete Session Error:", error);
      throw error;
    }
  },
};
