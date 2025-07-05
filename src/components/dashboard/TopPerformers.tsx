import React from 'react';
import { Award, TrendingUp, Users } from 'lucide-react';

const TopPerformers = () => {
  const performers = [
    {
      rank: 1,
      name: 'Alice Johnson',
      region: 'North Region',
      sales: 374850, // ₹3,74,850
      deals: 12,
      growth: '+23%',
    },
    {
      rank: 2,
      name: 'Sarah Wilson',
      region: 'South Region',
      sales: 316540, // ₹3,16,540
      deals: 10,
      growth: '+18%',
    },
    {
      rank: 3,
      name: 'Mike Chen',
      region: 'East Region',
      sales: 266560, // ₹2,66,560
      deals: 8,
      growth: '+15%',
    },
    {
      rank: 4,
      name: 'Diana Prince',
      region: 'West Region',
      sales: 241570, // ₹2,41,570
      deals: 7,
      growth: '+12%',
    },
  ];

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 text-yellow-600';
      case 2:
        return 'bg-gray-100 text-gray-600';
      case 3:
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-blue-100 text-blue-600';
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700">View All</button>
      </div>
      <div className="space-y-3">
        {performers.map((performer) => (
          <div key={performer.rank} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${getRankColor(performer.rank)}`}>
                {performer.rank}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{performer.name}</p>
                <p className="text-xs text-gray-500">{performer.region}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">₹{performer.sales.toLocaleString('en-IN')}</p>
              <p className="text-xs text-gray-500">{performer.deals} deals</p>
            </div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              {performer.growth}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopPerformers;