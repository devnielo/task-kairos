import { RedisOptions } from 'ioredis';

import { env } from '@/shared/config/env';

export const redisConnectionOptions: RedisOptions = {
  host: env.redis.host,
  port: env.redis.port,
  password: env.redis.password,
  maxRetriesPerRequest: null,
};
