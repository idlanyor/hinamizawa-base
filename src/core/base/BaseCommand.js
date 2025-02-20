export class BaseCommand {
    constructor(options = {}) {
        this.name = options.name;
        this.alias = options.alias || [];
        this.description = options.description || '';
        this.category = options.category || 'misc';
        this.cooldown = options.cooldown || 3;
        this.ownerOnly = options.ownerOnly || false;
        this.groupOnly = options.groupOnly || false;
        this.adminOnly = options.adminOnly || false;
        this.botAdminOnly = options.botAdminOnly || false;
    }

    async validate(context) {
        if (this.ownerOnly && !context.client.config.owners.includes(context.message.key.participant)) {
            throw new Error('Command ini hanya untuk owner bot!');
        }

        if (this.groupOnly && !context.message.key.remoteJid.endsWith('@g.us')) {
            throw new Error('Command ini hanya bisa digunakan di grup!');
        }

        if (this.adminOnly && !context.isAdmin) {
            throw new Error('Command ini hanya untuk admin grup!');
        }

        if (this.botAdminOnly && !context.isBotAdmin) {
            throw new Error('Bot harus menjadi admin untuk menggunakan command ini!');
        }
    }

    async execute(context) {
        throw new Error('Method execute() harus diimplementasikan');
    }
} 