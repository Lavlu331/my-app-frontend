import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { WishlistContext } from './WishlistContext';

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState(() => {
        try {
            const localData = localStorage.getItem('wishlistItems');
            return localData ? JSON.parse(localData) : [];
        } catch {
            return [];
        }
    });

    // LocalStorage সিঙ্ক করার জন্য useEffect
    useEffect(() => {
        localStorage.setItem('wishlistItems', JSON.stringify(wishlist));
    }, [wishlist]);

    const toggleWishlist = (product) => {
        if (!product || !product._id) return;

        setWishlist((prev) => {
            const isExist = prev.some((item) => item._id === product._id);
            if (isExist) {
                toast.error('Removed from Wishlist 💔');
                return prev.filter((item) => item._id !== product._id);
            } else {
                toast.success('Added to Wishlist ❤️');
                return [...prev, product];
            }
        });
    };

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};
