export class BaseCommand {
    constructor(options) {
        this.name = options.name;
        this.alias = options.alias || [];
        this.description = options.description || '';
        this.category = options.category || 'misc';
        this.cooldown = options.cooldown || 3;
    }

    /**
     * Method yang akan dijalankan ketika command dipanggil
     * @param {Object} context - Konteks command
     * @param {Client} context.client - Instance client
     * @param {Message} context.message - Instance message
     * @param {Array<string>} context.args - Arguments command
     */
    async execute({ client, message, args }) {
        throw new Error('Method execute() harus diimplementasikan');
    }
} 