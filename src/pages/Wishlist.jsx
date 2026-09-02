import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { WishlistContext } from '../context/WishlistContext';
import { CartContext } from '../context/CartContext';

const Wishlist = () => {
    const { wishlist, toggleWishlist } = useContext(WishlistContext);
    const { addToCart } = useContext(CartContext);

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6 pb-24">
            <div className="flex justify-between items-center mb-6"><h1 className="text-2xl font-extrabold text-gray-800">My Wishlist ❤️</h1><span className="text-sm text-gray-500">{wishlist.length} product(s)</span></div>
            {wishlist.length === 0 ? <div className="bg-white rounded-2xl p-10 text-center border"><p className="text-5xl mb-3">💝</p><p className="text-gray-500 mb-4">Your wishlist is empty.</p><Link to="/products" className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold text-sm">Browse Products</Link></div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {wishlist.map((product) => <div key={product._id} className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col"><Link to={`/product/${product._id}`}><img src={product.image || 'https://placehold.co/600x400?text=Product'} alt={product.name} className="w-full h-44 object-cover rounded-xl" /><h2 className="font-bold text-gray-800 mt-3">{product.name}</h2></Link><p className="font-extrabold text-blue-600 mt-1">৳{product.price}</p><div className="flex gap-2 mt-4"><button onClick={() => addToCart(product)} className="flex-1 bg-blue-600 text-white text-xs font-bold py-2.5 rounded-xl">Add to Cart</button><button onClick={() => toggleWishlist(product)} className="bg-red-50 text-red-600 text-xs font-bold px-3 rounded-xl">Remove</button></div></div>)}
            </div>}
        </div>
    );
};

export default Wishlist;
