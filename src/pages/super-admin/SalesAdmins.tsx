import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import { Plus, Search, Filter, Edit, Trash2, Eye, EyeOff, X, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  getSalesAdmins, 
  createSalesAdmin, 
  updateSalesAdmin, 
  deleteSalesAdmin, 
  toggleSalesAdminStatus 
} from '../../services/salesAdminService';


interface SalesAdmin {
  id: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  salesPersonsCount: number;
  totalSales: number;
  password?: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  region?: string;
  password?: string;
  confirmPassword?: string;
}

// Define region options for the form
const REGIONS = ['North Region', 'South Region', 'East Region', 'West Region', 'Central Region'] as const;

const SuperAdminSalesAdmins = () => {
  const [salesAdmins, setSalesAdmins] = useState<SalesAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<SalesAdmin | null>(null);
  const [editingAdmin, setEditingAdmin] = useState<SalesAdmin | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    region: 'all'
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  const [newAdmin, setNewAdmin] = useState<Omit<SalesAdmin, 'id' | 'status' | 'lastLogin' | 'salesPersonsCount' | 'totalSales'> & { 
    password: string; 
    confirmPassword: string;
  }>({
    name: '',
    email: '',
    phone: '',
    region: 'North Region',
    password: '',
    confirmPassword: ''
  });
  
  // Fetch sales admins on component mount
  const fetchSalesAdmins = useCallback(async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      const data = await getSalesAdmins(token);
      setSalesAdmins(data);
    } catch (error) {
      console.error('Error fetching sales admins:', error);
      toast.error('Failed to load sales admins');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSalesAdmins();
  }, [fetchSalesAdmins]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !token) return;
    
    setIsSubmitting(true);
    
    try {
      if (editingAdmin) {
        // Update existing admin
        const { confirmPassword, ...adminData } = newAdmin;
        const updatedAdmin = await updateSalesAdmin(editingAdmin.id, adminData, token);
        
        setSalesAdmins(prev => 
          prev.map(admin => admin.id === editingAdmin.id ? updatedAdmin : admin)
        );
        
        toast.success('Admin updated successfully');
      } else {
        // Add new admin
        const { confirmPassword, ...adminData } = newAdmin;
        const createdAdmin = await createSalesAdmin(adminData, token);
        
        setSalesAdmins(prev => [...prev, createdAdmin]);
        toast.success('Admin added successfully');
      }
      
      setShowAddModal(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving admin:', error);
      const errorMessage = error.response?.data?.error || 'Failed to save admin';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAdmin(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!newAdmin.name.trim()) errors.name = 'Name is required';
    if (!newAdmin.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(newAdmin.email)) {
      errors.email = 'Please enter a valid email';
    }
    if (!newAdmin.phone) errors.phone = 'Phone is required';
    if (!newAdmin.region) errors.region = 'Region is required';
    if (!editingAdmin && !newAdmin.password) {
      errors.password = 'Password is required';
    } else if (newAdmin.password && newAdmin.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (newAdmin.password !== newAdmin.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const resetForm = () => {
    setNewAdmin({
      name: '',
      email: '',
      phone: '',
      region: 'North Region',
      password: '',
      confirmPassword: ''
    });
    setFormErrors({});
    setEditingAdmin(null);
  };
  
  const handleEdit = (admin: SalesAdmin) => {
    setEditingAdmin(admin);
    setNewAdmin({
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      region: admin.region,
      password: '',
      confirmPassword: ''
    });
    setShowAddModal(true);
  };
  
  const handleDeleteClick = (admin: SalesAdmin) => {
    setAdminToDelete(admin);
  };

  const confirmDelete = async () => {
    if (!adminToDelete || !token) return;
    
    try {
      await deleteSalesAdmin(adminToDelete.id, token);
      setSalesAdmins(prev => prev.filter(admin => admin.id !== adminToDelete.id));
      setAdminToDelete(null);
      toast.success('Admin deleted successfully');
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast.error('Failed to delete admin');
    }
  };

  const toggleStatus = async (id: string, currentStatus: 'active' | 'inactive') => {
    if (!token) return;
    
    try {
      const updatedAdmin = await toggleSalesAdminStatus(id, currentStatus, token);
      
      setSalesAdmins(prev => 
        prev.map(admin => 
          admin.id === id 
            ? { ...admin, status: updatedAdmin.status }
            : admin
        )
      );
      
      toast.success(`Admin marked as ${updatedAdmin.status}`);
    } catch (error) {
      console.error('Error toggling admin status:', error);
      toast.error('Failed to update admin status');
    }
  };

  const filteredAdmins = React.useMemo(() => {
    if (isLoading) return [];
    
    return salesAdmins.filter(admin => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        searchTerm === '' ||
        admin.name.toLowerCase().includes(searchLower) ||
        admin.email.toLowerCase().includes(searchLower) ||
        admin.phone.includes(searchTerm) ||
        admin.region.toLowerCase().includes(searchLower);
        
      const matchesStatus = filters.status === 'all' || admin.status === filters.status;
      const matchesRegion = filters.region === 'all' || admin.region === filters.region;
      
      return matchesSearch && matchesStatus && matchesRegion;
    });
  }, [salesAdmins, searchTerm, filters, isLoading]);

  // Using the REGIONS constant in the component
  const regionOptions = [...REGIONS];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Admins</h1>
            {/* Hidden for now
            <p className="text-gray-600 mt-1">Manage your sales administration team</p>
            */}
          </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddModal(true)}
              className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Sales Admin
            </motion.button>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search sales admins..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </button>
              
              {showFilters && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10 p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-gray-900">Filters</h3>
                    <button 
                      onClick={() => setShowFilters(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={filters.status}
                        onChange={(e) => setFilters({...filters, status: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                      <select
                        value={filters.region}
                        onChange={(e) => setFilters({...filters, region: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">All Regions</option>
                        {regionOptions.map(region => (
                          <option key={region} value={region}>{region}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFilters({ status: 'all', region: 'all' });
                          setSearchTerm('');
                        }}
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* No Results */}
            {filteredAdmins.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No sales admins found</p>
                {searchTerm || filters.status !== 'all' || filters.region !== 'all' ? (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilters({ status: 'all', region: 'all' });
                    }}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Clear all filters
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAdmins.map((admin) => (
            <motion.div
              key={admin.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-lg">
                      {admin.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{admin.name}</h3>
                    <p className="text-sm text-gray-500">{admin.region}</p>
                  </div>
                </div>
                <div className="relative">
                  <button 
                    type="button"
                    className="p-1 hover:bg-gray-100 rounded"
                    onClick={() => toggleStatus(admin.id, admin.status)}
                    title={admin.status === 'active' ? 'Deactivate' : 'Activate'}
                  >
                    {admin.status === 'active' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Email:</span>
                  <span className="text-gray-900">{admin.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Phone:</span>
                  <span className="text-gray-900">{admin.phone}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Team Size:</span>
                  <span className="text-gray-900">{admin.salesPersonsCount} sales persons</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Sales:</span>
                  <span className="text-gray-900 font-medium">₹{admin.totalSales.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    admin.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {admin.status}
                </span>
                <div className="flex space-x-2">
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(admin);
                    }}
                    className="p-1 hover:bg-gray-100 rounded text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(admin);
                    }}
                    className="p-1 hover:bg-red-50 rounded text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </>
  )}


        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
            <div className="bg-white rounded-lg p-4 w-full max-w-lg mx-auto">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold">
                  {editingAdmin ? 'Edit Sales Admin' : 'Add New Sales Admin'}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2" onSubmit={handleSubmit}>
                <div className="flex flex-col">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newAdmin.name}
                    onChange={handleInputChange}
                    className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Enter full name"
                    required
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>
                  )}
                </div>
                <div className="flex flex-col">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={newAdmin.email}
                    onChange={handleInputChange}
                    className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Enter email address"
                    required
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>
                  )}
                </div>
                <div className="flex flex-col">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={newAdmin.phone}
                    onChange={handleInputChange}
                    className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Enter phone number"
                    required
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.phone}</p>
                  )}
                </div>
                <div className="flex flex-col">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Region</label>
                  <select
                    name="region"
                    value={newAdmin.region}
                    onChange={handleInputChange}
                    className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  >
                    <option value="">Select a region</option>
                    <option value="North Region">North Region</option>
                    <option value="South Region">South Region</option>
                    <option value="East Region">East Region</option>
                    <option value="West Region">West Region</option>
                  </select>
                  {formErrors.region && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.region}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={newAdmin.password}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                      placeholder="Enter password"
                      required={!editingAdmin}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={newAdmin.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                      placeholder="Confirm password"
                      required={!editingAdmin}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {formErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded font-semibold shadow-sm text-xs transition-all duration-150
                      ${isSubmitting
                        ? 'bg-blue-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800'}
                      text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 min-w-[120px]`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-3 w-3 mr-1 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                        Saving...
                      </>
                    ) : editingAdmin ? (
                      <>
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        Update Admin
                      </>
                    ) : (
                      <>
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        Add Sales Admin
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        
        )}

        {/* Delete Confirmation Modal */}
        {adminToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
                <button
                  onClick={() => setAdminToDelete(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-medium">{adminToDelete.name}</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setAdminToDelete(null)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (adminToDelete) {
                      confirmDelete();
                      setAdminToDelete(null);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SuperAdminSalesAdmins;