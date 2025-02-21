import { BasePlugin } from '../core/base/BasePlugin.js';

export default class WelcomePlugin extends BasePlugin {
    constructor(client) {
        super(client);
        this.description = 'Plugin untuk menyambut member baru';
        this.version = '1.0.0';
    }

    async onLoad() {
        // Register event untuk member join group
        this.client.eventHandler.register('group.participant.update', async (update) => {
            if (update.action === 'add') {
                const group = await this.client.sock.groupMetadata(update.id);
                const mentions = update.participants;
                
                await this.client.sock.sendMessage(update.id, {
                    text: `Selamat datang @${update.participants[0].split('@')[0]} di ${group.subject}! 👋`,
                    mentions
                });
            }
        });

        // Register command welcome
        this.client.commands.set('welcome', {
            name: 'welcome',
            description: 'Mengirim pesan welcome',
            async execute(context) {
                await context.reply('Selamat datang! 🎉');
            }
        });

        console.log(`Plugin ${this.name} v${this.version} berhasil dimuat`);
    }
} 