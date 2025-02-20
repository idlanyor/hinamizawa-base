import { Logger } from '../utils/Logger.js';

export class ErrorHandler {
    static handle(error, context = null) {
        if (error.name === 'CommandError') {
            // Error yang diharapkan dari command
            return context?.reply(error.message);
        }

        if (error.name === 'ValidationError') {
            // Error validasi input
            return context?.reply(`Validasi gagal: ${error.message}`);
        }

        // Log unexpected errors
        Logger.error('Terjadi kesalahan:', error);
        
        // Notify user if context exists
        if (context) {
            return context.reply('Terjadi kesalahan internal. Silakan coba lagi nanti.');
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