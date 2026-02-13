import { RateLimiterMemory } from "rate-limiter-flexible";

// Rate limiter for socket connections (per IP)
const connectionLimiter = new RateLimiterMemory({
  points: 10, // 10 connections
  duration: 60, // per 60 seconds
  blockDuration: 300, // block for 5 minutes if exceeded
});

// Rate limiter for socket events (per socket)
const eventLimiter = new RateLimiterMemory({
  points: 100, // 100 events
  duration: 60, // per 60 seconds
});

// Admin gets higher limits
const adminEventLimiter = new RateLimiterMemory({
  points: 500, // 500 events
  duration: 60, // per 60 seconds
});

export const socketConnectionRateLimit = async (socket, next) => {
  try {
    const key = socket.handshake.address || socket.handshake.headers["x-forwarded-for"] || socket.id;
    await connectionLimiter.consume(key);
    next();
  } catch (rejRes) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    next(new Error(`Too many connection attempts. Try again in ${secs} seconds.`));
  }
};

export const socketEventRateLimit = async (socket, next) => {
  try {
    const limiter = socket.user?.isAdmin ? adminEventLimiter : eventLimiter;
    const key = socket.user?.id || socket.id;
    await limiter.consume(key);
    next();
  } catch (rejRes) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    next(new Error(`Rate limit exceeded. Try again in ${secs} seconds.`));
  }
};

