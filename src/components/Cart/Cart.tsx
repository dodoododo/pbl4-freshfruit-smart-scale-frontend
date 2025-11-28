import React, { useState, useEffect, useRef } from "react";
import { X, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "../../context/CartContext";
import CheckoutForm from "./CheckoutForm";
import ProductCard from "../Products/ProductCard";
import type { Fruit } from "../../types";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const BASE_URL = "https://yoursubdomain.loca.lt";

const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const { items, addToCart, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();

  const [showCheckout, setShowCheckout] = useState(false);
  const [fruits, setFruits] = useState<Fruit[]>([]);
  const [loadingFruits, setLoadingFruits] = useState(true);
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [identifiedImages, setIdentifiedImages] = useState<Record<string, string[]>>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const identifiedRef = useRef<Record<string, string[]>>({});

  // Load fruits
  useEffect(() => {
    if (!isOpen) return;

    const fetchAll = async () => {
      try {
        setLoadingFruits(true);

        // 1. Fruits
        const fruitsRes = await fetch(`${BASE_URL}/fruits/`);
        const fruitsData: Fruit[] = await fruitsRes.json();
        setFruits(fruitsData);

        // 2. Initialize weights (default 0)
        const initialWeights: Record<string, number> = {};
        fruitsData.forEach((f) => {
          initialWeights[f.id] = 0;
        });
        setWeights(initialWeights);
      } catch (err) {
        console.error("Error fetching fruits:", err);
      } finally {
        setLoadingFruits(false);
      }
    };

    fetchAll();
  }, [isOpen]);

// Fetch files/latest + polling
useEffect(() => {
  // Nếu đóng cart hoặc chưa có fruits → ngừng
  if (!isOpen || fruits.length === 0) return;

  // ⛔ NGỪNG POLLING khi đang checkout
  if (showCheckout) return;

  const fetchFiles = async () => {
    try {
      const res = await fetch(`${BASE_URL}/files/latest`);
      const data = await res.json();
      console.log("Latest files data:", data);
      if (data.status !== "success" || !data.files) return;

      Object.entries(data.files).forEach(([fruitName, fileObj]: [string, any]) => {
        const foundFruit = fruits.find((f) => f.name === fruitName);
        if (!foundFruit) return;

        if (!items.some((item) => item.fruit.id === foundFruit.id)) {
          addToCart(foundFruit);
        }

        identifiedRef.current[foundFruit.id] = [fileObj.image_url];
        setIdentifiedImages({ ...identifiedRef.current });

        const detectedWeight = parseFloat(fileObj.weight) || 0;
        setWeights((prev) => ({ ...prev, [foundFruit.id]: detectedWeight }));

        updateQuantity(foundFruit.id, detectedWeight);
      });
    } catch (err) {
      console.error("Error fetching latest files:", err);
    }
  };

  fetchFiles();
  const interval = setInterval(fetchFiles, 3000);

  return () => clearInterval(interval);
}, [isOpen, fruits, items, showCheckout]);    // 👈 thêm showCheckout

  const handleCheckout = () => setShowCheckout(true);

  const handleCheckoutComplete = () => {
    clearCart();
    setShowCheckout(false);
    onClose();
  };

  const handleWeightChange = (fruitId: string, newWeight: number) => {
    setWeights((prev) => ({ ...prev, [fruitId]: newWeight }));
    updateQuantity(fruitId, newWeight);
  };

  if (!isOpen) return null;

  return (
    <div className="w-full fixed inset-0 z-50 overflow-hidden">

      {/* BACKDROP */}
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
            <CheckoutForm onComplete={handleCheckoutComplete} onBack={() => setShowCheckout(false)} />
          ) : (
            <div className="flex flex-1 overflow-hidden">

              {/* LEFT: Fruits list */}
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

              {/* RIGHT: Cart Items */}
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

                            {/* Identified Image (click to preview) */}
                            {identifiedImages[item.fruit.id]?.map((imgUrl, idx) => (
                              <img
                                key={idx}
                                src={imgUrl}
                                className="w-20 h-20 object-cover rounded mt-2 cursor-pointer transition-transform hover:scale-105"
                                onClick={() => setPreviewImage(imgUrl)}
                              />
                            ))}
                          </div>

                          {/* WEIGHT INPUT + REMOVE */}
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={weights[item.fruit.id] ?? 0}
                              onChange={(e) =>
                                handleWeightChange(item.fruit.id, parseFloat(e.target.value) || 0)
                              }
                              className="w-20 border rounded px-2 py-1 text-right"
                            />
                            <span className="text-gray-600">kg</span>

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
                      className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-800 transition-all"
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

      {/* IMAGE POPUP FULLSCREEN + ANIMATION */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[999] animate-fadeIn"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg animate-zoomIn"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Animation styles */}
      <style>{`
        @keyframes zoomIn {
          from { transform: scale(0.6); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .animate-zoomIn { animation: zoomIn 0.25s ease-out; }
        .animate-fadeIn { animation: fadeIn 0.25s ease-out; }
      `}</style>

    </div>
  );
};

export default Cart;
