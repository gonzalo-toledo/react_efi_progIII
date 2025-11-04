    // layouts/pedidos/PedidosView.jsx
    import { Fragment, useContext, useState, useEffect } from "react";
    import { DataTable } from "primereact/datatable";
    import { Column } from "primereact/column";
    import { Button } from "primereact/button";
    import { InputText } from "primereact/inputtext";
    import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog";
    import { Tag } from "primereact/tag";
    import { Card } from "primereact/card";
    import { Dialog } from "primereact/dialog";
    import { Dropdown } from "primereact/dropdown";
    import { InputNumber } from "primereact/inputnumber";
    import { Divider } from "primereact/divider";
    import { useNavigate } from "react-router-dom";
    import { exportToPdf } from '../../utils/ExportToPdf';

    import { PedidosContext } from "../../context/PedidosContext";
    import { MesasContext } from "../../context/MesasContext";
    import { PlatosContext } from "../../context/PlatosContext";
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
        createPedido,
    } = useContext(PedidosContext);

    const { user } = useContext(AuthContext);
    const { mesas, getMesas } = useContext(MesasContext);
    const { platos, getPlatos } = useContext(PlatosContext);
    const navigate = useNavigate();

    // Estados para el modal
    const [showDialog, setShowDialog] = useState(false);
    const [form, setForm] = useState({
        mesaId: '',
        meseroId: user?.id,
        detalles: [{ platoId: '', cantidad: 1 }],
    });

    useEffect(() => {
        getMesas?.();
        getPlatos?.();
    }, []);

    // Abrir modal para crear pedido
    const openNew = () => {
        setForm({
        mesaId: '',
        meseroId: user?.id,
        detalles: [{ platoId: '', cantidad: 1 }],
        });
        setShowDialog(true);
    };

    // Agregar un nuevo detalle de plato (solo si el último está completo)
    const addDetalle = () => {
        const last = form.detalles[form.detalles.length - 1];
        if (!last || !last.platoId) return; // prevención: no agregar si último vacío
        setForm({
        ...form,
        detalles: [...form.detalles, { platoId: '', cantidad: 1 }],
        });
    };

    // Eliminar un detalle de plato
    const removeDetalle = (index) => {
        if (form.detalles.length === 1) return; // seguridad: no eliminar si solo queda uno
        const newDetalles = form.detalles.filter((_, i) => i !== index);
        setForm({ ...form, detalles: newDetalles });
    };

    // Actualizar un detalle específico
    const updateDetalle = (index, field, value) => {
        const newDetalles = [...form.detalles];
        newDetalles[index][field] = value;
        setForm({ ...form, detalles: newDetalles });
    };

    // Calcular total del pedido
    const calcularTotal = () => {
        return form.detalles.reduce((acc, item) => {
        const plato = platos?.find(p => p.id === item.platoId);
        return acc + (plato?.precio || 0) * (item.cantidad || 0);
        }, 0);
    };

    // Enviar formulario
    const handleSubmit = async () => {
        // Validaciones
        if (!form.mesaId) {
        alert('Debe seleccionar una mesa');
        return;
        }
        if (form.detalles.length === 0) {
        alert('Debe agregar al menos un plato');
        return;
        }
        if (form.detalles.some(d => !d.platoId || d.cantidad <= 0)) {
        alert('Todos los platos deben tener un valor válido');
        return;
        }

        const success = await createPedido(form);
        if (success) {
        setShowDialog(false);
        setForm({
            mesaId: '',
            meseroId: user?.id,
            detalles: [{ platoId: '', cantidad: 1 }],
        });
        }
    };

    // ... (resto del componente queda igual: funciones de export, estadoTemplate, accionesTemplate, etc.)
    // Para no repetir, conservo las funciones existentes del código original:
    const handleVer = (id) => navigate(`/pedidos/detalle/${id}`);

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

    const handleExportPDF = () => {
        const title = "Pedidos del Momento " + new Date().toLocaleString();
        const columns = ["ID", "Fecha", "Mesa", "Mesero", "Estado", "Total"];
        const data = pedidosVisibles.map((p) => ({
        id: p.id,
        fecha: formatFecha(p.created_at),
        mesa: `Mesa ${p.mesaId}`,
        mesero: p.meseroId,
        estado: p.estado,
        total: `$${p.total}`,
        }));
        exportToPdf(data, title, columns);
    };

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

    const accionesTemplate = (rowData) => (
        <div className="p-d-flex p-gap-2" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Button
            icon="pi pi-eye"
            label="Ver"
            onClick={() => handleVer(rowData.id)}
            size="small"
            outlined
        />

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

    const pedidosVisibles = pedidos?.filter((p) => p.estado !== "cerrado");
    const mesasDisponibles = mesas?.filter((m) => m.disponible);
    const platosDisponibles = platos?.filter((p) => p.disponibilidad);

    const getStats = () => {
        const activos = pedidosVisibles?.length || 0;
        const pendientes = pedidosVisibles?.filter(p => p.estado === "pendiente").length || 0;
        const enPreparacion = pedidosVisibles?.filter(p => p.estado === "en preparación").length || 0;
        const listos = pedidosVisibles?.filter(p => p.estado === "listo").length || 0;
        return { activos, pendientes, enPreparacion, listos };
    };

    const stats = getStats();

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
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                {["admin", "mesero"].includes(user?.rol) && (
                <Button
                    label="Nuevo Pedido"
                    icon="pi pi-plus"
                    onClick={openNew}
                    size="large"
                    className="create-btn"
                />
                )}
                <Button
                label="Exportar PDF"
                icon="pi pi-file-pdf"
                severity="danger"
                size="large"
                onClick={handleExportPDF}
                />
            </div>
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

        {/* Dialog Modal para crear pedido (mejorado) */}
        <Dialog
            visible={showDialog}
            style={{ width: 'min(95%, 820px)' }}
            header="Crear Nuevo Pedido"
            modal
            onHide={() => setShowDialog(false)}
        >
            <div className="dialog-grid">
            {/* Seleccionar mesa */}
            <div className="field">
                <label htmlFor="mesa" className="font-bold">Mesa *</label>
                <Dropdown
                id="mesa"
                value={form.mesaId}
                options={mesasDisponibles?.map((m) => ({
                    label: `Mesa ${m.numero} (cap ${m.capacidad})`,
                    value: m.id,
                }))}
                onChange={(e) => setForm({ ...form, mesaId: e.value })}
                placeholder="Seleccionar mesa"
                className="w-full"
                />
            </div>

            <Divider />

            {/* Platos dinámicos */}
            <div className="field">
                <label className="font-bold">Platos *</label>

                {form.detalles.map((detalle, index) => {
                // opciones filtradas para evitar duplicados en distintas filas
                const opciones = (platosDisponibles || [])
                    .filter(p => !form.detalles.some((d, i) => d.platoId === p.id && i !== index))
                    .map((p) => ({ label: `${p.nombre} ($${p.precio})`, value: p.id, precio: p.precio }));

                const platoSeleccionado = platos?.find(pl => pl.id === detalle.platoId);
                const subtotal = (platoSeleccionado?.precio || 0) * (detalle.cantidad || 0);

                const canRemove = form.detalles.length > 1; // solo permitir eliminar si hay >1 renglones

                return (
                    <div key={index} className="detalle-row">
                    <Dropdown
                        value={detalle.platoId}
                        options={opciones}
                        onChange={(e) => updateDetalle(index, 'platoId', e.value)}
                        placeholder="Seleccionar plato"
                        className="detalle-select"
                    />

                    <div className="detalle-cantidad">
                        <InputNumber
                        value={detalle.cantidad}
                        onValueChange={(e) => updateDetalle(index, 'cantidad', e.value)}
                        min={1}
                        showButtons
                        buttonLayout="horizontal"
                        style={{ width: '120px' }}
                        />
                    </div>

                    <div className="detalle-subtotal">
                        <small style={{ display: 'block', fontWeight: 600 }}>${subtotal.toFixed(2)}</small>
                        <small style={{ color: 'var(--text-secondary)' }}>{platoSeleccionado ? platoSeleccionado.nombre : ''}</small>
                    </div>

                    <div className="detalle-actions">
                        <Button
                        icon="pi pi-trash"
                        severity="danger"
                        onClick={() => removeDetalle(index)}
                        disabled={!canRemove}
                        aria-label="Eliminar plato"
                        className="p-button-text"
                        />
                    </div>
                    </div>
                );
                })}

                <div className="mt-2">
                <Button
                    icon="pi pi-plus"
                    label="Agregar plato"
                    onClick={addDetalle}
                    outlined
                    disabled={!form.detalles[form.detalles.length - 1]?.platoId} // deshabilita hasta completar el último
                />
                </div>
            </div>

            <Divider />

            {/* Total */}
            <div className="field total-line">
                <h4 style={{ margin: 0 }}>Total: ${calcularTotal().toFixed(2)}</h4>
            </div>

            {/* Botones */}
            <div className="dialog-buttons">
                <Button
                label="Cancelar"
                icon="pi pi-times"
                outlined
                onClick={() => setShowDialog(false)}
                />
                <Button
                label="Crear Pedido"
                icon="pi pi-check"
                onClick={handleSubmit}
                loading={loading}
                />
            </div>
            </div>
        </Dialog>

        <style>{`
            .pedidos-container { padding: 2rem; max-width: 1600px; margin: 0 auto; }

            .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
            .page-title { font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem; display: flex; align-items: center; }
            .page-subtitle { color: rgba(255,255,255,0.7); margin: 0; }

            .stats-cards { display: grid; grid-template-columns: repeat(auto-fit,minmax(200px,1fr)); gap: 1rem; margin-bottom: 2rem; }
            .stat-card-mini { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); transition: all .2s; }
            .stat-mini-content { display:flex; align-items:center; gap:1rem; }
            .stat-mini-value { font-size:1.8rem; font-weight:700; color:#fff; }
            .stat-mini-label { font-size:.9rem; color: rgba(255,255,255,0.6); }

            .search-card { margin-bottom: 1.5rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); }
            .table-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); }

            .create-btn { background: linear-gradient(135deg,#10B981 0%,#059669 100%); border: none; }

            .field { margin-bottom: 1rem; }
            .field label { display:block; margin-bottom: .5rem; }

            :global(.estado-badge) { font-size: .85rem; padding: .4rem .8rem; }
            :global(.custom-datatable .p-datatable-thead > tr > th) { background: rgba(255,255,255,0.06); font-weight:600; }

            /* Dialog grid + detalle rows */
            .dialog-grid { display:flex; flex-direction:column; gap: 0.75rem; }
            .detalle-row { display: grid; grid-template-columns: 1fr 140px 120px 40px; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem; }
            .detalle-select { width: 100%; }
            .detalle-cantidad { display:flex; align-items:center; }
            .detalle-subtotal { text-align:right; font-size: 0.9rem; }
            .detalle-actions { display:flex; align-items:center; justify-content:center; }

            .total-line { display:flex; justify-content:flex-end; margin-top: 0.5rem; }
            .dialog-buttons { display:flex; justify-content:flex-end; gap: 0.5rem; margin-top: 1rem; }

            @media (max-width: 720px) {
            .detalle-row { grid-template-columns: 1fr 110px 1fr 40px; }
            .dialog-grid { gap: .5rem; }
            }
        `}</style>
        </Fragment>
    );
    };

    export default PedidosView;
