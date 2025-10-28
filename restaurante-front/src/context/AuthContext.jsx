import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService.js";
import { jwtDecode } from "jwt-decode";
import { notifyInfo, notifyError, notifySucces } from "../utils/Notifier";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const [loadingAuth, setLoadingAuth] = useState(true); // ✅ NUEVO



    const decodeUser = (token) => {
        try {
            const decoded = jwtDecode(token);
            if (!decoded || (decoded.exp && decoded.exp * 1000 < Date.now())) {
                return null;
            }
            return {
                id: decoded.id,
                nombre: decoded.nombre || "",
                email: decoded.email || "",
                rol: decoded.rol || ""  // ✅ nos aseguramos que el rol exista
            };
        } catch (e) {
            console.error("Error decoding token:", e);
            return null;
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const userLogued = decodeUser(token);
            if (userLogued) {
                setUser(userLogued);
            } else {
                localStorage.removeItem("token");
            }
        }
        setLoadingAuth(false); // ✅ listo para renderizar
    }, []);

    const login = async (credentials) => {
        try {
            const { data } = await authService.login(credentials);
            const token = data?.token;
            localStorage.setItem("token", token);

            // ✅ usar decodeUser SIEMPRE
            const userLogued = decodeUser(token);
            setUser(userLogued);

            navigate("/platos");
        } catch (error) {
            console.log(error);
            notifyError(error.message);
        }
    };




    const updateProfile = async (profileData, { redirect = false } = {}) => {
        try {
        const response = await authService.updateProfile(profileData);
        const { status, data } = response;

        if (status === 200) {
            notifySucces(data?.message || "Perfil actualizado correctamente");

            if (data?.token) {
            localStorage.setItem("token", data.token);
            const newUser = decodeUser(data.token);
            if (newUser) setUser(newUser);
            } else if (data?.user) {
            const updated = {
                nombre: data.user.nombre ?? user?.nombre,
                email: data.user.email ?? user?.email,
                rol: data.user.rol ?? user?.rol,
            };
            setUser(updated);
            } else {
            setUser((prev) => ({ ...prev, ...profileData }));
            }

            if (redirect) navigate("/");
            return { ok: true, data };
        } else {
            notifyError(data?.message || "No se pudo actualizar el perfil");
            return { ok: false, data };
        }
        } catch (error) {
        console.error("Update profile error:", error?.response || error);
        const msg = error?.response?.data?.message || "Error actualizando perfil";
        notifyError(msg);
        return { ok: false, error };
        }
    };


    const register = async (userData) => {
        try {
        const response = await authService.register(userData);
        const { status, data } = response;

        if (status === 201 || status === 200) {
            notifySucces(data?.message || "Usuario creado exitosamente");
            navigate("/login");
        } else {
            notifyError(data?.message || "Error al registrar usuario");
        }
        } catch (error) {
        console.error("Register error:", error?.response || error);
        const msg = error?.response?.data?.message || "Hubo un error al registrar el usuario";
        notifyError(msg);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("token");
        navigate("/login");
    };

    const forgotPassword = async (email) => {
        try {
        const response = await authService.forgotPassword(email);
        const { data } = response;
        notifySucces(data?.message || "Si existe el usuario, se envió un email");
        return true;
        } catch (error) {
        console.error("Forgot password error:", error?.response || error);
        notifyError(error?.response?.data?.message || "Error al solicitar recuperación");
        return false;
        }
    };

    const resetPassword = async (id, token, password) => {
        try {
        const bodyResetPassword = {
            id: Number(id),
            token,
            password,
        };
        const response = await authService.resetPassword(bodyResetPassword);
        const { status, data } = response;
        if (status === 200) {
            notifySucces(data?.message || "Contraseña actualizada con éxito");
            return true;
        } else {
            notifyError(data?.message || "No se pudo actualizar la contraseña");
            return false;
        }
        } catch (error) {
        console.error("Reset password error:", error?.response || error);
        notifyError(error?.response?.data?.message || "Hubo un error al actualizar la contraseña");
        return false;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                register,
                login,
                updateProfile,
                logout,
                forgotPassword,
                resetPassword,
                loadingAuth   // ✅ ¡AGREGAR ESTO!
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};