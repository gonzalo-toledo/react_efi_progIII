import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
    const { user, loadingAuth } = useContext(AuthContext);

    // ✅ Esperar a que AuthContext cargue el user real
    if (loadingAuth) {
        return <div>Cargando...</div>; // puedes poner un spinner si querés
    }

    return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
