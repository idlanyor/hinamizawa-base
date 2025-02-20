export class BaseService {
    constructor(client) {
        this.client = client;
    }

    async initialize() {
        // Override this method to initialize service
    }

    async destroy() {
        // Override this method for cleanup
    }
} 