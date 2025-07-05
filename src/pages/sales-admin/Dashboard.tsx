import React from 'react';
import Layout from '../../components/Layout';
import { Users, TrendingUp, Target, Award } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';

const SalesAdminDashboard = () => {
  const teamPerformanceData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Team Sales',
        data: [8000, 12000, 9500, 15000, 13000, 18000],
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
        label: 'Individual Sales',
        data: [4500, 3200, 2800, 3800, 2900],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Welcome back, Sales Admin!</h1>
          <p className="text-green-100">Monitor your team's performance and drive success</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Team Members</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-sm text-green-600">2 new this month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Team Sales</p>
                <p className="text-2xl font-bold text-gray-900">₹7,29,500</p>
                <p className="text-sm text-green-600">+15.2% from last month</p>
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
                <p className="text-sm text-green-600">On track for monthly goal</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Top Performer</p>
                <p className="text-lg font-bold text-gray-900">Alice Johnson</p>
                <p className="text-sm text-orange-600">₹3,74,850 this month</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Performance Trend</h3>
            <Line data={teamPerformanceData} options={chartOptions} />
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Individual Performance</h3>
            <Bar data={individualPerformanceData} options={chartOptions} />
          </div>
        </div>

        {/* Team Activity and Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Team Activity</h3>
            <div className="space-y-4">
              {[
                { person: 'Alice Johnson', action: 'Closed deal with TechCorp', amount: '₹2,08,250', time: '2 hours ago' },
                { person: 'Bob Smith', action: 'Added new prospect', amount: 'ABC Industries', time: '4 hours ago' },
                { person: 'Charlie Brown', action: 'Completed customer follow-up', amount: 'RetailMax', time: '6 hours ago' },
                { person: 'Diana Prince', action: 'Scheduled product demo', amount: 'StartupXYZ', time: '1 day ago' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-medium text-sm">
                        {activity.person.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{activity.person}</p>
                      <p className="text-xs text-gray-500">{activity.action} - {activity.amount}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Leaderboard</h3>
            <div className="space-y-3">
              {[
                { rank: 1, name: 'Alice Johnson', sales: '₹3,74,850', deals: 12 },
                { rank: 2, name: 'Diana Prince', sales: '₹3,16,540', deals: 10 },
                { rank: 3, name: 'Bob Smith', sales: '₹2,66,560', deals: 8 },
                { rank: 4, name: 'Charlie Brown', sales: '₹2,33,240', deals: 7 },
                { rank: 5, name: 'Eve Wilson', sales: '₹2,41,570', deals: 6 },
              ].map((performer) => (
                <div key={performer.rank} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      performer.rank === 1 ? 'bg-yellow-100 text-yellow-600' :
                      performer.rank === 2 ? 'bg-gray-100 text-gray-600' :
                      performer.rank === 3 ? 'bg-orange-100 text-orange-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {performer.rank}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{performer.name}</p>
                      <p className="text-xs text-gray-500">{performer.deals} deals closed</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{performer.sales}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SalesAdminDashboard;