import React from 'react';
import { StoreIcon, Star } from 'lucide-react';
import type { Fruit } from '../../types';
import { useCart } from '../../context/CartContext';


interface ProductCardProps {
  fruit: Fruit;
}

const ProductCard: React.FC<ProductCardProps> = ({ fruit }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(fruit);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="relative overflow-hidden">
        <img
          src={fruit.image}
          alt={fruit.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3">
          <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            Fresh
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold text-gray-800">{fruit.name}</h3>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 ml-1">4.8</span>
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-3 custom-line-clamp">
          {fruit.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-green-600">${fruit.price.toFixed(2)}</span>
          <span className="text-sm text-gray-500">{fruit.quantity} in quantity</span>
        </div>
        
        <button
          onClick={handleAddToCart}
          disabled={fruit.quantity === 0}
          className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
            fruit.quantity > 0
              ? 'bg-cyan-950 text-white hover:from-green-600 hover:to-orange-600 transform hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <StoreIcon className="w-4 h-4" />
          <span>{fruit.quantity > 0 ? 'Add to cart' : 'Out of quantity'}</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;