// layouts/pedidos/PedidosView.jsx
import { Fragment, useContext } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog";
import { Tag } from "primereact/tag";
import { Card } from "primereact/card";
import { useNavigate } from "react-router-dom";

import { PedidosContext } from "../../context/PedidosContext";
import { AuthContext } from "../../context/AuthContext";

const PedidosView = () => {
    const {
        pedidos,
        loading,
        lazy,
        setLazy,
        cancelPedido,
        changeEstado,
        closePedido,
    } = useContext(PedidosContext);

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Ver detalle del pedido
    const handleVer = (id) => navigate(`/pedidos/detalle/${id}`);

    // Cancelar pedido
    const handleCancel = (id) => {
        confirmDialog({
            message: "¿Está seguro que desea cancelar este pedido?",
            header: "Confirmación",
            icon: "pi pi-exclamation-triangle",
            acceptLabel: "Sí, cancelar",
            rejectLabel: "Cancelar",
            accept: async () => await cancelPedido(id),
        });
    };

    // Cerrar pedido (solo admin/cajero)
    const handleClose = (id) => {
        confirmDialog({
            message: "¿Cerrar pedido y liberar mesa?",
            header: "Confirmación",
            icon: "pi pi-check-circle",
            acceptLabel: "Sí, cerrar",
            rejectLabel: "Cancelar",
            accept: async () => await closePedido(id),
        });
    };

    // Confirmar cambio de estado
    const handleChangeEstado = (pedido) => {
        const nextEstado = {
            pendiente: "en preparación",
            "en preparación": "listo",
            listo: "servido",
            servido: "cuenta solicitada",
            "cuenta solicitada": "pagado",
        }[pedido.estado];

        if (!nextEstado) return;

        confirmDialog({
            message: `¿Desea avanzar el pedido de "${pedido.estado}" a "${nextEstado}"?`,
            header: "Confirmar cambio de estado",
            icon: "pi pi-refresh",
            acceptLabel: "Sí, cambiar",
            rejectLabel: "Cancelar",
            accept: async () => await changeEstado(pedido.id, nextEstado),
        });
    };

    // Template para el estado con badge de colores
    const estadoTemplate = (rowData) => {
        const estadoConfig = {
            pendiente: { severity: "warning", icon: "pi pi-clock" },
            "en preparación": { severity: "info", icon: "pi pi-spin pi-cog" },
            listo: { severity: "success", icon: "pi pi-check" },
            servido: { severity: "primary", icon: "pi pi-send" },
            "cuenta solicitada": { severity: "help", icon: "pi pi-dollar" },
            pagado: { severity: "success", icon: "pi pi-check-circle" },
            cancelado: { severity: "danger", icon: "pi pi-times" },
            cerrado: { severity: "secondary", icon: "pi pi-lock" },
        };

        const config = estadoConfig[rowData.estado] || { severity: "secondary", icon: "pi pi-question" };

        return (
            <Tag 
                value={rowData.estado} 
                severity={config.severity}
                icon={config.icon}
                className="estado-badge"
            />
        );
    };

    // Renderizar acciones
    const accionesTemplate = (rowData) => (
        <div className="p-d-flex p-gap-2" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* Ver detalle */}
            <Button 
                icon="pi pi-eye"
                label="Ver" 
                onClick={() => handleVer(rowData.id)}
                size="small"
                outlined
            />

            {/* Avanzar estado */}
            {[
                "pendiente",
                "en preparación",
                "listo",
                "servido",
                "cuenta solicitada",
            ].includes(rowData.estado) && (
                <Button
                    label="Avanzar"
                    icon="pi pi-arrow-right"
                    onClick={() => handleChangeEstado(rowData)}
                    size="small"
                    severity="info"
                />
            )}

            {/* Cancelar pedido (solo admin) */}
            {user?.rol === "admin" && !["cancelado", "cerrado"].includes(rowData.estado) && (
                <Button
                    icon="pi pi-times"
                    label="Cancelar"
                    severity="danger"
                    onClick={() => handleCancel(rowData.id)}
                    size="small"
                    outlined
                />
            )}

            {/* Cerrar pedido (solo admin/cajero) */}
            {["admin", "cajero"].includes(user?.rol) && 
             ["pagado", "cancelado"].includes(rowData.estado) && (
                <Button
                    icon="pi pi-lock"
                    label="Cerrar"
                    severity="success"
                    onClick={() => handleClose(rowData.id)}
                    size="small"
                />
            )}
        </div>
    );

    const formatFecha = (fecha) => {
        if (!fecha) return "-";
        const d = new Date(fecha);
        return isNaN(d.getTime())
            ? "-"
            : d.toLocaleString("es-AR", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
            });
    };

    const formatTotal = (rowData) => {
        return <span style={{ fontWeight: 600, color: '#10B981' }}>$ {rowData.total}</span>;
    };

    const mesaTemplate = (rowData) => {
        return (
            <Tag 
                value={`Mesa ${rowData.mesaId}`} 
                severity="info"
                icon="pi pi-table"
            />
        );
    };

    // Filtrar pedidos visibles
    const pedidosVisibles = pedidos?.filter((p) => p.estado !== "cerrado");

    // Estadísticas rápidas
    const getStats = () => {
        const activos = pedidosVisibles?.length || 0;
        const pendientes = pedidosVisibles?.filter(p => p.estado === "pendiente").length || 0;
        const enPreparacion = pedidosVisibles?.filter(p => p.estado === "en preparación").length || 0;
        const listos = pedidosVisibles?.filter(p => p.estado === "listo").length || 0;

        return { activos, pendientes, enPreparacion, listos };
    };

    const stats = getStats();

    // Render
    return (
        <Fragment>
            <ConfirmDialog />

            <div className="pedidos-container">
                {/* Header */}
                <div className="page-header">
                    <div>
                        <h1 className="page-title">
                            <i className="pi pi-shopping-cart mr-2" />
                            Gestión de Pedidos
                        </h1>
                        <p className="page-subtitle">Administra y controla todos los pedidos del restaurante</p>
                    </div>
                    {["admin", "mesero"].includes(user?.rol) && (
                        <Button
                            label="Nuevo Pedido"
                            icon="pi pi-plus"
                            onClick={() => navigate("/pedidos/crear")}
                            size="large"
                            className="create-btn"
                        />
                    )}
                </div>

                {/* Stats Cards */}
                <div className="stats-cards">
                    <Card className="stat-card-mini">
                        <div className="stat-mini-content">
                            <i className="pi pi-shopping-cart" style={{ fontSize: '2rem', color: '#3B82F6' }} />
                            <div>
                                <div className="stat-mini-value">{stats.activos}</div>
                                <div className="stat-mini-label">Activos</div>
                            </div>
                        </div>
                    </Card>
                    <Card className="stat-card-mini">
                        <div className="stat-mini-content">
                            <i className="pi pi-clock" style={{ fontSize: '2rem', color: '#F59E0B' }} />
                            <div>
                                <div className="stat-mini-value">{stats.pendientes}</div>
                                <div className="stat-mini-label">Pendientes</div>
                            </div>
                        </div>
                    </Card>
                    <Card className="stat-card-mini">
                        <div className="stat-mini-content">
                            <i className="pi pi-spin pi-cog" style={{ fontSize: '2rem', color: '#EF4444' }} />
                            <div>
                                <div className="stat-mini-value">{stats.enPreparacion}</div>
                                <div className="stat-mini-label">En Cocina</div>
                            </div>
                        </div>
                    </Card>
                    <Card className="stat-card-mini">
                        <div className="stat-mini-content">
                            <i className="pi pi-check" style={{ fontSize: '2rem', color: '#10B981' }} />
                            <div>
                                <div className="stat-mini-value">{stats.listos}</div>
                                <div className="stat-mini-label">Listos</div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Búsqueda */}
                <Card className="search-card">
                    <div className="p-inputgroup">
                        <span className="p-inputgroup-addon">
                            <i className="pi pi-search" />
                        </span>
                        <InputText
                            value={lazy?.q}
                            onChange={(e) =>
                                setLazy({ ...lazy, q: e.target.value, first: 0, page: 0 })
                            }
                            placeholder="Buscar por estado..."
                            className="search-input"
                        />
                    </div>
                </Card>

                {/* Tabla */}
                <Card className="table-card">
                    <DataTable
                        value={pedidosVisibles}
                        paginator
                        lazy
                        first={lazy?.first}
                        rows={lazy?.rows}
                        onPage={(e) =>
                            setLazy({
                                ...lazy,
                                first: e.first,
                                rows: e.rows,
                                page: e.page,
                            })
                        }
                        loading={loading}
                        emptyMessage={
                            lazy.q ? "No se encontraron resultados" : "No hay pedidos disponibles"
                        }
                        className="custom-datatable"
                        stripedRows
                        responsiveLayout="scroll"
                    >
                        <Column 
                            field="id" 
                            header="ID" 
                            sortable 
                            style={{ width: '80px' }}
                        />
                        <Column
                            field="created_at"
                            header="Fecha"
                            sortable
                            body={(rowData) => formatFecha(rowData.created_at)}
                        />
                        <Column 
                            field="mesaId" 
                            header="Mesa" 
                            sortable
                            body={mesaTemplate}
                        />
                        <Column 
                            field="meseroId" 
                            header="Mesero" 
                            sortable 
                        />
                        <Column 
                            field="estado" 
                            header="Estado" 
                            sortable
                            body={estadoTemplate}
                        />
                        <Column 
                            field="total" 
                            header="Total" 
                            body={formatTotal}
                            sortable
                        />
                        <Column
                            header="Acciones"
                            body={accionesTemplate}
                            exportable={false}
                            style={{ minWidth: "280px" }}
                        />
                    </DataTable>
                </Card>
            </div>

            <style>{`
                .pedidos-container {
                    padding: 2rem;
                    max-width: 1600px;
                    margin: 0 auto;
                }

                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }

                .page-title {
                    font-size: 2rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                    display: flex;
                    align-items: center;
                }

                .page-subtitle {
                    color: rgba(255, 255, 255, 0.7);
                    margin: 0;
                }

                .stats-cards {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                    margin-bottom: 2rem;
                }

                .stat-card-mini {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    transition: all 0.3s ease;
                }

                .stat-card-mini:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
                }

                .stat-mini-content {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .stat-mini-value {
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: #fff;
                }

                .stat-mini-label {
                    font-size: 0.9rem;
                    color: rgba(255, 255, 255, 0.6);
                }

                .search-card {
                    margin-bottom: 1.5rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .search-input {
                    font-size: 1rem;
                }

                .table-card {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .create-btn {
                    background: linear-gradient(135deg, #10B981 0%, #059669 100%);
                    border: none;
                }

                :global(.estado-badge) {
                    font-size: 0.85rem;
                    padding: 0.4rem 0.8rem;
                }

                :global(.custom-datatable .p-datatable-thead > tr > th) {
                    background: rgba(255, 255, 255, 0.08);
                    font-weight: 600;
                }

                @media (max-width: 768px) {
                    .pedidos-container {
                        padding: 1rem;
                    }

                    .page-header {
                        flex-direction: column;
                        gap: 1rem;
                        align-items: flex-start;
                    }

                    .stats-cards {
                        grid-template-columns: 1fr 1fr;
                    }
                }
            `}</style>
        </Fragment>
    );
};

export default PedidosView;