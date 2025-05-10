import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';

const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Valider le mot de passe
    await User.validatePassword(password);
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne(email);
    if (existingUser) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    const userId = await User.create({ name, email, password });
    res.status(201).json({ message: "Utilisateur créé avec succès", userId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne(email);
    
    if (!user) {
      return res.status(400).json({ message: "Utilisateur non trouvé" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }

    // Créer un token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: "Connexion réussie",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Déconnexion réussie" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
