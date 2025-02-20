export class MediaHandler {
    constructor(client) {
        this.client = client;
    }

    /**
     * Menangani pesan media yang masuk
     * @param {Object} message - Objek pesan dari WhatsApp
     * @returns {Object} Objek yang berisi informasi media
     */
    async handle(message) {
        try {
            const mediaType = this.getMediaType(message);
            if (!mediaType) return null;

            const mediaInfo = await this.extractMediaInfo(message, mediaType);
            return {
                type: mediaType,
                ...mediaInfo
            };
        } catch (error) {
            console.error('Error processing media:', error);
            return null;
        }
    }

    /**
     * Mendapatkan tipe media dari pesan
     * @param {Object} message - Objek pesan
     * @returns {String|null} Tipe media
     */
    getMediaType(message) {
        if (message.type === 'imageMessage') return 'image';
        if (message.type === 'videoMessage') return 'video';
        if (message.type === 'audioMessage') return 'audio';
        if (message.type === 'documentMessage') return 'document';
        if (message.type === 'stickerMessage') return 'sticker';
        return null;
    }

    /**
     * Mengekstrak informasi media dari pesan
     * @param {Object} message - Objek pesan
     * @param {String} mediaType - Tipe media
     * @returns {Object} Informasi media
     */
    async extractMediaInfo(message, mediaType) {
        const mediaMessage = message[`${mediaType}Message`];
        
        const baseInfo = {
            mimetype: mediaMessage?.mimetype,
            size: mediaMessage?.fileLength,
            caption: mediaMessage?.caption || '',
            filename: mediaMessage?.fileName || '',
        };

        // Informasi tambahan berdasarkan tipe media
        switch (mediaType) {
            case 'image':
                return {
                    ...baseInfo,
                    width: mediaMessage?.width,
                    height: mediaMessage?.height,
                    thumbnail: mediaMessage?.thumbnailDirectPath
                };

            case 'video':
                return {
                    ...baseInfo,
                    duration: mediaMessage?.seconds,
                    width: mediaMessage?.width,
                    height: mediaMessage?.height,
                    thumbnail: mediaMessage?.thumbnailDirectPath
                };

            case 'audio':
                return {
                    ...baseInfo,
                    duration: mediaMessage?.seconds,
                    ptt: mediaMessage?.ptt // voice note atau audio biasa
                };

            case 'document':
                return {
                    ...baseInfo,
                    thumbnail: mediaMessage?.thumbnailDirectPath
                };

            case 'sticker':
                return {
                    ...baseInfo,
                    isAnimated: mediaMessage?.isAnimated,
                    width: mediaMessage?.width,
                    height: mediaMessage?.height
                };

            default:
                return baseInfo;
        }
    }

    /**
     * Download media dari pesan
     * @param {Object} message - Objek pesan
     * @returns {Buffer} Buffer media
     */
    async downloadMedia(message) {
        try {
            const mediaType = this.getMediaType(message);
            if (!mediaType) throw new Error('Invalid media type');

            const buffer = await this.client.downloadMediaMessage(message);
            return buffer;
        } catch (error) {
            console.error('Error downloading media:', error);
            throw error;
        }
    }

    /**
     * Menyimpan media ke filesystem
     * @param {Buffer} buffer - Buffer media
     * @param {String} filename - Nama file
     * @param {String} path - Path penyimpanan
     */
    async saveMedia(buffer, filename, path = './media') {
        try {
            const fs = await import('fs/promises');
            const { join } = await import('path');

            // Buat direktori jika belum ada
            await fs.mkdir(path, { recursive: true });

            const filePath = join(path, filename);
            await fs.writeFile(filePath, buffer);
            
            return filePath;
        } catch (error) {
            console.error('Error saving media:', error);
            throw error;
        }
    }
} 