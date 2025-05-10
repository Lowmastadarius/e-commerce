import React from 'react';
import ProductList from '../components/ProductList';

const HomePage = () => {
  console.log('HomePage component rendering');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <ProductList />
      </main>
    </div>
  );
};

export default HomePage;