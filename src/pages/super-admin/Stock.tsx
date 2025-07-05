import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Plus, Search, Filter, AlertTriangle, Package, TrendingDown, TrendingUp, X, Save, Trash2, Edit } from 'lucide-react';
import { motion } from 'framer-motion';
import { getStockItems, createStockItem, updateStockItem, deleteStockItem, StockItem as StockItemType } from '../../services/stockService';

const useStockManagement = () => {
  const [stockItems, setStockItems] = useState<StockItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItemType | null>(null);
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
  });
  const [newItem, setNewItem] = useState<Omit<StockItemType, 'id' | 'status' | 'totalValue' | 'lastUpdated'>>({
    name: '',
    category: 'spices',
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    unitPrice: 0,
  });

  useEffect(() => {
    const loadStockItems = async () => {
      try {
        const items = await getStockItems();
        setStockItems(items);
        setError(null);
      } catch (err) {
        console.error('Error loading stock items:', err);
        setError('Failed to load stock items. Please try again later.');
        setStockItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStockItems();
  }, []);

  const categories = React.useMemo(() => 
    ['all', ...new Set(stockItems.map(item => item?.category).filter(Boolean))],
    [stockItems]
  );
  
  const filteredItems = React.useMemo(() => {
    if (!stockItems || stockItems.length === 0) return [];
    return stockItems.filter(item => {
      if (!item) return false;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = item.name?.toLowerCase().includes(searchLower) ||
                          item.category?.toLowerCase().includes(searchLower) ||
                          false;
      const matchesCategory = filters.category === 'all' || item.category === filters.category;
      const matchesStatus = filters.status === 'all' || item.status === filters.status;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [stockItems, searchTerm, filters.category, filters.status]);

  const { totalStockValue, lowStockItems, outOfStockItems } = React.useMemo(() => ({
    totalStockValue: filteredItems.reduce((sum, item) => sum + (item.totalValue || 0), 0),
    lowStockItems: filteredItems.filter(item => item.status === 'low_stock').length,
    outOfStockItems: filteredItems.filter(item => item.status === 'out_of_stock').length,
  }), [filteredItems]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewItem(prev => ({
      ...prev,
      [name]: name === 'name' || name === 'category' ? value : Number(value)
    }));
  };

  const handleAddOrUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const updatedItem = await updateStockItem(editingItem.id, newItem);
        setStockItems(prev => prev.map(item => item.id === editingItem.id ? updatedItem : item));
        setEditingItem(null);
      } else {
        const createdItem = await createStockItem(newItem);
        setStockItems(prev => [...prev, createdItem]);
      }
      setNewItem({
        name: '',
        category: 'spices',
        currentStock: 0,
        minStock: 0,
        maxStock: 0,
        unitPrice: 0,
      });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error saving stock item:', error);
      setError('Failed to save stock item. Please try again.');
    }
  };

  const handleEdit = (item: StockItemType) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      category: item.category,
      currentStock: item.currentStock,
      minStock: item.minStock,
      maxStock: item.maxStock,
      unitPrice: item.unitPrice,
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteStockItem(id);
        setStockItems(prev => prev.filter(item => item.id !== id));
      } catch (error) {
        console.error('Error deleting stock item:', error);
        setError('Failed to delete stock item. Please try again.');
      }
    }
  };

  const handleStockUpdate = async (id: string, change: number) => {
    try {
      const itemToUpdate = stockItems.find(item => item?.id === id);
      if (!itemToUpdate) return;
      
      const newStock = Math.max(0, (itemToUpdate.currentStock || 0) + change);
      
      const updatedItem = await updateStockItem(id, {
        ...itemToUpdate,
        currentStock: newStock,
        minStock: itemToUpdate.minStock || 0,
        maxStock: itemToUpdate.maxStock || 0,
        unitPrice: itemToUpdate.unitPrice || 0,
        name: itemToUpdate.name || '',
        category: itemToUpdate.category || 'spices'
      });
      
      setStockItems(prev => 
        prev.map(item => item?.id === id ? updatedItem : item).filter(Boolean) as StockItemType[]
      );
    } catch (error) {
      console.error('Error updating stock:', error);
      setError('Failed to update stock. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'bg-green-100 text-green-800';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return {
    stockItems,
    isLoading,
    error,
    searchTerm,
    showAddModal,
    showFilterModal,
    editingItem,
    setEditingItem,
    filters,
    newItem,
    filteredItems,
    categories,
    totalStockValue,
    lowStockItems,
    outOfStockItems,
    setSearchTerm,
    setShowAddModal,
    setShowFilterModal,
    setFilters,
    setNewItem,
    handleInputChange,
    handleAddOrUpdateItem,
    handleEdit,
    handleDelete,
    handleStockUpdate,
    getStatusColor,
  };
};

const SuperAdminStock = () => {
  const {
    stockItems,
    isLoading,
    error,
    searchTerm,
    showAddModal,
    showFilterModal,
    editingItem,
    setEditingItem,
    filters,
    newItem,
    filteredItems,
    categories,
    totalStockValue,
    lowStockItems,
    outOfStockItems,
    setSearchTerm,
    setShowAddModal,
    setShowFilterModal,
    setFilters,
    setNewItem,
    handleInputChange,
    handleAddOrUpdateItem,
    handleEdit,
    handleDelete,
    handleStockUpdate,
    getStatusColor,
  } = useStockManagement();

  // All state and effects are now handled by the useStockManagement hook

  // Close modals when clicking outside (must run unconditionally before any return)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Ignore clicks on elements that toggle or are inside modals
      if (target.closest('button[onClick*="setShowFilterModal"]') || target.closest('.filter-modal')) return;
      if (target.closest('button[onClick*="setShowAddModal"]') || target.closest('.modal-content')) return;

      if (showAddModal) {
        setShowAddModal(false);
        setEditingItem(null);
      }
      if (showFilterModal) {
        setShowFilterModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAddModal, showFilterModal, setShowAddModal, setShowFilterModal, setEditingItem]);

  // Loading and error states
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64 p-4">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  // Summary values are now calculated in the useStockManagement hook

  // getStatusColor is now provided by the useStockManagement hook

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
            {/* Hidden for now
            <p className="text-gray-600 mt-1">Monitor and manage warehouse inventory (All amounts in ₹ INR)</p>
            */}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.stopPropagation();
              setEditingItem(null);
              setNewItem({
                name: '',
                category: 'spices',
                currentStock: 0,
                minStock: 0,
                maxStock: 0,
                unitPrice: 0,
              });
              setShowAddModal(true);
            }}
            className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors relative z-40"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </motion.button>
        </div>

        {/* Stock Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Stock Value</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalStockValue.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{stockItems.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">{lowStockItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{outOfStockItems}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFilterModal(!showFilterModal);
                }}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors relative z-40"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
                {(filters.category !== 'all' || filters.status !== 'all') && (
                  <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {[filters.category !== 'all' ? '1' : '', filters.status !== 'all' ? '1' : ''].filter(Boolean).length}
                  </span>
                )}
              </button>
              
              {/* Filter Modal */}
              {showFilterModal && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-50 p-4 border border-gray-200 filter-modal"
                  onClick={(e) => e.stopPropagation()} // Prevent click from closing the modal
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-900">Filters</h3>
                    <button 
                      onClick={() => setShowFilterModal(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={filters.category}
                        onChange={(e) => setFilters({...filters, category: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Categories</option>
                        {categories.filter(cat => cat !== 'all').map(category => (
                          <option key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={filters.status}
                        onChange={(e) => setFilters({...filters, status: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Status</option>
                        <option value="in_stock">In Stock</option>
                        <option value="low_stock">Low Stock</option>
                        <option value="out_of_stock">Out of Stock</option>
                      </select>
                    </div>
                    
                    <button
                      onClick={() => {
                        setFilters({ category: 'all', status: 'all' });
                        setShowFilterModal(false);
                      }}
                      className="w-full mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Clear all filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-500 mb-2">
          Showing {filteredItems.length} of {stockItems.length} products
          {(filters.category !== 'all' || filters.status !== 'all' || searchTerm) && (
            <span className="ml-2">
              (filtered by: 
              {[
                filters.category !== 'all' ? `Category: ${filters.category}` : '',
                filters.status !== 'all' ? `Status: ${filters.status.replace('_', ' ')}` : '',
                searchTerm ? `Search: "${searchTerm}"` : ''
              ].filter(Boolean).join(', ')})
            </span>
          )}
        </div>
        
        {/* Stock Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleStockUpdate(item.id, -1)}
                          className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                          disabled={item.currentStock <= 0}
                        >
                          -
                        </button>
                        <div className="text-center min-w-[40px]">
                          <div className="text-sm font-medium">{item.currentStock}</div>
                          <div className="text-xs text-gray-500">units</div>
                        </div>
                        <button 
                          onClick={() => handleStockUpdate(item.id, 1)}
                          className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Min: {item.minStock} | Max: {item.maxStock}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{item.unitPrice.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{item.totalValue.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button 
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4 inline" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 inline" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div 
              className="bg-white rounded-lg p-6 w-full max-w-md modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingItem ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleAddOrUpdateItem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newItem.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter product name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={newItem.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="spices">Spices</option>
                    <option value="herbs">Herbs</option>
                    <option value="grains">Grains</option>
                    <option value="oils">Oils</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Stock
                    </label>
                    <input
                      type="number"
                      name="currentStock"
                      value={newItem.currentStock}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Stock
                    </label>
                    <input
                      type="number"
                      name="minStock"
                      value={newItem.minStock}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Stock
                    </label>
                    <input
                      type="number"
                      name="maxStock"
                      value={newItem.maxStock}
                      onChange={handleInputChange}
                      min={newItem.minStock + 1}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Price (₹)
                  </label>
                  <input
                    type="number"
                    name="unitPrice"
                    value={newItem.unitPrice}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingItem ? 'Update' : 'Add'} Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SuperAdminStock;