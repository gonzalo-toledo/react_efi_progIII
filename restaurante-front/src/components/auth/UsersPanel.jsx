import { useState, useEffect, useContext } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import usersService from '../../services/usersService';
import authService from '../../services/authService';
import { notifySucces, notifyError } from '../../utils/Notifier';
import { AuthContext } from '../../context/AuthContext';

const UsersPanel = () => {
    const { user: currentUser } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [roles, setRoles] = useState([]);
    const [form, setForm] = useState({
        id: null,
        nombre: '',
        email: '',
        password: '',
        confirmPassword: '',
        rol: ''
    });

    useEffect(() => {
        loadUsers();
        loadRoles();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const res = await usersService.list();
            setUsers(res.data);
        } catch (error) {
            notifyError('Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    const loadRoles = async () => {
        try {
            const res = await authService.roles();
            setRoles(res.data.map(r => ({ label: r.charAt(0).toUpperCase() + r.slice(1), value: r })));
        } catch (error) {
            console.error('Error loading roles:', error);
        }
    };

    const openNew = () => {
        setForm({ id: null, nombre: '', email: '', password: '', confirmPassword: '', rol: '' });
        setEditMode(false);
        setShowDialog(true);
    };

    const openEdit = (user) => {
        setForm({
            id: user.id,
            nombre: user.nombre,
            email: user.email,
            password: '',
            confirmPassword: '',
            rol: user.rol
        });
        setEditMode(true);
        setShowDialog(true);
    };

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleSubmit = async () => {
        // Validaciones
        if (!form.nombre || !form.email || !form.rol) {
            notifyError('Complete todos los campos obligatorios');
            return;
        }

        if (!validateEmail(form.email)) {
            notifyError('El email no es válido');
            return;
        }

        if (!editMode && !form.password) {
            notifyError('La contraseña es obligatoria para nuevos usuarios');
            return;
        }

        // Validar confirmación de contraseña solo si se ingresó una contraseña
        if (form.password && form.password !== form.confirmPassword) {
            notifyError('Las contraseñas no coinciden');
            return;
        }

        if (form.password && form.password.length < 6) {
            notifyError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        try {
            if (editMode) {
                const payload = { nombre: form.nombre, email: form.email };
                if (form.password) payload.password = form.password;
                
                await usersService.update(form.id, payload);
                
                // Solo actualizar rol si cambió
                const originalUser = users.find(u => u.id === form.id);
                if (form.rol !== originalUser?.rol) {
                    await usersService.updateRole(form.id, form.rol);
                }
                
                notifySucces('Usuario actualizado correctamente');
            } else {
                // Para crear usuario, usar usersService.create
                const { confirmPassword, ...userData } = form;
                await usersService.create(userData);
                notifySucces('Usuario creado correctamente');
            }
            loadUsers();
            setShowDialog(false);
        } catch (error) {
            const message = error.response?.data?.message || 'Error al guardar usuario';
            notifyError(message);
        }
    };

    const confirmDelete = (user) => {
        confirmDialog({
            message: `¿Está seguro de eliminar al usuario ${user.nombre}?`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            acceptClassName: 'p-button-danger',
            accept: () => handleDelete(user.id)
        });
    };

    const handleDelete = async (id) => {
        try {
            await usersService.delete(id);
            notifySucces('Usuario eliminado correctamente');
            loadUsers();
        } catch (error) {
            notifyError('Error al eliminar usuario');
        }
    };

    const rolBodyTemplate = (rowData) => {
        const severity = {
            admin: 'danger',
            cocinero: 'warning',
            mesero: 'info',
            cajero: 'success'
        };
        const label = rowData.rol.charAt(0).toUpperCase() + rowData.rol.slice(1);
        return <Tag value={label} severity={severity[rowData.rol]} />;
    };

    const statusBodyTemplate = (rowData) => {
        return (
            <Tag 
                value={rowData.is_active ? 'Activo' : 'Inactivo'} 
                severity={rowData.is_active ? 'success' : 'danger'} 
            />
        );
    };

    const actionsBodyTemplate = (rowData) => {
        const isCurrentUser = rowData.id === currentUser?.id;
        
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-pencil"
                    rounded
                    outlined
                    severity="info"
                    onClick={() => openEdit(rowData)}
                    tooltip="Editar usuario"
                    tooltipOptions={{ position: 'top' }}
                />
                <Button
                    icon="pi pi-trash"
                    rounded
                    outlined
                    severity="danger"
                    onClick={() => confirmDelete(rowData)}
                    disabled={isCurrentUser}
                    tooltip={isCurrentUser ? 'No puedes eliminarte a ti mismo' : 'Eliminar usuario'}
                    tooltipOptions={{ position: 'top' }}
                />
            </div>
        );
    };

    return (
        <div className="p-4">
            <ConfirmDialog />
            
            <div className="card">
                <div className="flex justify-content-between align-items-center mb-4">
                    <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
                    <Button
                        label="Nuevo Usuario"
                        icon="pi pi-plus"
                        onClick={openNew}
                    />
                </div>

                <DataTable
                    value={users}
                    loading={loading}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    emptyMessage="No hay usuarios registrados"
                    stripedRows
                    responsiveLayout="scroll"
                >
                    <Column field="id" header="ID" sortable style={{ width: '5%' }} />
                    <Column field="nombre" header="Nombre" sortable />
                    <Column field="email" header="Email" sortable />
                    <Column field="rol" header="Rol" body={rolBodyTemplate} sortable />
                    <Column field="is_active" header="Estado" body={statusBodyTemplate} sortable />
                    <Column 
                        field="created_at" 
                        header="Fecha Registro" 
                        sortable
                        body={(rowData) => new Date(rowData.created_at).toLocaleDateString('es-AR')}
                    />
                    <Column header="Acciones" body={actionsBodyTemplate} style={{ width: '10%' }} />
                </DataTable>
            </div>

            <Dialog
                visible={showDialog}
                style={{ width: '450px' }}
                header={editMode ? 'Editar Usuario' : 'Nuevo Usuario'}
                modal
                onHide={() => setShowDialog(false)}
            >
                <div className="flex flex-column gap-3">
                    <div className="field">
                        <label htmlFor="nombre" className="font-bold">Nombre *</label>
                        <InputText
                            id="nombre"
                            value={form.nombre}
                            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                            className="w-full"
                            placeholder="Ingrese el nombre"
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="email" className="font-bold">Email *</label>
                        <InputText
                            id="email"
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full"
                            placeholder="usuario@ejemplo.com"
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="password" className="font-bold">
                            Contraseña {editMode ? '(dejar vacío para no cambiar)' : '*'}
                        </label>
                        <InputText
                            id="password"
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            className="w-full"
                            placeholder={editMode ? 'Nueva contraseña (opcional)' : 'Mínimo 6 caracteres'}
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="confirmPassword" className="font-bold">
                            Confirmar Contraseña {editMode && '(si la cambió)'}
                        </label>
                        <InputText
                            id="confirmPassword"
                            type="password"
                            value={form.confirmPassword}
                            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                            className="w-full"
                            placeholder="Repita la contraseña"
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="rol" className="font-bold">Rol *</label>
                        <Dropdown
                            id="rol"
                            value={form.rol}
                            options={roles}
                            onChange={(e) => setForm({ ...form, rol: e.value })}
                            placeholder="Seleccione un rol"
                            className="w-full"
                        />
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
                        />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default UsersPanel;