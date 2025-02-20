import { Client } from './src/core/Client.js';
import { config } from './src/config/index.js';
import chalk from 'chalk';

async function startBot() {
    try {
        const client = new Client(config);
        
        // Initialize bot
        await client.initialize();
        
        // Connect to WhatsApp
        await client.connect();
        
    } catch (error) {
        console.error(chalk.red('Fatal Error:', error));
        process.exit(1);
    }
}

startBot();