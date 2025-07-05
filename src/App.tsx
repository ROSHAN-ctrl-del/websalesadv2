import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import SuperAdminLogin from './pages/auth/SuperAdminLogin';
import SalesAdminLogin from './pages/auth/SalesAdminLogin';
import SuperAdminDashboard from './pages/super-admin/Dashboard';
import SuperAdminSalesAdmins from './pages/super-admin/SalesAdmins';
import SuperAdminStock from './pages/super-admin/Stock';
import SuperAdminReports from './pages/super-admin/Reports';
import SuperAdminSettings from './pages/super-admin/Settings';
import SalesAdminDashboard from './pages/sales-admin/Dashboard';
import SalesAdminTeam from './pages/sales-admin/Team';
import SalesAdminCustomers from './pages/sales-admin/Customers';
import SalesAdminReports from './pages/sales-admin/Reports';
import SalesAdminManageTasks from './pages/sales-admin/ManageTasks';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/super-admin/login" />} />
              
              {/* Authentication Routes */}
              <Route path="/super-admin/login" element={<SuperAdminLogin />} />
              <Route path="/sales-admin/login" element={<SalesAdminLogin />} />
              
              {/* Super Admin Routes */}
              <Route path="/super-admin" element={
                <Navigate to="/super-admin/dashboard" replace />
              } />
              <Route path="/super-admin/dashboard" element={
                <ProtectedRoute role="super_admin">
                  <SuperAdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/super-admin/sales-admins" element={
                <ProtectedRoute role="super_admin">
                  <SuperAdminSalesAdmins />
                </ProtectedRoute>
              } />
              <Route path="/super-admin/stock" element={
                <ProtectedRoute role="super_admin">
                  <SuperAdminStock />
                </ProtectedRoute>
              } />
              <Route path="/super-admin/reports" element={
                <ProtectedRoute role="super_admin">
                  <SuperAdminReports />
                </ProtectedRoute>
              } />
              <Route path="/super-admin/settings" element={
                <ProtectedRoute role="super_admin">
                  <SuperAdminSettings />
                </ProtectedRoute>
              } />
              
              {/* Sales Admin Routes */}
              <Route path="/sales-admin/dashboard" element={
                <ProtectedRoute role="sales_admin">
                  <SalesAdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/sales-admin/team" element={
                <ProtectedRoute role="sales_admin">
                  <SalesAdminTeam />
                </ProtectedRoute>
              } />
              <Route path="/sales-admin/customers" element={
                <ProtectedRoute role="sales_admin">
                  <SalesAdminCustomers />
                </ProtectedRoute>
              } />
              <Route path="/sales-admin/reports" element={
                <ProtectedRoute role="sales_admin">
                  <SalesAdminReports />
                </ProtectedRoute>
              } />
              <Route path="/sales-admin/manage-tasks" element={
                <ProtectedRoute role="sales_admin">
                  <SalesAdminManageTasks />
                </ProtectedRoute>
              } />
            </Routes>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;