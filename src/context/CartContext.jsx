import { useState, useEffect } from 'react';
import { CartContext } from './CartContext';

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const localData = localStorage.getItem('cartItems');
            return localData ? JSON.parse(localData) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product) => {
        setCartItems((prevItems) => {
            const existItem = prevItems.find((item) => item.product === product._id);

            if (existItem) {
                return prevItems.map((item) =>
                    item.product === product._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                return [
                    ...prevItems,
                    {
                        product: product._id,
                        name: product.name,
                        image: product.image,
                        price: product.price,
                        quantity: 1,
                    },
                ];
            }
        });
    };

    // ➕/➖ কোয়ান্টিটি বাড়ানোর বা কমানোর ফাংশন
    const updateQuantity = (productId, amount) => {
        setCartItems((prevItems) =>
            prevItems
                .map((item) => {
                    if (item.product === productId) {
                        const newQty = item.quantity + amount;
                        return newQty > 0 ? { ...item, quantity: newQty } : null;
                    }
                    return item;
                })
                .filter(Boolean)
        );
    };

    const removeFromCart = (productId) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.product !== productId));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    return (
        <CartContext.Provider
            value={{ cartItems, addToCart, updateQuantity, removeFromCart, clearCart }}
        >
            {children}
        </CartContext.Provider>
    );
};
