

import {
  getUserSession,
  saveUserSession,
  addMessageToSession,
  clearUserSession,
  sessionExists,
  getSessionTTL
} from '../utills/redis.utills.js';

import {
  isTravelRelated,
  generateResponse,
  getPoliteRejection
} from '../utills/gemini.utills.js';

/**
 * Main chat endpoint handler
 * POST /api/chat
 */
const handleChat = async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    // Validation
    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Message is required and cannot be empty'
      });
    }

    if (!sessionId || sessionId.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'SessionId is required'
      });
    }

    // Check if message is travel-related
    if (!isTravelRelated(message)) {
      // Save the rejected query to session
      await addMessageToSession(sessionId, 'user', message);
      await addMessageToSession(sessionId, 'model', getPoliteRejection());

      return res.json({
        success: true,
        response: getPoliteRejection(),
        isRejected: true,
        isJson: false,
        sessionId: sessionId,
        timestamp: new Date().toISOString()
      });
    }

    // Get conversation history
    const conversationHistory = await getUserSession(sessionId);

    // Generate AI response
    const aiResult = await generateResponse(message, conversationHistory);

    if (!aiResult.success) {
      return res.status(500).json({
        success: false,
        error: aiResult.error || 'Failed to generate response',
        timestamp: new Date().toISOString()
      });
    }

    // Update conversation history
    await addMessageToSession(sessionId, 'user', message);
    await addMessageToSession(sessionId, 'model',
      typeof aiResult.response === 'string'
        ? aiResult.response
        : JSON.stringify(aiResult.response)
    );

    // Send response
    res.json({
      success: true,
      response: aiResult.response,
      isJson: aiResult.isJson,
      isRejected: false,
      sessionId: sessionId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Chat Controller Error:', error);
    res.status(500).json({
      success: false,
      error: 'Something went wrong. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get session history
 * GET /api/session/:sessionId
 */
const getSessionHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'SessionId is required'
      });
    }

    // Check if session exists
    const exists = await sessionExists(sessionId);
    if (!exists) {
      return res.status(404).json({
        success: false,
        error: 'Session not found or expired',
        sessionId: sessionId
      });
    }

    // Get session history
    const history = await getUserSession(sessionId);
    const ttl = await getSessionTTL(sessionId);

    res.json({
      success: true,
      sessionId: sessionId,
      messageCount: history.length,
      history: history,
      expiresIn: ttl > 0 ? `${Math.floor(ttl / 60)} minutes` : 'N/A',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Get Session Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve session',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Clear/delete session
 * DELETE /api/session/:sessionId
 */
const deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'SessionId is required'
      });
    }

    // Clear session
    const deleted = await clearUserSession(sessionId);

    if (!deleted) {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete session'
      });
    }

    res.json({
      success: true,
      message: 'Session cleared successfully',
      sessionId: sessionId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Delete Session Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete session',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Health check endpoint
 * GET /health
 */
const healthCheck = (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    service: 'Travel with Jawad Chatbot API',
    createdBy: 'Jawad Tech Group',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
};

export {
  handleChat,
  getSessionHistory,
  deleteSession,
  healthCheck
};