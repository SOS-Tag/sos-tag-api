import Redis from 'ioredis';
import { __prod__ } from '@constants/env';

const redis = __prod__ ? new Redis(process.env.REDIS_URL || 'redis') : new Redis();

const quitRedis = async () => {
  await new Promise<void>(resolve => {
    redis.quit(() => {
      resolve();
    });
  });

  // redis.quit() creates a thread to close the connection.
  // We wait until all threads have been run once to ensure the connection closes.
  await new Promise(resolve => setImmediate(resolve));
};

export { quitRedis };
export default redis;
