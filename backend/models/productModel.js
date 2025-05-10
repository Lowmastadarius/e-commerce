import db from '../config/database.js';

class Product {
    static async getAll() {
        try {
            const [rows] = await db.query('SELECT * FROM products');
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async getById(id) {
        try {
            const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async create(product) {
        try {
            const [result] = await db.query(
                'INSERT INTO products (name, price, description) VALUES (?, ?, ?)',
                [product.name, product.price, product.description]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }
}

export default Product; 