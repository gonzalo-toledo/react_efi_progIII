// layouts/home/NavbarLayout.jsx
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { Badge } from "primereact/badge";
import { Sidebar } from "primereact/sidebar";
import { Menu } from "primereact/menu";
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog";

const NavbarLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarVisible, setSidebarVisible] = useState(false);

    // Definir menú según rol
    const getMenuItems = () => {
        const baseItems = [
            {
                label: 'Principal',
                items: [
                    {
                        label: 'Dashboard',
                        icon: 'pi pi-home',
                        command: () => navigate('/'),
                        className: location.pathname === '/' ? 'active-menu-item' : ''
                    }
                ]
            }
        ];

        const roleItems = {
            admin: [
                {
                    label: 'Gestión',
                    items: [
                        {
                            label: 'Platos',
                            icon: 'pi pi-th-large',
                            command: () => navigate('/platos'),
                            className: location.pathname.includes('/platos') ? 'active-menu-item' : ''
                        },
                        {
                            label: 'Mesas',
                            icon: 'pi pi-table',
                            command: () => navigate('/mesas'),
                            className: location.pathname.includes('/mesas') ? 'active-menu-item' : ''
                        },
                        {
                            label: 'Pedidos',
                            icon: 'pi pi-shopping-cart',
                            command: () => navigate('/pedidos'),
                            className: location.pathname.includes('/pedidos') ? 'active-menu-item' : ''
                        }
                    ]
                }
            ],
            mesero: [
                {
                    label: 'Operaciones',
                    items: [
                        {
                            label: 'Crear Pedido',
                            icon: 'pi pi-plus-circle',
                            command: () => navigate('/pedidos/crear'),
                            className: location.pathname.includes('/pedidos/crear') ? 'active-menu-item' : ''
                        },
                        {
                            label: 'Pedidos',
                            icon: 'pi pi-shopping-cart',
                            command: () => navigate('/pedidos'),
                            className: location.pathname.includes('/pedidos') ? 'active-menu-item' : ''
                        },
                        {
                            label: 'Mesas',
                            icon: 'pi pi-table',
                            command: () => navigate('/mesas'),
                            className: location.pathname.includes('/mesas') ? 'active-menu-item' : ''
                        },
                        {
                            label: 'Platos',
                            icon: 'pi pi-th-large',
                            command: () => navigate('/platos'),
                            className: location.pathname.includes('/platos') ? 'active-menu-item' : ''
                        }
                    ]
                }
            ],
            cocinero: [
                {
                    label: 'Cocina',
                    items: [
                        {
                            label: 'Pedidos',
                            icon: 'pi pi-shopping-cart',
                            command: () => navigate('/pedidos'),
                            className: location.pathname.includes('/pedidos') ? 'active-menu-item' : ''
                        },
                        {
                            label: 'Platos',
                            icon: 'pi pi-th-large',
                            command: () => navigate('/platos'),
                            className: location.pathname.includes('/platos') ? 'active-menu-item' : ''
                        }
                    ]
                }
            ],
            cajero: [
                {
                    label: 'Caja',
                    items: [
                        {
                            label: 'Pedidos',
                            icon: 'pi pi-shopping-cart',
                            command: () => navigate('/pedidos'),
                            className: location.pathname.includes('/pedidos') ? 'active-menu-item' : ''
                        }
                    ]
                }
            ]
        };

        const userMenuItems = roleItems[user?.rol] || roleItems.mesero;
        
        const accountItems = [
            {
                label: 'Cuenta',
                items: [
                    {
                        label: 'Mi Perfil',
                        icon: 'pi pi-user',
                        command: () => navigate('/profile')
                    },
                    {
                        label: 'Cerrar Sesión',
                        icon: 'pi pi-sign-out',
                        command: () => handleLogout()
                    }
                ]
            }
        ];

        return [...baseItems, ...userMenuItems, ...accountItems];
    };

    const handleLogout = () => {
        confirmDialog({
            message: '¿Estás seguro que deseas cerrar sesión?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, salir',
            rejectLabel: 'Cancelar',
            accept: () => logout()
        });
    };

    const getRoleBadgeColor = () => {
        const colors = {
            admin: 'danger',
            mesero: 'info',
            cocinero: 'warning',
            cajero: 'success'
        };
        return colors[user?.rol] || 'info';
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <>
            <ConfirmDialog />
            
            {/* Top Navbar */}
            <div className="top-navbar">
                <div className="navbar-left">
                    <Button 
                        icon="pi pi-bars" 
                        onClick={() => setSidebarVisible(true)}
                        className="navbar-menu-btn"
                        text
                    />
                    <div className="navbar-brand" onClick={() => navigate('/')}>
                        <i className="pi pi-shop" style={{ fontSize: '1.5rem' }} />
                        <span className="brand-text">RestaurantApp</span>
                    </div>
                </div>

                <div className="navbar-right">
                    <Badge 
                        value={user?.rol?.toUpperCase()} 
                        severity={getRoleBadgeColor()}
                        className="ml-2"
                    />
                    <div className="user-info" onClick={() => navigate('/profile')}>
                        <Avatar 
                            label={getInitials(user?.nombre)} 
                            shape="circle" 
                            className="user-avatar"
                        />
                        <span className="user-name">{user?.nombre}</span>
                    </div>
                    <Button 
                        icon="pi pi-sign-out" 
                        onClick={handleLogout}
                        className="logout-btn"
                        text
                        rounded
                        tooltip="Cerrar sesión"
                        tooltipOptions={{ position: 'bottom' }}
                    />
                </div>
            </div>

            {/* Sidebar */}
            <Sidebar 
                visible={sidebarVisible} 
                onHide={() => setSidebarVisible(false)}
                className="custom-sidebar"
            >
                <div className="sidebar-header">
                    <Avatar 
                        label={getInitials(user?.nombre)} 
                        shape="circle" 
                        size="xlarge"
                        className="sidebar-avatar"
                    />
                    <h3 className="sidebar-username">{user?.nombre}</h3>
                    <p className="sidebar-role">
                        <Badge 
                            value={user?.rol} 
                            severity={getRoleBadgeColor()}
                        />
                    </p>
                </div>
                
                <Menu 
                    model={getMenuItems()} 
                    className="sidebar-menu"
                />
            </Sidebar>

            {/* Main Content */}
            <div className="main-content">
                <Outlet />
            </div>

            <style>{`
                .top-navbar {
                    position: sticky;
                    top: 0;
                    z-index: 999;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 2rem;
                    background: rgba(30, 30, 30, 0.95);
                    backdrop-filter: blur(10px);
                    border-bottom: 2px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
                }

                .navbar-left {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .navbar-menu-btn {
                    font-size: 1.5rem;
                }

                .navbar-brand {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .navbar-brand:hover {
                    transform: scale(1.05);
                }

                .brand-text {
                    font-size: 1.3rem;
                    font-weight: 700;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .navbar-right {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .role-badge {
                    font-size: 0.75rem;
                    padding: 0.4rem 0.8rem;
                }

                .user-info {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    padding: 0.5rem 1rem;
                    border-radius: 50px;
                    transition: all 0.3s ease;
                }

                .user-info:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                .user-avatar {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }

                .user-name {
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.9);
                }

                .sidebar-header {
                    text-align: center;
                    padding: 2rem 1rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    margin-bottom: 1rem;
                }

                .sidebar-avatar {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    margin-bottom: 1rem;
                }

                .sidebar-username {
                    font-size: 1.2rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    color: rgba(255, 255, 255, 0.9);
                }

                .sidebar-role {
                    margin: 0;
                }

                .main-content {
                    min-height: calc(100vh - 80px);
                    background: var(--surface-ground);
                }

                :global(.custom-sidebar) {
                    width: 280px;
                }

                :global(.custom-sidebar .p-sidebar-content) {
                    padding: 0;
                }

                :global(.sidebar-menu) {
                    border: none;
                    background: transparent;
                }

                :global(.sidebar-menu .p-menuitem-link) {
                    padding: 1rem 1.5rem;
                    transition: all 0.3s ease;
                }

                :global(.sidebar-menu .p-menuitem-link:hover) {
                    background: rgba(255, 255, 255, 0.1);
                }

                :global(.sidebar-menu .active-menu-item) {
                    background: rgba(102, 126, 234, 0.2);
                    border-left: 3px solid #667eea;
                }

                :global(.sidebar-menu .p-submenu-header) {
                    padding: 1rem 1.5rem 0.5rem;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.5);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                @media (max-width: 768px) {
                    .top-navbar {
                        padding: 0.75rem 1rem;
                    }

                    .brand-text {
                        display: none;
                    }

                    .user-name {
                        display: none;
                    }

                    .role-badge {
                        display: none;
                    }
                }
            `}</style>
        </>
    );
};

export default NavbarLayout;