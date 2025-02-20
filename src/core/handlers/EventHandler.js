export class EventHandler {
    constructor(client) {
        this.client = client;
        this.registeredEvents = new Map();
    }

    register(eventName, handler) {
        if (!this.registeredEvents.has(eventName)) {
            this.registeredEvents.set(eventName, []);
        }
        this.registeredEvents.get(eventName).push(handler);
    }

    async emit(eventName, ...args) {
        const handlers = this.registeredEvents.get(eventName) || [];
        for (const handler of handlers) {
            try {
                await handler(...args);
            } catch (error) {
                console.error(`Error in ${eventName} handler:`, error);
            }
        }
    }

    registerDefaultEvents() {
        // Message Events
        this.register('message', async (message) => {
            await this.client.messageHandler.handle(message);
        });

        // Group Events
        this.register('group.join', async (group) => {
            console.log(`Bot bergabung ke grup: ${group.subject}`);
        });

    }
} 