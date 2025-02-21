export class BasePlugin {
    constructor(client) {
        this.client = client;
        this.name = this.constructor.name;
        this.description = '';
        this.version = '1.0.0';
        this.enabled = true;
    }

    async initialize() {
        if (this.enabled) {
            await this.onLoad();
        }
    }

    async onLoad() {
        // Method ini harus diimplementasikan oleh plugin
        throw new Error('Method onLoad() harus diimplementasikan');
    }

    async enable() {
        this.enabled = true;
        await this.onLoad();
    }

    async disable() {
        this.enabled = false;
    }
} 