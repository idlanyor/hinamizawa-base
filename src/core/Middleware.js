export class Middleware {
    constructor() {
        this.middlewares = [];
    }

    use(fn) {
        this.middlewares.push(fn);
        return this;
    }

    async execute(ctx, next) {
        let prevIndex = -1;

        const runner = async (index) => {
            if (index === prevIndex) {
                throw new Error('next() called multiple times');
            }

            prevIndex = index;

            const middleware = this.middlewares[index];

            if (middleware) {
                await middleware(ctx, () => runner(index + 1));
            } else {
                await next();
            }
        };

        await runner(0);
    }
} 