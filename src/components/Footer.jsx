import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300 mt-16 border-t border-gray-800 pb-16 md:pb-0">
            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">

                {/* Brand Details */}
                <div>
                    <h2 className="text-2xl font-bold text-blue-400 mb-3">TechStore</h2>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        Your one-stop destination for modern tech products, gadgets, and accessories.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Quick Links</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/" className="hover:text-blue-400 transition">Home</Link></li>
                        <li><Link to="/cart" className="hover:text-blue-400 transition">Shopping Cart</Link></li>
                        <li><Link to="/profile" className="hover:text-blue-400 transition">My Profile</Link></li>
                    </ul>
                </div>

                {/* Support & Policies */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Customer Service</h3>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
                        <li><Link to="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link></li>
                        <li><Link to="/terms" className="hover:text-white transition">Terms & Conditions</Link></li>
                        <li><Link to="/return-policy" className="hover:text-white transition">Return Policy</Link></li>
                    </ul>
                </div>

                {/* Payment Methods Info */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Accepted Payments</h3>
                    <div className="flex flex-wrap gap-2 text-xs font-semibold">
                        <span className="bg-pink-600 text-white px-2.5 py-1 rounded">bKash</span>
                        <span className="bg-orange-600 text-white px-2.5 py-1 rounded">Nagad</span>
                        <span className="bg-emerald-600 text-white px-2.5 py-1 rounded">COD</span>
                    </div>
                </div>

            </div>

            <div className="bg-gray-950 py-4 text-center text-xs text-gray-500 border-t border-gray-800">
                © {new Date().getFullYear()} TechStore. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
