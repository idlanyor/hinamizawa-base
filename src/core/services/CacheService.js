import { BaseService } from '../base/BaseService.js';
import NodeCache from 'node-cache';

export class CacheService extends BaseService {
    constructor(client) {
        super(client);
        this.cache = new NodeCache({
            stdTTL: 300, // 5 menit
            checkperiod: 60
        });
    }

    set(key, value, ttl = 300) {
        return this.cache.set(key, value, ttl);
    }

    get(key) {
        return this.cache.get(key);
    }

    has(key) {
        return this.cache.has(key);
    }

    del(key) {
        return this.cache.del(key);
    }

    flush() {
        return this.cache.flushAll();
    }
} 