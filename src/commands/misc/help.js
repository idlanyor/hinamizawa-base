import { BaseCommand } from '../../core/BaseCommand.js';

export default class HelpCommand extends BaseCommand {
    constructor() {
        super({
            name: 'help',
            alias: ['h', 'menu'],
            description: 'Menampilkan daftar command',
            category: 'misc'
        });
    }

    async execute({ client, message, args }) {
        const commands = Array.from(client.commands.values());
        const categories = [...new Set(commands.map(cmd => cmd.category))];
        
        let helpText = '🤖 *DAFTAR COMMAND*\n\n';
        
        categories.forEach(category => {
            const categoryCommands = commands.filter(cmd => cmd.category === category);
            helpText += `*${category.toUpperCase()}*\n`;
            
            categoryCommands.forEach(cmd => {
                helpText += `• ${client.config.prefix}${cmd.name} - ${cmd.description}\n`;
            });
            
            helpText += '\n';
        });

        await message.reply(helpText);
    }
} 