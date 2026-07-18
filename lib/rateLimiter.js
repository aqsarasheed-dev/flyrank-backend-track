import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

// Returns true if the request should be BLOCKED (rate limit exceeded)
export async function isRateLimited(key, { maxRequests = 5, windowSeconds = 60 } = {}) {
  const redisKey = `ratelimit:${key}`;
  const current = await redis.incr(redisKey);

  if (current === 1) {
    // first request in this window — set expiry
    await redis.expire(redisKey, windowSeconds);
  }

  return current > maxRequests;
}