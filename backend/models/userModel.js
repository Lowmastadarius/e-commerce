import bcrypt from 'bcryptjs';
import db from '../config/database.js';

class User {
    static async create({ name, email, password }) {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const [result] = await db.query(
                'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                [name, email, hashedPassword]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    static async findOne(email) {
        try {
            const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async validatePassword(password) {
        if (password.length < 8) {
            throw new Error('Le mot de passe doit contenir au moins 8 caractères');
        }
    }
}

export default User; 