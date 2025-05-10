import React, { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

// Configuration de l'URL de base pour axios
axios.defaults.baseURL = 'http://localhost:5000'; // URL de votre backend
axios.defaults.withCredentials = true; // Important pour les cookies CORS
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Intercepteur pour ajouter le token à chaque requête
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Configuration des intercepteurs pour une meilleure gestion des erreurs
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ERR_NETWORK') {
      console.error('Erreur de connexion au serveur:', error);
      return Promise.reject({
        message: 'Impossible de se connecter au serveur. Vérifiez que le serveur est en cours d\'exécution et que CORS est correctement configuré.'
      });
    }
    return Promise.reject(error);
  }
);

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!isLogin && formData.name.trim().length < 2) {
      setError('Le nom doit contenir au moins 2 caractères');
      return false;
    }

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Veuillez entrer une adresse email valide');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }

    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Effacer l'erreur quand l'utilisateur modifie le champ
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      console.log('Envoi des données:', { ...formData, password: '***' });
      
      const response = await axios.post(endpoint, formData);
      
      console.log('Réponse du serveur:', response.data);
      
      if (response.data.token) {
        console.log('Token reçu, stockage dans le localStorage');
        localStorage.setItem('token', response.data.token);
        onClose();
        window.location.reload();
      } else {
        console.error('Token non reçu dans la réponse:', response.data);
        throw new Error('Token non reçu du serveur');
      }
    } catch (err) {
      console.error('Erreur détaillée:', err);
      
      if (err.response) {
        // Erreur avec réponse du serveur
        switch (err.response.status) {
          case 400:
            setError('Veuillez vérifier vos informations');
            break;
          case 401:
            setError('Email ou mot de passe incorrect');
            break;
          case 404:
            setError('Service d\'authentification non disponible');
            break;
          case 409:
            setError('Cet email est déjà utilisé');
            break;
          case 422:
            setError('Données invalides');
            break;
          case 500:
            setError('Erreur serveur, veuillez réessayer plus tard');
            break;
          default:
            setError('Une erreur est survenue');
        }
      } else if (err.request) {
        // Pas de réponse du serveur
        setError('Impossible de se connecter au serveur. Vérifiez que le serveur est en cours d\'exécution et que CORS est correctement configuré.');
      } else {
        // Erreur lors de la configuration de la requête
        setError(err.message || 'Une erreur est survenue lors de la configuration de la requête');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div 
        className="fixed inset-0 bg-black/10 backdrop-blur-[1.5px]"
        onClick={onClose}
      />
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative shadow-xl transform transition-all">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-center mb-6">
          {isLogin ? 'Connexion' : 'Inscription'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom complet
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="John Doe"
                required
                minLength="2"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="exemple@email.com"
              required
              pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="••••••••"
              required
              minLength="6"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 text-white py-2 rounded-md hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isLogin ? 'Connexion en cours...' : 'Inscription en cours...'}
              </span>
            ) : (
              isLogin ? 'Se connecter' : "S'inscrire"
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({ name: '', email: '', password: '' });
            }}
            className="text-amber-500 hover:text-amber-600 text-sm transition-colors"
          >
            {isLogin
              ? "Pas encore de compte ? S'inscrire"
              : 'Déjà un compte ? Se connecter'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal; 