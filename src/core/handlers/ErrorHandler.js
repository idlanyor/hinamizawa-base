import { Logger } from '../../utils/Logger.js';

export class ErrorHandler {
    static async handle(error, context) {
        console.error('Error dalam eksekusi command:', error);
        
        try {
            await context.reply(`Terjadi kesalahan: ${error.message}`);
        } catch (replyError) {
            console.error('Gagal mengirim pesan error:', replyError);
        }
    }
}

export class CommandError extends Error {
    constructor(message) {
        super(message);
        this.name = 'CommandError';
    }
}

export class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
} 