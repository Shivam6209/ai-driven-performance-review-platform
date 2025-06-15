import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import * as crypto from 'crypto';

@Injectable()
export class AICacheService {
  private readonly logger = new Logger(AICacheService.name);
  private readonly defaultTTL = 3600 * 24; // 24 hours

  constructor(@InjectRedis() private readonly redis: Redis) {}

  /**
   * Generate a cache key based on input parameters
   */
  private generateCacheKey(prefix: string, params: Record<string, any>): string {
    // Sort keys for consistent hash generation
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {} as Record<string, any>);

    const hash = crypto
      .createHash('md5')
      .update(JSON.stringify(sortedParams))
      .digest('hex');

    return `ai:${prefix}:${hash}`;
  }

  /**
   * Get cached content if available
   */
  async getCachedContent<T>(
    prefix: string,
    params: Record<string, any>,
  ): Promise<T | null> {
    try {
      const cacheKey = this.generateCacheKey(prefix, params);
      const cachedData = await this.redis.get(cacheKey);

      if (cachedData) {
        this.logger.debug(`Cache hit for ${prefix}`);
        return JSON.parse(cachedData) as T;
      }

      this.logger.debug(`Cache miss for ${prefix}`);
      return null;
    } catch (error: unknown) {
      this.logger.error(`Error retrieving cached content: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  /**
   * Cache content with optional TTL
   */
  async cacheContent(
    prefix: string,
    params: Record<string, any>,
    content: any,
    ttlSeconds = this.defaultTTL,
  ): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey(prefix, params);
      await this.redis.set(
        cacheKey,
        JSON.stringify(content),
        'EX',
        ttlSeconds,
      );
      this.logger.debug(`Cached content for ${prefix} with TTL ${ttlSeconds}s`);
    } catch (error: unknown) {
      this.logger.error(`Error caching content: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Invalidate cached content
   */
  async invalidateCache(
    prefix: string,
    params: Record<string, any>,
  ): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey(prefix, params);
      await this.redis.del(cacheKey);
      this.logger.debug(`Invalidated cache for ${prefix}`);
    } catch (error: unknown) {
      this.logger.error(`Error invalidating cache: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Invalidate all caches with a specific prefix
   */
  async invalidateCacheByPrefix(prefix: string): Promise<void> {
    try {
      const keys = await this.redis.keys(`ai:${prefix}:*`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.logger.debug(`Invalidated ${keys.length} keys with prefix ${prefix}`);
      }
    } catch (error: unknown) {
      this.logger.error(`Error invalidating cache by prefix: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Get or set cache with a factory function
   */
  async getOrSetCache<T>(
    prefix: string,
    params: Record<string, any>,
    factory: () => Promise<T>,
    ttlSeconds = this.defaultTTL,
  ): Promise<T> {
    const cachedContent = await this.getCachedContent<T>(prefix, params);
    
    if (cachedContent !== null) {
      return cachedContent;
    }

    const generatedContent = await factory();
    await this.cacheContent(prefix, params, generatedContent, ttlSeconds);
    return generatedContent;
  }

  /**
   * Batch process items with caching
   */
  async batchProcess<T, R>(
    prefix: string,
    items: T[],
    processor: (item: T) => Promise<R>,
    getItemParams: (item: T) => Record<string, any>,
    ttlSeconds = this.defaultTTL,
  ): Promise<R[]> {
    const results: R[] = [];
    const processingPromises: Promise<void>[] = [];

    for (const item of items) {
      const params = getItemParams(item);
      
      processingPromises.push(
        (async () => {
          const result = await this.getOrSetCache<R>(
            prefix,
            params,
            () => processor(item),
            ttlSeconds,
          );
          results.push(result);
        })(),
      );
    }

    await Promise.all(processingPromises);
    return results;
  }
} 