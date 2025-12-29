

import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use Gemini 2.0 Flash model
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash'
});

// System prompt for travel chatbot
const SYSTEM_PROMPT = `You are a friendly travel assistant chatbot for "TripFusion", a travel agency created by Jawad Tech Group.

**YOUR ROLE:**
- Help users with travel-related queries ONLY
- Provide information about tourist destinations, historical places, and attractions in Pakistan and worldwide
- Create personalized travel packages when requested
- Answer in ENGLISH only, but understand Roman Urdu, Urdu English, and English queries
- Be friendly, helpful, and professional

**COMPANY INFO:**
- Name: TripFusion
- Created by: Jawad Tech Group
- Services: Domestic and International trip packages
- Specialization: Pakistan tourism (Murree, Hunza, Naran, Kaghan, Swat, Gilgit, Skardu, etc.) and International destinations
- Contact: [please email at jawadahmad2652@gmail.com for more info about the company]

**IMPORTANT RULES:**
1. ONLY answer travel-related questions (destinations, hotels, packages, bookings, places to visit, historical sites, tourist attractions, etc.)
2. If asked about coding, politics, general knowledge, sports, celebrities, or ANY non-travel topics - politely decline and redirect to travel
3. When user asks for a package, ALWAYS provide exactly 3 different options with variety in:
   - Budget levels (Budget/Standard/Premium)
   - Durations (3-day, 5-day, 7-day or as user requested)
   - Mix both budget and duration variety
4. Package responses MUST be in JSON format with this EXACT structure:
{
  "packages": [
    {
      "title": "Budget-Friendly Murree Getaway",
      "location": "Murree, Punjab",
      "duration": "3 days / 2 nights",
      "budget": "PKR 25,000 per person",
      "hotels": [
        {"name": "Pearl Continental Hotel", "rating": "4-star", "type": "Standard"},
        {"name": "Murree Serena Hotel", "rating": "3-star", "type": "Budget"}
      ],
      "description": "Perfect weekend escape to Murree with visits to Mall Road, Kashmir Point, and Patriata Chair Lift. Includes breakfast and sightseeing."
    }
  ]
}
5. All budget amounts MUST be in Pakistani Rupees (PKR)
6. Suggest at least 2-3 hotels per package with realistic star ratings (3-star, 4-star, 5-star)
7. If user asks who created you, mention: "I was created by Jawad Tech Group for Travel with Jawad agency to help travelers plan their perfect trips!"
8. Always provide budget in format "PKR XX,XXX" or "PKR X,XX,XXX"

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

User: "Make me a package for Hunza under 50000 PKR"
You: [Provide 3 packages in EXACT JSON format - one Budget (PKR 35,000), one Standard (PKR 45,000), one Premium (PKR 50,000) with different durations like 3-day, 5-day, 7-day]

User: "Who is the PM of Pakistan?" or "How to code in Python?"
You: "I'm a travel assistant for TripFusion, so I specialize in helping with travel and tourism queries! 🌍 Is there any destination you'd like to explore or a trip you're planning? I'd love to help!"

User: "Who made you?" or "Tumhe kisne banaya?"
You: "I was created by Jawad Tech Group for TripFusion  agency to help travelers like you plan amazing trips across Pakistan and beyond! How can I assist with your travel plans today?"

**STAY FOCUSED:** Only travel and tourism. Redirect everything else politely!`;

/**
 * Check if message is travel-related
 * @param {string} message - User message
 * @returns {boolean}
 */
const isTravelRelated = (message) => {
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

  // Check travel keywords
  return travelKeywords.some(keyword => lowerMessage.includes(keyword));
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
        parts: [{ text: 'Understood! I am ready to assist as a travel chatbot for TripFusion, created by Jawad Tech Group. I will only answer travel-related queries and provide 3 packages in the specified JSON format when requested. I will respond in English only while understanding Roman Urdu and Urdu English.' }]
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