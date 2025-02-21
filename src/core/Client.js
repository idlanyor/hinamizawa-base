import {
    makeWASocket,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    makeInMemoryStore,
    useMultiFileAuthState,
    DisconnectReason,
    Browsers
} from '@seaavey/baileys';
import pino from "pino";
import fs from 'fs-extra';
import path from 'path'
import { EventEmitter } from 'events';
import { MessageHandler } from './handlers/MessageHandler.js';
import chalk from 'chalk';

export class Client extends EventEmitter {
    constructor(config) {
        super();
        this.config = config;
        this.commands = new Map();
        this.plugins = new Map();
        this.services = new Map();
        this.sock = null;
        this.isConnecting = false;
        this.connectionAttempts = 0;
        this.MAX_CONNECTION_ATTEMPTS = 3;
        this.messageHandler = new MessageHandler(this);
        this.commandsPath = path.join(process.cwd(), 'src', 'commands');
    }

    async initialize() {
        try {
            await this.loadCommands();
            console.log('Client berhasil diinisialisasi');
        } catch (error) {
            console.error('Gagal menginisialisasi client:', error);
            throw error;
        }
    }

    async loadCommands() {
        try {
            await fs.ensureDir(this.commandsPath);

            const categories = await fs.readdir(this.commandsPath);

            for (const category of categories) {
                const categoryPath = path.join(this.commandsPath, category);
                
                const stats = await fs.stat(categoryPath);
                if (!stats.isDirectory()) continue;

                const commandFiles = await fs.readdir(categoryPath);

                for (const commandFile of commandFiles) {
                    if (!commandFile.endsWith('.js')) continue;

                    try {
                        const commandPath = path.join(categoryPath, commandFile);
                        const { default: CommandClass } = await import(`file://${commandPath}`);
                        
                        const command = new CommandClass();
                        
                        this.commands.set(command.name, command);
                    } catch (error) {
                        console.error(`Gagal memuat command ${commandFile}:`, error);
                    }
                }
            }

            console.log(`Total ${this.commands.size} commands berhasil dimuat`);
        } catch (error) {
            console.error('Gagal memuat commands:', error);
            throw error;
        }
    }

    async #delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async connect() {
        try {
            // Reset connection attempts jika sudah terlalu banyak
            if (this.connectionAttempts >= this.MAX_CONNECTION_ATTEMPTS) {
                console.log(chalk.red('❌ Terlalu banyak percobaan koneksi gagal'));
                await this.resetSession();
                process.exit(1);
            }

            this.connectionAttempts++;
            console.log(chalk.blue('🚀 Memulai koneksi...'));

            // Konfigurasi logger
            const logger = pino({ level: 'silent' });

            // Buat folder session jika belum ada
            await fs.ensureDir(this.config.sessionId);

            // Inisialisasi store
            const store = makeInMemoryStore({ logger });
            store.readFromFile(`${this.config.sessionId}/store.json`);
            
            // Inisialisasi autentikasi
            const { state, saveCreds } = await useMultiFileAuthState(this.config.sessionId);
            const { version } = await fetchLatestBaileysVersion();

            // Fungsi untuk membuat socket
            const createSocket = () => {
                const sock = makeWASocket({
                    version,
                    logger,
                    printQRInTerminal: false,
                    auth: {
                        creds: state.creds,
                        keys: makeCacheableSignalKeyStore(state.keys, logger),
                    },
                    browser: Browsers.macOS('Chrome'),
                    markOnlineOnConnect: true
                });

                store?.bind(sock.ev);
                sock.ev.on('creds.update', saveCreds);

                // Handler koneksi
                sock.ev.on('connection.update', async (update) => {
                    const { connection, lastDisconnect, qr } = update;

                    if (qr) {
                        console.log(chalk.yellow('⌛ Menunggu kode pairing...'));
                        try {
                            const pairingCode = await sock.requestPairingCode(this.config.phoneNumber);
                            console.log(chalk.cyan('🔑 Kode pairing Anda:'), chalk.yellow(pairingCode));
                        } catch (pairingError) {
                            console.error(chalk.red('❌ Gagal mendapatkan kode pairing:'), pairingError);
                        }
                    }

                    if (connection === 'close') {
                        const statusCode = lastDisconnect?.error?.output?.statusCode;
                        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
                        
                        console.log(chalk.red('❌ Koneksi terputus'), 
                            shouldReconnect ? chalk.yellow('Mencoba reconnect...') : chalk.red('Sesi tidak valid'));

                        if (shouldReconnect) {
                            await this.#delay(3000); // Tunggu 3 detik sebelum reconnect
                            await this.connect();
                        } else {
                            await this.resetSession();
                            console.log(chalk.green('✓ Sesi berhasil direset, silakan restart bot'));
                            process.exit(0);
                        }
                    }

                    if (connection === 'open') {
                        this.connectionAttempts = 0; // Reset attempts jika berhasil
                        console.log(chalk.green('✓ Berhasil terhubung ke WhatsApp!'));
                    }
                });

                // Handler pesan
                sock.ev.on('messages.upsert', async (m) => {
                    if (m.type === 'notify') {
                        for (const msg of m.messages) {
                            await this.messageHandler.handle(msg);
                        }
                    }
                });

                return sock;
            };

            // Buat dan simpan socket
            this.sock = createSocket();

        } catch (error) {
            console.error(chalk.red('❌ Gagal terhubung:'), error);
            await this.#delay(3000);
            await this.connect();
        }
    }

    async resetSession() {
        try {
            await fs.remove(this.config.sessionId);
            await fs.remove(`${this.config.sessionId}/store.json`);
            console.log(chalk.yellow('🗑️ Sesi lama berhasil dihapus'));
        } catch (error) {
            console.error(chalk.red('❌ Gagal menghapus sesi:'), error);
        }
    }
}

export async function clearMessages(m) {
    try {
        if (!m) return;
        let data;
        const text = m.message?.conversation?.trim() || m.message?.extendedTextMessage?.text?.trim();
        if (!text) return m;

        if (m.key.remoteJid.endsWith("g.us")) {
            data = {
                chatsFrom: "group",
                remoteJid: m.key.remoteJid,
                participant: {
                    fromMe: m.key.fromMe,
                    number: m.key.participant,
                    pushName: m.pushName,
                    message: text,
                },
            };
        } else {
            data = {
                chatsFrom: "private",
                remoteJid: m.key.remoteJid,
                fromMe: m.key.fromMe,
                pushName: m.pushName,
                message: text,
            };
        }
        return data;
    } catch (err) {
        return m;
    }
}

export const sanitizeBotId = botId => botId.split(":")[0] + "@s.whatsapp.net";

export const getPpUrl = async (sock, id) => {
    const ppUrl = globalThis.defaultProfilePic
    try {
        return await sock.profilePictureUrl(id, "image")
    } catch {
        return ppUrl
    }
}
