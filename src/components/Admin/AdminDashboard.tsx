import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import type { Fruit } from '../../types/index.ts';

interface AdminDashboardProps {
  onBack: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [fruits, setFruits] = useState<Fruit[]>([]);
  const [editingFruit, setEditingFruit] = useState<Fruit | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    description: '',
    category: '',
    quantity: ''
  });

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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    const newFruit = {
      name: formData.name,
      price: parseFloat(formData.price),
      image: formData.image,
      description: formData.description,
      category: formData.category,
      quantity: parseInt(formData.quantity)
    };

    try {
      const response = await fetch("https://yoursubdomain.loca.lt/fruits/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newFruit),
      });

      if (!response.ok) {
        throw new Error("Failed to add fruit");
      }

      const createdFruit: Fruit = await response.json();

      setFruits([...fruits, createdFruit]);
      setShowAddForm(false);
      resetForm();
    } catch (error) {
      console.error("Error adding fruit:", error);
      alert("Error adding fruit");
    }
  };

  const handleEdit = (fruit: Fruit) => {
    setEditingFruit(fruit);
    setFormData({
      name: fruit.name,
      price: fruit.price.toString(),
      image: fruit.image,
      description: fruit.description,
      category: fruit.category,
      quantity: fruit.quantity.toString()
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFruit) return;

    const updatedFruit: Fruit = {
      ...editingFruit,
      name: formData.name,
      price: parseFloat(formData.price),
      image: formData.image,
      description: formData.description,
      category: formData.category,
      quantity: parseInt(formData.quantity)
    };

    try {
      const response = await fetch(`https://yoursubdomain.loca.lt/fruits/${editingFruit.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFruit),
      });

      if (!response.ok) throw new Error("Failed to update fruit");

      const savedFruit: Fruit = await response.json();

      setFruits(fruits.map(fruit =>
        fruit.id === savedFruit.id ? savedFruit : fruit
      ));
      setEditingFruit(null);
      resetForm();
    } catch (err) {
      console.error("Error updating fruit:", err);
      alert("Update failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this fruit?')) return;

    try {
      const response = await fetch(`https://yoursubdomain.loca.lt/fruits/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete fruit");

      setFruits(fruits.filter(fruit => fruit.id !== id));
    } catch (err) {
      console.error("Error deleting fruit:", err);
      alert("Delete failed");
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      image: '',
      description: '',
      category: '',
      quantity: ''
    });
  };

  const handleCancel = () => {
    setEditingFruit(null);
    setShowAddForm(false);
    resetForm();
  };

  const renderForm = (isEditing: boolean) => (
    <form onSubmit={isEditing ? handleUpdate : handleAdd} className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {isEditing ? 'Edit Fruit' : 'Add New Fruit'}
        </h3>
        <button type="button" onClick={handleCancel} className="text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
          <input
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">quantity</label>
          <input
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
          <input
            type="url"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            rows={3}
            required
          />
        </div>
      </div>

      <div className="flex space-x-4 mt-6">
        <button
          type="submit"
          className="bg-gradient-to-r from-green-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-orange-600 flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{isEditing ? 'Update' : 'Add'} Fruit</span>
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage your fruit inventory</p>
            </div>
          </div>
          
          {!showAddForm && !editingFruit && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-green-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-orange-600 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Fruit</span>
            </button>
          )}
        </div>

        {showAddForm && renderForm(false)}
        {editingFruit && renderForm(true)}

        <div className="bg-white rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Fruit Inventory ({fruits.length})</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fruits.map(fruit => (
                  <tr key={fruit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={fruit.image}
                          alt={fruit.name}
                          className="w-12 h-12 object-cover rounded-lg mr-4"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{fruit.name}</div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">{fruit.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {fruit.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      ${fruit.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        fruit.quantity > 10 
                          ? 'bg-green-100 text-green-800'
                          : fruit.quantity > 0
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {fruit.quantity} units
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(fruit)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(fruit.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
