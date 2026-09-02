import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

const Cart = () => {
    const { cartItems, updateQuantity, removeFromCart, clearCart } = useContext(CartContext);
    const navigate = useNavigate();

    
    const totalPrice = cartItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
    );

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 pb-20">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Shopping Cart 🛒</h1>

            {cartItems.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-lg font-medium">Your cart is empty! 🛍️</p>
                    <button 
                        onClick={() => navigate('/')}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
                    >
                        Continue Shopping
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Cart Items List */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Selected Products</h2>
                        <div className="divide-y divide-gray-100">
                            {cartItems.map((item) => (
                                <div key={item.product} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={item.image || 'https://placehold.co/100x100?text=Product'}
                                            alt={item.name}
                                            className="w-16 h-16 object-cover rounded-xl shrink-0"
                                        />
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-sm md:text-base">{item.name}</h3>
                                            <p className="text-xs text-gray-500">৳{item.price} each</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                                        {/* ➕ / ➖ Quantity Controls (Feature 2) */}
                                        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                                            <button
                                                onClick={() => updateQuantity(item.product, -1)}
                                                className="px-3 py-1 hover:bg-gray-200 font-bold text-gray-700 text-sm"
                                            >
                                                -
                                            </button>
                                            <span className="px-3 py-1 text-sm font-bold bg-white text-gray-800 min-w-[30px] text-center">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.product, 1)}
                                                className="px-3 py-1 hover:bg-gray-200 font-bold text-gray-700 text-sm"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <span className="font-bold text-base md:text-lg text-blue-600 min-w-[70px] text-right">
                                            ৳{item.price * item.quantity}
                                        </span>

                                        <button
                                            onClick={() => removeFromCart(item.product)}
                                            className="text-red-500 hover:text-red-700 font-semibold text-xs bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-100 shrink-0 transition"
                                        >
                                            ✕ Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total & Checkout Actions */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div>
                            <span className="text-gray-500 text-sm">Total Amount:</span>
                            <h2 className="text-3xl font-extrabold text-gray-800">৳{totalPrice}</h2>
                        </div>

                        <div className="flex gap-3 w-full sm:w-auto">
                            <button
                                onClick={clearCart}
                                className="px-5 py-3 text-gray-600 hover:text-red-600 border border-gray-300 hover:border-red-300 rounded-xl w-1/2 sm:w-auto text-sm font-semibold transition"
                            >
                                Clear Cart
                            </button>
                            <button
                                onClick={() => navigate('/Checkout')}
                                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition w-1/2 sm:w-auto text-center text-sm shadow-md"
                            >
                                Proceed to Checkout ➡️
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;