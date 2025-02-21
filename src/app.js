import { Client } from './core/Client.js';

export async function startBot() {
    const client = new Client({
        // konfigurasi client
        commandsPath: './src/commands', // sesuaikan path
        prefix: '!' // prefix command
    });

    try {
        // Inisialisasi client terlebih dahulu
        await client.initialize();

        // Kemudian connect
        await client.connect();
    } catch (error) {
        console.error('Gagal memulai bot:', error);
    }
}

startBot(); 