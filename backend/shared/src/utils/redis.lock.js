export const acquireLock = async (redisClient, key, ttl = 5000) => {
  const lockKey = `lock:${key}`;
  try {
    const result = await redisClient.set(lockKey, "locked", {
      NX: true,
      PX: ttl,
    });
    return result === "OK";
  } catch (err) {
    console.error("Redis acquireLock error:", err?.message || err);
    return false;
  }
};

export const releaseLock = async (redisClient, key) => {
  const lockKey = `lock:${key}`;
  try {
    await redisClient.del(lockKey);
  } catch (err) {
    console.warn("Redis releaseLock error:", err?.message || err);
  }
};
