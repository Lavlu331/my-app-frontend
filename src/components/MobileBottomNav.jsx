import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

const MobileBottomNav = () => {
    const { cartItems } = useContext(CartContext);
    const location = useLocation();

    const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    const isActive = (path) => location.pathname === path;

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-6 flex justify-between items-center z-50 shadow-lg">
            {/* Home */}
            <Link
                to="/"
                className={`flex flex-col items-center text-xs font-semibold ${isActive('/') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'
                    }`}
            >
                <span className="text-xl">🏠</span>
                <span>Home</span>
            </Link>

            {/* Cart */}
            <Link
                to="/cart"
                className={`flex flex-col items-center text-xs font-semibold relative ${isActive('/cart') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'
                    }`}
            >
                <span className="text-xl">🛒</span>
                <span>Cart</span>
                {totalCartCount > 0 && (
                    <span className="absolute -top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {totalCartCount}
                    </span>
                )}
            </Link>

            <Link
                to="/wishlist"
                className={`flex flex-col items-center text-xs font-semibold ${isActive('/wishlist') ? 'text-pink-600' : 'text-gray-500 hover:text-gray-800'}`}
            >
                <span className="text-xl">❤️</span>
                <span>Wishlist</span>
            </Link>

            {/* Admin */}
            <Link
                to="/admin"
                className={`flex flex-col items-center text-xs font-semibold ${isActive('/admin') ? 'text-amber-500' : 'text-gray-500 hover:text-gray-800'
                    }`}
            >
                <span className="text-xl">📊</span>
                <span>Admin</span>
            </Link>

            {/* Profile */}
            <Link
                to="/profile"
                className={`flex flex-col items-center text-xs font-semibold ${isActive('/profile') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'
                    }`}
            >
                <span className="text-xl">👤</span>
                <span>Profile</span>
            </Link>
        </div>
    );
};

export default MobileBottomNav;
