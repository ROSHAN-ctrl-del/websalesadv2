import React from 'react';
import Layout from '../../components/Layout';
import DashboardStats from '../../components/dashboard/DashboardStats';
import SalesChart from '../../components/dashboard/SalesChart';
import StockLevels from '../../components/dashboard/StockLevels';
import RecentActivity from '../../components/dashboard/RecentActivity';
import TopPerformers from '../../components/dashboard/TopPerformers';

const SuperAdminDashboard = () => {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Welcome back, Super Admin!</h1>
          <p className="text-blue-100">Here's an overview of your sales management system</p>
        </div>

        {/* Stats Cards */}
        <DashboardStats />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesChart />
          <StockLevels />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity />
          <TopPerformers />
        </div>
      </div>
    </Layout>
  );
};

export default SuperAdminDashboard;