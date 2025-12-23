import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import ProductCard from './ProductCard';
import type { Fruit } from '../../types';

const ProductGrid: React.FC = () => {
  const [fruits, setFruits] = useState<Fruit[]>([]);
  const [filteredFruits, setFilteredFruits] = useState<Fruit[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    const fetchFruits = async () => {
      try {
        const res = await fetch("https://yoursubdomain.loca.lt/fruits/");
        if (!res.ok) throw new Error("Failed to fetch fruits");
        const data = await res.json();
        setFruits(data);
      } catch (err) {
        console.error("Failed to fetch fruits:", err);
      }
    };
    fetchFruits();
  }, []);

  useEffect(() => {
    let filtered = [...fruits];

    if (searchTerm) {
      filtered = filtered.filter(fruit =>
        fruit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fruit.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(fruit => fruit.category === selectedCategory);
    }

    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return a.price - b.price;   // low → high
        case 'price-high':
          return b.price - a.price;   // high → low
        default:
          return 0;
      }
    });

    setFilteredFruits(filtered);
  }, [fruits, searchTerm, selectedCategory, sortBy]);

  const categories = ['all', ...Array.from(new Set(fruits.map(fruit => fruit.category)))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Fresh Fruits</h1>
        <p className="text-gray-600">Discover our selection of premium fresh fruits</p>
      </div>

      {/* Filters */}
      <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search fruits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div> */}

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="name">Sort by Name</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {filteredFruits.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFruits.map(fruit => (
            <ProductCard key={fruit.id} fruit={fruit} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No fruits found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
