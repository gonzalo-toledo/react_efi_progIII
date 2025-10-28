import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';

const EditProfile = () => {
    const { user, updateProfile } = useContext(AuthContext);
    const [form, setForm] = useState({
        nombre: "",
        email: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Inicializar el formulario cuando el usuario esté disponible
    useEffect(() => {
        if (user) {
            setForm({
                nombre: user.nombre || "",
                email: user.email || "",
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
        // Limpiar mensaje al escribir
        if (message.text) setMessage({ type: '', text: '' });
    };

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        // Validaciones
        if (!form.nombre.trim()) {
            setMessage({ type: 'warn', text: 'El nombre es obligatorio' });
            setLoading(false);
            return;
        }

        if (!form.email.trim()) {
            setMessage({ type: 'warn', text: 'El email es obligatorio' });
            setLoading(false);
            return;
        }

        if (!validateEmail(form.email)) {
            setMessage({ type: 'warn', text: 'El email no es válido' });
            setLoading(false);
            return;
        }

        try {
            await updateProfile(form);
            setMessage({ type: 'success', text: '✅ Perfil actualizado correctamente' });
        } catch (error) {
            setMessage({ type: 'error', text: '❌ Error al actualizar el perfil' });
        } finally {
            setLoading(false);
        }
    };

    const hasChanges = () => {
        return form.nombre !== user?.nombre || form.email !== user?.email;
    };

    return (
        <div className="flex justify-content-center align-items-center p-4">
            <Card 
                title="Editar Perfil" 
                className="w-full md:w-6 lg:w-4"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
                <form onSubmit={onSubmit} className="flex flex-column gap-3">
                    <div className="field">
                        <label htmlFor="nombre" className="block mb-2 font-semibold">
                            Nombre
                        </label>
                        <InputText
                            id="nombre"
                            name="nombre"
                            value={form.nombre}
                            onChange={handleChange}
                            className="w-full"
                            placeholder="Ingrese su nombre"
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="email" className="block mb-2 font-semibold">
                            Email
                        </label>
                        <InputText
                            id="email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full"
                            placeholder="usuario@ejemplo.com"
                        />
                    </div>
                    <Button
                        type="submit"
                        label={loading ? "Guardando..." : "Guardar cambios"}
                        icon={loading ? "pi pi-spin pi-spinner" : "pi pi-check"}
                        className="w-full"
                        disabled={loading || !hasChanges()}
                        tooltip={!hasChanges() ? "No hay cambios para guardar" : ""}
                    />
                </form>
            </Card>
        </div>
    );
};

export default EditProfile;