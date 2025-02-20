import { BaseCommand } from '../../core/base/BaseCommand.js'

export default class LlamaCommand extends BaseCommand {
    constructor() {
        super({
            name: 'llama',
            alias: ['llama'],
            description: 'Berbicara dengan Llama AI',
            category: 'ai'
        });
    }

    async execute(context) {
        // Implementasi command
        await context.reply('Llama AI command');
    }
}