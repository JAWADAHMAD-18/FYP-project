import { redisClient } from '../config/redis.config.js';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { ApiError } from '../utills/apiError.utills.js';

// ==================== CONFIGURATION ====================

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const DEV_MULTIPLIER = isDevelopment ? 10 : 1;

// Whitelist IPs from environment
const WHITELIST_IPS = (process.env.RATE_LIMIT_WHITELIST || '')
  .split(',')
  .map(ip => ip.trim())
  .filter(Boolean);

// ==================== REDIS STORE ====================

let redisStore = null;
if (process.env.REDIS_URL && isProduction) {
  try {
    redisStore = new RedisStore({
      client: redisClient,
      prefix: 'rl:tripfusion:',
    });
  } catch (err) {
    console.error('Redis store init failed, using memory store:', err);
  }
}

// ==================== UTILITY FUNCTIONS ====================

const skipWhitelistedIPs = (req) => {
  const ip = req.ip || req.connection.remoteAddress;
  if (WHITELIST_IPS.includes(ip)) return true;
  if (isDevelopment && (ip === '127.0.0.1' || ip === '::1')) return true;
  return false;
};

const generateKey = (req) => {
  return req.user?.id ? `${req.ip}-${req.user.id}` : req.ip;
};

const rateLimitHandler = (req, res, next) => {
  const resetTime = new Date(req.rateLimit?.resetTime || Date.now() + 60000);
  const minutesRemaining = Math.ceil((resetTime - Date.now()) / 60000);

  next(new ApiError(
    429,
    `Too many requests. Please try again in ${minutesRemaining} minute(s).`
  ));
};

// Middleware to add rate limit info to responses
export const rateLimitInfoMiddleware = (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = function (data) {
    if (req.rateLimit) {
      data.rateLimit = {
        limit: req.rateLimit.limit,
        remaining: req.rateLimit.remaining,
        resetTime: new Date(req.rateLimit.resetTime).toISOString(),
      };
    }
    return originalJson(data);
  };
  next();
};

// ==================== RATE LIMITERS ====================

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100 * DEV_MULTIPLIER,
  skip: skipWhitelistedIPs,
  keyGenerator: generateKey,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore,
});

export const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30 * DEV_MULTIPLIER,
  skip: skipWhitelistedIPs,
  keyGenerator: generateKey,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore,
});

export const customPackageLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10 * DEV_MULTIPLIER,
  skip: skipWhitelistedIPs,
  keyGenerator: generateKey,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore,
});

export const externalApiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 50 * DEV_MULTIPLIER,
  skip: skipWhitelistedIPs,
  keyGenerator: generateKey,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore,
});

export const dbQueryLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 200 * DEV_MULTIPLIER,
  skip: skipWhitelistedIPs,
  keyGenerator: generateKey,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5 * DEV_MULTIPLIER,
  skip: skipWhitelistedIPs,
  keyGenerator: generateKey,
  skipSuccessfulRequests: true,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore,
});

export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3 * DEV_MULTIPLIER,
  skip: skipWhitelistedIPs,
  keyGenerator: generateKey,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore,
});

// ==================== CUSTOM FACTORY ====================

export const createCustomLimiter = (config) => {
  const { windowMs = 60000, max = 10, message = 'Rate limit exceeded', skipSuccessfulRequests = false } = config;
  return rateLimit({
    windowMs,
    max: max * DEV_MULTIPLIER,
    skip: skipWhitelistedIPs,
    keyGenerator: generateKey,
    skipSuccessfulRequests,
    handler: rateLimitHandler,
    standardHeaders: true,
    legacyHeaders: false,
    message,
    store: redisStore,
  });
};

// ==================== LOGGING ====================

if (isDevelopment) {
  console.log('⚙️  Production-Ready Rate Limiter Config:');
  console.log(`   - ENV: ${process.env.NODE_ENV}`);
  console.log(`   - DEV_MULTIPLIER: ${DEV_MULTIPLIER}x`);
  console.log(`   - Whitelisted IPs: ${WHITELIST_IPS.length || 'None'}`);
  console.log('   - API Limiter: 100 req / 15 min');
  console.log('   - Chat Limiter: 30 req / 1 min');
  console.log('   - Custom Package: 10 req / 10 min');
  console.log('   - External API: 50 req / 5 min');
  console.log('   - DB Queries: 200 req / 5 min');
  console.log('   - Auth: 5 req / 15 min');
  console.log('   - Strict: 3 req / 1 hr');
}

export default {
  apiLimiter,
  chatLimiter,
  customPackageLimiter,
  externalApiLimiter,
  dbQueryLimiter,
  authLimiter,
  strictLimiter,
  createCustomLimiter,
  rateLimitInfoMiddleware,
};
