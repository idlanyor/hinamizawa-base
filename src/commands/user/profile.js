import { BaseCommand } from '../../core/base/BaseCommand.js';
import User, { formatProfile } from '../../database/models/User.js';

export default class ProfileCommand extends BaseCommand {
    constructor() {
        super({
            name: 'profile',
            alias: ['p'],
            description: 'Lihat profil pengguna',
            category: 'user'
        });
    }

    async execute(context) {
        try {
            const userId = context.message.key.participant || context.message.key.remoteJid;
            const user = await User.getUser(userId.split('@')[0]);

            if (!user) {
                return context.reply('❌ Profil tidak ditemukan!');
            }

            await context.reply(formatProfile(user));
        } catch (error) {
            console.error('Error in profile command:', error);
            await context.reply('❌ Terjadi kesalahan saat mengambil profil');
        }
    }
} 