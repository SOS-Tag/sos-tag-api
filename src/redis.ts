import Redis from 'ioredis';
import { __prod__ } from '@constants/env';

const redis = __prod__ ? new Redis(process.env.REDIS_URL || 'redis') : new Redis();

export default redis;
