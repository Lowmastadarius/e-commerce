import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Création du pool de connexion
export const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ecommerce',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Fonction pour tester la connexion
export const testConnection = async () => {
  try {
    const connection = await db.getConnection();
    console.log('Connexion à la base de données réussie !');
    connection.release();
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error);
    throw error;
  }
};

// Middleware pour gérer les erreurs de base de données
const handleDatabaseError = (error) => {
  console.error('Erreur de base de données:', {
    message: error.message,
    code: error.code,
    errno: error.errno,
    sqlState: error.sqlState,
    sqlMessage: error.sqlMessage
  });

  // Retourner un message d'erreur approprié
  switch (error.code) {
    case 'ER_ACCESS_DENIED_ERROR':
      return 'Erreur d\'accès à la base de données';
    case 'ECONNREFUSED':
      return 'Impossible de se connecter à la base de données';
    case 'ER_BAD_DB_ERROR':
      return 'Base de données non trouvée';
    case 'ER_NO_SUCH_TABLE':
      return 'Table non trouvée';
    default:
      return 'Erreur de base de données';
  }
};

export { handleDatabaseError };
