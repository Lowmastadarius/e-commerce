import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { db, handleDatabaseError } from '../config/database.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt'; // À changer en production !

// Middleware de logging
const logRequest = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  
  // Ne logger le body que pour les requêtes POST/PUT
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Body:', { 
      ...req.body, 
      password: req.body.password ? '***' : undefined 
    });
  }
  
  next();
};

// Middleware d'authentification
const authenticateToken = async (req, res, next) => {
  try {
    console.log('Début de l\'authentification');
    const authHeader = req.headers['authorization'];
    console.log('Auth header:', authHeader);

    if (!authHeader) {
      console.log('Pas de header Authorization');
      return res.status(401).json({ message: 'Token manquant' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('Pas de token dans le header');
      return res.status(401).json({ message: 'Token manquant' });
    }

    console.log('Vérification du token...');
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log('Token décodé:', decoded);
    } catch (error) {
      console.error('Erreur de vérification du token:', error);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Token invalide' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expiré' });
      }
      throw error;
    }

    try {
      console.log('Recherche de l\'utilisateur avec l\'ID:', decoded.userId);
      const [users] = await db.query(
        'SELECT id, name, email FROM users WHERE id = ?',
        [decoded.userId]
      );
      
      console.log('Résultat de la requête:', users);

      if (users.length === 0) {
        console.log('Utilisateur non trouvé avec l\'ID:', decoded.userId);
        return res.status(401).json({ 
          message: 'Utilisateur non trouvé',
          userId: decoded.userId 
        });
      }

      req.user = users[0];
      console.log('Authentification réussie pour:', req.user.email);
      next();
    } catch (error) {
      console.error('Erreur lors de la requête à la base de données:', error);
      const errorMessage = handleDatabaseError(error);
      return res.status(500).json({ 
        message: errorMessage,
        details: error.message,
        userId: decoded.userId
      });
    }
  } catch (error) {
    console.error('Erreur détaillée d\'authentification:', error);
    return res.status(500).json({ 
      message: 'Erreur d\'authentification',
      error: error.message 
    });
  }
};

router.use(logRequest);

// Route pour récupérer les informations de l'utilisateur connecté
router.get('/me', authenticateToken, async (req, res) => {
  try {
    console.log('Récupération des informations utilisateur');
    console.log('User dans req:', req.user);
    
    if (!req.user || !req.user.id) {
      console.error('req.user ou req.user.id manquant:', req.user);
      return res.status(500).json({ 
        message: 'Erreur: données utilisateur manquantes',
        user: req.user 
      });
    }

    const userId = req.user.id;
    console.log('Recherche de l\'utilisateur avec l\'ID:', userId);
    
    const [users] = await db.query(
      'SELECT id, name, email FROM users WHERE id = ?',
      [userId]
    );

    console.log('Résultat de la requête:', users);

    if (users.length === 0) {
      console.log('Utilisateur non trouvé avec l\'ID:', userId);
      return res.status(404).json({ 
        message: 'Utilisateur non trouvé',
        userId: userId 
      });
    }

    console.log('Informations utilisateur récupérées avec succès:', users[0]);
    res.json(users[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération des informations utilisateur:', error);
    const errorMessage = handleDatabaseError(error);
    res.status(500).json({ 
      message: errorMessage,
      details: error.message,
      user: req.user
    });
  }
});

// Route d'inscription
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const [result] = await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    // Générer le token JWT
    const token = jwt.sign(
      { userId: result.insertId },
      process.env.JWT_SECRET || 'votre_secret_jwt',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      token,
      user: {
        id: result.insertId,
        name,
        email
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ message: handleDatabaseError(error) });
  }
});

// Route de connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const user = users[0];

    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'votre_secret_jwt',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: handleDatabaseError(error) });
  }
});

// Route de test pour vérifier la structure de la table users
router.get('/test-table', async (req, res) => {
  try {
    console.log('Vérification de la structure de la table users');
    const [columns] = await db.query('DESCRIBE users');
    console.log('Structure de la table:', columns);
    
    const [users] = await db.query('SELECT id, name, email FROM users');
    console.log('Utilisateurs trouvés:', users);
    
    res.json({
      tableStructure: columns,
      users: users
    });
  } catch (error) {
    console.error('Erreur lors de la vérification de la table:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la vérification de la table',
      error: error.message 
    });
  }
});

export default router; 