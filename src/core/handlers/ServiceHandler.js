import chalk from "chalk";

export class ServiceHandler {
    constructor(client) {
        this.client = client;
        this.services = new Map();
    }

    register(name, service) {
        if (this.services.has(name)) {
            throw new Error(`Service ${name} sudah terdaftar`);
        }
        this.services.set(name, service);
        return this;
    }

    get(name) {
        if (!this.services.has(name)) {
            throw new Error(`Service ${name} tidak ditemukan`);
        }
        return this.services.get(name);
    }

    async initialize() {
        for (const [name, service] of this.services) {
            if (typeof service.initialize === 'function') {
                await service.initialize();
                console.log(chalk.green(`✓ Service ${name} berhasil diinisialisasi`));
            }
        }
    }
} 