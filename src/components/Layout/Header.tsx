import React from 'react';
import { ShoppingCart, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Logo from './Logo';

export type View = 'products' | 'bills' | 'billHistory' | 'admin' | 'account' | 'employees';

interface HeaderProps {
  onToggleCart: () => void;
  onNavigateToAdmin: () => void;
  currentView: string;
  onViewChange: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleCart, onNavigateToAdmin, currentView, onViewChange }) => {
  const { user, logout, isAdmin } = useAuth();
  const { getTotalItems } = useCart();

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Logo onViewChange={onViewChange} />

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <button
              onClick={() => onViewChange('products')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                currentView === 'products'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-700 hover:text-green-600'
              }`}
            >
              Products
            </button>
{/* 
            <button
              onClick={() => onViewChange('orders')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                currentView === 'orders'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-700 hover:text-green-600'
              }`}
            >
              Orders
            </button> */}

            <button
              onClick={() => onViewChange('bills')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                currentView === 'bills'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-700 hover:text-green-600'
              }`}
            >
              Bills
            </button>

            {/* ✅ New Bill History button */}
            <button
              onClick={() => onViewChange('billHistory')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                currentView === 'billHistory'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-700 hover:text-green-600'
              }`}
            >
              Bill History
            </button>

            {isAdmin && (
              <button
                onClick={() => onViewChange('employees')}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  currentView === 'employees'
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-700 hover:text-green-600'
                }`}
              >
                Employees
              </button>
            )}
          </nav>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onToggleCart}
              className="relative p-2 text-gray-700 hover:text-green-600 transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </button>

            {isAdmin && (
              <button
                onClick={onNavigateToAdmin}
                className="p-2 text-gray-700 hover:text-green-600 transition-colors"
                title="Admin Panel"
              >
                <Settings className="w-6 h-6" />
              </button>
            )}

            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => onViewChange('account')}
            >
              <User className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700 hover:text-green-600 transition-colors">
                {user?.name}
              </span>
            </div>

            <button
              onClick={logout}
              className="p-2 text-gray-700 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
