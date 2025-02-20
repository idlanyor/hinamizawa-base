import { Plugin } from '../../core/Plugin.js';

export default class PingCommand extends Plugin {
  constructor(client) {
    super(client, {
      name: 'ping',
      description: 'Ping command'
    });
  }

  async onLoad() {
    this.client.commands.set('ping', {
      execute: async (message) => {
        const start = Date.now();
        await message.reply('Pong!');
        return message.reply(`Latency: ${Date.now() - start}ms`);
      }
    });
  }
} 