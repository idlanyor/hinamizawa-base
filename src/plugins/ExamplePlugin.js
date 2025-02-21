import { BasePlugin } from '../core/base/BasePlugin.js';

export default class ExamplePlugin extends BasePlugin {
    constructor(client) {
        super(client);
        this.description = 'Contoh plugin sederhana';
        this.version = '1.0.0';
    }

    async onLoad() {
        // Register commands atau event listeners
        console.log(`Plugin ${this.name} v${this.version} berhasil dimuat`);
        
        // Contoh register command
        this.client.commands.set('example', {
            name: 'example',
            description: 'Contoh command dari plugin',
            async execute(context) {
                await context.reply('Hello dari Example Plugin! 👋');
            }
        });
    }
} 