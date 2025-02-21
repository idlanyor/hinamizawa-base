import getConnection from '../connection.js';

export class User {
    static async getUser(userId) {
        const db = await getConnection();
        return await db.get('SELECT * FROM users WHERE user_id = ?', userId);
    }

    static async create(userId, name) {
        const db = await getConnection();
        const now = new Date().toISOString();
        await db.run(
            'INSERT INTO users (user_id, name, level, exp, total_command, created_at) VALUES (?, ?, 1, 0, 0, ?)',
            [userId, name, now]
        );
    }

    static async addExp(userId, exp) {
        const db = await getConnection();
        const user = await this.getUser(userId);
        if (!user) return null;

        const currentExp = user.exp + exp;
        const currentLevel = user.level;
        const expNeeded = currentLevel * 100;

        let newLevel = currentLevel;
        let levelUp = false;

        if (currentExp >= expNeeded) {
            newLevel = currentLevel + 1;
            levelUp = true;
        }

        await db.run(
            'UPDATE users SET exp = ?, level = ? WHERE user_id = ?',
            [currentExp, newLevel, userId]
        );

        return {
            levelUp,
            newLevel,
            currentExp
        };
    }

    static async incrementCommand(userId) {
        const db = await getConnection();
        await db.run(
            'UPDATE users SET total_command = total_command + 1 WHERE user_id = ?',
            [userId]
        );
    }

    static async getTopUsers(limit = 10) {
        const db = await getConnection();
        return await db.all(
            'SELECT * FROM users ORDER BY exp DESC LIMIT ?',
            limit
        );
    }
}

// Perbaiki command profile untuk menampilkan data dengan benar
export const formatProfile = (user) => {
    const joinDate = new Date(user.created_at).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return `🎭 *PROFIL PENGGUNA*
👤 Nama: ${user.name}
📊 Level: ${user.level}
⭐ XP: ${user.exp}
🎯 Total Command: ${user.total_command || 0}
📅 Bergabung: ${joinDate}`;
};

export default User; 