import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import Skeleton from '../components/Skeleton';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // ব্যানার স্টেট
    const [banner, setBanner] = useState({ imageUrl: '', buttonLink: '/products' });

    const { wishlist, toggleWishlist } = useContext(WishlistContext);
    const context = useContext(CartContext);
    const addToCart = context ? context.addToCart : () => { };

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                // প্রোডাক্ট এবং ব্যানার একসাথে ফেচ করা
                const [productRes, bannerRes, categoryRes] = await Promise.all([
                    API.get('/products'),
                    API.get('/banner').catch(() => ({ data: null })),
                    API.get('/categories').catch(() => ({ data: [] }))
                ]);

                const productList = productRes.data.products || productRes.data;
                setProducts(Array.isArray(productList) ? productList : []);
                setCategories(Array.isArray(categoryRes.data) ? categoryRes.data : []);

                if (bannerRes && bannerRes.data) {
                    setBanner(bannerRes.data);
                }
            } catch (err) {
                console.error('Failed to fetch home data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchHomeData();
    }, []);

    const featuredProducts = products.filter((product) => product.isFeatured).slice(0, 6);
    const newArrivals = [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-10">

            {/* DYNAMIC PHOTOSHOP BANNER SECTION */}
            {banner.imageUrl ? (
                <div className="rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl">
                    <a href={banner.buttonLink || '/products'}>
                        <img 
                            src={banner.imageUrl} 
                            alt="Promotional Banner" 
                            className="w-full h-[220px] sm:h-[320px] md:h-[400px] object-cover"
                        />
                    </a>
                </div>
            ) : (
                /* ডিফল্ট ফলব্যাক ব্যানার */
                <div className="relative bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 text-white rounded-2xl p-8 md:p-12 shadow-xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-4 max-w-xl text-center md:text-left z-10">
                        <span className="bg-amber-400 text-gray-900 font-bold text-xs uppercase px-3 py-1 rounded-full tracking-wide">
                            🔥 Mega Sale - Up to 40% OFF
                        </span>
                        <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
                            Upgrade Your Tech Gear Today!
                        </h1>
                        <p className="text-gray-200 text-sm md:text-base">
                            Discover premium gadgets, smartphones, and accessories with official warranty and fastest home delivery.
                        </p>
                        <a
                            href="/products"
                            className="inline-block bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold px-6 py-3 rounded-xl shadow-lg transition transform hover:-translate-y-0.5"
                        >
                            Shop Now 🛒
                        </a>
                    </div>
                </div>
            )}

            {/* VALUE PROPS BAR */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">🚚</span>
                    <div>
                        <h4 className="font-bold text-gray-800 text-sm">Free Shipping</h4>
                        <p className="text-xs text-gray-500">On orders over ৳2,000</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-3xl">⚡</span>
                    <div>
                        <h4 className="font-bold text-gray-800 text-sm">Fast Delivery</h4>
                        <p className="text-xs text-gray-500">Within 24-48 Hours</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-3xl">🔒</span>
                    <div>
                        <h4 className="font-bold text-gray-800 text-sm">Secure Payment</h4>
                        <p className="text-xs text-gray-500">100% Safe Checkout</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-3xl">🔄</span>
                    <div>
                        <h4 className="font-bold text-gray-800 text-sm">7 Days Return</h4>
                        <p className="text-xs text-gray-500">Hassle free policy</p>
                    </div>
                </div>
            </div>

            {categories.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-4"><h2 className="text-2xl font-extrabold text-gray-800">Shop by Category</h2><Link to="/products" className="text-sm font-bold text-blue-600">View all →</Link></div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {categories.slice(0, 10).map((category) => <Link key={category._id} to={`/products?category=${encodeURIComponent(category.name)}`} className="bg-white border border-gray-100 hover:border-blue-300 hover:text-blue-600 rounded-2xl p-4 text-center text-sm font-bold transition">{category.name}</Link>)}
                    </div>
                </section>
            )}

            {!loading && newArrivals.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-4"><h2 className="text-2xl font-extrabold text-gray-800">New Arrivals</h2><Link to="/products?search=" className="text-sm font-bold text-blue-600">View all →</Link></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{newArrivals.map((product) => <Link key={product._id} to={`/product/${product._id}`} className="bg-white rounded-2xl border border-gray-100 p-3 hover:shadow-md transition"><img src={product.image || 'https://placehold.co/300x220?text=Product'} alt={product.name} className="w-full h-32 object-cover rounded-xl" /><p className="font-bold text-sm text-gray-800 mt-2 line-clamp-1">{product.name}</p><p className="font-extrabold text-blue-600 text-sm">৳{product.price}</p></Link>)}</div>
                </section>
            )}

            {/* Featured products */}
            <div id="products">
                <div className="w-full">
                    <div className="flex items-center justify-between mb-4"><h2 className="text-2xl font-extrabold text-gray-800">{featuredProducts.length ? 'Featured Products' : 'Popular Products'}</h2><Link to="/products" className="text-sm font-bold text-blue-600">View all →</Link></div>
                    {loading ? (
                        <Skeleton />
                    ) : products.length === 0 ? (
                        <div className="bg-white p-8 rounded-2xl text-center text-gray-500 shadow-sm border border-gray-100">
                            No products found matching your filter criteria! 🔍
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(featuredProducts.length ? featuredProducts : products.slice(0, 6)).map((product, index) => {
                                // ১. ডাটাবেজ থেকে আসা মূল প্রাইস ও বর্তমান বিক্রি মূল্য
                                const currentPrice = product.price; // বর্তমান দাম (যেমন: ১৫০০)
                                const originalPrice = product.originalPrice; // আসল দাম (যেমন: ১৮০০ বা ১০০০)
                                
                                // ২. ডিসকাউন্ট পার্সেন্টেজ হিসাব (যদি আসল দাম বেশি থাকে)
                                const hasDiscount = originalPrice && originalPrice > currentPrice;
                                const discountPercent = hasDiscount 
                                    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) 
                                    : 0;

                                const isOutOfStock = product.countInStock !== undefined && product.countInStock <= 0;
                                const displayCategory = product.category && typeof product.category === 'object'
                                    ? product.category.name
                                    : (product.category || 'General');

                                return (
                                    <div key={product._id || product.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition p-4 flex flex-col justify-between border border-gray-100 group relative">

                                        <div className="absolute top-6 left-6 z-10 flex flex-col gap-1">
                                            {isOutOfStock ? (
                                                <span className="bg-red-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-md shadow-sm uppercase">
                                                    Out of Stock ❌
                                                </span>
                                            ) : hasDiscount ? (
                                                <span className="bg-red-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-md shadow-sm uppercase">
                                                    -{discountPercent}% OFF
                                                </span>
                                            ) : index % 2 === 0 ? (
                                                <span className="bg-emerald-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-md shadow-sm uppercase">
                                                    HOT 🔥
                                                </span>
                                            ) : null}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleWishlist(product);
                                            }}
                                            className="absolute top-6 right-6 z-10 bg-white/90 backdrop-blur p-2 rounded-full shadow-sm hover:scale-110 transition duration-200 cursor-pointer"
                                        >
                                            {wishlist && wishlist.some((item) => item._id === product._id) ? '❤️' : '🤍'}
                                        </button>

                                        <div>
                                            <Link to={`/product/${product._id || product.id}`}>
                                                <div className="overflow-hidden rounded-xl mb-3 relative bg-gray-50">
                                                    <img
                                                        src={product.image || 'https://placehold.co/600x400?text=Product'}
                                                        alt={product.name}
                                                        className={`w-full h-48 object-cover group-hover:scale-105 transition duration-300 ${isOutOfStock ? 'opacity-50' : ''}`}
                                                    />
                                                </div>
                                                <h2 className="text-base font-bold text-gray-800 hover:text-blue-600 transition line-clamp-1 mb-1">
                                                    {product.name}
                                                </h2>
                                            </Link>

                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2.5 py-0.5 rounded-full font-medium">
                                                    {displayCategory}
                                                </span>
                                                <span className="text-amber-500 text-xs font-bold">
                                                    ★ {product.rating ? product.rating.toFixed(1) : '4.5'}
                                                </span>
                                                {!isOutOfStock && product.countInStock !== undefined && (
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${product.countInStock <= 5 ? 'text-amber-700 bg-amber-50' : 'text-emerald-600 bg-emerald-50'}`}>
                                                        {product.countInStock <= 5 ? `Only ${product.countInStock} left` : `Stock: ${product.countInStock}`}
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-gray-500 text-xs line-clamp-2">{product.description}</p>
                                        </div>

                                        <div className="mt-4 flex justify-between items-center pt-3 border-t border-gray-50">
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    {/* বর্তমান বিক্রয় মূল্যে টেক্সট দেখানো */}
                                                    <span className="text-xl font-extrabold text-blue-600">৳{currentPrice}</span>
                                                    {/* অরিজিনাল প্রাইস যদি বর্তমান দামের থেকে বেশি হয় তবেই শুধু কেটে দিয়ে দেখাবে */}
                                                    {hasDiscount && (
                                                        <span className="text-xs text-gray-400 line-through">৳{originalPrice}</span>
                                                    )}
                                                </div>
                                            </div>

                                            <button
                                                disabled={isOutOfStock}
                                                className={`px-3 py-2 rounded-xl transition font-bold text-xs shadow-sm flex items-center gap-1 ${isOutOfStock
                                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                                    }`}
                                                onClick={() => addToCart(product)}
                                            >
                                                <span>{isOutOfStock ? 'Out of Stock' : 'Add'}</span> {!isOutOfStock && '🛒'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Home;
