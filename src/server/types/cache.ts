/* eslint-disable @typescript-eslint/no-explicit-any */
import cache from 'server/cache';
import { Redis } from 'ioredis';

export type GraphqlFastifyCache = ReturnType<typeof cache>;

export type Cache<C = Record<string, never>> = {
  defaultTTL: number;
  storage: 'memory' | Redis;
  policy?: CachePolicy<C>;
};

export type CachePolicy<C = Record<string, any>> = {
  [key in keyof C]?: {
    ttl: number;
  };
};
