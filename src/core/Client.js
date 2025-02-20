import { makeInMemoryStore, makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers, makeCacheableSignalKeyStore, DisconnectReason } from '@seaavey/baileys';
import { EventEmitter } from 'events';
import NodeCache from "node-cache";
import chalk from "chalk";
import pino from "pino";
import fs from 'fs-extra';
import path from 'path';
import { Plugin } from './Plugin.js';
import { MessageHandler } from './handlers/MessageHandler.js';
import { EventHandler } from './handlers/EventHandler.js';
import { PluginHandler } from './handlers/PluginHandler.js';
import { ServiceHandler } from './handlers/ServiceHandler.js';
import { DatabaseService } from './services/DatabaseService.js';
import { CacheService } from './services/CacheService.js';
import { QueueHandler } from './handlers/QueueHandler.js';
import { RateLimiter } from './middlewares/RateLimiter.js';

export class Client extends EventEmitter {
    constructor(config) {
        super();
        this.config = config;
        this.commands = new Map();
        this.plugins = new Map();
        this.services = new Map();
        
        // Initialize handlers
        this.messageHandler = new MessageHandler(this);
        this.eventHandler = new EventHandler(this);
        this.pluginHandler = new PluginHandler(this);
        this.queueHandler = new QueueHandler();
        
        // Initialize rate limiter
        this.rateLimiter = new RateLimiter({
            windowMs: 60000,
            max: 10
        });
        
        // Add rate limiter middleware
        this.messageHandler.router.use(this.rateLimiter.middleware());
    }

    async initialize() {
        try {
            // Load core services
            await this.loadServices();
            
            // Load commands
            await this.loadCommands();
            
            // Load plugins
            await this.loadPlugins();
            
            // Register default events
            this.eventHandler.registerDefaultEvents();
            
            console.log(chalk.green('✓ Bot berhasil diinisialisasi'));
        } catch (error) {
            console.error(chalk.red('❌ Gagal menginisialisasi bot:', error));
            throw error;
        }
    }

    async connect() {
        try {
            console.log(chalk.blue('🚀 Memulai inisialisasi bot...'));
            
            const msgRetryCounterCache = new NodeCache();
            const useStore = this.config.useStore;

            const MAIN_LOGGER = pino({
                level: 'silent'
            });
            
            const logger = MAIN_LOGGER.child({});

            console.log(chalk.yellow('📦 Mempersiapkan store...'));
            const store = useStore ? makeInMemoryStore({ logger }) : undefined;

            if (store) {
                store.readFromFile(`store-${this.config.sessionId}`);
                setInterval(() => {
                    store.writeToFile(`store-${this.config.sessionId}`);
                }, 10000 * 6);
                console.log(chalk.green('✓ Store berhasil dimuat'));
            }

            console.log(chalk.yellow('🔑 Memuat credentials...'));
            const P = pino({ level: 'silent' });
            let { state, saveCreds } = await useMultiFileAuthState(this.config.sessionId);
            let { version, isLatest } = await fetchLatestBaileysVersion();
            console.log(chalk.green(`✓ Menggunakan Baileys versi ${version}`));

            console.log(chalk.yellow('🔌 Membuat koneksi socket...'));
            this.sock = await makeWASocket({
                version,
                logger: P,
                printQRInTerminal: false,
                browser: Browsers.macOS('Safari'),
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, P)
                },
                msgRetryCounterCache,
                connectOptions: {
                    maxRetries: 5,
                    keepAlive: true
                }
            });

            if (store) {
                store.bind(this.sock.ev);
            }

            this.sock.ev.on('creds.update', saveCreds);

            if (!this.sock.authState.creds.registered) {
                console.log(chalk.yellow('📱 Menunggu Pairing Code...'));
                await this.handlePairing();
            }

            this.handleConnectionEvents();
            await this.loadCommands();

        } catch (error) {
            console.error(chalk.red('❌ Kesalahan saat menghubungkan:', error));
            throw error;
        }
    }

    async handlePairing() {
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        let retryCount = 0;
        const maxRetries = 1;

        while (retryCount < maxRetries) {
            try {
                await delay(6000);
                const code = await this.sock.requestPairingCode(this.config.phoneNumber);
                console.log(chalk.green('Kode Pairing : '), chalk.bgGreen.black(code));
                break;
            } catch (e) {
                retryCount++;
                if (retryCount >= maxRetries) {
                    await fs.remove(`./${this.config.sessionId}`);
                    await this.connect();
                }
            }
        }
    }

    handleConnectionEvents() {
        // Connection events
        this.sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update;

            switch (connection) {
                case "connecting":
                    console.log(chalk.yellow('🔄 Memulai Koneksi Socket...'));
                    break;

                case "open":
                    console.log(chalk.green('✓ Koneksi Terhubung'));
                    console.log(chalk.blue('🤖 Bot siap digunakan!'));
                    this.emit('ready');
                    break;

                case "close":
                    console.log(chalk.red("❌ Koneksi terputus"));
                    const reason = lastDisconnect?.error?.output?.statusCode;
                    if (reason === DisconnectReason.loggedOut) {
                        console.log(chalk.red("❌ Sesi tidak valid, menghapus folder sesi..."));
                        await fs.remove(`./${this.config.sessionId}`);
                        console.log(chalk.yellow("🔄 Mencoba login ulang..."));
                        await this.connect();
                    } else {
                        console.log(chalk.yellow('🔄 Mencoba menghubungkan ulang...'));
                        await this.connect();
                    }
                    break;
            }
        });

        // Message events
        this.sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify') return;

            const message = messages[0];
            if (!message) return;

            const sender = message.key.remoteJid;
            const messageType = Object.keys(message.message || {})[0];
            const content = message.message?.conversation || 
                          message.message?.imageMessage?.caption || 
                          message.message?.videoMessage?.caption ||
                          message.message?.extendedTextMessage?.text || '';

            console.log(chalk.blue(`📝 Pesan masuk dari ${sender}`));
            console.log(chalk.yellow(`📩 Isi: ${content}`));
            console.log(chalk.cyan(`└─ Tipe: ${messageType}`));

            try {
                await this.messageHandler.handle(message);
            } catch (error) {
                console.error(chalk.red('❌ Error handling message:', error));
            }
        });

        // Group events
        this.sock.ev.on('group-participants.update', async (event) => {
            console.log(chalk.magenta('👥 Update Grup:'), event);
        });

        // Other events
        this.sock.ev.on('presence.update', async (presence) => {
            console.log(chalk.yellow('👤 Update Presence:'), presence);
        });
    }

    async loadCommands() {
        try {
            console.log(chalk.yellow('📚 Memuat commands...'));
            const commandsPath = this.config.commandsPath;
            
            if (!fs.existsSync(commandsPath)) {
                await fs.mkdir(commandsPath, { recursive: true });
                await fs.mkdir(path.join(commandsPath, 'misc'));
                await fs.mkdir(path.join(commandsPath, 'admin'));
                await fs.mkdir(path.join(commandsPath, 'owner'));
                console.log(chalk.green('✓ Folder commands berhasil dibuat'));
                return;
            }

            const categories = await fs.readdir(commandsPath);

            for (const category of categories) {
                const categoryPath = path.join(commandsPath, category);
                
                const stats = await fs.stat(categoryPath);
                if (!stats.isDirectory()) continue;

                const commands = await fs.readdir(categoryPath);

                for (const command of commands) {
                    if (!command.endsWith('.js')) continue;

                    try {
                        const commandPath = path.join(categoryPath, command);
                        const CommandClass = (await import(`file://${commandPath}`)).default;
                        const cmd = new CommandClass();
                        this.commands.set(cmd.name, cmd);
                    } catch (error) {
                        console.error(chalk.red(`❌ Gagal memuat command ${command}:`, error));
                    }
                }
            }

            console.log(chalk.green(`✓ Total ${this.commands.size} commands berhasil dimuat`));
        } catch (error) {
            console.error(chalk.red('❌ Error loading commands:', error));
        }
    }

    // Plugin management
    async loadPlugin(pluginPath) {
        try {
            const plugin = await import(pluginPath);
            if (!(plugin instanceof Plugin)) {
                throw new Error('Invalid plugin format');
            }

            await plugin.onLoad();
            this.plugins.set(plugin.name, plugin);
            
            if (plugin.enabled) {
                await plugin.onEnable();
            }

        } catch (error) {
            console.error(`Error loading plugin: ${error}`);
        }
    }

    async loadPlugins(directory) {
        const files = await fs.readdir(directory);
        for (const file of files) {
            if (file.endsWith('.js')) {
                await this.loadPlugin(path.join(directory, file));
            }
        }
    }

    async loadServices() {
        try {
            // Initialize service handler
            this.serviceHandler = new ServiceHandler(this);

            // Register core services
            this.serviceHandler.register('database', new DatabaseService(this));
            this.serviceHandler.register('cache', new CacheService(this));
            // ... register other services

            // Initialize all services
            await this.serviceHandler.initialize();
            
            console.log(chalk.green('✓ Services berhasil dimuat'));
        } catch (error) {
            console.error(chalk.red('❌ Gagal memuat services:', error));
            throw error;
        }
    }
} 
