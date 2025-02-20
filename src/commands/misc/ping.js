import { BaseCommand } from '../../core/BaseCommand.js';

export default class PingCommand extends BaseCommand {
    constructor() {
        super({
            name: 'ping',
            alias: ['p'],
            description: 'Mengecek latency bot',
            category: 'misc'
        });
    }

    async execute({ client, message }) {
        const start = Date.now();
        await message.reply('Pong!');
        const latency = Date.now() - start;
        return message.reply(`Latency: ${latency}ms`);
    }
} 