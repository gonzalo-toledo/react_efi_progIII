import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { notifySucces, notifyError } from '../utils/Notifier';

const AdminRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div className="flex justify-content-center align-items-center" style={{ height: '100vh' }}>
            <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem' }}></i>
        </div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.rol !== 'admin') {
        notifyError('Acceso denegado. Solo administradores.');
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;