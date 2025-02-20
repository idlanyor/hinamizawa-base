export class Router {
    constructor() {
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
        const { commandName } = context;
        const command = this.routes.get(commandName);

        if (!command) return null;

        // Execute middlewares
        for (const middleware of this.middlewares) {
            await middleware(context, () => {});
        }

        return command.execute(context);
    }
} 