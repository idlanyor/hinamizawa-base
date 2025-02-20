export const databaseConfig = {
    uri: process.env.DATABASE_URI || 'sqlite:bot.db',
    options: {
        logging: false,
        dialect: 'sqlite',
        storage: './bot.db'
    }
}; 