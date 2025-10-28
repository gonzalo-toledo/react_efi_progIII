import 'primereact/resources/themes/lara-dark-indigo/theme.css'; 
import 'primereact/resources/primereact.min.css';               
import 'primeicons/primeicons.css';
import './App.css';

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toast } from 'primereact/toast';
import { TOAST_REF } from './utils/ToastRef';

import { AuthProvider } from './context/AuthContext';

import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import Home from './layouts/home/Home';
import NavbarLayout from './layouts/home/NavbarLayout';

import AuthModule from './components/auth';
import { PlatosProvider } from './context/PlatosContext';
import PlatosModule from './layouts/platos';
import { MesasProvider } from './context/MesasContext';
import MesasModule from './layouts/mesas';
import { PedidosProvider } from './context/PedidosContext';
import PedidosModule from './layouts/pedidos';
import UsersPanel from './components/auth/UsersPanel';
import EditProfile from './components/auth/EditProfile';

function App() {
    return (
        <BrowserRouter>
            <Toast ref={TOAST_REF} position="top-right" />
            <AuthProvider>
                <Routes>
                    {/* Rutas públicas (login, register, etc.) */}
                    <Route path="/*" element={<AuthModule />} />

                    {/* Grupo de rutas privadas con Navbar */}
                    <Route element={<PrivateRoute><NavbarLayout /></PrivateRoute>}>
                        <Route path="/" element={<Home />} />
                        
                        {/* Editar perfil */}
                        <Route path="/profile" element={<EditProfile />} />

                        {/* Panel de usuarios - Solo admin */}
                        <Route 
                            path="/usuarios" 
                            element={
                                <AdminRoute>
                                    <UsersPanel />
                                </AdminRoute>
                            } 
                        />

                        <Route 
                            path="/platos/*" 
                            element={
                                <PlatosProvider>
                                    <PlatosModule />
                                </PlatosProvider>
                            } 
                        />

                        <Route 
                            path="/mesas/*" 
                            element={
                                <MesasProvider>
                                    <MesasModule />
                                </MesasProvider>
                            } 
                        />

                        <Route 
                            path="/pedidos/*" 
                            element={
                                <PlatosProvider>
                                    <MesasProvider>
                                        <PedidosProvider>
                                            <PedidosModule />
                                        </PedidosProvider>
                                    </MesasProvider>
                                </PlatosProvider>
                            } 
                        />
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;