import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import CheckoutForm from './CheckoutForm';
import ProductCard from '../Products/ProductCard';
import type { Fruit } from '../../types';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [fruits, setFruits] = useState<Fruit[]>([]);
  const [loadingFruits, setLoadingFruits] = useState(true);

  useEffect(() => {
    const fetchFruits = async () => {
      try {
        const res = await fetch("https://yoursubdomain.loca.lt/fruits/");
        if (!res.ok) throw new Error("Failed to fetch fruits");
        const data = await res.json();
        setFruits(data);
      } catch (err) {
        console.error("Failed to fetch fruits:", err);
      } finally {
        setLoadingFruits(false);
      }
    };
    fetchFruits();
  }, []);

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  const handleCheckoutComplete = () => {
    clearCart();
    setShowCheckout(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="w-full fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full bg-white shadow-xl"> {/* Removed max-w-4xl for full device width */}
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <ShoppingBag className="w-6 h-6 mr-2" />
              Shopping Cart ({items.length})
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {showCheckout ? (
            <CheckoutForm 
              onComplete={handleCheckoutComplete}
              onBack={() => setShowCheckout(false)}
            />
          ) : (
            <>
              {/* Split Layout: Left - Fruits to Add, Right - Cart Items */}
              <div className="flex flex-1 overflow-hidden">
                {/* Left: Fruits Page */}
                <div className="w-2/3 overflow-y-auto p-6 border-r">
                  {loadingFruits ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">Loading fruits...</p>
                    </div>
                  ) : fruits.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No fruits available.</p>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Add More Fruits</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {fruits.map(fruit => (
                          <ProductCard key={fruit.id} fruit={fruit} />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Right: Cart Items */}
                <div className="w-1/3 flex flex-col">
                  <div className="flex-1 overflow-y-auto p-6">
                    {items.length === 0 ? (
                      <div className="text-center py-12">
                        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Your cart is empty</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {items.map(item => (
                          <div key={item.fruit.id} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                            <img
                              src={item.fruit.image}
                              alt={item.fruit.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-800">{item.fruit.name}</h3>
                              <p className="text-green-600 font-semibold">${item.fruit.price.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => updateQuantity(item.fruit.id, item.quantity - 1)}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.fruit.id, item.quantity + 1)}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => removeFromCart(item.fruit.id)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded ml-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer for Cart */}
                  {items.length > 0 && (
                    <div className="border-t p-6 bg-gray-50">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold text-gray-800">Total:</span>
                        <span className="text-2xl font-bold text-green-600">
                          ${getTotalPrice().toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={handleCheckout}
                        className="w-full bg-gradient-to-r from-green-500 to-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-orange-600 transition-all"
                      >
                        Proceed to Checkout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;