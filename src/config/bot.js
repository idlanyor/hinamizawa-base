export const botConfig = {
    name: 'KanataBot',
    version: '1.0.0',
    prefix: process.env.PREFIX || '.',
    owners: (process.env.OWNER_NUMBER || '').split(','),
    cooldown: parseInt(process.env.COMMAND_COOLDOWN) || 3
}; 