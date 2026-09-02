import { useEffect, useState, useCallback } from 'react';
import API from '../api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('orders');
    const [orderFilter, setOrderFilter] = useState('all');

    const getArrayData = (resValue, key) => {
        const data = resValue?.data;
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data[key])) return data[key];
        return [];
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [ordersRes, productsRes, usersRes, categoriesRes] = await Promise.allSettled([
                API.get('/orders'),
                API.get('/products/admin'),
                API.get('/users'),
                API.get('/categories')
            ]);

            if (ordersRes.status === 'fulfilled') setOrders(getArrayData(ordersRes.value, 'orders'));
            if (productsRes.status === 'fulfilled') setProducts(getArrayData(productsRes.value, 'products'));
            if (usersRes.status === 'fulfilled') setUsers(getArrayData(usersRes.value, 'users'));
            if (categoriesRes.status === 'fulfilled') setCategories(getArrayData(categoriesRes.value, 'categories'));
        } catch (err) {
            console.error('Fetch error:', err);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleStatusChange = async (orderId, newStatus) => {
        const previousOrders = [...orders];
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus, isDelivered: newStatus === 'Delivered' } : o));

        try {
            await API.put(`/orders/${orderId}/deliver`, { status: newStatus });
            toast.success(`Order status updated to ${newStatus}!`);
        } catch (err) {
            setOrders(previousOrders);
            toast.error(err.response?.data?.message || 'Failed to update order status');
        }
    };

    const handlePaymentStatus = async (orderId, paymentStatus) => {
        const previousOrders = [...orders];
        setOrders(prev => prev.map(order => order._id === orderId ? {
            ...order,
            paymentStatus,
            isPaid: paymentStatus === 'Paid',
        } : order));

        try {
            await API.put(`/orders/${orderId}/payment`, { paymentStatus });
            toast.success(`Payment marked as ${paymentStatus}.`);
        } catch (err) {
            setOrders(previousOrders);
            toast.error(err.response?.data?.message || 'Failed to update payment');
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to delete this cancelled order?')) return;
        const previousOrders = [...orders];
        setOrders(prev => prev.filter(o => o._id !== orderId));

        try {
            await API.delete(`/orders/${orderId}`);
            toast.success('Cancelled order deleted successfully!');
        } catch (err) {
            setOrders(previousOrders);
            toast.error(err.response?.data?.message || 'Failed to delete order');
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        const previousProducts = [...products];
        setProducts(prev => prev.filter(p => p._id !== productId));

        try {
            await API.delete(`/products/${productId}`);
            toast.success('Product deleted successfully!');
        } catch (err) {
            setProducts(previousProducts);
            toast.error(err.response?.data?.message || 'Failed to delete product!');
        }
    };

    const handleRestockProduct = async (productId) => {
        const value = window.prompt('How many units do you want to add?');
        if (value === null) return;
        const quantity = Number(value);
        if (!Number.isInteger(quantity) || quantity < 1) {
            toast.error('Enter a positive whole number.');
            return;
        }
        try {
            const { data } = await API.patch(`/products/${productId}/stock`, { quantity });
            setProducts(prev => prev.map(product => product._id === productId ? data : product));
            toast.success('Stock updated successfully.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to restock product.');
        }
    };

    const handleEditProduct = async (product) => {
        const name = window.prompt('Product name', product.name);
        if (name === null) return;
        const price = window.prompt('Selling price', product.price);
        if (price === null) return;
        const description = window.prompt('Description', product.description);
        if (description === null) return;
        try {
            const { data } = await API.put(`/products/${product._id}`, { name, price, description, category: product.category });
            setProducts(prev => prev.map(item => item._id === product._id ? data : item));
            toast.success('Product updated successfully.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update product.');
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        const previousCategories = [...categories];
        setCategories(prev => prev.filter(c => c._id !== categoryId));

        try {
            await API.delete(`/categories/${categoryId}`);
            toast.success('Category deleted successfully!');
        } catch (err) {
            setCategories(previousCategories);
            toast.error(err.response?.data?.message || 'Failed to delete category');
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        const previousUsers = [...users];
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole, isAdmin: newRole === 'admin' } : u));

        try {
            await API.put(`/users/${userId}/role`, { role: newRole });
            toast.success(`User role changed to ${newRole}!`);
        } catch (err) {
            setUsers(previousUsers);
            toast.error(err.response?.data?.message || 'Failed to update user role');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        const previousUsers = [...users];
        setUsers(prev => prev.filter(u => u._id !== userId));

        try {
            await API.delete(`/users/${userId}`);
            toast.success('User removed successfully!');
        } catch (err) {
            setUsers(previousUsers);
            toast.error(err.response?.data?.message || 'Failed to delete user');
        }
    };

    const totalRevenue = orders
        .filter(order => order.status !== 'Cancelled')
        .reduce((acc, order) => acc + (order.totalPrice || 0), 0);
        
    const outOfStockCount = products.filter(p => (p.countInStock || 0) === 0).length;
    const lowStockCount = products.filter(p => {
        const stock = p.countInStock ?? 0;
        return stock > 0 && stock <= 5;
    }).length;
    const productCosts = new Map(products.map(product => [product._id, Number(product.costPrice || 0)]));
    const estimatedProfit = orders.filter(order => order.status !== 'Cancelled').reduce((total, order) => total + (order.orderItems || []).reduce((orderProfit, item) => orderProfit + ((Number(item.price) - (productCosts.get(item.product) || 0)) * item.quantity), 0), 0);
    const visibleOrders = orderFilter === 'all' ? orders : orders.filter(order => order.status === orderFilter);

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6 pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard 📊</h1>
                    <p className="text-sm text-gray-500">Manage orders, products, categories, stock levels, and user roles.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 font-semibold uppercase">Total Revenue</p>
                    <h2 className="text-2xl font-black text-blue-600 mt-1">৳{totalRevenue}</h2>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 font-semibold uppercase">Est. Profit</p>
                    <h2 className="text-2xl font-black text-emerald-600 mt-1">৳{estimatedProfit}</h2>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 font-semibold uppercase">Total Orders</p>
                    <h2 className="text-2xl font-black text-gray-800 mt-1">{orders.length}</h2>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 font-semibold uppercase">Total Products</p>
                    <h2 className="text-2xl font-black text-emerald-600 mt-1">{products.length}</h2>
                    {outOfStockCount > 0 && (
                        <p className="text-[11px] text-red-500 font-bold mt-1">⚠️ {outOfStockCount} Out of Stock</p>
                    )}
                    {lowStockCount > 0 && <p className="text-[11px] text-amber-600 font-bold mt-1">⚠️ {lowStockCount} Low Stock</p>}
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 font-semibold uppercase">Categories</p>
                    <h2 className="text-2xl font-black text-amber-600 mt-1">{categories.length}</h2>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 font-semibold uppercase">Total Users</p>
                    <h2 className="text-2xl font-black text-purple-600 mt-1">{users.length}</h2>
                </div>
            </div>

            <div className="flex gap-2 border-b mb-6 overflow-x-auto">
                {['orders', 'products', 'categories', 'users'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 px-4 font-bold text-sm border-b-2 transition shrink-0 capitalize ${
                            activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'
                        }`}
                    >
                        {tab} ({
                            tab === 'orders' ? orders.length :
                            tab === 'products' ? products.length :
                            tab === 'categories' ? categories.length : users.length
                        })
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-10 font-semibold text-gray-500">Loading admin panel... ⌛</div>
            ) : activeTab === 'orders' ? (
                <div className="space-y-3">
                    <div className="flex justify-end">
                        <select value={orderFilter} onChange={(e) => setOrderFilter(e.target.value)} className="px-3 py-2 rounded-xl border bg-white text-sm font-semibold">
                            <option value="all">All Orders</option>
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left text-xs md:text-sm">
                        <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
                            <tr>
                                <th className="p-4">Order ID & Date</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Items</th>
                                <th className="p-4">Total Price</th>
                                <th className="p-4">Order & Payment Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {visibleOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center p-6 text-gray-400">No orders found.</td>
                                </tr>
                            ) : (
                                visibleOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50/50">
                                        <td className="p-4">
                                            <p className="font-bold text-gray-800">#{order._id?.substring(0, 8)}...</p>
                                            <p className="text-[10px] text-gray-400">
                                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </td>
                                        <td className="p-4 font-semibold text-gray-800">{order.user?.name || 'Guest'}</td>
                                        <td className="p-4">
                                            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-bold text-[10px]">
                                                {order.orderItems?.length || 0} Products
                                            </span>
                                        </td>
                                        <td className="p-4 font-bold text-blue-600">৳{order.totalPrice}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <select
                                                    value={order.isDelivered ? 'Delivered' : order.status || 'Pending'}
                                                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                    className="px-2.5 py-1 rounded-lg font-bold text-xs border bg-white"
                                                >
                                                    <option value="Pending">Pending ⏳</option>
                                                    <option value="Shipped">Shipped 🚚</option>
                                                    <option value="Delivered">Delivered ✅</option>
                                                    <option value="Cancelled">Cancelled ❌</option>
                                                </select>

                                                {order.paymentStatus === 'Pending Verification' && (
                                                    <>
                                                        <button
                                                            onClick={() => handlePaymentStatus(order._id, 'Paid')}
                                                            className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-xs font-bold hover:bg-emerald-100 transition"
                                                        >
                                                            Approve Payment
                                                        </button>
                                                        <button
                                                            onClick={() => handlePaymentStatus(order._id, 'Rejected')}
                                                            className="bg-red-50 text-red-600 px-2.5 py-1 rounded-lg text-xs font-bold hover:bg-red-100 transition"
                                                        >
                                                            Reject Payment
                                                        </button>
                                                    </>
                                                )}
                                                {order.paymentStatus && order.paymentStatus !== 'Pending Verification' && (
                                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${order.isPaid ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                                                        Payment: {order.paymentStatus}
                                                    </span>
                                                )}
                                                
                                                {order.status === 'Cancelled' && (
                                                    <button
                                                        onClick={() => handleDeleteOrder(order._id)}
                                                        className="text-red-500 bg-red-50 px-2.5 py-1 rounded-lg text-xs font-bold hover:bg-red-100 transition"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    </div>
                </div>
            ) : activeTab === 'products' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {products.length === 0 ? (
                        <p className="text-gray-400 col-span-3 text-center py-6">No products available.</p>
                    ) : (
                        products.map((product) => {
                            const stock = product.countInStock ?? 0;
                            return (
                                <div key={product._id} className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${stock === 0 ? 'bg-red-50/40 border-red-200' : 'bg-white border-gray-100'}`}>
                                    <div className="flex items-center gap-3 min-w-0">
                                        <img src={product.image || 'https://placehold.co/100x100'} alt={product.name} className="w-12 h-12 object-cover rounded-xl shrink-0" />
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-xs text-gray-800 truncate">{product.name}</h3>
                                            <p className="text-xs font-bold text-blue-600">৳{product.price}</p>
                                            {stock === 0 ? (
                                                <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-md">Out of Stock (0)</span>
                                            ) : (
                                                <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md">In Stock ({stock})</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 shrink-0">
                                        <button onClick={() => handleEditProduct(product)} className="text-blue-700 bg-blue-50 p-2 rounded-xl text-xs font-bold hover:bg-blue-100">Edit</button>
                                        <button onClick={() => handleRestockProduct(product._id)} className="text-emerald-700 bg-emerald-50 p-2 rounded-xl text-xs font-bold hover:bg-emerald-100">Restock</button>
                                        <button onClick={() => handleDeleteProduct(product._id)} className="text-red-500 bg-red-50 p-2 rounded-xl text-xs font-bold hover:bg-red-100">Delete</button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            ) : activeTab === 'categories' ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-2xl">
                    <table className="w-full text-left text-xs md:text-sm">
                        <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
                            <tr>
                                <th className="p-4">Category Name</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {categories.length === 0 ? (
                                <tr>
                                    <td colSpan="2" className="text-center p-6 text-gray-400">No categories found.</td>
                                </tr>
                            ) : (
                                categories.map((cat) => (
                                    <tr key={cat._id} className="hover:bg-gray-50/50">
                                        <td className="p-4 font-bold text-gray-800">{cat.name}</td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleDeleteCategory(cat._id)}
                                                className="text-red-500 bg-red-50 px-3 py-1 rounded-lg text-xs font-bold hover:bg-red-100 transition"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left text-xs md:text-sm">
                        <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
                            <tr>
                                <th className="p-4">User Name</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center p-6 text-gray-400">No users found.</td>
                                </tr>
                            ) : (
                                users.map((u) => (
                                    <tr key={u._id} className="hover:bg-gray-50/50">
                                        <td className="p-4 font-bold text-gray-800">{u.name}</td>
                                        <td className="p-4 text-gray-600">{u.email}</td>
                                        <td className="p-4">
                                            <select
                                                value={u.role || (u.isAdmin ? 'admin' : 'customer')}
                                                onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                                className="px-2.5 py-1 rounded-lg font-bold text-xs border bg-white"
                                            >
                                                <option value="customer">Customer 👤</option>
                                                <option value="admin">Admin 👑</option>
                                            </select>
                                        </td>
                                        <td className="p-4">
                                            <button onClick={() => handleDeleteUser(u._id)} className="text-red-500 bg-red-50 px-3 py-1 rounded-lg text-xs font-bold hover:bg-red-100">Delete</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
