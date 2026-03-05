import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import MeasurementListPage from './pages/MeasurementListPage';
import MeasurementsPage from './pages/MeasurementsPage';
import BillingPage from './pages/BillingPage';
import OrdersPage from './pages/OrdersPage';
import HistoryPage from './pages/HistoryPage';
import { CustomerDetailsStep, MeasurementsStep, BillingStep } from './pages/NewOrderFlow';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Layout>{children}</Layout> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/measurements" element={<ProtectedRoute><MeasurementListPage /></ProtectedRoute>} />
        <Route path="/measurements/new" element={<ProtectedRoute><MeasurementsPage /></ProtectedRoute>} />
        <Route path="/measurements/:id" element={<ProtectedRoute><MeasurementsPage /></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute><BillingPage /></ProtectedRoute>} />
        <Route path="/billing/:id" element={<ProtectedRoute><BillingPage /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />

        {/* New Customer 3-Step Flow */}
        <Route path="/new-order/customer" element={<ProtectedRoute><CustomerDetailsStep /></ProtectedRoute>} />
        <Route path="/new-order/measurements" element={<ProtectedRoute><MeasurementsStep /></ProtectedRoute>} />
        <Route path="/new-order/billing" element={<ProtectedRoute><BillingStep /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
