import React from 'react';
import { AlertTriangle, TrendingDown, Package } from 'lucide-react';

const StockLevels = () => {
  const stockItems = [
    { name: 'Wireless Headphones', current: 150, min: 20, status: 'good' },
    { name: 'Smartphone Case', current: 15, min: 50, status: 'low' },
    { name: 'Laptop Stand', current: 0, min: 10, status: 'out' },
    { name: 'USB Cable', current: 75, min: 25, status: 'good' },
    { name: 'Mouse Pad', current: 8, min: 15, status: 'low' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800';
      case 'low':
        return 'bg-yellow-100 text-yellow-800';
      case 'out':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <Package className="h-4 w-4 text-green-600" />;
      case 'low':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'out':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Stock Levels</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700">View All</button>
      </div>
      <div className="space-y-3">
        {stockItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              {getStatusIcon(item.status)}
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500">
                  Current: {item.current} | Min: {item.min}
                </p>
              </div>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
              {item.status === 'good' ? 'In Stock' : item.status === 'low' ? 'Low Stock' : 'Out of Stock'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockLevels;