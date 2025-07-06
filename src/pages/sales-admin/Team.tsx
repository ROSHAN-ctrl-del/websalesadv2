import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Plus, Search, MapPin, Phone, Mail, MoreVertical, Edit, Trash2, X, Loader2, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  getTeamMembers, 
  addTeamMember, 
  updateTeamMember, 
  deleteTeamMember, 
  toggleTeamMemberStatus,
  TeamMember as TeamMemberType
} from '../../services/teamService';

type TeamMember = TeamMemberType;

interface FormData {
  name: string;
  email: string;
  phone: string;
  region: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  region?: string;
  password?: string;
  confirmPassword?: string;
}

const SalesAdminTeam = () => {
  const [salesPersons, setSalesPersons] = useState<TeamMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showMenuId, setShowMenuId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    region: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});

  // Save to localStorage whenever salesPersons changes
  useEffect(() => {
    localStorage.setItem('salesTeam', JSON.stringify(salesPersons));
  }, [salesPersons]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const data = await getTeamMembers();
        setSalesPersons(data);
      } catch (error) {
        console.error('Error loading team data:', error);
        toast.error('Failed to load team data');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData.region) {
      newErrors.region = 'Region is required';
    }

    // Password validation (required for new users, optional for editing)
    if (!editingId) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else if (formData.password) {
      // If editing and password is provided, validate it
      if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      if (editingId) {
        // Update existing team member
        const updateData: any = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          region: formData.region,
          lastActivity: new Date().toISOString()
        };

        // Only include password if it's provided
        if (formData.password) {
          updateData.password = formData.password;
        }

        const updatedMember = await updateTeamMember(editingId, updateData);
        
        setSalesPersons(prev => 
          prev.map(person => 
            person.id === editingId ? updatedMember : person
          )
        );
        toast.success('Team member updated successfully');
      } else {
        // Add new team member
        const newMember = await addTeamMember({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          region: formData.region,
          password: formData.password,
          status: 'active',
          currentLocation: 'Office',
          totalSales: 0,
          dealsCount: 0
        });
        
        setSalesPersons(prev => [newMember, ...prev]);
        toast.success('Team member added successfully');
      }
      
      // Reset form and close modal
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving team member:', error);
      toast.error('Failed to save team member');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      region: '',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
    setEditingId(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // Handle edit
  const handleEdit = (person: TeamMember) => {
    setFormData({
      name: person.name,
      email: person.email,
      phone: person.phone,
      region: person.region,
      password: '',
      confirmPassword: ''
    });
    setEditingId(person.id);
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      try {
        await deleteTeamMember(id);
        setSalesPersons(prev => prev.filter(person => person.id !== id));
        toast.success('Team member deleted successfully');
      } catch (error) {
        console.error('Error deleting team member:', error);
        toast.error('Failed to delete team member');
      }
    }
  };

  // Toggle status
  const toggleStatus = async (id: string, currentStatus: 'active' | 'inactive') => {
    try {
      const updatedMember = await toggleTeamMemberStatus(id, currentStatus);
      setSalesPersons(prev => 
        prev.map(person => 
          person.id === id ? updatedMember : person
        )
      );
      toast.success(`Team member marked as ${updatedMember.status}`);
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update team member status');
    }
   };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showMenuId) {
        setShowMenuId(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showMenuId]);

  // Open add modal
  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  // Filter team members based on search term
  const filteredPersons = salesPersons.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="container mx-auto p-2 md:p-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h1 className="text-xl font-bold text-gray-800">My Team</h1>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openAddModal}
            className="flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors whitespace-nowrap"
            disabled={isLoading}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Sales Person
          </motion.button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredPersons.map((person) => (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-lg">
                      {person.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{person.name}</h3>
                    <p className="text-sm text-gray-500">{person.region} Region</p>
                  </div>
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setShowMenuId(showMenuId === person.id ? null : person.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                    aria-label="More options"
                  >
                    <MoreVertical className="h-4 w-4 text-gray-400" />
                  </button>
                  
                  {/* Dropdown menu */}
                  {showMenuId === person.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                      <div className="py-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(person);
                            setShowMenuId(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStatus(person.id, person.status);
                            setShowMenuId(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          {person.status === 'active' ? (
                            <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                          ) : (
                            <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                          )}
                          Mark as {person.status === 'active' ? 'Inactive' : 'Active'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(person.id);
                            setShowMenuId(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {person.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {person.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  Currently at {person.currentLocation}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">₹{person.totalSales.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-500">Total Sales</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{person.dealsCount}</p>
                  <p className="text-xs text-gray-500">Deals Closed</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  person.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {person.status}
                </span>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEdit(person)}
                    className="p-1 hover:bg-gray-100 rounded"
                    aria-label="Edit"
                  >
                    <Edit className="h-4 w-4 text-gray-400 hover:text-green-600" />
                  </button>
                  <button 
                    onClick={() => handleDelete(person.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-red-400 hover:text-red-600" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
            >
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="bg-white rounded-lg p-6 w-full max-w-md relative"
              >
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
                
                <h2 className="text-xl font-bold mb-4">
                  {editingId ? 'Edit Team Member' : 'Add New Team Member'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                      placeholder="Enter full name"
                      disabled={isSubmitting}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                      placeholder="Enter email address"
                      disabled={isSubmitting}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                      placeholder="Enter phone number"
                      disabled={isSubmitting}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned Region <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="region"
                      value={formData.region}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${
                        errors.region ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                      disabled={isSubmitting}
                    >
                      <option value="">Select region</option>
                      <option value="Downtown">Downtown</option>
                      <option value="Suburbs">Suburbs</option>
                      <option value="Industrial">Industrial</option>
                      <option value="Retail">Retail</option>
                    </select>
                    {errors.region && (
                      <p className="mt-1 text-sm text-red-600">{errors.region}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password {!editingId && <span className="text-red-500">*</span>}
                      {editingId && <span className="text-gray-500 text-xs">(Leave blank to keep current)</span>}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border ${
                          errors.password ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10`}
                        placeholder={editingId ? "Leave blank to keep current" : "Enter password"}
                        disabled={isSubmitting}
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
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password {!editingId && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border ${
                          errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10`}
                        placeholder="Confirm password"
                        disabled={isSubmitting}
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
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center min-w-[100px]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : editingId ? (
                        'Update'
                      ) : (
                        'Add Member'
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default SalesAdminTeam;