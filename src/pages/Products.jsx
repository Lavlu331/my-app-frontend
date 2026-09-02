import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import API from '../api';

const Products = () => {
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
    const [maxPrice, setMaxPrice] = useState(100000);
    const [sortBy, setSortBy] = useState('default');
    const [categories, setCategories] = useState(['All']);
    const [selectedBrand, setSelectedBrand] = useState('All');
    const [selectedColor, setSelectedColor] = useState('All');
    const [selectedSize, setSelectedSize] = useState('All');
    const [selectedWarranty, setSelectedWarranty] = useState('All');
    const [stockFilter, setStockFilter] = useState('all');
    const [discountOnly, setDiscountOnly] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const { data } = await API.get('/products', {
                    params: { pageNumber: page, keyword: searchTerm, category: selectedCategory, maxPrice, sortBy },
                });
                setProducts(data.products || data);
                setPages(data.pages || 1);
            } catch (error) {
                console.error('Failed to fetch products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [page, searchTerm, selectedCategory, maxPrice, sortBy]);

    useEffect(() => {
        API.get('/categories')
            .then(({ data }) => setCategories(['All', ...data.map((category) => category.name)]))
            .catch((error) => console.error('Failed to fetch categories:', error));
    }, []);

    useEffect(() => {
        setSearchTerm(searchParams.get('search') || '');
        setSelectedCategory(searchParams.get('category') || 'All');
        setPage(1);
    }, [searchParams]);

    const resetToFirstPage = (update) => {
        update();
        setPage(1);
    };

    const filteredProducts = products
        .filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter((product) => selectedCategory === 'All' || product.category === selectedCategory)
        .filter((product) => Number(product.price) <= maxPrice)
        .filter((product) => selectedBrand === 'All' || product.brand === selectedBrand)
        .filter((product) => selectedColor === 'All' || product.color === selectedColor)
        .filter((product) => selectedSize === 'All' || product.size === selectedSize)
        .filter((product) => selectedWarranty === 'All' || product.warranty === selectedWarranty)
        .filter((product) => stockFilter === 'all' || (stockFilter === 'in' ? product.countInStock > 0 : product.countInStock <= 0))
        .filter((product) => !discountOnly || Number(product.originalPrice) > Number(product.price))
        .sort((a, b) => sortBy === 'low-to-high' ? a.price - b.price : sortBy === 'high-to-low' ? b.price - a.price : sortBy === 'newest' ? new Date(b.createdAt) - new Date(a.createdAt) : 0);

    const brands = [...new Set(products.map((product) => product.brand).filter(Boolean))];
    const colors = [...new Set(products.map((product) => product.color).filter(Boolean))];
    const sizes = [...new Set(products.map((product) => product.size).filter(Boolean))];
    const warranties = [...new Set(products.map((product) => product.warranty).filter(Boolean))];
    const clearFilters = () => {
        setSearchTerm(''); setSelectedCategory('All'); setMaxPrice(100000); setSortBy('default');
        setSelectedBrand('All'); setSelectedColor('All'); setSelectedSize('All'); setSelectedWarranty('All'); setStockFilter('all'); setDiscountOnly(false); setPage(1);
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">All Products 🛍️</h1>

            {loading ? (
                <div className="text-center my-12 text-lg font-semibold text-gray-600">Loading products... ⏳</div>
            ) : (
                <>
                    <div className="flex flex-col md:flex-row gap-8">
                        <aside className="w-full md:w-1/4 bg-white p-5 rounded-2xl shadow-sm h-fit border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Filter Products 🎛️</h2>
                            <button onClick={clearFilters} className="w-full mb-3 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100">Clear All Filters</button>
                            <input value={searchTerm} onChange={(event) => resetToFirstPage(() => setSearchTerm(event.target.value))} placeholder="Search products..." className="w-full px-3 py-2 mb-5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-700 text-sm mb-2">Categories</h3>
                                <div className="flex flex-col gap-1.5">
                                    {categories.map((category) => <button key={category} onClick={() => resetToFirstPage(() => setSelectedCategory(category))} className={`text-left px-3 py-2 rounded-xl text-xs font-semibold transition ${selectedCategory === category ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>{category}</button>)}
                                </div>
                            </div>
                            {brands.length > 0 && <div className="mb-5"><h3 className="font-semibold text-gray-700 text-sm mb-2">Brand</h3><select value={selectedBrand} onChange={(e) => resetToFirstPage(() => setSelectedBrand(e.target.value))} className="w-full px-3 py-2 border rounded-xl text-xs bg-white"><option>All</option>{brands.map((brand) => <option key={brand}>{brand}</option>)}</select></div>}
                            <div className="mb-5"><h3 className="font-semibold text-gray-700 text-sm mb-2">Availability</h3><select value={stockFilter} onChange={(e) => resetToFirstPage(() => setStockFilter(e.target.value))} className="w-full px-3 py-2 border rounded-xl text-xs bg-white"><option value="all">All products</option><option value="in">In stock</option><option value="out">Out of stock</option></select></div>
                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-5 cursor-pointer"><input type="checkbox" checked={discountOnly} onChange={(e) => resetToFirstPage(() => setDiscountOnly(e.target.checked))} /> Discounted products only</label>
                            {colors.length > 0 && <div className="mb-5"><h3 className="font-semibold text-gray-700 text-sm mb-2">Color</h3><select value={selectedColor} onChange={(e) => resetToFirstPage(() => setSelectedColor(e.target.value))} className="w-full px-3 py-2 border rounded-xl text-xs bg-white"><option>All</option>{colors.map((color) => <option key={color}>{color}</option>)}</select></div>}
                            {sizes.length > 0 && <div className="mb-5"><h3 className="font-semibold text-gray-700 text-sm mb-2">Size / Storage</h3><select value={selectedSize} onChange={(e) => resetToFirstPage(() => setSelectedSize(e.target.value))} className="w-full px-3 py-2 border rounded-xl text-xs bg-white"><option>All</option>{sizes.map((size) => <option key={size}>{size}</option>)}</select></div>}
                            {warranties.length > 0 && <div className="mb-5"><h3 className="font-semibold text-gray-700 text-sm mb-2">Warranty</h3><select value={selectedWarranty} onChange={(e) => resetToFirstPage(() => setSelectedWarranty(e.target.value))} className="w-full px-3 py-2 border rounded-xl text-xs bg-white"><option>All</option>{warranties.map((warranty) => <option key={warranty}>{warranty}</option>)}</select></div>}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-700 text-sm mb-2">Max Price: ৳{maxPrice}</h3>
                                <input type="range" min="0" max="100000" step="500" value={maxPrice} onChange={(event) => resetToFirstPage(() => setMaxPrice(Number(event.target.value)))} className="w-full accent-blue-600 cursor-pointer" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-700 text-sm mb-2">Sort By Price</h3>
                                <select value={sortBy} onChange={(event) => resetToFirstPage(() => setSortBy(event.target.value))} className="w-full px-3 py-2 border rounded-xl text-xs font-semibold text-gray-700 outline-none bg-white border-gray-200">
                                    <option value="default">Default</option><option value="low-to-high">Price: Low to High</option><option value="high-to-low">Price: High to Low</option><option value="newest">Newest Arrivals</option>
                                </select>
                            </div>
                        </aside>
                        <div className="w-full md:w-3/4">
                        <p className="text-sm font-semibold text-gray-500 mb-4">{filteredProducts.length} product{filteredProducts.length === 1 ? '' : 's'} found</p>
                        {filteredProducts.length === 0 ? <div className="bg-white p-8 rounded-2xl text-center text-gray-500 border">No products found matching your filter.</div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.map((product) => (
                            <div key={product._id} className="border rounded-2xl p-4 shadow-sm hover:shadow-md transition bg-white flex flex-col justify-between">
                                <div>
                                    <div className="relative"><img
                                        src={product.image || 'https://placehold.co/600x400?text=Product'}
                                        alt={product.name}
                                        className="w-full h-48 object-cover rounded-xl mb-3"
                                    />{product.countInStock > 0 && product.countInStock <= 5 && <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg">Only {product.countInStock} left</span>}</div>
                                    <h2 className="font-bold text-gray-800 line-clamp-1">{product.name}</h2>
                                    <p className="text-blue-600 font-extrabold my-2">৳{product.price}</p>
                                </div>
                                <Link
                                    to={`/product/${product._id}`}
                                    className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-sm transition mt-3"
                                >
                                    View Details
                                </Link>
                            </div>
                        ))}
                        </div>}
                        </div>
                    </div>

                    {/* Pagination Controls */}
                    {pages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-10">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage((prev) => prev - 1)}
                                className="px-4 py-2 border rounded-xl font-bold text-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                ◀ Previous
                            </button>

                            {[...Array(pages).keys()].map((x) => (
                                <button
                                    key={x + 1}
                                    onClick={() => setPage(x + 1)}
                                    className={`px-4 py-2 rounded-xl font-bold text-sm ${
                                        page === x + 1 ? 'bg-blue-600 text-white' : 'bg-white border text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    {x + 1}
                                </button>
                            ))}

                            <button
                                disabled={page === pages}
                                onClick={() => setPage((prev) => prev + 1)}
                                className="px-4 py-2 border rounded-xl font-bold text-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next ▶
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Products;
