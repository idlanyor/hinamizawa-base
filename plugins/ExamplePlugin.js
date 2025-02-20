import { BasePlugin } from '../src/core/base/BasePlugin.js';

export default class ExamplePlugin extends BasePlugin {
    constructor(client) {
        super(client);
        this.description = 'Contoh plugin';
        this.version = '1.0.0';
    }

    async initialize() {
        // Register commands
        this.client.commands.set('example', {
            name: 'example',
            execute: async ({ message }) => {
                await message.reply('Ini adalah contoh command dari plugin!');
            }
        });

        // Register event listeners
        this.client.eventHandler.register('message', async (message) => {
            // Handle message event
        });
    }
} 