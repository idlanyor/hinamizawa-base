import { Context } from '../Context.js';
import { Router } from '../Router.js';

export class MessageHandler {
    constructor(client) {
        this.client = client;
        this.router = new Router();
        this.cooldowns = new Map();
    }

    async handle(message) {
        try {
            // Create context
            const context = new Context(this.client, message);
            await context.initialize();

            if (!context.commandName) return;

            // Check cooldown
            if (this.isOnCooldown(context)) {
                return context.reply('Mohon tunggu sebelum menggunakan command ini lagi.');
            }

            // Handle command
            await this.router.handle(context);

            // Set cooldown
            this.setCooldown(context);

        } catch (error) {
            console.error('Error handling message:', error);
        }
    }

    isOnCooldown(context) {
        const { commandName } = context;
        const key = `${context.message.key.remoteJid}:${commandName}`;
        
        if (this.cooldowns.has(key)) {
            const expirationTime = this.cooldowns.get(key);
            if (Date.now() < expirationTime) {
                return true;
            }
        }
        return false;
    }

    setCooldown(context) {
        const { commandName } = context;
        const key = `${context.message.key.remoteJid}:${commandName}`;
        const command = this.client.commands.get(commandName);
        
        this.cooldowns.set(
            key, 
            Date.now() + (command.cooldown * 1000)
        );
    }
} 