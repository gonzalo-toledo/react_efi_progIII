// layouts/platos/PlatosView.jsx
import { Fragment, useContext } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { PlatosContext } from "../../context/PlatosContext";
import { AuthContext } from "../../context/AuthContext";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog";
import { InputSwitch } from "primereact/inputswitch";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";

const PlatosView = () => {
    const {
        platos,
        setEditingPlato,
        loading,
        lazy,
        setLazy,
        deletePlato,
        toggleDisponibilidad,
    } = useContext(PlatosContext);

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
        
    
    const handleEdit = (plato) => {
        setEditingPlato(plato);
        navigate(`/platos/editar/${plato.id}`);
    };

    const handleDelete = (id) => {
        confirmDialog({
            message: "¿Está seguro que desea eliminar este plato?",
            header: "Confirmación",
            icon: "pi pi-exclamation-triangle",
            acceptLabel: "Sí, eliminar",
            rejectLabel: "Cancelar",
            accept: async () => {
                await deletePlato(id);
            },
        });
    };

    const bodyActions = (rowData) => (
        <div className="p-d-flex p-gap-2" style={{ display: 'flex', gap: '0.5rem' }}>
            <Button 
                icon="pi pi-pencil"
                label="Editar" 
                onClick={() => handleEdit(rowData)}
                size="small"
                outlined
            />
            <Button
                icon="pi pi-trash"
                label="Eliminar"
                severity="danger"
                onClick={() => handleDelete(rowData.id)}
                size="small"
                outlined
            />
        </div>
    );

    const precioTemplate = (rowData) => {
        return <span style={{ fontWeight: 600, color: '#10B981' }}>$ {rowData.precio}</span>;
    };

    const disponibilidadTemplate = (rowData) => {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <InputSwitch
                    checked={rowData.disponibilidad}
                    onChange={(e) => toggleDisponibilidad(rowData.id, e.value)}
                />
                <Tag 
                    value={rowData.disponibilidad ? "Disponible" : "No disponible"}
                    severity={rowData.disponibilidad ? "success" : "danger"}
                    icon={rowData.disponibilidad ? "pi pi-check" : "pi pi-times"}
                />
            </div>
        );
    };

    const descripcionTemplate = (rowData) => {
        const desc = rowData.descripcion || "Sin descripción";
        return (
            <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {desc.length > 50 ? `${desc.substring(0, 50)}...` : desc}
            </span>
        );
    };

    const platosVisibles = user?.rol === "admin" ? platos : platos.filter(p => p.disponibilidad === true);

    // Estadísticas
    const getStats = () => {
        const total = platos?.length || 0;
        const disponibles = platos?.filter(p => p.disponibilidad).length || 0;
        const noDisponibles = total - disponibles;
        return { total, disponibles, noDisponibles };
    };

    const stats = getStats();
    console.log("Render PlatosView user:", user);

    return (
        <Fragment>
            <ConfirmDialog />

            <div className="platos-container">
                {/* Header */}
                <div className="page-header">
                    <div>
                        <h1 className="page-title">
                            <i className="pi pi-th-large mr-2" />
                            Gestión de Platos
                        </h1>
                        <p className="page-subtitle">Administra el menú del restaurante</p>
                    </div>
                    {user?.rol === "admin" && (
                        <Button
                            label="Nuevo Plato"
                            icon="pi pi-plus"
                            onClick={() => navigate("/platos/crear")}
                            size="large"
                            className="create-btn"
                        />
                    )}
                </div>

                {/* Stats Cards */}
                <div className="stats-cards">
                    <Card className="stat-card-mini">
                        <div className="stat-mini-content">
                            <i className="pi pi-th-large" style={{ fontSize: '2rem', color: '#8B5CF6' }} />
                            <div>
                                <div className="stat-mini-value">{stats.total}</div>
                                <div className="stat-mini-label">Total Platos</div>
                            </div>
                        </div>
                    </Card>
                    <Card className="stat-card-mini">
                        <div className="stat-mini-content">
                            <i className="pi pi-check-circle" style={{ fontSize: '2rem', color: '#10B981' }} />
                            <div>
                                <div className="stat-mini-value">{stats.disponibles}</div>
                                <div className="stat-mini-label">Disponibles</div>
                            </div>
                        </div>
                    </Card>
                    <Card className="stat-card-mini">
                        <div className="stat-mini-content">
                            <i className="pi pi-times-circle" style={{ fontSize: '2rem', color: '#EF4444' }} />
                            <div>
                                <div className="stat-mini-value">{stats.noDisponibles}</div>
                                <div className="stat-mini-label">No Disponibles</div>
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
                            placeholder="Buscar por nombre del plato..."
                            className="search-input"
                        />
                    </div>
                </Card>

                {/* Tabla de datos */}
                <Card className="table-card">
                    <DataTable
                        key={user?.rol} // fuerza re-render cuando el rol cambia
                        value={platosVisibles || []}
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
                        className="custom-datatable"
                        emptyMessage={
                            lazy.q ? "No se encontraron resultados" : "No hay platos disponibles"
                        }
                        stripedRows
                        responsiveLayout="scroll"
                        >
                        <Column field="nombre" header="Nombre" sortable style={{ fontWeight: 600 }} />
                        <Column field="precio" header="Precio" sortable body={precioTemplate} />
                        <Column field="descripcion" header="Descripción" body={descripcionTemplate} />
                        {user?.rol === "admin" && (
                            <Column 
                                field="disponibilidad" 
                                header="Disponibilidad" 
                                body={disponibilidadTemplate}
                            />
                        )}
                        {user?.rol === "admin" && (
                            <Column 
                                header="Acciones" 
                                body={bodyActions} 
                                style={{ minWidth: '150px' }} 
                            />
                        )}
                        </DataTable>
                </Card>
            </div>

            <style>{`
                .platos-container {
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
                    background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
                    border: none;
                }

                :global(.custom-datatable .p-datatable-thead > tr > th) {
                    background: rgba(255, 255, 255, 0.08);
                    font-weight: 600;
                }

                @media (max-width: 768px) {
                    .platos-container {
                        padding: 1rem;
                    }

                    .page-header {
                        flex-direction: column;
                        gap: 1rem;
                        align-items: flex-start;
                    }

                    .stats-cards {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </Fragment>
    );
};

export default PlatosView;