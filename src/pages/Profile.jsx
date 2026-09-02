import { useEffect, useState, useCallback } from "react";
import API from "../api";

const getStoredUserInfo = () => {
  try {
    return JSON.parse(localStorage.getItem("userInfo")) || {};
  } catch {
    localStorage.removeItem("userInfo");
    return {};
  }
};

const Profile = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders"); // 'orders', 'profile', 'security'

  const storedUserResponse = getStoredUserInfo();
  const storedUser = storedUserResponse.user || storedUserResponse;

  const [userInfo, setUserInfo] = useState(storedUser);
  const [name, setName] = useState(storedUser.name || "");
  const [email, setEmail] = useState(storedUser.email || "");
  const [phone, setPhone] = useState(storedUser.phone || "");
  const [savedAddress, setSavedAddress] = useState(storedUser.savedAddress || {
    address: "", city: "", postalCode: "", country: "Bangladesh",
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const userRes = await API.get("/users/profile");
      if (userRes.data) {
        setUserInfo(userRes.data);
        setName(userRes.data.name || "");
        setEmail(userRes.data.email || "");
        setPhone(userRes.data.phone || "");
        setSavedAddress(userRes.data.savedAddress || { address: "", city: "", postalCode: "", country: "Bangladesh" });
        // Profile API নিরাপত্তার জন্য token ফেরত দেয় না। পুরোনো token রেখে
        // user data আপডেট না করলে পরের authenticated request-এ Bearer undefined যায়।
        const storedAuth = getStoredUserInfo();
        localStorage.setItem(
          "userInfo",
          JSON.stringify({ ...storedAuth, ...userRes.data, token: storedAuth.token })
        );
      }

      const orderRes = await API.get("/orders/myorders");
      setOrders(orderRes.data || []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setUpdateLoading(true);

    try {
      const res = await API.put("/users/profile", { name, email, phone, savedAddress });
      setUserInfo(res.data);
      // Update response-এও token থাকে না, তাই existing login token সংরক্ষণ করি।
      const storedAuth = getStoredUserInfo();
      localStorage.setItem(
        "userInfo",
        JSON.stringify({ ...storedAuth, ...res.data, token: storedAuth.token })
      );
      setName(res.data.name);
      setEmail(res.data.email);
      setPhone(res.data.phone || "");
      setSavedAddress(res.data.savedAddress || savedAddress);
      setMessage("Profile updated successfully! ✅");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await API.put("/users/password", passwords);
      setMessage("Password changed successfully! 🔒");
      setPasswords({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password.");
    }
  };

  const handleDownloadInvoice = (order) => {
    const printWindow = window.open("", "_blank");
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice #${order._id}</title>
        <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #333; }
        .invoice-box { max-width: 800px; margin: auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #3b82f6; padding-bottom: 15px; margin-bottom: 20px; }
        .logo { font-size: 24px; font-weight: bold; color: #3b82f6; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; font-size: 14px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .table th { background: #f8fafc; text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0; font-size: 13px; }
        .table td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
        .total-box { margin-top: 20px; text-align: right; font-size: 18px; font-weight: bold; color: #1e293b; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #eee; padding-top: 15px; }
        </style>
    </head>
      <body>
        <div class="invoice-box">
          <div class="header">
            <div class="logo">Tech Store 🛒</div>
            <div>
              <h3 style="margin:0;">INVOICE</h3>
              <p style="margin:0; font-size: 12px; color: #666;">Order ID: #${order._id}</p>
              <p style="margin:0; font-size: 12px; color: #666;">Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div class="info-grid">
            <div>
              <strong>Customer Info:</strong><br>
              Name: ${userInfo.name || "Customer"}<br>
              Email: ${userInfo.email || "N/A"}
            </div>
            <div>
              <strong>Shipping Address:</strong><br>
              ${order.shippingAddress?.address || "N/A"}, ${order.shippingAddress?.city || ""}<br>
              Postal Code: ${order.shippingAddress?.postalCode || "N/A"}<br>
              Payment Method: <strong>${order.paymentMethod || "COD"}</strong>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.orderItems
        .map(
          (item) => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>৳${item.price}</td>
                  <td>৳${item.price * item.quantity}</td>
                </tr>
              `,
        )
        .join("")}
            </tbody>
          </table>

          <div class="total-box">
            Total Paid: ৳${order.totalPrice}
          </div>

          <div class="footer">
            Thank you for shopping with Tech Store! ❤️<br>
            For support, contact: support@techstore.com
          </div>
        </div>
        <script>
        window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-24 space-y-6">
      {/* Top Banner / User Info Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 sm:p-8 rounded-3xl shadow-lg text-white flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5 text-center sm:text-left flex-col sm:flex-row">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-2xl flex items-center justify-center font-black text-3xl shadow-inner">
            {userInfo.name ? userInfo.name[0].toUpperCase() : "U"}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {userInfo.name || "User Profile"}
            </h1>
            <p className="text-blue-100 text-sm mt-0.5">{userInfo.email}</p>
            <span className="inline-block mt-2 bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/20">
              {userInfo.role === "admin" ? "⚡ Admin Account" : "🛍️ Customer Account"}
            </span>
          </div>
        </div>
        <div className="text-center bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20">
          <p className="text-xs text-blue-200 font-medium">Total Orders</p>
          <p className="text-2xl font-black">{orders.length}</p>
        </div>
      </div>

      {/* Alerts */}
      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-2xl text-sm font-semibold shadow-sm flex items-center gap-2">
          <span>✅</span> {message}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-sm font-semibold shadow-sm flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 max-w-md mx-auto sm:mx-0">
        <button
          onClick={() => {
            setActiveTab("orders");
            setMessage("");
            setError("");
          }}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${activeTab === "orders" ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-50"}`}
        >
          📦 My Orders
        </button>
        <button
          onClick={() => {
            setActiveTab("profile");
            setMessage("");
            setError("");
          }}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${activeTab === "profile" ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-50"}`}
        >
          ✏️ Edit Profile
        </button>
        <button
          onClick={() => {
            setActiveTab("security");
            setMessage("");
            setError("");
          }}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${activeTab === "security" ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-50"}`}
        >
          🔑 Security
        </button>
      </div>

      {/* Tab Contents */}
      <div className="transition-all duration-300">
        {/* 1. ORDERS TAB */}
        {activeTab === "orders" && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">
              Order History
            </h2>

            {loading ? (
              <div className="text-center py-12 text-gray-400 text-sm animate-pulse">
                Loading your orders... ⏳
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <span className="text-4xl">🛍️</span>
                <p className="text-gray-500 text-sm">
                  You haven't placed any orders yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="border border-gray-100 bg-white hover:border-blue-200 transition-all rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-900 text-sm">
                          Order #{order._id.substring(0, 10)}...
                        </span>
                        <span
                          className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${order.isPaid ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"}`}
                        >
                          {order.isPaid ? "Paid" : "Processing"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Date: {new Date(order.createdAt).toLocaleDateString()} •{" "}
                        {order.orderItems.length}{" "}
                        {order.orderItems.length === 1 ? "Item" : "Items"}
                      </p>
                      <p className="text-xs font-semibold text-blue-600">Tracking: {order.status || "Pending"}</p>
                      <p className="text-base font-black text-blue-600 pt-1">
                        ৳{order.totalPrice}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDownloadInvoice(order)}
                      className="bg-gray-50 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-gray-200 text-gray-700 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition shadow-xs"
                    >
                      <span>📄</span> Download Invoice
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. EDIT PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 max-w-xl">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6">
              Update Profile Information
            </h2>
            <form onSubmit={handleProfileUpdate} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
                  required
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="01XXXXXXXXX"
                  autoComplete="tel"
                />
              </div>
              <div className="border-t pt-5 space-y-4">
                <p className="text-sm font-bold text-gray-800">Saved Delivery Address</p>
                <input type="text" value={savedAddress.address} onChange={(e) => setSavedAddress({ ...savedAddress, address: e.target.value })} placeholder="House, road, area" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" value={savedAddress.city} onChange={(e) => setSavedAddress({ ...savedAddress, city: e.target.value })} placeholder="City" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition" />
                  <input type="text" value={savedAddress.postalCode} onChange={(e) => setSavedAddress({ ...savedAddress, postalCode: e.target.value })} placeholder="Postal code" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition" />
                </div>
              </div>
              <button
                type="submit"
                disabled={updateLoading}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-2xl transition shadow-md active:scale-95"
              >
                {updateLoading ? "Saving Changes..." : "Save Changes"}
              </button>
            </form>
          </div>
        )}

        {/* 3. SECURITY TAB */}
        {activeTab === "security" && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 max-w-xl">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6">
              Change Password
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
                  required
                  autoComplete="current-password"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) =>
                    setPasswords({ ...passwords, newPassword: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
                  required
                  autoComplete="new-password"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs px-6 py-3 rounded-2xl transition shadow-md active:scale-95"
              >
                Update Password
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
