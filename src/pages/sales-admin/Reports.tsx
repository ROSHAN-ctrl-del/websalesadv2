import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { Download, Calendar, TrendingUp, Users, Target, Award } from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

const SalesAdminReports = () => {
  const [dateRange, setDateRange] = useState('30days');

  // Sample data for charts
  const teamSalesData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Team Sales',
        data: [18000, 22000, 19000, 25000],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const individualPerformanceData = {
    labels: ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'],
    datasets: [
      {
        label: 'Sales Performance',
        data: [4500, 3200, 2800, 3800, 2900],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
      },
    ],
  };

  const regionData = {
    labels: ['Downtown', 'Suburbs', 'Industrial', 'Retail'],
    datasets: [
      {
        data: [35, 28, 20, 17],
        backgroundColor: [
          '#10B981',
          '#3B82F6',
          '#F59E0B',
          '#EF4444',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
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
            <h1 className="text-2xl font-bold text-gray-900">Team Reports</h1>
            <p className="text-gray-600 mt-1">Analyze your team's performance and generate reports</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 3 months</option>
            </select>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700 transition-colors">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Team Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹7,29,500</p>
                <p className="text-sm text-green-600">+15.2% from last month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Team Members</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-sm text-blue-600">All active</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Target Achievement</p>
                <p className="text-2xl font-bold text-gray-900">78%</p>
                <p className="text-sm text-green-600">On track</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Deal Size</p>
                <p className="text-2xl font-bold text-gray-900">₹2,36,900</p>
                <p className="text-sm text-green-600">+8.3% increase</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Team Sales Trend */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Sales Trend</h3>
            <Line data={teamSalesData} options={chartOptions} />
          </div>

          {/* Individual Performance */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Individual Performance</h3>
            <Bar data={individualPerformanceData} options={chartOptions} />
          </div>
        </div>

        {/* Regional Performance and Team Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Regional Performance */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Region</h3>
            <div className="h-64">
              <Doughnut data={regionData} options={doughnutOptions} />
            </div>
          </div>

          {/* Team Performance Insights */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-green-900">Top Performer</p>
                  <p className="text-sm text-green-700">Alice Johnson - ₹3,74,850 this month</p>
                </div>
                <Award className="h-8 w-8 text-green-600" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-blue-900">Most Improved</p>
                  <p className="text-sm text-blue-700">Diana Prince - +45% growth</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium text-yellow-900">Needs Attention</p>
                  <p className="text-sm text-yellow-700">Charlie Brown - Below target</p>
                </div>
                <Target className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Team Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4 mr-2" />
              Team Performance (CSV)
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4 mr-2" />
              Customer Report (Excel)
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4 mr-2" />
              Activity Summary (PDF)
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SalesAdminReports;