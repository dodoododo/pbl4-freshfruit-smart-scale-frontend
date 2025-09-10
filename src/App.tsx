import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import Login from './components/Auth/Login.tsx';
import Signup from './components/Auth/Signup.tsx';
import Header from './components/Layout/Header.tsx';
import ProductGrid from './components/Products/ProductGrid.tsx';
import Cart from './components/Cart/Cart.tsx';
import OrderHistory from './components/Orders/OrderHistory.tsx';
import AdminDashboard from './components/Admin/AdminDashboard.tsx';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [currentView, setCurrentView] = useState<'products' | 'orders' | 'admin'>('products');
  const [isCartOpen, setIsCartOpen] = useState(false);

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login');
  };

  if (!user) {
    return authMode === 'login' 
      ? <Login onToggleMode={toggleAuthMode} />
      : <Signup onToggleMode={toggleAuthMode} />;
  }

  if (currentView === 'admin') {
    return <AdminDashboard onBack={() => setCurrentView('products')} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onToggleCart={() => setIsCartOpen(true)}
        onNavigateToAdmin={() => setCurrentView('admin')}
        currentView={currentView}
        onViewChange={setCurrentView}
      />
      
      <main>
        {currentView === 'products' && <ProductGrid />}
        {currentView === 'orders' && <OrderHistory />}
      </main>

      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;