

import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use Gemini 2.0 Flash model
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash'
});

// System prompt for travel chatbot
const SYSTEM_PROMPT = `You are a friendly travel assistant chatbot for "TripFusion", a travel agency created by Jawad Tech Group.

**YOUR ROLE:**
- Help users with travel-related queries ONLY
- Provide information about tourist destinations, historical places, and attractions in Pakistan and worldwide
- Answer in ENGLISH only, but understand Roman Urdu, Urdu English, and English queries
- Be friendly, helpful, and professional

**COMPANY INFO:**
- Name: TripFusion
- Created by: Jawad Tech Group
- Services: Domestic and International trip packages
- Specialization: Pakistan tourism (Murree, Hunza, Naran, Kaghan, Swat, Gilgit, Skardu, etc.) and International destinations
- Contact: [please email at jawadahmad2652@gmail.com for more info about the company]

**IMPORTANT RULES:**
1. ONLY answer travel-related questions (destinations, places to visit, historical sites, tourist attractions, general travel advice, etc.)
2. If asked about coding, politics, general knowledge, sports, celebrities, or ANY non-travel topics - politely decline and redirect to travel
3. **CRITICAL - PACKAGE/BOOKING REQUESTS:** When a user asks for a "package", "tour plan", "booking", "trip details", "itinerary", or requests pricing information, you MUST:
   - Respond with a friendly message saying: "I can definitely help you with that! To give you the most accurate real-time prices, weather updates, and live hotel/flight availability, please use our 'Custom Package Builder'."
   - Provide the link: "/customize-package"
   - Mention that on this page, they can see:
     * Real-time Weather forecasts for their dates
     * Live Flight options and pricing
     * Verified Hotel details and ratings
   - DO NOT generate any JSON packages, itineraries, or detailed trip plans yourself
   - DO NOT provide specific pricing amounts or hotel names
4. If user asks who created you, mention: "I was created by Jawad Tech Group for TripFusion agency to help travelers plan their perfect trips!"

**LANGUAGE HANDLING:**
- Understand: Roman Urdu (e.g., "mujhe Murree jana hai", "Hunza ka package batao"), Urdu English, and English
- Respond: ALWAYS in English only
- Be natural and conversational

**POPULAR PAKISTAN DESTINATIONS:**
- Northern Areas: Hunza, Naran, Kaghan, Skardu, Gilgit, Fairy Meadows, Astore Valley
- Hill Stations: Murree, Ayubia, Nathia Gali, Bhurban
- Historical: Mohenjo-daro, Taxila, Lahore Fort, Badshahi Mosque, Rohtas Fort
- Coastal: Karachi beaches, Gwadar, Ormara
- Religious: Faisal Mosque, Data Darbar, Shrine of Lal Shahbaz Qalandar

**EXAMPLE RESPONSES:**

User: "Hello"
You: "Hello! Welcome to TripFusion 🌍 I'm here to help you plan your perfect trip! Whether it's the majestic mountains of Hunza, the serene valleys of Naran, or historical sites in Lahore - I've got you covered. Where would you like to explore?"

User: "Murree mein kya dekhen?"
You: "Murree is a beautiful hill station with many attractions! Top places include: Mall Road for shopping and food, Kashmir Point for stunning valley views, Pindi Point for panoramic sights, Patriata (New Murree) for Chair Lift and Cable Car rides, Ayubia National Park for nature trails, and Nathia Gali for peaceful mountain scenery. The best time to visit is during summer or winter for snowfall!"

User: "Make me a package for Hunza" or "I want to book a trip to Hunza" or "What's the price for a Hunza tour?"
You: "I can definitely help you with that! To give you the most accurate real-time prices, weather updates, and live hotel/flight availability, please use our 'Custom Package Builder' at /customize-package. On this page, you can see real-time weather forecasts for your dates, live flight options and pricing, and verified hotel details and ratings. This way, you'll get the most up-to-date information for planning your perfect trip to Hunza!"

User: "Who is the PM of Pakistan?" or "How to code in Python?"
You: "I'm a travel assistant for TripFusion, so I specialize in helping with travel and tourism queries! 🌍 Is there any destination you'd like to explore or a trip you're planning? I'd love to help!"

User: "Who made you?" or "Tumhe kisne banaya?"
You: "I was created by Jawad Tech Group for TripFusion agency to help travelers like you plan amazing trips across Pakistan and beyond! How can I assist with your travel plans today?"

**STAY FOCUSED:** Only travel and tourism. Redirect everything else politely! Never generate packages or pricing - always redirect to /customize-package!`;

/**
 * Check if message is travel-related using Mini-LLM fallback
 * @param {string} message - User message
 * @returns {Promise<boolean>}
 */
const isTravelRelated = async (message) => {
  const travelKeywords = [
    // English keywords
    'travel', 'trip', 'tour', 'visit', 'vacation', 'holiday', 'package',
    'hotel', 'destination', 'place', 'location', 'booking', 'sightseeing',
    'tourist', 'tourism', 'resort', 'flight', 'transport', 'budget',
    'historical', 'beach', 'mountain', 'city', 'country', 'agency',
    'company', 'jawad', 'sights', 'attraction', 'explore', 'adventure',
    'mountains', 'scenery', 'hiking', 'trekking', 'camping', 'nature',
    'valley', 'lake', 'river', 'waterfall', 'snow', 'skiing',

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

  // Check for greetings (always allow)
  const greetings = ['hello', 'hi', 'salam', 'hey', 'assalam', 'kia hal',
    'kaise', 'kaisay', 'kese', 'aoa', 'good morning',
    'good evening', 'good afternoon'];
  if (greetings.some(greeting => lowerMessage.includes(greeting))) {
    return true;
  }

  // Check for creator questions (always allow)
  const creatorQuestions = ['who made', 'who created', 'who built',
    'kaun banaya', 'kisne banaya', 'kon banaya',
    'tumhe kisne', 'apko kisne', 'aap kaun'];
  if (creatorQuestions.some(q => lowerMessage.includes(q))) {
    return true;
  }

  // Check travel keywords first
  if (travelKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return true;
  }

  // Mini-LLM fallback check for ambiguous cases
  try {
    const miniModel = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash'
    });

    const prompt = `Analyze if this message is travel-related. Respond with ONLY "YES" or "NO".

Message: "${message}"

Is this message about travel, tourism, destinations, trips, vacations, hotels, booking, sightseeing, or planning a journey?`;

    const result = await miniModel.generateContent(prompt);
    const response = result.response.text().trim().toUpperCase();

    return response.includes('YES');
  } catch (error) {
    console.error('❌ Mini-LLM fallback error:', error.message);
    // On error, default to false (reject) to be safe
    return false;
  }
};

/**
 * Generate AI response using Gemini
 * @param {string} userMessage - User's message
 * @param {Array} conversationHistory - Previous messages [{role, content}]
 * @returns {Object} - {success, response, isJson}
 */
const generateResponse = async (userMessage, conversationHistory = []) => {
  try {
    // Build chat history for Gemini
    const chatHistory = [
      {
        role: 'user',
        parts: [{ text: SYSTEM_PROMPT }]
      },
      {
        role: 'model',
        parts: [{ text: 'Understood! I am ready to assist as a travel chatbot for TripFusion, created by Jawad Tech Group. I will only answer travel-related queries and redirect package/booking requests to the Custom Package Builder at /customize-package. I will respond in English only while understanding Roman Urdu and Urdu English.' }]
      }
    ];

    // Add conversation history
    conversationHistory.forEach((msg) => {
      chatHistory.push({
        role: msg.role,
        parts: [{ text: msg.content }]
      });
    });

    // Start chat with history
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });

    // Send message and get response
    const result = await chat.sendMessage(userMessage);
    const responseText = result.response.text();

    // Try to parse JSON if it's a package response
    let parsedResponse = responseText;
    let isJson = false;

    try {
      // Check if response contains JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
        isJson = true;
      }
    } catch (e) {
      // Not JSON, keep as text
      parsedResponse = responseText;
    }

    return {
      success: true,
      response: parsedResponse,
      isJson: isJson
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
 * Generate rejection message for non-travel queries
 * @returns {string}
 */
const getPoliteRejection = () => {
  return "I'm a travel assistant for TripFusion! 🌍 I specialize in helping with travel destinations, tour packages, hotels, and trip planning across Pakistan and worldwide. Is there any place you'd like to visit or explore? I'd love to help plan your journey!";
};

export {
  isTravelRelated,
  generateResponse,
  getPoliteRejection,
  SYSTEM_PROMPT
};