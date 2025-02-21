import { BasePlugin } from '../core/base/BasePlugin.js';

export default class AutoResponsePlugin extends BasePlugin {
    constructor(client) {
        super(client);
        this.description = 'Auto response untuk kata kunci tertentu';
        this.version = '1.0.0';
        
        // Daftar kata kunci dan responnya
        this.keywords = new Map([
            ['ping', 'pong! 🏓'],
            ['halo', 'Hai! 👋'],
            ['makasih', 'Sama-sama! 😊'],
            ['good morning', 'Selamat pagi! ☀️'],
            ['good night', 'Selamat malam! 🌙']
        ]);
    }

    async onLoad() {
        // Register message handler
        this.client.eventHandler.register('messages.upsert', async (m) => {
            if (m.type !== 'notify') return;
            
            for (const msg of m.messages) {
                const text = msg.message?.conversation?.toLowerCase() || 
                           msg.message?.extendedTextMessage?.text?.toLowerCase();
                
                if (!text) continue;

                // Cek setiap kata kunci
                for (const [keyword, response] of this.keywords) {
                    if (text.includes(keyword)) {
                        await this.client.sock.sendMessage(
                            msg.key.remoteJid,
                            { text: response },
                            { quoted: msg }
                        );
                        break;
                    }
                }
            }
        });

        console.log(`Plugin ${this.name} v${this.version} berhasil dimuat`);
    }
} 