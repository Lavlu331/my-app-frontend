import { useState, useEffect } from 'react';
import API from '../api';

const emptyProduct = {
    name: '', brand: '', sku: '', price: '', originalPrice: '', costPrice: '', category: '', countInStock: '',
    description: '', image: '', additionalImages: '', color: '', size: '', specifications: '', warranty: '',
    weight: '', dimensions: '', isFeatured: false, isActive: true, seoTitle: '', seoDescription: '',
};

const fieldClass = 'w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
const Field = ({ label, children }) => <label className="block text-xs font-semibold text-gray-600"><span className="mb-1 block">{label}</span>{children}</label>;

const AddProduct = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadingIndex, setUploadingIndex] = useState(null);
    const [products, setProducts] = useState([{ ...emptyProduct }]);

    const fetchCategories = async () => {
        try { setCategories((await API.get('/categories')).data); }
        catch (err) { console.error('Failed to fetch categories:', err); }
    };
    useEffect(() => { fetchCategories(); }, []);

    const getAuthConfig = (isFormData = false) => {
        let userInfo = null;
        try { userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null'); }
        catch { localStorage.removeItem('userInfo'); }
        const token = userInfo?.token || userInfo?.user?.token;
        return { headers: { 'Content-Type': isFormData ? 'multipart/form-data' : 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } };
    };

    const handleInputChange = (index, field, value) => setProducts((current) => current.map((product, itemIndex) => itemIndex === index ? { ...product, [field]: value } : product));
    const handleAddMoreProduct = () => setProducts((current) => [...current, { ...emptyProduct }]);
    const handleRemoveProduct = (index) => {
        if (products.length === 1) return;
        setProducts((current) => current.filter((_, itemIndex) => itemIndex !== index));
    };

    const handleImageUpload = async (event, index) => {
        const file = event.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        setUploadingIndex(index);
        try {
            const { data } = await API.post('/upload', formData, getAuthConfig(true));
            handleInputChange(index, 'image', data.imageUrl);
        } catch (err) {
            console.error('Image Upload Error:', err.response?.data?.message || err.message);
            alert(err.response?.data?.message || 'Image upload failed!');
        } finally { setUploadingIndex(null); }
    };

    const handleAddCategory = async (event) => {
        event.preventDefault();
        if (!newCategory.trim()) return;
        try {
            await API.post('/categories', { name: newCategory }, getAuthConfig());
            setNewCategory('');
            fetchCategories();
        } catch (err) {
            console.error('Category Add Error:', err.response?.data?.message || err.message);
            alert(err.response?.data?.message || 'Failed to add category!');
        }
    };

    const handleSubmitAllProducts = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            const config = getAuthConfig();
            if (products.length === 1) await API.post('/products', products[0], config);
            else await API.post('/products/bulk', products, config);
            alert(`${products.length} Product(s) added successfully!`);
            setProducts([{ ...emptyProduct }]);
        } catch (err) {
            console.error('Product Add Error:', err.response?.data?.message || err.message);
            alert(err.response?.data?.message || 'Failed to add products. Please check required fields!');
        } finally { setLoading(false); }
    };

    return (
        <div className="mx-auto max-w-5xl space-y-5 p-4 md:p-6">
            <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
                <h2 className="mb-3 text-base font-bold text-gray-800">Add a category</h2>
                <form onSubmit={handleAddCategory} className="flex flex-col gap-2 sm:flex-row">
                    <input type="text" placeholder="e.g. Smartwatches, Audio" value={newCategory} onChange={(event) => setNewCategory(event.target.value)} className={fieldClass} required />
                    <button type="submit" className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700">+ Add category</button>
                </form>
            </section>

            <form onSubmit={handleSubmitAllProducts} className="space-y-4">
                <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between md:p-5">
                    <div><h1 className="text-xl font-extrabold text-gray-800">Add products</h1><p className="text-xs text-gray-500">Only fields marked with * are required. Open more details only when needed.</p></div>
                    <button type="button" onClick={handleAddMoreProduct} className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100">+ Add another product</button>
                </div>

                {products.map((item, index) => (
                    <section key={index} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
                        <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3"><span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">Product #{index + 1}</span>{products.length > 1 && <button type="button" onClick={() => handleRemoveProduct(index)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100">Remove</button>}</div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <Field label="Product name *"><input type="text" placeholder="e.g. iPhone 15 Pro" value={item.name} onChange={(event) => handleInputChange(index, 'name', event.target.value)} className={fieldClass} required /></Field>
                            <Field label="Price *"><input type="number" min="0" placeholder="e.g. 120000" value={item.price} onChange={(event) => handleInputChange(index, 'price', event.target.value)} className={fieldClass} required /></Field>
                            <Field label="Category *"><select value={item.category} onChange={(event) => handleInputChange(index, 'category', event.target.value)} className={fieldClass} required><option value="">Select category</option>{categories.map((category) => <option key={category._id || category.name} value={category.name}>{category.name}</option>)}</select></Field>
                            <Field label="Stock quantity *"><input type="number" min="0" placeholder="e.g. 15" value={item.countInStock} onChange={(event) => handleInputChange(index, 'countInStock', event.target.value)} className={fieldClass} required /></Field>
                            <Field label="Brand"><input type="text" placeholder="e.g. Samsung" value={item.brand} onChange={(event) => handleInputChange(index, 'brand', event.target.value)} className={fieldClass} /></Field>
                            <Field label="Product image"><input type="text" placeholder="Image URL (optional)" value={item.image} onChange={(event) => handleInputChange(index, 'image', event.target.value)} className={fieldClass} /></Field>
                            <div className="md:col-span-2"><Field label="Upload image"><input type="file" accept="image/*" onChange={(event) => handleImageUpload(event, index)} className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700" /></Field>{uploadingIndex === index && <p className="mt-1 text-xs font-medium text-blue-600">Uploading image...</p>}</div>
                            <div className="md:col-span-2"><Field label="Description *"><textarea placeholder="Short description of the product..." value={item.description} onChange={(event) => handleInputChange(index, 'description', event.target.value)} className={`${fieldClass} h-20 resize-y`} required /></Field></div>

                            <details className="md:col-span-2 rounded-xl border border-gray-200 bg-gray-50/70">
                                <summary className="cursor-pointer px-4 py-3 text-sm font-bold text-gray-700">More product details <span className="text-xs font-medium text-gray-400">(optional)</span></summary>
                                <div className="grid grid-cols-1 gap-4 border-t border-gray-200 p-4 md:grid-cols-2">
                                    <Field label="SKU / product code"><input type="text" placeholder="e.g. SAM-S24-256-BLK" value={item.sku} onChange={(event) => handleInputChange(index, 'sku', event.target.value)} className={fieldClass} /></Field>
                                    <Field label="Original price"><input type="number" min="0" placeholder="Price before discount" value={item.originalPrice} onChange={(event) => handleInputChange(index, 'originalPrice', event.target.value)} className={fieldClass} /></Field>
                                    <Field label="Purchase cost"><input type="number" min="0" placeholder="Your buying cost" value={item.costPrice} onChange={(event) => handleInputChange(index, 'costPrice', event.target.value)} className={fieldClass} /></Field>
                                    <Field label="Color / variant"><input type="text" placeholder="e.g. Black" value={item.color} onChange={(event) => handleInputChange(index, 'color', event.target.value)} className={fieldClass} /></Field>
                                    <Field label="Size / storage"><input type="text" placeholder="e.g. 256 GB / XL" value={item.size} onChange={(event) => handleInputChange(index, 'size', event.target.value)} className={fieldClass} /></Field>
                                    <Field label="Warranty"><input type="text" placeholder="e.g. 1 Year Official" value={item.warranty} onChange={(event) => handleInputChange(index, 'warranty', event.target.value)} className={fieldClass} /></Field>
                                    <Field label="Weight"><input type="text" placeholder="e.g. 180g" value={item.weight} onChange={(event) => handleInputChange(index, 'weight', event.target.value)} className={fieldClass} /></Field>
                                    <Field label="Dimensions"><input type="text" placeholder="e.g. 160×75×8 mm" value={item.dimensions} onChange={(event) => handleInputChange(index, 'dimensions', event.target.value)} className={fieldClass} /></Field>
                                    <div className="md:col-span-2"><Field label="Additional image URLs"><textarea placeholder="One image URL per line or comma-separated" value={item.additionalImages} onChange={(event) => handleInputChange(index, 'additionalImages', event.target.value)} className={`${fieldClass} h-16 resize-y`} /></Field></div>
                                    <div className="md:col-span-2"><Field label="Specifications"><textarea placeholder="e.g. RAM: 8 GB | Display: 6.7 inch | Battery: 5000 mAh" value={item.specifications} onChange={(event) => handleInputChange(index, 'specifications', event.target.value)} className={`${fieldClass} h-20 resize-y`} /></Field></div>
                                    <Field label="SEO title"><input type="text" placeholder="Google search title" value={item.seoTitle} onChange={(event) => handleInputChange(index, 'seoTitle', event.target.value)} className={fieldClass} /></Field>
                                    <Field label="SEO description"><input type="text" placeholder="Short search description" value={item.seoDescription} onChange={(event) => handleInputChange(index, 'seoDescription', event.target.value)} className={fieldClass} /></Field>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700"><input type="checkbox" checked={item.isFeatured} onChange={(event) => handleInputChange(index, 'isFeatured', event.target.checked)} /> Featured product</label>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700"><input type="checkbox" checked={item.isActive} onChange={(event) => handleInputChange(index, 'isActive', event.target.checked)} /> Show in store</label>
                                </div>
                            </details>
                        </div>
                    </section>
                ))}

                <div className="sticky bottom-3 z-10 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur sm:flex-row">
                    <button type="button" onClick={handleAddMoreProduct} className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50">+ Add another product</button>
                    <button type="submit" disabled={loading || uploadingIndex !== null} className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">{loading ? 'Submitting...' : `Save all products (${products.length})`}</button>
                </div>
            </form>
        </div>
    );
};

export default AddProduct;
