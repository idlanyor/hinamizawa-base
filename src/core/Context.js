export class Context {
    constructor(client, message, args = []) {
        this.client = client;
        this.message = message;
        this.args = args;
        this.commandName = '';
        this.user = null;
        this.group = null;
        this.isAdmin = false;
        this.isBotAdmin = false;
    }

    async reply(content) {
        return this.client.sock.sendMessage(
            this.message.key.remoteJid,
            { text: content },
            { quoted: this.message }
        );
    }

    async initialize() {
        const content = this.message.message?.conversation || 
                       this.message.message?.extendedTextMessage?.text || '';
                       
        if (content.startsWith(this.client.config.prefix)) {
            const [cmd, ...args] = content
                .slice(this.client.config.prefix.length)
                .trim()
                .split(' ');
            
            this.commandName = cmd;
            this.args = args;
        }

        if (this.message.key.remoteJid.endsWith('@g.us')) {
            this.group = await this.client.sock.groupMetadata(this.message.key.remoteJid);
            this.isAdmin = this.group.participants
                .filter(p => p.admin)
                .some(p => p.id === this.message.key.participant);
            this.isBotAdmin = this.group.participants
                .filter(p => p.admin)
                .some(p => p.id === this.client.sock.user.id);
        }
    }
} 