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
    // Initialize with default fruits if none exist
    const savedFruits = localStorage.getItem('fruits');
    if (!savedFruits) {
      const defaultFruits: Fruit[] = [
        {
          id: '1',
          name: 'Fresh Apples',
          price: 3.99,
          image: 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=400',
          description: 'Crisp and sweet red apples, perfect for snacking or baking.',
          category: 'Apples',
          stock: 50
        },
        {
          id: '2',
          name: 'Ripe Bananas',
          price: 2.49,
          image: 'https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg?auto=compress&cs=tinysrgb&w=400',
          description: 'Yellow bananas packed with potassium and natural sweetness.',
          category: 'Tropical',
          stock: 75
        },
        {
          id: '3',
          name: 'Juicy Oranges',
          price: 4.99,
          image: 'https://images.pexels.com/photos/357573/pexels-photo-357573.jpeg?auto=compress&cs=tinysrgb&w=400',
          description: 'Fresh Valencia oranges bursting with vitamin C.',
          category: 'Citrus',
          stock: 60
        },
        {
          id: '4',
          name: 'Sweet Strawberries',
          price: 5.99,
          image: 'https://images.pexels.com/photos/46174/strawberries-berries-fruit-freshness-46174.jpeg?auto=compress&cs=tinysrgb&w=400',
          description: 'Hand-picked strawberries, sweet and perfect for desserts.',
          category: 'Berries',
          stock: 30
        },
        {
          id: '5',
          name: 'Fresh Grapes',
          price: 6.99,
          image: 'https://images.pexels.com/photos/708777/pexels-photo-708777.jpeg?auto=compress&cs=tinysrgb&w=400',
          description: 'Seedless green grapes, sweet and refreshing.',
          category: 'Grapes',
          stock: 45
        },
        {
          id: '6',
          name: 'Ripe Mangoes',
          price: 7.99,
          image: 'https://images.pexels.com/photos/918352/pexels-photo-918352.jpeg?auto=compress&cs=tinysrgb&w=400',
          description: 'Tropical mangoes with rich, sweet flavor.',
          category: 'Tropical',
          stock: 25
        }
      ];
      localStorage.setItem('fruits', JSON.stringify(defaultFruits));
      setFruits(defaultFruits);
    } else {
      setFruits(JSON.parse(savedFruits));
    }
  }, []);

  useEffect(() => {
    let filtered = fruits;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(fruit =>
        fruit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fruit.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(fruit => fruit.category === selectedCategory);
    }

    // Sort fruits
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return b.price - a.price;
        case 'price-high':
          return a.price - b.price;
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
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

          {/* Category Filter */}
          <div className="relative">
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
          </div>

          {/* Sort */}
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

      {/* Product Grid */}
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