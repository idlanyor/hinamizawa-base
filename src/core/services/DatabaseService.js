import chalk from 'chalk';
import { BaseService } from '../base/BaseService.js';
import getConnection from '../../database/connection.js';

export class DatabaseService extends BaseService {
    constructor(client) {
        super(client);
        this.connection = null;
    }

    async initialize() {
        try {
            // Initialize database connection
            this.connection = await getConnection();
            console.log(chalk.green('✓ Database berhasil terhubung'));
        } catch (error) {
            console.error(chalk.red('❌ Gagal terhubung ke database:', error));
            throw error;
        }
    }

    async connect() {
        return await getConnection();
    }

    async disconnect() {
        if (this.connection) {
            await this.connection.close();
            this.connection = null;
        }
    }
} 