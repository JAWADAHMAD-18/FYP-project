// ============================================
// GEMINI AI UTILITIES
// Travel with Jawad - Jawad Tech Group
// ============================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use Gemini 2.0 Flash model
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-pro-exp'
});

// System prompt for travel chatbot
export const SYSTEM_PROMPT = `You are a friendly travel assistant chatbot for "Travel with Jawad", a travel agency created by Jawad Tech Group.

... ( SAME PROMPT — NOT CHANGED ) ...
`;

/**
 * Check if message is travel-related
 */
export const isTravelRelated = (message) => {
  const travelKeywords = [
    // English keywords
    'travel', 'trip', 'tour', 'visit', 'vacation', 'holiday', 'package',
    'hotel', 'destination', 'place', 'location', 'booking', 'sightseeing',
    'tourist', 'tourism', 'resort', 'flight', 'transport', 'budget',
    'historical', 'beach', 'mountain', 'city', 'country', 'agency',
    'company', 'jawad', 'sights', 'attraction', 'explore', 'adventure',

    // Roman Urdu keywords
    'safar', 'ghoomna', 'ghumna', 'ghumaon', 'jana', 'jaon', 'jayein',
    'mazaar', 'qabristan', 'masjid', 'darbar', 'kahan', 'kitna',
    'kharch', 'paisay', 'rupees', 'cost', 'price', 'detail', 'batao',
    'batayen', 'dikhayen', 'suggest', 'recommend',

    // Pakistan destinations
    'murree', 'lahore', 'karachi', 'islamabad', 'naran', 'kaghan', 'hunza',
    'swat', 'kashmir', 'gilgit', 'skardu', 'chitral', 'kalash', 'fairy',
    'meadows', 'deosai', 'khunjerab', 'mohenjo', 'daro', 'taxila',
    'badshahi', 'faisal', 'mosque', 'fort', 'museum', 'minar', 'pakistan',
    'rawalpindi', 'peshawar', 'quetta', 'multan', 'faisalabad', 'gwadar',

    // International
    'dubai', 'turkey', 'malaysia', 'thailand', 'maldives', 'saudi',
    'arabia', 'umrah', 'hajj', 'europe', 'paris', 'london', 'bangkok'
  ];

  const lowerMessage = message.toLowerCase();

  // Greetings allowed always
  const greetings = [
    'hello', 'hi', 'salam', 'hey', 'assalam', 'kia hal',
    'kaise', 'kaisay', 'kese', 'aoa', 'good morning',
    'good evening', 'good afternoon'
  ];
  if (greetings.some(g => lowerMessage.includes(g))) return true;

  // Creator questions allowed
  const creatorQuestions = [
    'who made', 'who created', 'who built',
    'kaun banaya', 'kisne banaya', 'kon banaya',
    'tumhe kisne', 'apko kisne', 'aap kaun'
  ];
  if (creatorQuestions.some(q => lowerMessage.includes(q))) return true;

  return travelKeywords.some(keyword => lowerMessage.includes(keyword));
};

/**
 * Generate AI response using Gemini
 */
export const generateResponse = async (userMessage, conversationHistory = []) => {
  try {
    const chatHistory = [
      {
        role: 'user',
        parts: [{ text: SYSTEM_PROMPT }]
      },
      {
        role: 'model',
        parts: [{
          text:
            'Understood! I am ready to assist as a travel chatbot for Travel with Jawad...'
        }]
      }
    ];

    // Add previous chat history
    conversationHistory.forEach(msg => {
      chatHistory.push({
        role: msg.role,
        parts: [{ text: msg.content }]
      });
    });

    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048
      }
    });

    const result = await chat.sendMessage(userMessage);
    const responseText = result.response.text();

    let parsedResponse = responseText;
    let isJson = false;

    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
        isJson = true;
      }
    } catch (err) {
      parsedResponse = responseText;
    }

    return {
      success: true,
      response: parsedResponse,
      isJson
    };

  } catch (error) {
    console.error('❌ Gemini API Error:', error.message);
    return {
      success: false,
      response: 'Sorry, I encountered an error. Please try again!',
      isJson: false,
      error: error.message
    };
  }
};

/**
 * Polite rejection
 */
export const getPoliteRejection = () => {
  return "I'm a travel assistant for Travel with Jawad! 🌍 I can help with destinations, packages, hotels, and planning amazing trips. Where would you like to travel?";
};
