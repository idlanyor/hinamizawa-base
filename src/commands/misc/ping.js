import { BaseCommand } from '../../core/BaseCommand.js';

export default class PingCommand extends BaseCommand {
    constructor() {
        super({
            name: 'ping',
            alias: ['p'],
            description: 'Periksa koneksi bot',
            category: 'misc',
            cooldown: 5 // 5 detik
        });
    }

    async execute(context) {
        await context.reply('Pong! 🏓');
    }
} 