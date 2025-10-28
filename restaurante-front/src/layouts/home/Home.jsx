import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Badge } from "primereact/badge";
import { Skeleton } from "primereact/skeleton";
import "./Home.css";

const Home = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        pedidosActivos: 0,
        mesasOcupadas: 0,
        mesasDisponibles: 0,
        platosDisponibles: 0,
        pedidosPendientes: 0,
        pedidosEnPreparacion: 0,
        pedidosListos: 0,
        totalVentas: 0
    });
    const [loading, setLoading] = useState(true);

    // Simular carga de estadísticas (aquí conectarías con tu API)
    useEffect(() => {
        setTimeout(() => {
            setStats({
                pedidosActivos: 12,
                mesasOcupadas: 8,
                mesasDisponibles: 12,
                platosDisponibles: 45,
                pedidosPendientes: 3,
                pedidosEnPreparacion: 5,
                pedidosListos: 4,
                totalVentas: 15420
            });
            setLoading(false);
        }, 1000);
    }, []);

    // Accesos rápidos según rol
    const getQuickActions = () => {
        const actions = {
            admin: [
                { label: "Gestionar Platos", icon: "pi pi-th-large", path: "/platos", color: "#8B5CF6" },
                { label: "Gestionar Mesas", icon: "pi pi-table", path: "/mesas", color: "#EC4899" },
                { label: "Ver Pedidos", icon: "pi pi-shopping-cart", path: "/pedidos", color: "#3B82F6" },
                { label: "Crear Pedido", icon: "pi pi-plus-circle", path: "/pedidos/crear", color: "#10B981" }
            ],
            mesero: [
                { label: "Crear Pedido", icon: "pi pi-plus-circle", path: "/pedidos/crear", color: "#10B981" },
                { label: "Ver Pedidos", icon: "pi pi-shopping-cart", path: "/pedidos", color: "#3B82F6" },
                { label: "Ver Mesas", icon: "pi pi-table", path: "/mesas", color: "#EC4899" },
                { label: "Ver Platos", icon: "pi pi-th-large", path: "/platos", color: "#8B5CF6" }
            ],
            cocinero: [
                { label: "Pedidos Pendientes", icon: "pi pi-clock", path: "/pedidos", color: "#F59E0B" },
                { label: "En Preparación", icon: "pi pi-spin pi-spinner", path: "/pedidos", color: "#EF4444" },
                { label: "Ver Platos", icon: "pi pi-th-large", path: "/platos", color: "#8B5CF6" }
            ],
            cajero: [
                { label: "Pedidos para Cobrar", icon: "pi pi-dollar", path: "/pedidos", color: "#10B981" },
                { label: "Ver Pedidos", icon: "pi pi-shopping-cart", path: "/pedidos", color: "#3B82F6" },
                { label: "Cerrar Pedidos", icon: "pi pi-lock", path: "/pedidos", color: "#6366F1" }
            ]
        };
        return actions[user?.rol] || actions.mesero;
    };

    // Estadísticas relevantes según rol
    const getRelevantStats = () => {
        const allStats = [
            { 
                label: "Pedidos Activos", 
                value: stats.pedidosActivos, 
                icon: "pi pi-shopping-cart", 
                color: "#3B82F6",
                roles: ["admin", "mesero", "cocinero", "cajero"]
            },
            { 
                label: "Mesas Ocupadas", 
                value: stats.mesasOcupadas, 
                icon: "pi pi-users", 
                color: "#EC4899",
                roles: ["admin", "mesero"]
            },
            { 
                label: "Mesas Disponibles", 
                value: stats.mesasDisponibles, 
                icon: "pi pi-check-circle", 
                color: "#10B981",
                roles: ["admin", "mesero"]
            },
            { 
                label: "Platos Disponibles", 
                value: stats.platosDisponibles, 
                icon: "pi pi-th-large", 
                color: "#8B5CF6",
                roles: ["admin", "cocinero"]
            },
            { 
                label: "Pendientes", 
                value: stats.pedidosPendientes, 
                icon: "pi pi-clock", 
                color: "#F59E0B",
                roles: ["admin", "cocinero"]
            },
            { 
                label: "En Preparación", 
                value: stats.pedidosEnPreparacion, 
                icon: "pi pi-spin pi-cog", 
                color: "#EF4444",
                roles: ["admin", "cocinero"]
            },
            { 
                label: "Listos", 
                value: stats.pedidosListos, 
                icon: "pi pi-check", 
                color: "#14B8A6",
                roles: ["admin", "mesero", "cocinero"]
            },
            { 
                label: "Ventas del Día", 
                value: `$${stats.totalVentas}`, 
                icon: "pi pi-dollar", 
                color: "#10B981",
                roles: ["admin", "cajero"]
            }
        ];

        return allStats.filter(stat => stat.roles.includes(user?.rol));
    };

    const StatCard = ({ label, value, icon, color }) => (
        <Card className="stat-card" style={{ borderLeft: `4px solid ${color}` }}>
            {loading ? (
                <>
                    <Skeleton width="100%" height="2rem" className="mb-2" />
                    <Skeleton width="60%" height="1.5rem" />
                </>
            ) : (
                <>
                    <div className="stat-header">
                        <i className={icon} style={{ fontSize: "2rem", color }} />
                        <span className="stat-value">{value}</span>
                    </div>
                    <div className="stat-label">{label}</div>
                </>
            )}
        </Card>
    );

    const QuickActionCard = ({ label, icon, path, color }) => (
        <Card 
            className="quick-action-card" 
            onClick={() => navigate(path)}
            style={{ cursor: "pointer", borderTop: `3px solid ${color}` }}
        >
            <div className="quick-action-content">
                <i className={icon} style={{ fontSize: "2.5rem", color }} />
                <span className="quick-action-label">{label}</span>
            </div>
        </Card>
    );

    const getRoleBadge = () => {
        const roleColors = {
            admin: "danger",
            mesero: "info",
            cocinero: "warning",
            cajero: "success"
        };
        return roleColors[user?.rol] || "info";
    };

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">
                        ¡Bienvenido, {user?.nombre || "Usuario"}! 👋
                    </h1>
                    <p className="dashboard-subtitle">
                        Panel de control del restaurante
                        <Badge 
                            value={user?.rol?.toUpperCase()} 
                            severity={getRoleBadge()} 
                            className="ml-2"
                        />
                    </p>
                </div>
            </div>

            {/* Estadísticas */}
            <div className="stats-section">
                <h2 className="section-title">
                    <i className="pi pi-chart-bar mr-2" />
                    Estadísticas en Tiempo Real
                </h2>
                <div className="stats-grid">
                    {getRelevantStats().map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))}
                </div>
            </div>

            {/* Accesos Rápidos */}
            <div className="quick-actions-section">
                <h2 className="section-title">
                    <i className="pi pi-bolt mr-2" />
                    Accesos Rápidos
                </h2>
                <div className="quick-actions-grid">
                    {getQuickActions().map((action, index) => (
                        <QuickActionCard key={index} {...action} />
                    ))}
                </div>
            </div>

            {/* Información adicional según rol */}
            <div className="info-section">
                <Card className="info-card">
                    <h3 className="info-title">
                        <i className="pi pi-info-circle mr-2" />
                        Información de tu Rol
                    </h3>
                    {user?.rol === "admin" && (
                        <p>Como administrador, tienes control total sobre el sistema. Puedes gestionar platos, mesas, pedidos y usuarios.</p>
                    )}
                    {user?.rol === "mesero" && (
                        <p>Como mesero, puedes crear pedidos, asignar mesas y gestionar el servicio a los clientes.</p>
                    )}
                    {user?.rol === "cocinero" && (
                        <p>Como cocinero, gestiona los pedidos desde pendiente hasta listo para servir.</p>
                    )}
                    {user?.rol === "cajero" && (
                        <p>Como cajero, gestiona los cobros y cierre de pedidos, liberando las mesas.</p>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default Home;