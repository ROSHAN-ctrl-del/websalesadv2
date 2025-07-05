import React from 'react';
import Layout from '../../components/Layout';

const ManageTasks: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto p-2 md:p-3">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-800">Manage Tasks</h1>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-gray-600">Task management functionality will be implemented here.</p>
        </div>
      </div>
    </Layout>
  );
};

export default ManageTasks;
