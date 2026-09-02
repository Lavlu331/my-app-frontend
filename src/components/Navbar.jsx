import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import API from '../api';
import toast from 'react-hot-toast';

const Navbar = () => {
    const { cartItems } = useContext(CartContext);

    const wishlistContext = useContext(WishlistContext);
    const wishlist = wishlistContext ? wishlistContext.wishlist : [];

    const [showDropdown, setShowDropdown] = useState(false);
    const [showCartPreview, setShowCartPreview] = useState(false);
    const [categories, setCategories] = useState([]);

    // 🔍 Live Search States
    const [searchQuery, setSearchQuery] = useState('');
    const [allProducts, setAllProducts] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);

    const navigate = useNavigate();

    const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    
    // ✅ Safe localStorage Parse
    const rawUserInfo = localStorage.getItem('userInfo');
    let userInfo = null;
    try {
        userInfo = rawUserInfo ? JSON.parse(rawUserInfo) : null;
    } catch {
        localStorage.removeItem('userInfo');
    }

    // 🔒 Dynamic Admin Checking (Flat & Nested Object Support)
    const userRole = userInfo?.role || userInfo?.user?.role;
    const isAdmin = userInfo?.isAdmin || userInfo?.user?.isAdmin || userRole === 'admin';

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await API.get('/products');
                setAllProducts(res.data.products || res.data || []);
            } catch (err) {
                console.error('Failed to fetch search products:', err);
            }
        };
        fetchProducts();
        API.get('/categories').then(({ data }) => setCategories(data || [])).catch(() => setCategories([]));
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setSearchResults([]);
            setShowSearchDropdown(false);
        } else if (Array.isArray(allProducts)) {
            const filtered = allProducts.filter((p) =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setSearchResults(filtered);
            setShowSearchDropdown(true);
        }
    }, [searchQuery, allProducts]);

    const handleLogout = async () => {
        try {
            await API.post('/auth/logout');
        } catch (error) {
            console.error('Logout failed:', error);
        }
        localStorage.removeItem('userInfo');
        toast.success('Logged out successfully! 👋');
        setShowDropdown(false);
        navigate('/login');
    };

    const handleSelectProduct = (productId) => {
        setSearchQuery('');
        setShowSearchDropdown(false);
        navigate(`/product/${productId}`);
    };

    const handleSearchSubmit = (event) => {
        if (event.key === 'Enter' && searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
            setShowSearchDropdown(false);
        }
    };

    return (
        <nav className="bg-gray-900 text-white sticky top-0 z-50 shadow-lg border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
                <div className="flex justify-between items-center gap-4">

                    {/* Brand Logo */}
                    <Link to="/" className="text-2xl font-extrabold text-blue-400 tracking-wider flex items-center gap-1 shrink-0">
                        <span>Tech</span><span className="text-white">Store</span>
                    </Link>

                    {/* 🔍 LIVE SEARCH BAR (Desktop View) */}
                    <div className="relative flex-1 max-w-md mx-2 hidden md:block">
                        <input
                            type="text"
                            placeholder="Search products by name... 🔎"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearchSubmit}
                            className="w-full bg-gray-800 text-white placeholder-gray-400 px-4 py-2 rounded-xl text-sm border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        {/* Desktop Search Dropdown Results */}
                        {showSearchDropdown && (
                            <div className="absolute left-0 right-0 top-11 bg-white text-gray-800 rounded-xl shadow-2xl border border-gray-100 max-h-80 overflow-y-auto z-50 divide-y divide-gray-100">
                                {searchResults.length === 0 ? (
                                    <div className="p-4 text-center text-xs text-gray-500">
                                        No matching products found 🔍
                                    </div>
                                ) : (
                                    searchResults.map((product) => (
                                        <div
                                            key={product._id}
                                            onClick={() => handleSelectProduct(product._id)}
                                            className="p-3 hover:bg-blue-50 cursor-pointer flex items-center gap-3 transition"
                                        >
                                            <img
                                                src={product.image || 'https://placehold.co/100x100?text=Product'}
                                                alt={product.name}
                                                className="w-10 h-10 object-cover rounded-lg"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-xs text-gray-800 truncate">{product.name}</p>
                                                <p className="text-[10px] text-gray-500">{product.category || 'General'}</p>
                                            </div>
                                            <span className="font-bold text-xs text-blue-600 shrink-0">
                                                ৳{product.price}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Quick Links */}
                    <div className="hidden lg:flex gap-6 items-center font-semibold text-sm shrink-0">
                        <Link to="/" className="hover:text-blue-400 transition">Home</Link>
                        <Link to="/products" className="hover:text-blue-400 transition">Products</Link>
                        <div className="relative group">
                            <button className="hover:text-blue-400 transition">Categories ▾</button>
                            <div className="absolute left-0 top-6 hidden group-hover:block w-48 bg-white text-gray-800 rounded-xl shadow-xl py-2 border border-gray-100 z-50">
                                {categories.length ? categories.map((category) => <Link key={category._id} to={`/products?category=${encodeURIComponent(category.name)}`} className="block px-4 py-2 text-xs font-semibold hover:bg-blue-50">{category.name}</Link>) : <p className="px-4 py-2 text-xs text-gray-400">No categories</p>}
                            </div>
                        </div>
                        <Link to="/wishlist" className="hover:text-pink-400 transition">Wishlist</Link>

                        {/* Admin Link on Top Nav */}
                        {isAdmin && (
                            <Link to="/admin" className="hover:text-amber-400 text-amber-300 transition flex items-center gap-1">
                                <span>Admin 📊</span>
                            </Link>
                        )}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3 font-medium text-sm shrink-0">

                        {/* Wishlist Button */}
                        <Link to="/" className="relative hover:text-pink-400 transition flex items-center gap-1 bg-gray-800 px-3 py-1.5 rounded-xl border border-gray-700">
                            <span className="text-base">❤️</span>
                            {wishlist.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                                    {wishlist.length}
                                </span>
                            )}
                        </Link>

                        {/* Cart Button */}
                        <div className="relative">
                        <Link onMouseEnter={() => setShowCartPreview(true)} to="/cart" className="relative hover:text-blue-400 transition flex items-center gap-1 bg-gray-800 px-3 py-1.5 rounded-xl border border-gray-700">
                            <span className="text-base">🛒</span>
                            <span className="hidden sm:inline">Cart</span>
                            {totalCartCount > 0 && (
                                <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                                    {totalCartCount}
                                </span>
                            )}
                        </Link>
                        {showCartPreview && (
                            <div onMouseLeave={() => setShowCartPreview(false)} className="absolute right-0 top-10 w-72 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100 p-3 z-50">
                                <p className="font-bold text-sm mb-2">Cart ({totalCartCount})</p>
                                {cartItems.length ? <>{cartItems.slice(0, 3).map((item) => <div key={item.product} className="flex justify-between gap-3 text-xs py-1"><span className="truncate">{item.name} × {item.quantity}</span><span className="font-bold">৳{item.price * item.quantity}</span></div>)}<Link to="/cart" className="block text-center bg-blue-600 text-white font-bold text-xs py-2 rounded-lg mt-3">View Cart</Link></> : <p className="text-xs text-gray-500">Your cart is empty.</p>}
                            </div>
                        )}
                        </div>

                        {/* Auth User Dropdown */}
                        {userInfo ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl transition font-semibold"
                                >
                                    <div className="w-6 h-6 bg-white text-blue-600 rounded-full flex items-center justify-center text-xs font-bold uppercase">
                                        {userInfo.user?.name ? userInfo.user.name.charAt(0) : (userInfo.name ? userInfo.name.charAt(0) : 'U')}
                                    </div>
                                    <span className="hidden sm:inline max-w-[90px] truncate">{userInfo.user?.name || userInfo.name}</span>
                                    <span className="text-xs">▼</span>
                                </button>

                                {showDropdown && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-xl shadow-xl py-2 border border-gray-100 z-50">
                                        <div className="px-4 py-2 border-b">
                                            <p className="text-xs text-gray-400">Signed in as</p>
                                            <p className="text-sm font-bold truncate">{userInfo.user?.email || userInfo.email}</p>
                                        </div>
                                        
                                        <Link
                                            to="/profile"
                                            onClick={() => setShowDropdown(false)}
                                            className="block px-4 py-2 text-sm hover:bg-gray-50 transition"
                                        >
                                            👤 My Profile & Orders
                                        </Link>

                                        {/* ✅ Display Admin Links dynamically */}
                                        {isAdmin && (
                                            <>
                                                <Link
                                                    to="/admin"
                                                    onClick={() => setShowDropdown(false)}
                                                    className="block px-4 py-2 text-sm hover:bg-gray-50 transition text-amber-600 font-semibold"
                                                >
                                                    📊 Admin Dashboard
                                                </Link>
                                                <Link
                                                    to="/add-product"
                                                    onClick={() => setShowDropdown(false)}
                                                    className="block px-4 py-2 text-sm hover:bg-gray-50 transition text-blue-600 font-semibold"
                                                >
                                                    ➕ Add Product
                                                </Link>
                                            </>
                                        )}

                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition border-t mt-1"
                                        >
                                            🚪 Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <Link to="/login" className="border border-gray-600 text-xs px-3 py-2 rounded-xl hover:bg-gray-800 transition">
                                    Login
                                </Link>
                                <Link to="/register" className="bg-blue-600 text-xs px-3 py-2 rounded-xl hover:bg-blue-700 transition font-bold">
                                    Register
                                </Link>
                            </div>
                        )}

                    </div>
                </div>

                {/* 📱 LIVE SEARCH BAR (Mobile View) */}
                <div className="relative mt-2 md:hidden">
                    <input
                        type="text"
                        placeholder="Search products... 🔎"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearchSubmit}
                        className="w-full bg-gray-800 text-white placeholder-gray-400 px-3 py-1.5 rounded-xl text-xs border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* Mobile Search Dropdown Results */}
                    {showSearchDropdown && (
                        <div className="absolute left-0 right-0 top-10 bg-white text-gray-800 rounded-xl shadow-2xl border border-gray-100 max-h-60 overflow-y-auto z-50 divide-y divide-gray-100">
                            {searchResults.length === 0 ? (
                                <div className="p-3 text-center text-xs text-gray-500">
                                    No matching products found 🔍
                                </div>
                            ) : (
                                searchResults.map((product) => (
                                    <div
                                        key={product._id}
                                        onClick={() => handleSelectProduct(product._id)}
                                        className="p-2.5 hover:bg-blue-50 cursor-pointer flex items-center gap-3 transition"
                                    >
                                        <img
                                            src={product.image || 'https://placehold.co/100x100?text=Product'}
                                            alt={product.name}
                                            className="w-8 h-8 object-cover rounded-lg"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-xs text-gray-800 truncate">{product.name}</p>
                                            <p className="text-[10px] text-gray-500">{product.category || 'General'}</p>
                                        </div>
                                        <span className="font-bold text-xs text-blue-600 shrink-0">
                                            ৳{product.price}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

            </div>
        </nav>
    );
};

export default Navbar;
