import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { Download, Calendar, Filter, TrendingUp, Users, Package, DollarSign, FileText, FileSpreadsheet } from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { exportToCSV, exportToExcel, exportToPDF, ReportData } from '../../utils/reportExporter';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const SuperAdminReports = () => {
  const [dateRange, setDateRange] = useState('30days');

  // Sample data for charts and reports
  const salesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales Revenue',
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const regionData = {
    labels: ['North', 'South', 'East', 'West'],
    datasets: [
      {
        label: 'Sales by Region',
        data: [45000, 32000, 28000, 38000],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
      },
    ],
  };

  const performanceData = {
    labels: ['Electronics', 'Accessories', 'Office Supplies', 'Home & Garden'],
    datasets: [
      {
        data: [35, 25, 20, 20],
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
        ],
      },
    ],
  };

  // Report data for export
  const salesReportData: ReportData = {
    title: 'Sales Report',
    columns: ['Month', 'Revenue', 'Orders', 'Growth'],
    data: [
      { Month: 'January', Revenue: '₹12,00,000', Orders: 145, Growth: '+12%' },
      { Month: 'February', Revenue: '₹19,00,000', Orders: 189, Growth: '+58%' },
      { Month: 'March', Revenue: '₹15,00,000', Orders: 156, Growth: '-21%' },
      { Month: 'April', Revenue: '₹25,00,000', Orders: 234, Growth: '+67%' },
      { Month: 'May', Revenue: '₹22,00,000', Orders: 198, Growth: '-12%' },
      { Month: 'June', Revenue: '₹30,00,000', Orders: 267, Growth: '+36%' },
    ],
    summary: {
      'Total Revenue': '₹1,23,00,000',
      'Total Orders': 1189,
      'Average Growth': '+23%',
      'Best Month': 'June',
      'Generated On': new Date().toLocaleDateString()
    }
  };

  const inventoryReportData: ReportData = {
    title: 'Inventory Report',
    columns: ['Product', 'Category', 'Stock', 'Value', 'Status'],
    data: [
      { Product: 'Wireless Headphones', Category: 'Electronics', Stock: 150, Value: '₹14,99,850', Status: 'In Stock' },
      { Product: 'Smartphone Case', Category: 'Accessories', Stock: 15, Value: '₹3,74,850', Status: 'Low Stock' },
      { Product: 'Laptop Stand', Category: 'Office Supplies', Stock: 0, Value: '₹0', Status: 'Out of Stock' },
      { Product: 'USB Cable', Category: 'Electronics', Stock: 75, Value: '₹1,87,425', Status: 'In Stock' },
      { Product: 'Mouse Pad', Category: 'Accessories', Stock: 8, Value: '₹1,99,920', Status: 'Low Stock' },
    ],
    summary: {
      'Total Products': 5,
      'Total Value': '₹22,62,045',
      'Low Stock Items': 2,
      'Out of Stock Items': 1,
      'Generated On': new Date().toLocaleDateString()
    }
  };

  const userActivityReportData: ReportData = {
    title: 'User Activity Report',
    columns: ['User', 'Role', 'Last Login', 'Actions', 'Status'],
    data: [
      { User: 'Alice Johnson', Role: 'Sales Person', 'Last Login': '2024-01-15', Actions: 45, Status: 'Active' },
      { User: 'Bob Smith', Role: 'Sales Person', 'Last Login': '2024-01-14', Actions: 32, Status: 'Active' },
      { User: 'Charlie Brown', Role: 'Sales Person', 'Last Login': '2024-01-10', Actions: 18, Status: 'Inactive' },
      { User: 'Diana Prince', Role: 'Sales Admin', 'Last Login': '2024-01-15', Actions: 67, Status: 'Active' },
      { User: 'Eve Wilson', Role: 'Sales Admin', 'Last Login': '2024-01-13', Actions: 23, Status: 'Active' },
    ],
    summary: {
      'Total Users': 5,
      'Active Users': 4,
      'Inactive Users': 1,
      'Total Actions': 185,
      'Generated On': new Date().toLocaleDateString()
    }
  };

  const handleExport = (reportData: ReportData, format: 'csv' | 'excel' | 'pdf') => {
    switch (format) {
      case 'csv':
        exportToCSV(reportData);
        break;
      case 'excel':
        exportToExcel(reportData);
        break;
      case 'pdf':
        exportToPDF(reportData);
        break;
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600 mt-1">Comprehensive system reports and data insights</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 3 months</option>
              <option value="1year">Last year</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹1,23,45,678</p>
                <p className="text-sm text-green-600">+12.5% from last month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">8,459</p>
                <p className="text-sm text-green-600">+8.2% from last month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">2,847</p>
                <p className="text-sm text-green-600">+15.3% from last month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Products Sold</p>
                <p className="text-2xl font-bold text-gray-900">15,632</p>
                <p className="text-sm text-green-600">+18.7% from last month</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Trend */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend</h3>
            <Line data={salesData} options={chartOptions} />
          </div>

          {/* Regional Performance */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Performance</h3>
            <Bar data={regionData} options={chartOptions} />
          </div>
        </div>

        {/* Category Performance and Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Performance */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Category</h3>
            <div className="h-64">
              <Doughnut data={performanceData} options={doughnutOptions} />
            </div>
          </div>

          {/* Top Performing Products */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
            <div className="space-y-4">
              {[
                { name: 'Wireless Headphones', sales: '₹3,75,000', growth: '+23%' },
                { name: 'Smartphone Case', sales: '₹2,66,400', growth: '+18%' },
                { name: 'Laptop Stand', sales: '₹2,33,100', growth: '+12%' },
                { name: 'USB Cable', sales: '₹1,83,150', growth: '+8%' },
                { name: 'Mouse Pad', sales: '₹1,49,850', growth: '+5%' },
              ].map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">Revenue: {product.sales}</p>
                  </div>
                  <span className="text-sm font-medium text-green-600">{product.growth}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Download Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sales Report */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Sales Report</h4>
              <p className="text-sm text-gray-600 mb-4">Monthly sales performance and trends</p>
              <div className="flex flex-col space-y-2">
                <button 
                  onClick={() => handleExport(salesReportData, 'csv')}
                  className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Download CSV
                </button>
                <button 
                  onClick={() => handleExport(salesReportData, 'excel')}
                  className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Download Excel
                </button>
                <button 
                  onClick={() => handleExport(salesReportData, 'pdf')}
                  className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </button>
              </div>
            </div>

            {/* Inventory Report */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Inventory Report</h4>
              <p className="text-sm text-gray-600 mb-4">Stock levels and product status</p>
              <div className="flex flex-col space-y-2">
                <button 
                  onClick={() => handleExport(inventoryReportData, 'csv')}
                  className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Download CSV
                </button>
                <button 
                  onClick={() => handleExport(inventoryReportData, 'excel')}
                  className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Download Excel
                </button>
                <button 
                  onClick={() => handleExport(inventoryReportData, 'pdf')}
                  className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </button>
              </div>
            </div>

            {/* User Activity Report */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">User Activity Report</h4>
              <p className="text-sm text-gray-600 mb-4">User engagement and activity logs</p>
              <div className="flex flex-col space-y-2">
                <button 
                  onClick={() => handleExport(userActivityReportData, 'csv')}
                  className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Download CSV
                </button>
                <button 
                  onClick={() => handleExport(userActivityReportData, 'excel')}
                  className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Download Excel
                </button>
                <button 
                  onClick={() => handleExport(userActivityReportData, 'pdf')}
                  className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SuperAdminReports;