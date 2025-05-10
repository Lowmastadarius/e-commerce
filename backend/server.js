import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth.routes.js";
import { testConnection } from "./config/database.js";
import productRoutes from "./routes/products.js";
import path from "path";
import { fileURLToPath } from 'url';
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Configuration CORS détaillée
const corsOptions = {
  origin: 'http://localhost:5173', // URL de votre frontend
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization']
};

app.use(cors(corsOptions));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// Middleware pour parser le body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Servir les fichiers statiques du dossier public
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Créer le dossier pour les uploads s'il n'existe pas
const uploadDir = path.join(__dirname, 'public', 'uploads', 'products');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ message: 'Le serveur fonctionne correctement !' });
});

// Gestion des erreurs 404
app.use((req, res) => {
  console.log('Route non trouvée:', req.method, req.url);
  res.status(404).json({ message: 'Route non trouvée' });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).json({ 
    message: 'Erreur serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
});

const PORT = process.env.PORT || 5000;

// Tester la connexion à la base de données avant de démarrer le serveur
testConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
    console.log('Routes disponibles:');
    console.log('- GET  /api/test');
    console.log('- POST /api/auth/register');
    console.log('- POST /api/auth/login');
    console.log('- GET  /api/auth/me');
    console.log('- GET  /api/products');
    console.log('- POST /api/products');
  });
});
