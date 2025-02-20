import { CacheService } from '../services/CacheService.js';

export class RateLimiter {
    constructor(options = {}) {
        this.windowMs = options.windowMs || 60000; // 1 menit
        this.max = options.max || 10; // maksimal 10 request
        this.cache = new CacheService();
    }

    middleware() {
        return async (context, next) => {
            const key = `ratelimit:${context.message.key.participant}`;
            const current = this.cache.get(key) || 0;

            if (current >= this.max) {
                throw new Error('Anda terlalu banyak mengirim perintah. Silakan tunggu beberapa saat.');
            }

            this.cache.set(key, current + 1, this.windowMs / 1000);
            await next();
        };
    }
} 