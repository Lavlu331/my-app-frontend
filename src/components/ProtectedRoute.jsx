import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    let userInfo = null;
    try {
        const storedUserInfo = localStorage.getItem('userInfo');
        userInfo = storedUserInfo ? JSON.parse(storedUserInfo) : null;
    } catch {
        localStorage.removeItem('userInfo');
    }
    const location = useLocation();

    if (!userInfo) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return children;
};

export default ProtectedRoute;
