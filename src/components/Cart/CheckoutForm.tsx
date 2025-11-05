import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, UserSearch } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import type { Order, CartItem, ShippingAddress } from '../../types/index.ts'; // Assuming these are in your types

// --- Define Customer type based on your Pydantic model ---
interface Customer {
  cus_id: string; // Use string for IDs in TS/JS
  name: string;
  phone: string; // Phone will be the unique lookup key
  address?: string;
  moneySpent: number;
}

interface CheckoutFormProps {
  onComplete: () => void;
  onBack: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onComplete, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');

  // --- New Customer States ---
  const [customerPhone, setCustomerPhone] = useState('');
  const [foundCustomer, setFoundCustomer] = useState<Customer | null>(null);
  const [customerLookupError, setCustomerLookupError] = useState('');
  const [createCustomerError, setCreateCustomerError] = useState('');

  const { items, getTotalPrice } = useCart();
  const { user } = useAuth();

  // Effect to pre-fill form if auth user has info
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /**
   * Look up customer in localStorage
   */
  const handleFindCustomer = () => {
    if (!customerPhone) {
      setCustomerLookupError('Please enter a phone number.');
      return;
    }

    setCreateCustomerError(''); // Clear create error on new lookup
    const customers: Customer[] = JSON.parse(
      localStorage.getItem('customers') || '[]'
    );
    const found = customers.find((c) => c.phone === customerPhone);

    if (found) {
      setFoundCustomer(found);
      setFormData({
        ...formData, // Keep email if already entered
        name: found.name,
        address: found.address || '',
        // Leave city/zip blank for this specific shipment
        city: '', 
        zipCode: '',
      });
      setCustomerLookupError(''); // Clear error
    } else {
      setFoundCustomer(null);
      setCustomerLookupError(
        'Customer not found. Fill form to create a new customer, or clear phone to checkout as guest.'
      );
    }
  };

  /**
   * Handle the final order submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setCreateCustomerError(''); // Clear errors on submit

    const total = getTotalPrice();
    const allCustomers: Customer[] = JSON.parse(
      localStorage.getItem('customers') || '[]'
    );

    // --- Customer Logic ---
    try {
      if (foundCustomer) {
        // 1. Update existing customer
        const updatedCustomers = allCustomers.map((c) =>
          c.phone === foundCustomer.phone
            ? { ...c, moneySpent: c.moneySpent + total }
            : c
        );
        localStorage.setItem('customers', JSON.stringify(updatedCustomers));
      } else if (customerPhone) {
        // 2. Create new customer (if phone was entered but not found)

        // Check if phone number already exists (as requested)
        const existing = allCustomers.find((c) => c.phone === customerPhone);
        if (existing) {
          throw new Error(
            'This phone number is already registered. Please use "Find Customer".'
          );
        }

        // Combine address fields for the customer's profile
        const newCustomerAddress = `${formData.address}, ${formData.city}, ${formData.zipCode}`;
        
        const newCustomer: Customer = {
          cus_id: Date.now().toString(),
          name: formData.name,
          phone: customerPhone,
          address: newCustomerAddress,
          moneySpent: total,
        };
        
        allCustomers.push(newCustomer);
        localStorage.setItem('customers', JSON.stringify(allCustomers));
      }
      // 3. Else (no phone input), proceed as guest. No customer action.

    } catch (err: any) {
      setCreateCustomerError(err.message);
      setIsProcessing(false);
      return; // Stop submission
    }
    
    // --- Order Processing (Simulated) ---
    setTimeout(() => {
      const shippingAddress: ShippingAddress = {
        name: formData.name,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        zipCode: formData.zipCode,
      };

      const order: Order = {
        id: Date.now().toString(),
        userId: user?.id || 'guest',
        items: [...items],
        total: total,
        status: 'pending',
        createdAt: new Date().toISOString(),
        shippingAddress: shippingAddress,
      };

      // Save order to localStorage
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.push(order);
      localStorage.setItem('orders', JSON.stringify(orders));

      setOrderId(order.id);
      setOrderComplete(true);
      setIsProcessing(false);
    }, 2000);
  };

  // --- Order Complete Screen ---
  if (orderComplete) {
    return (
      <div className="p-6 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Order Confirmed!
        </h2>
        <p className="text-gray-600 mb-4">
          Thank you for your purchase. Your order #{orderId} has been confirmed.
        </p>
        <button
          onClick={onComplete}
          className="w-full bg-gradient-to-r from-green-500 to-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-orange-600 transition-all"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  // --- Main Checkout Form Screen ---
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-6 border-b">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full mr-3"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold text-gray-800">Checkout</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          
          {/* --- Customer Lookup Section --- */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Customer Phone (Optional)
            </label>
            <div className="flex space-x-2">
              <input
                type="tel"
                name="customerPhone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter phone to find or create customer"
              />
              <button
                type="button"
                onClick={handleFindCustomer}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center"
              >
                <UserSearch className="w-5 h-5 mr-2"/>
                Find
              </button>
            </div>
            {customerLookupError && (
              <p className="text-sm text-red-600">{customerLookupError}</p>
            )}
            {createCustomerError && (
              <p className="text-sm text-red-600">{createCustomerError}</p>
            )}
            {foundCustomer && (
              <p className="text-sm text-green-600 font-medium">
                Welcome back, {foundCustomer.name}! Total spent: ${foundCustomer.moneySpent.toFixed(2)}
              </p>
            )}
          </div>
          
          {/* --- Shipping Details Section --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ZIP Code
              </label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* --- Order Summary --- */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-3">Order Summary</h3>
            {items.map((item) => (
              <div
                key={item.fruit.id}
                className="flex justify-between items-center mb-2"
              >
                <span className="text-sm text-gray-600">
                  {item.fruit.name} x {item.quantity.toFixed(3)} kg
                </span>
                <span className="text-sm font-medium">
                  ${(item.fruit.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-800">Total:</span>
                <span className="font-bold text-green-600 text-lg">
                  ${getTotalPrice().toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* --- Footer Submit Button --- */}
      <div className="border-t p-6">
        <button
          type="submit"
          onClick={handleSubmit} // This will trigger the form's onSubmit
          disabled={isProcessing}
          className="w-full bg-gradient-to-r from-green-500 to-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-orange-600 disabled:opacity-50 transition-all"
        >
          {isProcessing
            ? 'Processing Order...'
            : `Place Order - $${getTotalPrice().toFixed(2)}`}
        </button>
      </div>
    </div>
  );
};

export default CheckoutForm;