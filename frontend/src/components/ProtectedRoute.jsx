import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loader"></div>
                <p>Verifying authentication...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect to login but keep the location they were trying to go to
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}
