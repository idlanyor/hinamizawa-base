export class Router {
    constructor(client) {
        this.client = client;
        this.routes = new Map();
        this.middlewares = [];
    }

    use(middleware) {
        this.middlewares.push(middleware);
        return this;
    }

    register(command) {
        this.routes.set(command.name, command);
        command.alias?.forEach(alias => {
            this.routes.set(alias, command);
        });
        return this;
    }

    async handle(context) {
        const command = this.client.commands.get(context.commandName);
        
        if (!command) return;

        // Jalankan middleware jika ada
        if (command.middlewares) {
            for (const middleware of command.middlewares) {
                await middleware(context);
            }
        }

        // Eksekusi command
        await command.execute(context);
    }
} 