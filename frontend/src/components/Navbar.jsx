import { AlignJustify, Search, Heart, GiftIcon, ShoppingBag, Globe, DiamondPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import AuthModal from './AuthModal';
import CreateProductModal from './CreateProductModal';
import { useCart } from '../context/CartContext';
import axios from 'axios';

const Navbar = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCreateProductModalOpen, setIsCreateProductModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getCartItemsCount } = useCart();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Token trouvé dans le localStorage:', token ? 'Oui' : 'Non');
    
    if (token) {
      // Définir le token dans les headers axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Headers axios configurés:', axios.defaults.headers.common);
      
      // Récupérer les informations de l'utilisateur
      console.log('Envoi de la requête /api/auth/me');
      axios.get('/api/auth/me')
        .then(response => {
          console.log('Réponse de l\'API:', response.data);
          setUser(response.data);
        })
        .catch(error => {
          console.error('Erreur détaillée:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
          });
          
          // Ne supprimer le token que si c'est une erreur d'authentification
          if (error.response?.status === 401) {
            console.log('Erreur d\'authentification, suppression du token');
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
          } else {
            console.log('Erreur non liée à l\'authentification, conservation du token');
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLoginClick = () => {
    setIsAuthModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <>
      <header className="sticky top-0 left-0 w-full bg-white bg-opacity-95 backdrop-blur-md shadow z-40 border-b border-gray-200">
        {/* Partie haute */}
        <div className="container mx-auto px-2 py-1 flex items-center justify-between h-14">
          <div className="flex items-center space-x-2">
            {/* Nom du site */}
            <Link to="/" className="text-xl font-bold text-amber-500 flex items-center">
              E-commerce
            </Link>
          </div>
          {/* Bouton Catégories */}
          <button className="flex items-center text-gray-700 hover:bg-gray-100 px-2 py-1 rounded transition">
            <AlignJustify className="w-5 h-5 mr-1" />
            <span className="font-medium text-sm">Catégories</span>
          </button>
          {/* Barre de recherche */}
          <form className="flex-1 mx-4 max-w-xl flex items-center bg-gray-100 rounded-full px-3 py-1 border border-gray-200">
            <input
              type="text"
              placeholder="Que cherchez-vous ?"
              className="flex-1 bg-transparent outline-none text-sm px-2"
            />
            <button type="submit" className="text-white bg-amber-500 rounded-full p-1 ml-2 hover:bg-amber-600 transition">
              <Search className="w-5 h-5" />
            </button>
          </form>
          {/* Actions à droite */}
          <div className="flex items-center space-x-3">
            {/* Bouton Login/User */}
            {loading ? (
              <div className="w-20 h-6 bg-gray-200 animate-pulse rounded"></div>
            ) : user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="text-sm font-medium text-gray-700 hover:text-amber-500 px-2 py-1 rounded transition flex items-center"
                >
                  <span className="mr-1">{user.name}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isProfileOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
                    onMouseLeave={() => setIsProfileOpen(false)}
                  >
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={handleLoginClick} className="text-sm font-medium text-gray-700 hover:text-amber-500 px-2 py-1 rounded transition">
                Se connecter
              </button>
            )}
            {/* Sélecteur de langue */}
            <button className="flex items-center text-gray-700 hover:text-amber-500 px-2 py-1 rounded transition">
              <Globe className="w-5 h-5 mr-1" />
              <span className="text-sm">FR</span>
            </button>
            {/* Icônes */}
            <button className="hover:text-amber-500 transition"><Heart className="w-5 h-5" /></button>
            <button className="hover:text-amber-500 transition"><GiftIcon className="w-5 h-5" /></button>
            <Link to="/cart" className="hover:text-amber-500 transition relative">
              <ShoppingBag className="w-5 h-5" />
              {getCartItemsCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getCartItemsCount()}
                </span>
              )}
            </Link>
            <button 
              onClick={() => setIsCreateProductModalOpen(true)}
              className="hover:text-amber-500 transition"
            >
              <DiamondPlus className="w-5 h-5" />
            </button>
          </div>
        </div>
        {/* Partie basse : navigation secondaire */}
        <nav className="w-full border-t border-gray-100 bg-white">
          <div className="container mx-auto flex items-center space-x-6 h-9 px-2 overflow-x-auto">
            <span className="flex items-center text-sm text-gray-700 hover:text-amber-500 cursor-pointer"><GiftIcon className='w-4 h-4 mr-1'/>Cadeaux</span>
            <span className="text-sm text-gray-700 hover:text-amber-500 cursor-pointer">Cadeaux de fête des mères</span>
            <span className="text-sm text-gray-700 hover:text-amber-500 cursor-pointer">Articles de déco</span>
            <span className="text-sm text-gray-700 hover:text-amber-500 cursor-pointer">Articles de mode</span>
            <span className="text-sm text-gray-700 hover:text-amber-500 cursor-pointer">Liste de cadeaux</span>
            <span className="text-sm text-gray-700 hover:text-amber-500 cursor-pointer">Cartes cadeaux</span>
          </div>
        </nav>
      </header>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <CreateProductModal 
        isOpen={isCreateProductModalOpen} 
        onClose={() => setIsCreateProductModalOpen(false)} 
      />
    </>
  );
};

export default Navbar;