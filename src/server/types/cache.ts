/* eslint-disable @typescript-eslint/no-explicit-any */
import cache from 'server/cache';
import { Redis } from 'ioredis';

export type GraphqlFastifyCache = ReturnType<typeof cache>;

export type Cache<C = Record<string, never>> = {
  defaultTTL: number;
  all?: boolean;
  storage: 'memory' | Redis;
  policy?: CachePolicy<C>;
};

type CachePolicy<C extends Record<string, any>> = {
  [key in keyof C]?: {
    ttl: number;
  };
};
