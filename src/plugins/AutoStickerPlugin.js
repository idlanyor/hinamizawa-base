import { BasePlugin } from '../core/base/BasePlugin.js';
import { downloadMediaMessage } from '@seaavey/baileys';

export default class AutoStickerPlugin extends BasePlugin {
    constructor(client) {
        super(client);
        this.description = 'Auto convert media ke sticker';
        this.version = '1.0.0';
    }

    async onLoad() {
        // Register event untuk auto sticker
        this.client.eventHandler.register('messages.upsert', async (m) => {
            if (m.type !== 'notify') return;
            
            for (const msg of m.messages) {
                // Skip jika bukan media
                if (!msg.message?.imageMessage && !msg.message?.videoMessage) continue;
                
                // Skip jika tidak ada caption #sticker
                const caption = msg.message?.imageMessage?.caption || 
                              msg.message?.videoMessage?.caption;
                if (!caption?.includes('#sticker')) continue;

                try {
                    // Download media
                    const buffer = await downloadMediaMessage(
                        msg,
                        'buffer',
                        {},
                        {
                            reuploadRequest: this.client.sock.updateMediaMessage
                        }
                    );

                    // Convert ke sticker
                    await this.client.sock.sendImageAsSticker(
                        msg.key.remoteJid,
                        buffer,
                        msg,
                        {
                            packname: 'Auto Sticker',
                            author: 'Bot'
                        }
                    );
                } catch (error) {
                    console.error('Error creating sticker:', error);
                }
            }
        });

        console.log(`Plugin ${this.name} v${this.version} berhasil dimuat`);
    }
} 