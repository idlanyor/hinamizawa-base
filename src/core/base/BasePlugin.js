export class BasePlugin {
    constructor(client) {
        this.client = client;
        this.name = this.constructor.name;
        this.description = '';
        this.version = '1.0.0';
    }

    async initialize() {
        // Override this method to initialize plugin
    }

    async enable() {
        // Override this method to enable plugin
    }

    async disable() {
        // Override this method to disable plugin
    }
} 