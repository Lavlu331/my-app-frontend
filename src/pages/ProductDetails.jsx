import { useEffect, useMemo, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';

const ProductDetails = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);

    const context = useContext(CartContext);
    const addToCart = context ? context.addToCart : () => {};
    const { wishlist, toggleWishlist } = useContext(WishlistContext) || { wishlist: [], toggleWishlist: () => {} };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await API.get(`/products/${id}`);
                setProduct(res.data);
                setActiveImage(0);
            } catch (err) {
                console.error('Failed to fetch product:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    useEffect(() => {
        document.title = product?.name ? `${product.name} | TechStore` : 'TechStore - E-Commerce';
        return () => { document.title = 'TechStore - E-Commerce'; };
    }, [product]);

    const images = useMemo(() => {
        if (!product) return [];
        return [...new Set([product.image || product.imageUrl, ...(product.images || [])].filter(Boolean))];
    }, [product]);

    if (loading) return <div className="text-center mt-12 text-xl font-semibold text-gray-600">Loading product details... ⏳</div>;
    if (!product) return <div className="text-center mt-12 text-xl text-red-500 font-bold">Product not found! ❌</div>;

    const stock = Number(product.countInStock ?? product.stock ?? 0);
    const isInStock = stock > 0;
    const hasDiscount = Number(product.originalPrice) > Number(product.price);
    const discount = hasDiscount ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
    const details = [
        ['Brand', product.brand], ['SKU', product.sku], ['Color', product.color], ['Size / Storage', product.size],
        ['Weight', product.weight], ['Dimensions', product.dimensions], ['Warranty', product.warranty],
    ].filter(([, value]) => value);

    const handleShare = async () => {
        const shareData = { title: product.name, text: `Check out ${product.name}`, url: window.location.href };
        try {
            if (navigator.share) await navigator.share(shareData);
            else {
                await navigator.clipboard.writeText(window.location.href);
                window.alert('Product link copied!');
            }
        } catch {
            // The user dismissed the native sharing dialog.
        }
    };

    return (
        <main className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-10">
            <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs font-medium text-gray-500">
                <Link to="/" className="hover:text-blue-600">Home</Link><span>/</span>
                <Link to="/products" className="hover:text-blue-600">{product.category || 'Products'}</Link><span>/</span>
                <span className="max-w-48 truncate text-gray-800">{product.name}</span>
            </nav>

            <section className="grid gap-8 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm md:p-7 lg:grid-cols-2 lg:gap-12">
                <div className="space-y-4">
                    <div className="relative flex min-h-80 items-center justify-center overflow-hidden rounded-2xl bg-slate-50 p-6 md:min-h-125">
                        {hasDiscount && <span className="absolute left-4 top-4 rounded-full bg-rose-500 px-3 py-1 text-xs font-bold text-white">-{discount}% OFF</span>}
                        <img src={images[activeImage] || 'https://placehold.co/600x400?text=Product'} alt={product.name} className="max-h-105 w-full object-contain" />
                    </div>
                    {images.length > 1 && <div className="flex gap-3 overflow-x-auto pb-1">{images.map((image, index) => <button key={image} type="button" onClick={() => setActiveImage(index)} aria-label={`View product image ${index + 1}`} className={`h-18 w-18 shrink-0 overflow-hidden rounded-xl border-2 bg-slate-50 p-1 transition ${activeImage === index ? 'border-blue-600' : 'border-transparent hover:border-gray-300'}`}><img src={image} alt="" className="h-full w-full object-contain" /></button>)}</div>}
                </div>

                <div className="flex flex-col">
                    <div className="mb-5 flex items-start justify-between gap-4">
                        <div><p className="mb-2 text-xs font-bold uppercase tracking-wider text-blue-600">{product.category || 'General'}</p><h1 className="text-2xl font-extrabold leading-tight text-gray-900 md:text-4xl">{product.name}</h1></div>
                        <button onClick={() => toggleWishlist(product)} className="rounded-xl border border-gray-200 p-3 text-xl transition hover:border-rose-200 hover:bg-rose-50" aria-label="Add product to wishlist">{wishlist.some((item) => item._id === product._id) ? '❤️' : '🤍'}</button>
                    </div>
                    {product.brand && <p className="mb-5 text-sm text-gray-500">Brand: <span className="font-semibold text-gray-800">{product.brand}</span></p>}

                    <div className="mb-5 border-y border-gray-100 py-5">
                        <div className="flex flex-wrap items-end gap-x-3 gap-y-1"><span className="text-3xl font-black text-blue-600">৳{Number(product.price).toLocaleString()}</span>{hasDiscount && <span className="pb-1 text-sm text-gray-400 line-through">৳{Number(product.originalPrice).toLocaleString()}</span>}</div>
                        <p className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${isInStock ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'}`}>{isInStock ? `In stock · ${stock} available` : 'Currently out of stock'}</p>
                        {isInStock && stock <= 5 && <p className="mt-2 text-xs font-semibold text-amber-600">Only {stock} left — order soon.</p>}
                    </div>
                    <p className="mb-6 whitespace-pre-line text-sm leading-7 text-gray-600">{product.description}</p>
                    <div className="mt-auto grid grid-cols-[1fr_auto] gap-3"><button disabled={!isInStock} onClick={() => addToCart(product)} className={`rounded-xl px-5 py-3.5 text-sm font-bold transition ${isInStock ? 'bg-blue-600 text-white hover:bg-blue-700' : 'cursor-not-allowed bg-gray-100 text-gray-400'}`}>{isInStock ? 'Add to Cart 🛒' : 'Out of Stock'}</button><button onClick={handleShare} className="rounded-xl border border-gray-200 px-4 text-lg transition hover:border-blue-200 hover:bg-blue-50" aria-label="Share product">↗</button></div>
                </div>
            </section>

            {(details.length > 0 || product.specifications) && <section className="mt-8 grid gap-6 lg:grid-cols-5">
                {details.length > 0 && <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2"><h2 className="mb-5 text-lg font-extrabold text-gray-900">Product information</h2><dl className="space-y-3">{details.map(([label, value]) => <div key={label} className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-3 text-sm last:border-0 last:pb-0"><dt className="text-gray-500">{label}</dt><dd className="break-words text-right font-semibold text-gray-800">{value}</dd></div>)}</dl></div>}
                {product.specifications && <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-3"><h2 className="mb-5 text-lg font-extrabold text-gray-900">Specifications</h2><p className="whitespace-pre-line text-sm leading-7 text-gray-600">{product.specifications}</p></div>}
            </section>}
        </main>
    );
};

export default ProductDetails;
