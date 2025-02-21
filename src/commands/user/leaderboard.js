import { BaseCommand } from '../../core/base/BaseCommand.js';
import User from '../../database/models/User.js';

export default class LeaderboardCommand extends BaseCommand {
    constructor() {
        super({
            name: 'leaderboard',
            alias: ['lb'],
            description: 'Tampilkan papan peringkat',
            category: 'user'
        });
    }

    async execute(context) {
        try {
            const users = await User.getTopUsers(10);
            
            let leaderboard = '🏆 *LEADERBOARD TOP 10*\n\n';
            users.forEach((user, index) => {
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤';
                leaderboard += `${medal} ${index + 1}. ${user.name}\n`;
                leaderboard += `   ⭐ Level: ${user.level} | XP: ${user.exp} | 🎯 CMD: ${user.total_command || 0}\n`;
            });

            await context.reply(leaderboard);
        } catch (error) {
            console.error('Error in leaderboard command:', error);
            await context.reply('❌ Terjadi kesalahan saat mengambil leaderboard');
        }
    }
} 