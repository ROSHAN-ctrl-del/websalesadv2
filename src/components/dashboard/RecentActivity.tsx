import React from 'react';
import { Clock, User, Package, DollarSign } from 'lucide-react';

const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      type: 'sale',
      user: 'Alice Johnson',
      action: 'closed a deal',
      details: '$2,500 - TechCorp',
      time: '2 hours ago',
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      id: 2,
      type: 'user',
      user: 'Bob Smith',
      action: 'added new customer',
      details: 'RetailMax Inc',
      time: '4 hours ago',
      icon: User,
      color: 'text-blue-600',
    },
    {
      id: 3,
      type: 'stock',
      user: 'System',
      action: 'low stock alert',
      details: 'Smartphone Cases',
      time: '6 hours ago',
      icon: Package,
      color: 'text-yellow-600',
    },
    {
      id: 4,
      type: 'sale',
      user: 'Charlie Brown',
      action: 'updated order',
      details: 'Order #12345',
      time: '1 day ago',
      icon: DollarSign,
      color: 'text-green-600',
    },
  ];

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700">View All</button>
      </div>
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`p-1 rounded-full bg-gray-100`}>
                <Icon className={`h-4 w-4 ${activity.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.user}</span> {activity.action}
                </p>
                <p className="text-xs text-gray-500">{activity.details}</p>
              </div>
              <div className="flex items-center text-xs text-gray-400">
                <Clock className="h-3 w-3 mr-1" />
                {activity.time}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;