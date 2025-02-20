export const authMiddleware = async (ctx, next) => {
    if (ctx.message.isGroup && !ctx.message.isGroupAdmin) {
        return ctx.reply('Anda tidak memiliki izin untuk menggunakan perintah ini!');
    }
    await next();
}; 