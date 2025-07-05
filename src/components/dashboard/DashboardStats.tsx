import React from 'react';
import { TrendingUp, Users, Package, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

const DashboardStats = () => {
  const stats = [
    {
      title: 'Total Revenue',
      value: '₹1,23,45,678',
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'blue',
    },
    {
      title: 'Active Users',
      value: '2,847',
      change: '+15.3%',
      changeType: 'positive',
      icon: Users,
      color: 'green',
    },
    {
      title: 'Products Sold',
      value: '15,632',
      change: '+18.7%',
      changeType: 'positive',
      icon: Package,
      color: 'purple',
    },
    {
      title: 'Growth Rate',
      value: '23.1%',
      change: '+2.1%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'orange',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${getColorClasses(stat.color)}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className={`text-sm ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change} from last month
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default DashboardStats;