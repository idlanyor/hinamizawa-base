import { BaseCommand } from '../../../core/base/BaseCommand.js';

export default class PingCommand extends BaseCommand {
    constructor() {
        super({
            name: 'ping',
            alias: ['p'],
            description: 'Mengecek latency bot',
            category: 'misc'
        });
    }

    async execute(context) {
        const start = Date.now();
        await context.reply('Pong!');
        const latency = Date.now() - start;
        return context.reply(`Latency: ${latency}ms`);
    }
} 