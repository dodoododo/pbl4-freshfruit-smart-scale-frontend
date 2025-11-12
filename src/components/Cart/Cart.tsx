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

  const identifiedRef = useRef<Record<string, string[]>>({});

  // Load fruits và weight ban đầu khi mở cart
  useEffect(() => {
    if (!isOpen) return;

    const fetchAll = async () => {
      try {
        setLoadingFruits(true);

        // 1. Fruits
        const fruitsRes = await fetch(`${BASE_URL}/fruits/`);
        const fruitsData: Fruit[] = await fruitsRes.json();
        setFruits(fruitsData);

        // 2. Weight ban đầu
        const weightRes = await fetch(`${BASE_URL}/hardware/get_weight`);
        const weightData = await weightRes.json();
        const initialWeights: Record<string, number> = {};
        fruitsData.forEach((f) => {
          initialWeights[f.id] = weightData.weight ? parseFloat(weightData.weight) : 0;
        });
        setWeights(initialWeights);

      } catch (err) {
        console.error("Error fetching fruits or weight:", err);
      } finally {
        setLoadingFruits(false);
      }
    };

    fetchAll();
  }, [isOpen]);

  // Fetch files/latest + polling
  useEffect(() => {
    if (!isOpen || fruits.length === 0) return;

    const fetchFiles = async () => {
      try {
        const res = await fetch(`${BASE_URL}/files/latest`);
        const data = await res.json();
        console.log("Latest files data:", data);
        if (data.status !== "success" || !data.files) return;
        
        const filesArray = Object.entries(data.files).map(([name, file]: [string, any]) => ({
          fruitName: name,
          ...file,
        }));

        filesArray.forEach((fileObj) => {
          const foundFruit = fruits.find((f) => f.name === fileObj.fruitName);
          console.log("Matching fruit for file:", fileObj.fruitName, foundFruit);
          if (!foundFruit) return;

          // Thêm vào cart nếu chưa có
          if (!items.some((item) => item.fruit.id === foundFruit.id)) addToCart(foundFruit);

          // Cập nhật ảnh nhận diện
          const prev = identifiedRef.current[foundFruit.id] || [];
          if (!prev.includes(fileObj.image_url)) {
            identifiedRef.current[foundFruit.id] = [...prev, fileObj.image_url];
            setIdentifiedImages({ ...identifiedRef.current });
          }
        });
      } catch (err) {
        console.error("Error fetching latest files:", err);
      }
    };

    fetchFiles();
    const interval = setInterval(fetchFiles, 1000);
    return () => clearInterval(interval);
  }, [isOpen, fruits, items]);

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

  const handleWeigh = async (fruitId: string) => {
    try {
      const res = await fetch(`${BASE_URL}/hardware/get_weight`);
      const data = await res.json();
      handleWeightChange(fruitId, parseFloat(data.weight));
    } catch (err) {
      console.error("Error fetching weight:", err);
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

          {/* Main content */}
          {showCheckout ? (
            <CheckoutForm onComplete={handleCheckoutComplete} onBack={() => setShowCheckout(false)} />
          ) : (
            <div className="flex flex-1 overflow-hidden">
              {/* Left: Fruits list */}
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
                        <div key={item.fruit.id} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                          <span className="text-gray-700 font-medium w-6">{index + 1}</span>
                          <img src={item.fruit.image} alt={item.fruit.name} className="w-16 h-16 object-cover rounded-lg" />
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-800">{item.fruit.name}</h3>
                            <p className="text-green-600 font-semibold">{item.fruit.price.toLocaleString()}$ / kg</p>
                            {identifiedImages[item.fruit.id]?.map((imgUrl, idx) => (
                              <img key={idx} src={imgUrl} className="w-20 h-20 object-cover rounded mt-2" />
                            ))}
                          </div>

                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              step="1"
                              min="0"
                              value={weights[item.fruit.id] ?? 0} // 0 vẫn giữ nguyên
                              onChange={(e) => handleWeightChange(item.fruit.id, parseFloat(e.target.value) || 0)}
                              className="w-20 border rounded px-2 py-1 text-right"
                            />
                            <span className="text-gray-600">kg</span>
                            <button onClick={() => handleWeigh(item.fruit.id)} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">Weight</button>
                            <button onClick={() => removeFromCart(item.fruit.id)} className="p-1 text-red-500 hover:bg-red-50 rounded ml-2">
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
                      <span className="text-2xl font-bold text-green-600">{getTotalPrice().toLocaleString()} $</span>
                    </div>
                    <button onClick={handleCheckout} className="w-full bg-gradient-to-r bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-800 transition-all">
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
