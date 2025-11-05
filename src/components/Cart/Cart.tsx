import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Trash2 } from 'lucide-react';
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

  // --- new states for weights + AI-identified images ---
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [identifiedImages, setIdentifiedImages] = useState<Record<string, string>>({});

  // --- Fetch fruits from backend API ---
  useEffect(() => {
    const fetchFruits = async () => {
      try {
        setLoadingFruits(true);
        const res = await fetch("https://yoursubdomain.loca.lt/fruits/");
        if (!res.ok) throw new Error("Failed to fetch fruits");
        const data = await res.json();
        setFruits(data);
      } catch (err) {
        console.error("Error fetching fruits:", err);
      } finally {
        setLoadingFruits(false);
      }
    };
    fetchFruits();
  }, []);

  const handleCheckout = () => setShowCheckout(true);

  const handleCheckoutComplete = () => {
    clearCart();
    setShowCheckout(false);
    onClose();
  };

  // --- update fruit weight (kg) ---
  const handleWeightChange = (fruitId: string, newWeight: number) => {
    setWeights((prev) => ({ ...prev, [fruitId]: newWeight }));
    updateQuantity(fruitId, newWeight); // treat quantity as kg
  };

  // --- get weight from ESP (dummy simulation) ---
  const handleWeigh = async (fruitId: string) => {
    try {
      const res = await fetch('https://yoursubdomain.loca.lt/hardware/get_weight'); // replace with your ESP32 endpoint
      const data = await res.json();
      const newWeight = parseFloat(data.weight);
      handleWeightChange(fruitId, newWeight);
    } catch (error) {
      console.error('Error fetching weight:', error);
    }
  };

  const handleIdentify = async (fruitId: string) => {
    // This should ideally come from your .env file
    const BASE_URL = 'https://yoursubdomain.loca.lt'; 

    try {
      const res = await fetch(`${BASE_URL}/api/files/latest`); // Your endpoint that returns the JSON
      const data = await res.json();

      // Check if the API call was successful and the URL exists
      if (data.status === 'success' && data.latest_image_url) {
        // Construct the full, absolute URL for the image
        const fullImageUrl = `${BASE_URL}/api/files/image/${data.latest_image_file}`;
        // Update state with the correct full URL
        setIdentifiedImages((prev) => ({ ...prev, [fruitId]: fullImageUrl }));
      } else {
        // Handle cases where status might not be 'success' or the URL is missing
        throw new Error('API response did not contain a valid image URL.');
      }
    } catch (error) {
      console.error('Error fetching identification:', error);
      // fallback image
      setIdentifiedImages((prev) => ({
        ...prev,
        [fruitId]: 'https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg',
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-full fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full bg-white shadow-xl">
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
            <div className="flex flex-1 overflow-hidden">
              {/* Left: Add More Fruits */}
              <div className="w-1/3 overflow-y-auto p-6 border-r">
                {loadingFruits ? (
                  <div className="text-center py-12 text-gray-500">Loading fruits...</div>
                ) : (
                  <>
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Add Fruits</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {fruits.map((fruit) => (
                        <ProductCard key={fruit.id} fruit={fruit} />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Right: Cart Items */}
              <div className="w-2/3 flex flex-col">
                <div className="flex-1 overflow-y-auto p-6">
                  {items.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No Items In Cart</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {items.map((item, index) => (
                        <div
                          key={item.fruit.id}
                          className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg"
                        >
                          <span className="text-gray-700 font-medium w-6">{index + 1}</span>

                          <img
                            src={item.fruit.image}
                            alt={item.fruit.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />

                          <div className="flex-1">
                            <h3 className="font-medium text-gray-800">{item.fruit.name}</h3>
                            <p className="text-green-600 font-semibold">
                              {item.fruit.price.toLocaleString()}$ / kg
                            </p>

                            {identifiedImages[item.fruit.id] && (
                              <img
                                src={identifiedImages[item.fruit.id]}
                                alt="Identified Fruit"
                                className="w-20 h-20 object-cover rounded mt-2"
                              />
                            )}
                          </div>

                          {/* Weight input + buttons */}
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              step="0.001"
                              min="0"
                              value={weights[item.fruit.id] || 0}
                              onChange={(e) =>
                                handleWeightChange(
                                  item.fruit.id,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-20 border rounded px-2 py-1 text-right"
                            />
                            <span className="text-gray-600">kg</span>

                            <button
                              onClick={() => handleWeigh(item.fruit.id)}
                              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                            >
                              Weight
                            </button>

                            <button
                              onClick={() => handleIdentify(item.fruit.id)}
                              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                            >
                              Identify
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

                {/* Footer */}
                {items.length > 0 && (
                  <div className="border-t p-6 bg-gray-50">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold text-gray-800">Total:</span>
                      <span className="text-2xl font-bold text-green-600">
                        {getTotalPrice().toLocaleString()} $
                      </span>
                    </div>
                    <button
                      onClick={handleCheckout}
                      className="w-full bg-gradient-to-r from-green-500 to-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-orange-600 transition-all"
                    >
                      Check Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
