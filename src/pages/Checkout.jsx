import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { CartContext } from '../context/CartContext';
import toast from 'react-hot-toast'; // Toast নোটিফিকেশন যোগ করা হলো

const Checkout = () => {
    // ⚠️ এখানে cart এর বদলে cartItems ব্যবহার করতে হবে (আপনার CartContext অনুযায়ী)
    const { cartItems, clearCart } = useContext(CartContext);
    const navigate = useNavigate();

    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('Bangladesh');
    
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [trxId, setTrxId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadSavedAddress = async () => {
            try {
                const { data } = await API.get('/users/profile');
                const saved = data.savedAddress;
                if (!saved) return;
                setAddress(saved.address || '');
                setCity(saved.city || '');
                setPostalCode(saved.postalCode || '');
                setCountry(saved.country || 'Bangladesh');
            } catch {
                // Checkout remains available; unauthenticated users will be asked to log in by the order API.
            }
        };
        loadSavedAddress();
    }, []);

    // 💰 মোট বিল হিসাব করা (cartItems থেকে)
    const totalPrice = cartItems ? cartItems.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0) : 0;

    const handleCheckout = async (e) => {
        e.preventDefault(); // ফর্ম রিলোড বন্ধ করা

        if (!cartItems || cartItems.length === 0) {
            return toast.error('Your cart is empty!');
        }

        if (!address || !city || !postalCode) {
            return toast.error('Please fill in all shipping address fields!');
        }

        // 🛑 TrxID Validation
        if (paymentMethod === 'bKash/Nagad' && !trxId.trim()) {
            return toast.error('Please enter your TrxID for mobile banking!');
        }

        setIsSubmitting(true);
        try {
            const orderData = {
                orderItems: cartItems.map((item) => ({
                    product: item.product,
                    quantity: item.quantity,
                    name: item.name,
                    price: item.price,
                    image: item.image,
                })),
                shippingAddress: { address, city, postalCode, country },
                totalPrice,
                paymentMethod,
                paymentResult: trxId ? { id: trxId } : undefined,
            };

            await API.post('/orders', orderData);
            toast.success(paymentMethod === 'COD'
                ? 'Order placed successfully! 🎉'
                : 'Order submitted for payment verification. 🎉');
            clearCart();
            navigate('/'); // অর্ডার সফল হলে হোমে পাঠিয়ে দিবে
        } catch (err) {
            console.error('Checkout failed:', err);
            toast.error(err.response?.data?.message || 'Checkout failed! Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // যদি কার্ট খালি থাকে
    if (!cartItems || cartItems.length === 0) {
        return (
            <div className="text-center mt-12">
                <p className="text-xl font-bold text-gray-600">Your cart is empty! 🛒</p>
                <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg">Go back to Shop</button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 pb-20">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Secure Checkout 🔒</h1>

            <form onSubmit={handleCheckout} className="space-y-6">
                
                {/* Shipping Address Form */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Shipping Address 🏠</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="md:col-span-2">
                            <label className="block text-gray-700 font-semibold mb-1 text-xs">Street Address</label>
                            <input
                                type="text" placeholder="House no, Road no, Area..."
                                value={address} onChange={(e) => setAddress(e.target.value)}
                                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-semibold mb-1 text-xs">City</label>
                            <input
                                type="text" placeholder="Dhaka, Chittagong..."
                                value={city} onChange={(e) => setCity(e.target.value)}
                                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-semibold mb-1 text-xs">Postal Code</label>
                            <input
                                type="text" placeholder="1207"
                                value={postalCode} onChange={(e) => setPostalCode(e.target.value)}
                                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required
                            />
                        </div>
                    </div>
                </div>

                {/* Payment Method Selection */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Select Payment Method 💳</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        
                        <label className={`p-4 border rounded-xl flex items-center justify-between cursor-pointer transition ${paymentMethod === 'COD' ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                            <div>
                                <p className="font-bold text-gray-800 text-sm">Cash on Delivery</p>
                                <p className="text-xs text-gray-500">Pay when received</p>
                            </div>
                            <input type="radio" value="COD" checked={paymentMethod === 'COD'} onChange={() => { setPaymentMethod('COD'); setTrxId(''); }} className="hidden" />
                        </label>

                        <label className={`p-4 border rounded-xl flex items-center justify-between cursor-pointer transition ${paymentMethod === 'bKash/Nagad' ? 'border-pink-600 bg-pink-50 ring-2 ring-pink-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                            <div>
                                <p className="font-bold text-gray-800 text-sm">bKash / Nagad</p>
                                <p className="text-xs text-gray-500">Mobile Banking</p>
                            </div>
                            <input type="radio" value="bKash/Nagad" checked={paymentMethod === 'bKash/Nagad'} onChange={() => setPaymentMethod('bKash/Nagad')} className="hidden" />
                        </label>

                    </div>

                    {/* 📱 TrxID Field for bKash / Nagad */}
                    {paymentMethod === 'bKash/Nagad' && (
                        <div className="mt-4 p-4 bg-pink-50 rounded-xl border border-pink-200 space-y-2">
                            <p className="text-xs text-pink-700 font-medium">
                                অনুগ্রহ করে আমাদের <strong className="text-pink-900">017XXXXXXXX</strong> নম্বরে <strong>৳{totalPrice}</strong> Send Money করে নিচের বক্সে Transaction ID (TrxID) লিখুন।
                            </p>
                            <input
                                type="text" placeholder="Enter TrxID here..."
                                value={trxId} onChange={(e) => setTrxId(e.target.value)}
                                className="w-full px-3 py-2 border border-pink-300 rounded-xl text-sm outline-none bg-white uppercase font-bold focus:ring-2 focus:ring-pink-400"
                                required={paymentMethod === 'bKash/Nagad'}
                            />
                        </div>
                    )}
                </div>

                {/* Total & Checkout Button */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex justify-between items-center">
                    <div>
                        <span className="text-gray-500 text-sm">Total Payable:</span>
                        <h2 className="text-3xl font-extrabold text-gray-800">৳{totalPrice}</h2>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-8 py-3 text-white font-bold rounded-xl transition shadow-md ${isSubmitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                        {isSubmitting ? 'Processing...' : 'Confirm Order 🚀'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Checkout;
