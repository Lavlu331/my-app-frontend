import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AdminRoute = ({ children }) => {
    let userInfo = null;
    try {
        const storedUserInfo = localStorage.getItem('userInfo');
        userInfo = storedUserInfo ? JSON.parse(storedUserInfo) : null;
    } catch {
        localStorage.removeItem('userInfo');
    }

    
    const isAdmin = 
        userInfo?.role === 'admin' || 
        userInfo?.user?.role === 'admin' || 
        userInfo?.isAdmin === true || 
        userInfo?.user?.isAdmin === true;

    useEffect(() => {
        if (!userInfo || !isAdmin) {
            toast.error('Access Denied! Admins only. 🔒', { id: 'admin-access-denied' });
        }
    }, [userInfo, isAdmin]);

    if (!userInfo || !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;
