import React from 'react';
import type { View } from './Header';

const Logo: React.FC<{ onViewChange: (view: View) => void }> = ({ onViewChange }) => {
  return (
    <>
      <style>{`
        @keyframes rainbow {
          0% { background-position: 0 0; }
          100% { background-position: -100% 0; }
        }
      `}</style>
      <div
        className="text-2xl font-bold cursor-pointer transition-all duration-300 hover:scale-105"
        style={{
          background: 'linear-gradient(90deg, red, orange, red, orange)',
          backgroundSize: '200% 100%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'rainbow 10s linear infinite',
        }}
        onClick={() => onViewChange("products")}
      >
        <span className="inline-block animate-bounce"></span>🍎 Fresh Fruit Market
      </div>
    </>
  );
};

export default Logo;