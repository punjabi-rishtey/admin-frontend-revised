// App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "./components/layout/Layout";
import Login from "./components/pages/Login";
import Dashboard from "./components/pages/Dashboard";
import Users from "./components/pages/Users";
import UserDetail from "./components/pages/UserDetail";
import Testimonials from "./components/pages/Testimonials";
import Analytics from "./components/pages/Analytics";
import CustomerSupport from "./components/pages/CustomerSupport";
import PaymentRequests from "./components/pages/PaymentRequests";
import MembershipPlans from "./components/pages/MembershipPlans";
import Coupons from "./components/pages/Coupons";
import Messages from "./components/pages/Messages";
import Reviews from "./components/pages/Reviews";
import QRCode from "./components/pages/QRCode";
import AddUser from "./components/pages/AddUser";
import EditUserPage from "./components/pages/EditUser";
// import Utility from './components/pages/Utility';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login setIsAuthenticated={setIsAuthenticated} />
            )
          }
        />

        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Layout setIsAuthenticated={setIsAuthenticated} />
            ) : (
              <Navigate to="/login" />
            )
          }
        >
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="users/:id" element={<UserDetail />} />
          <Route path="testimonials" element={<Testimonials />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="support" element={<CustomerSupport />} />
          <Route path="payments" element={<PaymentRequests />} />
          <Route path="membership" element={<MembershipPlans />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="messages" element={<Messages />} />
          <Route path="reviews" element={<Reviews />} />
          {/* <Route path="utility" element={<Utility />} /> */}
          <Route path="qr" element={<QRCode />} />
          <Route path="add-user" element={<AddUser />} />
          <Route path="edit-user/:id" element={<EditUserPage />} />

          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
