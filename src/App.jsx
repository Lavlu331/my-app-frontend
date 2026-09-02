import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import AdminRoute from './components/AdminRoute'; 
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import AddProduct from './pages/AddProduct';
import ProductDetails from './pages/ProductDetails';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import WhatsAppButton from './components/WhatsAppButton';
import Checkout from './pages/Checkout';
import Products from './pages/Products';
import InfoPage from './pages/InfoPage';
import Wishlist from './pages/Wishlist';
import NotFound from './pages/NotFound';
import BackToTop from './components/BackToTop';
function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />

      <div className="min-h-screen bg-gray-100 flex flex-col justify-between">
        <div>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/about" element={<InfoPage type="about" />} />
            <Route path="/privacy-policy" element={<InfoPage type="privacy" />} />
            <Route path="/terms" element={<InfoPage type="terms" />} />
            <Route path="/return-policy" element={<InfoPage type="returns" />} />

            
            {/* 🔒 Protected Routes (Admins Only) */}
            <Route
              path="/add-product"
              element={
                <AdminRoute>
                  <AddProduct />
                </AdminRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Footer />
        <WhatsAppButton />
        <MobileBottomNav />
        <BackToTop />
      </div>
    </Router>
  );
}

export default App;
