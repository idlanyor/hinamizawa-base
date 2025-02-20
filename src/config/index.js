import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const config = {
    // Bot Configuration
    prefix: process.env.PREFIX || '.',
    sessionId: process.env.SESSION_ID || 'kanata-bot',
    phoneNumber: process.env.PHONE_NUMBER,
    ownerNumber: process.env.OWNER_NUMBER || '62895395590009',
    
    // Features Configuration
    useStore: process.env.USE_STORE === 'true',
    
    // Paths Configuration
    mediaPath: path.join(process.cwd(), 'media'),
    pluginsPath: path.join(process.cwd(), 'plugins'),
    commandsPath: path.join(process.cwd(), 'src', 'app', 'commands'),
    
    // Command Configuration
    cooldown: parseInt(process.env.COMMAND_COOLDOWN) || 3,
    
    // Database Configuration
    dbUri: process.env.DATABASE_URI || 'sqlite:bot.db'
}; 