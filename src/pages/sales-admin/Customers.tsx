import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout';
import { Plus, Search, Filter, Building, Phone, Mail, MapPin, X, Edit, Trash2, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { searchTeamMembers } from '../../services/teamService';

interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
  status: 'active' | 'inactive' | 'potential';
  assignedTo: string;
  items?: ShopItem[];
}

interface ShopItem {
  id: string;
  name: string;
  quantity: number;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
}

const SalesAdminCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: '1',
      name: 'John Doe',
      company: 'TechCorp Solutions',
      email: 'john.doe@techcorp.com',
      phone: '+1-555-0301',
      address: '123 Tech Street, San Francisco, CA',
      totalOrders: 15,
      totalSpent: 25000,
      lastOrder: '2024-01-10T10:30:00Z',
      status: 'active',
      assignedTo: 'Alice Johnson',
    },
    {
      id: '2',
      name: 'Sarah Wilson',
      company: 'RetailMax Inc',
      email: 'sarah.wilson@retailmax.com',
      phone: '+1-555-0302',
      address: '456 Commerce Ave, New York, NY',
      totalOrders: 8,
      totalSpent: 12000,
      lastOrder: '2024-01-12T14:15:00Z',
      status: 'active',
      assignedTo: 'Bob Smith',
    },
    {
      id: '3',
      name: 'Mike Chen',
      company: 'StartupXYZ',
      email: 'mike.chen@startupxyz.com',
      phone: '+1-555-0303',
      address: '789 Innovation Blvd, Austin, TX',
      totalOrders: 0,
      totalSpent: 0,
      lastOrder: '',
      status: 'potential',
      assignedTo: 'Charlie Brown',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    assignedTo: ''
  });
  const [items, setItems] = useState<ShopItem[]>([
    { id: '1', name: '', quantity: 1 }
  ]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  const [teamSearchTerm, setTeamSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside handler for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowTeamDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || customer.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'potential':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.company || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingCustomer) {
      // Update existing customer
      setCustomers(prev => prev.map(customer => 
        customer.id === editingCustomer.id 
          ? { ...customer, ...formData, items }
          : customer
      ));
      toast.success('Shop updated successfully');
    } else {
      // Add new customer
      const newCustomer: Customer = {
        id: Date.now().toString(),
        ...formData,
        totalOrders: 0,
        totalSpent: 0,
        lastOrder: '',
        status: 'potential' as const,
        items
      };
      setCustomers(prev => [newCustomer, ...prev]);
      toast.success('Shop added successfully');
    }

    resetForm();
    setShowAddModal(false);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      company: customer.company,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      assignedTo: customer.assignedTo
    });
    setItems(customer.items || [{ id: '1', name: '', quantity: 1 }]);
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this shop?')) {
      setCustomers(prev => prev.filter(customer => customer.id !== id));
      toast.success('Shop deleted successfully');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      address: '',
      assignedTo: ''
    });
    setItems([{ id: '1', name: '', quantity: 1 }]);
    setEditingCustomer(null);
  };

  // Search team members
  const searchTeamMembersHandler = async (query: string) => {
    try {
      const results = await searchTeamMembers(query);
      setTeamMembers(results);
    } catch (error) {
      console.error('Error searching team members:', error);
    }
  };

  // Handle team member selection
  const handleTeamMemberSelect = (member: TeamMember) => {
    setFormData(prev => ({
      ...prev,
      assignedTo: member.name
    }));
    setShowTeamDropdown(false);
    setTeamSearchTerm('');
  };

  // Handle item changes
  const handleItemChange = (id: string, field: 'name' | 'quantity', value: string | number) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // Add new item
  const addItem = () => {
    const newItem: ShopItem = {
      id: Date.now().toString(),
      name: '',
      quantity: 1
    };
    setItems(prev => [...prev, newItem]);
  };

  // Remove item
  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shop Management</h1>
            <p className="text-gray-600 mt-1">Manage your shop relationships and track interactions</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddModal(true)}
            className="mt-4 sm:mt-0 bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Shop
          </motion.button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search shops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="potential">Potential</option>
            </select>
          </div>
        </div>

        {/* Customer Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Shops</p>
                <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Shops</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.filter(c => c.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Building className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Potential Shops</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.filter(c => c.status === 'potential').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCustomers.map((customer) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">{customer.name}</h3>
                    <p className="text-xs text-gray-600 mb-2 truncate">{customer.company}</p>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(customer.status)}`}>
                        {customer.status}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {customer.totalOrders} orders
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-1 ml-2">
                    <button 
                      onClick={() => handleEdit(customer)}
                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-all duration-200"
                      title="Edit"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(customer.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all duration-200"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                {/* Contact Info */}
                <div className="space-y-2">
                  <div className="flex items-center text-xs text-gray-600 bg-gray-50 px-2 py-1.5 rounded">
                    <Mail className="h-3 w-3 mr-2 text-gray-400 flex-shrink-0" />
                    <span className="truncate font-medium">{customer.email}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-600 bg-gray-50 px-2 py-1.5 rounded">
                    <Phone className="h-3 w-3 mr-2 text-gray-400 flex-shrink-0" />
                    <span className="font-medium">{customer.phone}</span>
                  </div>
                  {customer.address && (
                    <div className="flex items-start text-xs text-gray-600 bg-gray-50 px-2 py-1.5 rounded">
                      <MapPin className="h-3 w-3 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                      <span className="line-clamp-1">{customer.address}</span>
                    </div>
                  )}
                </div>

                {/* Assigned To */}
                <div className="flex items-center text-xs bg-blue-50 px-2 py-1.5 rounded">
                  <span className="text-blue-600 mr-1 font-medium">Assigned:</span>
                  <span className="font-semibold text-blue-800 truncate">{customer.assignedTo || 'Unassigned'}</span>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700">Items</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                      {customer.items?.length || 0}
                    </span>
                  </div>
                  {customer.items && customer.items.length > 0 ? (
                    <div className="space-y-1">
                      {customer.items.slice(0, 2).map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-xs bg-green-50 px-2 py-1 rounded border border-green-100">
                          <span className="text-green-800 font-medium truncate">{item.name}</span>
                          <span className="text-green-600 font-bold bg-green-100 px-1 py-0.5 rounded text-xs">x{item.quantity}</span>
                        </div>
                      ))}
                      {customer.items.length > 2 && (
                        <div className="text-xs text-gray-500 text-center py-1 bg-gray-50 rounded border border-gray-100">
                          +{customer.items.length - 2} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 text-center py-1.5 bg-gray-50 rounded border border-gray-100">
                      <div className="flex items-center justify-center">
                        <Building className="h-3 w-3 mr-1 text-gray-300" />
                        No items
                      </div>
                    </div>
                  )}
                </div>

                {/* Financial Info */}
                <div className="pt-2 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white rounded p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600 font-medium">Total Spent</span>
                    <span className="text-sm font-bold text-gray-900">
                      ₹{customer.totalSpent.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {customer.lastOrder && (
                    <div className="text-xs text-gray-500 flex items-center">
                      <span className="mr-1">Last:</span>
                      <span className="font-medium">{new Date(customer.lastOrder).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add Customer Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 w-full max-w-sm">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold">
                  {editingCustomer ? 'Edit Shop' : 'Add New Shop'}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Owner Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Owner name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Shop Name *
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Shop name"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Email address"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Phone number"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Shop location"
                  />
                </div>
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Assigned To
                  </label>
                  <div className="relative" ref={dropdownRef}>
                    <input
                      type="text"
                      value={formData.assignedTo}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, assignedTo: e.target.value }));
                        setTeamSearchTerm(e.target.value);
                        if (e.target.value.length > 0) {
                          searchTeamMembersHandler(e.target.value);
                          setShowTeamDropdown(true);
                        } else {
                          setShowTeamDropdown(false);
                        }
                      }}
                      onFocus={() => {
                        if (formData.assignedTo.length > 0) {
                          searchTeamMembersHandler(formData.assignedTo);
                          setShowTeamDropdown(true);
                        }
                      }}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Search team members..."
                    />
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                  </div>
                  
                  {/* Team Members Dropdown */}
                  {showTeamDropdown && teamMembers.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-auto">
                      {teamMembers.map((member) => (
                        <div
                          key={member.id}
                          onClick={() => handleTeamMemberSelect(member)}
                          className="px-2 py-1.5 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 text-sm"
                        >
                          <div className="font-medium text-gray-900">{member.name}</div>
                          <div className="text-xs text-gray-500">{member.email}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Items Section */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Items
                  </label>
                  <div className="space-y-2">
                    {items.map((item, index) => (
                      <div key={item.id} className="flex gap-2 items-center">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Item name"
                          />
                        </div>
                        <div className="w-20">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Qty"
                            min="1"
                          />
                        </div>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addItem}
                      className="flex items-center gap-1 text-green-600 hover:text-green-700 text-xs font-medium"
                    >
                      <Plus className="w-3 h-3" />
                      Add More Items
                    </button>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    {editingCustomer ? 'Update Shop' : 'Add Shop'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SalesAdminCustomers;