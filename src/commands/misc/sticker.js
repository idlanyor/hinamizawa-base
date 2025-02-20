import { BaseCommand } from '../../core/BaseCommand.js';
import { downloadMediaMessage } from '@seaavey/baileys';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import chalk from 'chalk';

export default class StickerCommand extends BaseCommand {
    constructor() {
        super({
            name: 'sticker',
            alias: ['s', 'stiker'],
            description: 'Membuat sticker dari gambar/video',
            category: 'misc'
        });
    }

    async execute({ client, message, args }) {
        try {
            console.log(chalk.blue('🎯 Memproses command sticker...'));

            // Cek media dari pesan
            const quotedMsg = message.message.extendedTextMessage?.contextInfo?.quotedMessage;
            const mediaMessage = message.message.imageMessage || 
                               message.message.videoMessage || 
                               quotedMsg?.imageMessage ||
                               quotedMsg?.videoMessage;

            if (!mediaMessage) {
                console.log(chalk.yellow('❌ Tidak ada media yang valid'));
                return await client.sock.sendMessage(
                    message.key.remoteJid,
                    { text: 'Kirim/reply gambar atau video dengan caption .s' },
                    { quoted: message }
                );
            }

            // Log tipe media
            const mediaType = mediaMessage.mimetype.split('/')[0];
            console.log(chalk.cyan(`├─ Tipe Media: ${mediaType}`));
            console.log(chalk.cyan(`├─ Mime Type: ${mediaMessage.mimetype}`));

            // Kirim pesan proses
            console.log(chalk.blue('📤 Mengirim pesan proses...'));
            await client.sock.sendMessage(
                message.key.remoteJid,
                { text: '⏳ Sedang membuat sticker...' },
                { quoted: message }
            );

            // Download media
            console.log(chalk.blue('📥 Mengunduh media...'));
            const buffer = await downloadMediaMessage(
                quotedMsg ? {
                    message: quotedMsg,
                    key: message.message.extendedTextMessage.contextInfo.stanzaId
                } : message,
                'buffer',
                {},
                {
                    reuploadRequest: client.sock.updateMediaMessage
                }
            );
            console.log(chalk.green('✓ Media berhasil diunduh'));

            // Buat sticker
            console.log(chalk.blue('🎨 Membuat sticker...'));
            const sticker = new Sticker(buffer, {
                pack: 'Created By', // Nama pack sticker
                author: 'Bot', // Nama author
                type: StickerTypes.FULL, // Full sticker
                categories: ['🤩', '🎉'], // Kategori sticker
                id: 'kanata', // ID sticker pack
                quality: 50, // Kualitas sticker (1-100)
                background: '#00000000' // Transparent background
            });

            // Convert ke buffer
            console.log(chalk.blue('🔄 Mengkonversi ke format sticker...'));
            const stickerBuffer = await sticker.toBuffer();
            console.log(chalk.green('✓ Sticker berhasil dibuat'));

            // Kirim sticker
            console.log(chalk.blue('📤 Mengirim sticker...'));
            await client.sock.sendMessage(
                message.key.remoteJid,
                { sticker: stickerBuffer },
                { quoted: message }
            );
            console.log(chalk.green('✓ Sticker berhasil dikirim'));

        } catch (error) {
            console.error(chalk.red('❌ Error membuat sticker:'), error);
            await client.sock.sendMessage(
                message.key.remoteJid,
                { text: 'Gagal membuat sticker! Pastikan media yang dikirim valid.' },
                { quoted: message }
            );
        }
    }
}