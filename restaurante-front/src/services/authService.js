import api from "./api";

const authService = {
    login: (credentials) => api.post("auth/login", credentials),
    register: (data) => api.post("auth/register", data),
    forgotPassword: (email) => api.post("auth/forgot-password", { email }),
    resetPassword: (data) => api.post("auth/reset-password", data),
    updateProfile: (data) => api.put("auth/update-profile", data),
    roles: () => api.get("auth/roles"),
    profile: () => api.get("auth/profile"), 
}

export default authService;