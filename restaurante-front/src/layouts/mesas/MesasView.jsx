// layouts/mesas/MesasView.jsx
import { Fragment, useContext, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { MesasContext } from "../../context/MesasContext";
import { AuthContext } from "../../context/AuthContext";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog";
import { InputSwitch } from "primereact/inputswitch";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";

const MesasView = () => {
    const {
        mesas,
        loading,
        lazy,
        setLazy,
        deleteMesa,
        toggleDisponibilidad,
        createMesa,
        editMesa,
    } = useContext(MesasContext);

    const { user } = useContext(AuthContext);

    // Estados para el modal
    const [showDialog, setShowDialog] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({
        id: null,
        numero: '',
        capacidad: '',
        disponible: true,
    });

    // Abrir modal para crear
    const openNew = () => {
        setForm({
            id: null,
            numero: '',
            capacidad: '',
            disponible: true,
        });
        setEditMode(false);
        setShowDialog(true);
    };

    // Abrir modal para editar
    const handleEdit = (mesa) => {
        setForm({
            id: mesa.id,
            numero: mesa.numero,
            capacidad: mesa.capacidad,
            disponible: mesa.disponible,
        });
        setEditMode(true);
        setShowDialog(true);
    };

    // Enviar formulario
    const handleSubmit = async () => {
        // Validaciones básicas
        if (!form.numero || form.numero <= 0) {
            alert('El número de mesa debe ser mayor a 0');
            return;
        }
        if (!form.capacidad || form.capacidad <= 0) {
            alert('La capacidad debe ser mayor a 0');
            return;
        }

        const payload = {
            numero: form.numero,
            capacidad: form.capacidad,
            disponible: form.disponible,
        };

        let success;
        if (editMode) {
            success = await editMesa({ ...payload, id: form.id });
        } else {
            success = await createMesa(payload);
        }

        if (success) {
            setShowDialog(false);
            setForm({
                id: null,
                numero: '',
                capacidad: '',
                disponible: true,
            });
        }
    };

    const handleDelete = (id) => {
        confirmDialog({
            message: "¿Está seguro que desea eliminar esta mesa?",
            header: "Confirmación",
            icon: "pi pi-exclamation-triangle",
            acceptLabel: "Sí, eliminar",
            rejectLabel: "Cancelar",
            accept: async () => {
                await deleteMesa(id);
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

    const numeroTemplate = (rowData) => {
        return (
            <Tag 
                value={`Mesa ${rowData.numero}`} 
                severity="info"
                icon="pi pi-table"
                style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}
            />
        );
    };

    const capacidadTemplate = (rowData) => {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="pi pi-users" style={{ color: '#8B5CF6' }} />
                <span style={{ fontWeight: 600 }}>{rowData.capacidad} personas</span>
            </div>
        );
    };

    const disponibilidadTemplate = (rowData) => {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <InputSwitch
                    checked={rowData.disponible}
                    onChange={(e) => toggleDisponibilidad(rowData.id, e.value)}
                />
                <Tag 
                    value={rowData.disponible ? "Disponible" : "Ocupada"}
                    severity={rowData.disponible ? "success" : "danger"}
                    icon={rowData.disponible ? "pi pi-check" : "pi pi-lock"}
                />
            </div>
        );
    };

    // Filtrado según rol
    const mesasVisibles =
        user?.rol === "admin"
            ? mesas
            : mesas.filter((m) => m.disponible === true);

    // Estadísticas
    const getStats = () => {
        const total = mesas?.length || 0;
        const disponibles = mesas?.filter(m => m.disponible).length || 0;
        const ocupadas = total - disponibles;
        const capacidadTotal = mesas?.reduce((acc, m) => acc + (m.capacidad || 0), 0) || 0;
        return { total, disponibles, ocupadas, capacidadTotal };
    };

    const stats = getStats();

    return (
        <Fragment>
            <ConfirmDialog />

            <div className="mesas-container">
                {/* Header */}
                <div className="page-header">
                    <div>
                        <h1 className="page-title">
                            <i className="pi pi-table mr-2" />
                            Gestión de Mesas
                        </h1>
                        <p className="page-subtitle">Administra las mesas del restaurante</p>
                    </div>
                    {user?.rol === "admin" && (
                        <Button
                            label="Nueva Mesa"
                            icon="pi pi-plus"
                            onClick={openNew}
                            size="large"
                            className="create-btn"
                        />
                    )}
                </div>

                {/* Stats Cards */}
                <div className="stats-cards">
                    <Card className="stat-card-mini">
                        <div className="stat-mini-content">
                            <i className="pi pi-table" style={{ fontSize: '2rem', color: '#EC4899' }} />
                            <div>
                                <div className="stat-mini-value">{stats.total}</div>
                                <div className="stat-mini-label">Total Mesas</div>
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
                            <i className="pi pi-lock" style={{ fontSize: '2rem', color: '#EF4444' }} />
                            <div>
                                <div className="stat-mini-value">{stats.ocupadas}</div>
                                <div className="stat-mini-label">Ocupadas</div>
                            </div>
                        </div>
                    </Card>
                    <Card className="stat-card-mini">
                        <div className="stat-mini-content">
                            <i className="pi pi-users" style={{ fontSize: '2rem', color: '#8B5CF6' }} />
                            <div>
                                <div className="stat-mini-value">{stats.capacidadTotal}</div>
                                <div className="stat-mini-label">Capacidad Total</div>
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
                            placeholder="Buscar por capacidad..."
                            className="search-input"
                        />
                    </div>
                </Card>

                {/* Tabla de datos */}
                <Card className="table-card">
                    <DataTable
                        value={mesasVisibles}
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
                        className="custom-datatable"
                        emptyMessage={
                            lazy.q ? "No se encontraron resultados" : "No hay mesas disponibles"
                        }
                        stripedRows
                        responsiveLayout="scroll"
                    >
                        <Column 
                            field="numero" 
                            header="Número" 
                            sortable
                            body={numeroTemplate}
                        />
                        <Column 
                            field="capacidad" 
                            header="Capacidad" 
                            sortable
                            body={capacidadTemplate}
                        />
                        {user?.rol === "admin" && (
                            <Column 
                                field="disponible" 
                                header="Disponibilidad" 
                                sortable
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

            {/* Dialog Modal */}
            <Dialog
                visible={showDialog}
                style={{ width: '450px' }}
                header={editMode ? 'Editar Mesa' : 'Nueva Mesa'}
                modal
                onHide={() => setShowDialog(false)}
            >
                <div className="flex flex-column gap-3">
                    <div className="field">
                        <label htmlFor="numero" className="font-bold">Número *</label>
                        <InputNumber
                            id="numero"
                            value={form.numero}
                            onValueChange={(e) => setForm({ ...form, numero: e.value })}
                            className="w-full"
                            placeholder="Ingrese el número de mesa"
                            min={1}
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="capacidad" className="font-bold">Capacidad *</label>
                        <InputNumber
                            id="capacidad"
                            value={form.capacidad}
                            onValueChange={(e) => setForm({ ...form, capacidad: e.value })}
                            className="w-full"
                            placeholder="Número de personas"
                            min={1}
                        />
                    </div>

                    <div className="field-checkbox">
                        <InputSwitch
                            inputId="disponible"
                            checked={form.disponible}
                            onChange={(e) => setForm({ ...form, disponible: e.value })}
                        />
                        <label htmlFor="disponible" className="ml-2">Disponible</label>
                    </div>

                    <div className="flex justify-content-end gap-2 mt-3">
                        <Button
                            label="Cancelar"
                            icon="pi pi-times"
                            outlined
                            onClick={() => setShowDialog(false)}
                        />
                        <Button
                            label="Guardar"
                            icon="pi pi-check"
                            onClick={handleSubmit}
                            loading={loading}
                        />
                    </div>
                </div>
            </Dialog>

            <style>{`
                .mesas-container {
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
                    background: linear-gradient(135deg, #EC4899 0%, #DB2777 100%);
                    border: none;
                }

                .field {
                    margin-bottom: 1rem;
                }

                .field label {
                    display: block;
                    margin-bottom: 0.5rem;
                }

                .field-checkbox {
                    display: flex;
                    align-items: center;
                    margin-top: 1rem;
                }

                :global(.custom-datatable .p-datatable-thead > tr > th) {
                    background: rgba(255, 255, 255, 0.08);
                    font-weight: 600;
                }

                @media (max-width: 768px) {
                    .mesas-container {
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

export default MesasView;