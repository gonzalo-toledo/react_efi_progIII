    // layouts/pedidos/PedidosForm.jsx
    import { Fragment, useContext, useEffect, useMemo } from "react";
    import { Formik, Form, FieldArray, ErrorMessage } from "formik";
    import * as Yup from "yup";
    import { Button } from "primereact/button";
    import { Dropdown } from "primereact/dropdown";
    import { InputNumber } from "primereact/inputnumber";
    import { Card } from "primereact/card";
    import { Divider } from "primereact/divider";
    import { useNavigate } from "react-router-dom";

    import { PedidosContext } from "../../context/PedidosContext";
    import { MesasContext } from "../../context/MesasContext";
    import { PlatosContext } from "../../context/PlatosContext";
    import { AuthContext } from "../../context/AuthContext";

    const PedidosForm = () => {
    const navigate = useNavigate();
    const { createPedido, loading } = useContext(PedidosContext);
    const { mesas, getMesas } = useContext(MesasContext);
    const { platos, getPlatos } = useContext(PlatosContext);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        getMesas?.();
        getPlatos?.();
        // eslint-disable-next-line
    }, []);

    const mesasDisponibles = (mesas || []).filter((m) => m.disponible);
    const platosDisponibles = (platos || []).filter((p) => p.disponibilidad);

    // Valores iniciales
    const initialValues = {
        mesaId: "",
        meseroId: user?.id ?? "",
        detalles: [{ platoId: "", cantidad: 1 }],
    };

    // Validación
    const validationSchema = Yup.object({
        mesaId: Yup.number()
        .typeError("Debe seleccionar una mesa")
        .required("Debe seleccionar una mesa"),
        detalles: Yup.array()
        .min(1, "Debe agregar al menos un plato")
        .of(
            Yup.object({
            platoId: Yup.number()
                .typeError("Debe seleccionar un plato")
                .required("Debe seleccionar un plato"),
            cantidad: Yup.number()
                .typeError("Cantidad inválida")
                .min(1, "Cantidad mínima 1")
                .required("Debe ingresar una cantidad"),
            })
        ),
    });

    // Helpers
    const formatPrice = (n) => (Number(n || 0)).toFixed(2);

    const calcularTotal = (detalles) =>
        (detalles || []).reduce((acc, item) => {
        const plato = platosDisponibles.find((p) => p.id === item.platoId);
        return acc + (Number(plato?.precio || 0) * Number(item.cantidad || 0));
        }, 0);

    const handleSubmit = async (values, { setSubmitting }) => {
        const payload = {
        mesaId: values.mesaId,
        meseroId: values.meseroId,
        detalles: values.detalles,
        total: Number(calcularTotal(values.detalles)) || 0,
        };

        try {
        const success = await createPedido(payload);
        if (success) navigate("/pedidos");
        } finally {
        setSubmitting(false);
        }
    };

    // Memoizar lista de ids seleccionados para excluir en selects
    const selectedPlatoIds = (detalles) =>
        (detalles || []).map((d) => d.platoId).filter(Boolean);

    return (
        <Fragment>
        <Card title="Crear nuevo pedido" className="p-4">
            <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
            >
            {({ values, setFieldValue, isSubmitting }) => {
                const total = calcularTotal(values.detalles);

                // ids seleccionados (sin contar posibles "")
                const selectedIds = selectedPlatoIds(values.detalles);

                return (
                <Form>
                    {/* Seleccionar mesa */}
                    <div className="mb-3">
                    <label className="font-bold">Mesa</label>
                    <Dropdown
                        value={values.mesaId}
                        options={(mesasDisponibles || []).map((m) => ({
                        label: `Mesa ${m.numero} (cap ${m.capacidad})`,
                        value: m.id,
                        }))}
                        onChange={(e) => setFieldValue("mesaId", e.value)}
                        placeholder="Seleccionar mesa"
                        className="w-full"
                        aria-label="Seleccionar mesa"
                    />
                    <ErrorMessage
                        name="mesaId"
                        component="div"
                        className="error-message"
                    />
                    </div>

                    <Divider />
                    <h3 className="mb-2">Platos</h3>

                    <FieldArray name="detalles">
                    {({ push, remove }) => (
                        <>
                        {(values.detalles || []).map((item, index) => {
                            // opciones filtradas para evitar duplicados en otras filas (excepto la propia)
                            const opciones = (platosDisponibles || [])
                            .filter((p) =>
                                !values.detalles.some(
                                (d, i) => i !== index && d.platoId === p.id
                                )
                            )
                            .map((p) => ({ label: `${p.nombre} ($${formatPrice(p.precio)})`, value: p.id }));

                            const platoSeleccionado = (platos || []).find(pl => pl.id === item.platoId);
                            const precio = Number(platoSeleccionado?.precio || 0);
                            const subtotal = precio * Number(item.cantidad || 0);

                            return (
                            <div key={index} className="detalle-line mb-3" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: 160 }}>
                                <label className="sr-only">Plato</label>
                                <Dropdown
                                    value={item.platoId}
                                    options={opciones}
                                    onChange={(e) => {
                                    const updated = [...values.detalles];
                                    updated[index].platoId = e.value;
                                    setFieldValue("detalles", updated);
                                    }}
                                    placeholder="Seleccionar plato"
                                    className="w-full"
                                    aria-label={`Seleccionar plato ${index + 1}`}
                                />
                                <ErrorMessage name={`detalles[${index}].platoId`} component="div" className="error-message" />
                                </div>

                                <div style={{ width: 120 }}>
                                <label className="sr-only">Cantidad</label>
                                <InputNumber
                                    value={item.cantidad}
                                    onValueChange={(e) => {
                                    const updated = [...values.detalles];
                                    updated[index].cantidad = e.value || 1;
                                    setFieldValue("detalles", updated);
                                    }}
                                    min={1}
                                    showButtons
                                    buttonLayout="horizontal"
                                    aria-label={`Cantidad plato ${index + 1}`}
                                    style={{ width: '100%' }}
                                />
                                <ErrorMessage name={`detalles[${index}].cantidad`} component="div" className="error-message" />
                                </div>

                                <div style={{ width: 120, textAlign: 'right' }}>
                                <div style={{ fontWeight: 700 }}>${formatPrice(subtotal)}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{platoSeleccionado?.nombre ?? ''}</div>
                                </div>

                                <div style={{ width: 40 }}>
                                <Button
                                    icon="pi pi-trash"
                                    severity="danger"
                                    type="button"
                                    onClick={() => {
                                    // evitar remover si queda 1 solo elemento
                                    if (values.detalles.length === 1) {
                                        // resetear fila si es el único
                                        setFieldValue("detalles", [{ platoId: "", cantidad: 1 }]);
                                        return;
                                    }
                                    remove(index);
                                    }}
                                    aria-label="Eliminar plato"
                                    className="p-button-text"
                                />
                                </div>
                            </div>
                            );
                        })}

                        <div style={{ marginTop: 8 }}>
                            <Button
                            type="button"
                            icon="pi pi-plus"
                            label="Agregar plato"
                            onClick={() => push({ platoId: "", cantidad: 1 })}
                            disabled={!values.detalles[values.detalles.length - 1]?.platoId}
                            />
                        </div>

                        <ErrorMessage name="detalles" component="div" className="error-message" />
                        </>
                    )}
                    </FieldArray>

                    <Divider />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0 }}>Total: ${formatPrice(total)}</h4>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <Button
                        type="button"
                        label="Cancelar"
                        severity="secondary"
                        onClick={() => navigate("/pedidos")}
                        />
                        <Button
                        type="submit"
                        label="Crear pedido"
                        loading={loading || isSubmitting}
                        disabled={loading || isSubmitting}
                        />
                    </div>
                    </div>
                </Form>
                );
            }}
            </Formik>
        </Card>

        {/* Estilos mínimos para errores y layout (ajustá según tu theme) */}
        <style>{`
            .error-message { color: #f43f5e; margin-top: 0.25rem; font-size: 0.9rem; }
            .detalle-line .p-dropdown { width: 100%; }
            .sr-only { position: absolute !important; height: 1px; width: 1px; overflow: hidden; clip: rect(1px,1px,1px,1px); white-space: nowrap; }
        `}</style>
        </Fragment>
    );
    };

    export default PedidosForm;
