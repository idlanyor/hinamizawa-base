import { Context } from '../Context.js';
import { Router } from '../Router.js';
import { ErrorHandler } from './ErrorHandler.js';
import User from '../../database/models/User.js';

export class MessageHandler {
    constructor(client) {
        this.client = client;
        this.router = new Router(client);
        this.cooldowns = new Map();
    }

    async handle(message) {
        try {
            // Create context
            const context = new Context(this.client, message);
            await context.initialize();

            // Proses XP dan level untuk setiap pesan
            const userId = message.key.participant || message.key.remoteJid;
            const noTel = userId.split('@')[0];
            
            // Cek dan buat user jika belum ada
            let user = await User.getUser(noTel);
            if (!user) {
                await User.create(noTel, message.pushName || 'User');
            }

            // Tambah exp untuk setiap pesan (5-15 exp random)
            const expGained = Math.floor(Math.random() * 11) + 5;
            const expResult = await User.addExp(noTel, expGained);

            // Jika naik level, kirim notifikasi
            if (expResult?.levelUp) {
                await this.client.sock.sendMessage(message.key.remoteJid, {
                    text: `🎉 Selamat! Level kamu naik ke level ${expResult.newLevel}!`
                }, { quoted: message });
            }

            // Cek apakah pesan adalah command
            if (!context.commandName) {
                // Jika bukan command, coba jalankan plugin auto response
                await this.handleAutoResponse(message);
                return;
            }

            // Get command
            const command = this.client.commands.get(context.commandName);
            if (!command) return; // Skip jika command tidak ditemukan

            // Check cooldown
            if (this.isOnCooldown(context)) {
                return context.reply('Mohon tunggu sebelum menggunakan command ini lagi.');
            }

            // Increment command counter
            await User.incrementCommand(noTel);

            // Handle command
            await this.router.handle(context);

            // Set cooldown
            this.setCooldown(context, command);

        } catch (error) {
            console.error('Error handling message:', error);
            ErrorHandler.handle(error, context);
        }
    }

    async handleAutoResponse(message) {
        // Implementasi auto response sederhana
        const text = message.message?.conversation?.toLowerCase() || 
                     message.message?.extendedTextMessage?.text?.toLowerCase();
        
        if (!text) return;

        const autoResponses = {
            'ping': 'Pong! 🏓',
            'halo': 'Hai! 👋',
            'hai': 'Hello! 😊',
            'makasih': 'Sama-sama! 🙏',
        };

        for (const [keyword, response] of Object.entries(autoResponses)) {
            if (text.includes(keyword)) {
                await this.client.sock.sendMessage(
                    message.key.remoteJid,
                    { text: response },
                    { quoted: message }
                );
                break;
            }
        }
    }

    isOnCooldown(context) {
        const { commandName } = context;
        const key = `${context.message.key.remoteJid}:${commandName}`;
        
        if (this.cooldowns.has(key)) {
            const expirationTime = this.cooldowns.get(key);
            if (Date.now() < expirationTime) {
                return true;
            }
        }
        return false;
    }

    setCooldown(context, command) {
        if (!command) return; // Skip jika command tidak ada
        
        const { commandName } = context;
        const key = `${context.message.key.remoteJid}:${commandName}`;
        
        this.cooldowns.set(
            key, 
            Date.now() + (command.cooldown * 1000 || 3000)
        );
    }
} 