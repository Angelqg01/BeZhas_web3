/**
 * BeZhas Cache Service
 * Provides a unified caching interface using node-cache (L1) and Redis (L2)
 */

const NodeCache = require('node-cache');
const redisService = require('./redis.service');
const pino = require('pino');
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

class CacheService {
    constructor() {
        // L1 Cache: In-memory (Local to this instance)
        this.l1 = new NodeCache({
            stdTTL: parseInt(process.env.CACHE_L1_TTL || '300'),
            checkperiod: 60,
            useClones: false
        });

        this.stats = {
            hits: 0,
            misses: 0,
            keys: 0
        };

        logger.info('Cache Service initialized (L1: node-cache)');
    }

    /**
     * Get a value from cache
     */
    async get(key) {
        // Try L1 first
        let value = this.l1.get(key);
        if (value !== undefined) {
            this.stats.hits++;
            return value;
        }

        // Try L2 (Redis) if available
        if (redisService.isAvailable()) {
            try {
                const redis = await redisService.getConnection();
                const redisValue = await redis.get(key);
                if (redisValue) {
                    value = JSON.parse(redisValue);
                    // Populate L1 for subsequent calls
                    this.l1.set(key, value);
                    this.stats.hits++;
                    return value;
                }
            } catch (error) {
                logger.warn({ key, error: error.message }, 'Redis get error');
            }
        }

        this.stats.misses++;
        return null;
    }

    /**
     * Set a value in cache
     */
    async set(key, value, ttl = null) {
        // Set in L1
        const l1Ttl = ttl || parseInt(process.env.CACHE_L1_TTL || '300');
        this.l1.set(key, value, l1Ttl);

        // Set in L2 (Redis) if available
        if (redisService.isAvailable()) {
            try {
                const redis = await redisService.getConnection();
                const redisTtl = ttl || parseInt(process.env.CACHE_L2_TTL || '3600');
                await redis.set(key, JSON.stringify(value), 'EX', redisTtl);
            } catch (error) {
                logger.warn({ key, error: error.message }, 'Redis set error');
            }
        }

        return true;
    }

    /**
     * Delete a value from cache
     */
    async del(key) {
        this.l1.del(key);

        if (redisService.isAvailable()) {
            try {
                const redis = await redisService.getConnection();
                await redis.del(key);
            } catch (error) {
                logger.warn({ key, error: error.message }, 'Redis del error');
            }
        }
    }

    /**
     * Clear all cache
     */
    async flush() {
        this.l1.flushAll();

        if (redisService.isAvailable()) {
            try {
                const redis = await redisService.getConnection();
                await redis.flushdb();
            } catch (error) {
                logger.warn({ error: error.message }, 'Redis flush error');
            }
        }
    }

    /**
     * Get cache statistics (required by web3-core.init.js)
     */
    getStats() {
        const l1Stats = this.l1.getStats();

        return {
            l1: l1Stats,
            totals: {
                hits: this.stats.hits,
                misses: this.stats.misses,
                hitRate: this.stats.hits + this.stats.misses > 0
                    ? ((this.stats.hits / (this.stats.hits + this.stats.misses)) * 100).toFixed(2)
                    : 0
            },
            redis: {
                connected: redisService.isAvailable()
            }
        };
    }
}

module.exports = new CacheService();
