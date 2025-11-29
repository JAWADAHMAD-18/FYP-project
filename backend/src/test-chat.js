// ============================================
// TEST FILE FOR TERMINAL TESTING (ESM VERSION)
// Travel with Jawad - Jawad Tech Group
// ============================================

import dotenv from 'dotenv';
dotenv.config();

import { connectRedis, disconnectRedis } from './config/redis.config.js';
import { handleChat } from './controllers/chat.controller.js';

console.log('\n🔍 Environment Check:');
console.log('API Key:', process.env.GEMINI_API_KEY ?
  `✅ Loaded (${process.env.GEMINI_API_KEY.substring(0, 10)}...)` :
  '❌ NOT FOUND');
console.log('Redis Host:', process.env.REDIS_HOST || 'localhost');
console.log('Port:', process.env.PORT || 3000);
// Fake Express Request
const fakeReq = {
  body: {
    message: "aoa",
    sessionId: "user-12345"
  }
};

// Fake Express Response
const fakeRes = {
  statusCode: 200,
  json(data) {
    console.log('\n=================================');
    console.log('✅ RESPONSE RECEIVED:');
    console.log('=================================');
    console.log(JSON.stringify(data, null, 2));
    console.log('=================================\n');
    return this;
  },
  status(code) {
    this.statusCode = code;
    console.log(`📊 Status Code: ${code}`);
    return this;
  }
};

// Main test function
const runTest = async () => {
  try {
    console.log('\n🚀 Starting test...\n');

    // Step 1: Connect to Redis
    console.log('📡 Connecting to Redis...');
    await connectRedis();
    console.log('✅ Redis connected!\n');

    // Step 2: Run chat controller
    console.log('💬 Sending message to chatbot...');
    console.log(`📝 Message: "${fakeReq.body.message}"`);
    console.log(`🔑 Session ID: ${fakeReq.body.sessionId}\n`);

    await handleChat(fakeReq, fakeRes);

    // Step 3: Disconnect Redis
    setTimeout(async () => {
      console.log('🔌 Disconnecting Redis...');
      await disconnectRedis();
      console.log('✅ Test completed successfully!\n');
      process.exit(0);
    }, 2000);

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error);
    await disconnectRedis();
    process.exit(1);
  }
};

// Run the test
runTest();
