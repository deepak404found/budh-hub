import { Redis } from "@upstash/redis";
import { redisConfig, isRedisConfigured } from "@/lib/config/env";

export const redis = isRedisConfigured()
  ? new Redis({
      url: redisConfig.url,
      token: redisConfig.token,
    })
  : null;


