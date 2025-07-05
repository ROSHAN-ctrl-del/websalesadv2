import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import {
  LayoutDashboard,
  Users,
  Package,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  UserCheck,
  ShoppingCart,
  ListTodo,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  // Safely get socket context with default empty notifications
  const socketContext = useSocket();
  const notifications = socketContext?.notifications || [];
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const superAdminNavItems = [
    { path: '/super-admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/super-admin/sales-admins', icon: UserCheck, label: 'Sales Admins' },
    { path: '/super-admin/stock', icon: Package, label: 'Stock Management' },
    { path: '/super-admin/reports', icon: BarChart3, label: 'Reports' },
    { path: '/super-admin/settings', icon: Settings, label: 'Settings' },
  ];

  const salesAdminNavItems = [
    { path: '/sales-admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/sales-admin/team', icon: Users, label: 'My Team' },
    { path: '/sales-admin/manage-tasks', icon: ListTodo, label: 'Manage Tasks' },
    { path: '/sales-admin/customers', icon: ShoppingCart, label: 'Shops' },
    { path: '/sales-admin/reports', icon: BarChart3, label: 'Reports' },
  ];

  // Ensure we always have a default set of navigation items
  const getNavItems = () => {
    if (!user) return [];
    return user.role === 'super_admin' ? superAdminNavItems : salesAdminNavItems;
  };
  
  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
    navigate(`/${user?.role?.replace('_', '-')}/login`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col h-screen sticky top-0">
          {/* Logo/Brand */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="p-4 border-b border-gray-200"
          >
            <h1 className="text-xl font-bold text-gray-800">
              {user?.role === 'super_admin' ? 'Super Admin' : 'Sales Admin'}
            </h1>
          </motion.div>
          
          {/* Profile Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="p-4 border-b border-gray-200 flex flex-col items-center"
          >
            <div className="relative mb-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <h3 className="font-semibold text-gray-800">{user?.name || 'User'}</h3>
            <p className="text-sm text-gray-500">{user?.email || 'user@example.com'}</p>
          </motion.div>
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className="md:hidden">
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h1 className="text-xl font-bold text-gray-800">
                    {user?.role === 'super_admin' ? 'Super Admin' : 'Sales Admin'}
                  </h1>
                  <p className="text-xs text-gray-500">Welcome back!</p>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 rounded-md text-gray-500 hover:bg-gray-100"
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Profile Section */}
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="hidden md:block">
                      <p className="text-sm font-medium text-gray-700">{user?.name || 'User'}</p>
                      <p className="text-xs text-gray-500">{user?.email?.split('@')[0] || 'user'}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-800">{user?.name || 'User'}</h3>
                    <p className="text-xs text-gray-500">{user?.email?.split('@')[0] || 'user'}</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <header className="bg-white border-b border-gray-200 z-10">
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-md text-gray-500 hover:bg-gray-100 md:hidden"
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>
              <h1 className="ml-2 text-lg font-medium text-gray-900">
                {navItems.find((item) => item.path === location.pathname)?.label || 'Dashboard'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-500 rounded-full hover:bg-gray-100 relative"
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </motion.button>
                
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 py-1 z-50"
                    >
                      <div className="px-4 py-2 border-b">
                        <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                                !notification.read ? 'bg-blue-50' : ''
                              }`}
                              onClick={() => {
                                // Handle notification click
                                setShowNotifications(false);
                              }}
                            >
                              <p className="text-sm text-gray-900">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(notification.timestamp).toLocaleString()}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-4 text-center text-sm text-gray-500">
                            No new notifications
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="relative">
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 rounded-full hover:bg-gray-100"
                  aria-label="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto focus:outline-none p-2 md:p-4 bg-gray-100">
          {children}
        </main>
      </motion.div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Layout;