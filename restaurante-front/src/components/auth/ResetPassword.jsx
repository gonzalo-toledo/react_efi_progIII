import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../../context/AuthContext"
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useNavigate } from "react-router-dom"
import { Card } from "primereact/card"

const ResetPassword = () => {

    const navigate = useNavigate()

    const resetSchema = Yup.object({
        password: Yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('Campo requerido'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Las contraseñas deben coincidir')
            .required('Campo requerido')
    })

    const { resetPassword } = useContext(AuthContext)
    const [loading, setLoading] = useState(false)
    const [params, setParams] = useState({ token: '', id: '' })

    useEffect(() => {
        const url = new URLSearchParams(window.location.search)
        setParams({ token: url.get('token') || "", id: url.get('id') || "" })
    }, [])

    const invalidLink = !params.token || !params.id

    return (
        <div className="card">
            <div className="flex flex-column align-items-center gap-3 py-5">
            <h2 className="text-3xl font-bold m-0 mb-3">Restablecer Contraseña</h2>
            
            {invalidLink ? (
                <div className="text-center">
                <i className="pi pi-exclamation-triangle text-6xl text-orange-500 mb-3"></i>
                <p className="text-600 line-height-3">
                    Enlace inválido o incompleto. Por favor, verifica el enlace enviado a tu correo.
                </p>
                <Button
                    label="Volver al inicio"
                    icon="pi pi-home"
                    className="mt-3"
                    onClick={() => setCurrentView('login')}
                />
                </div>
            ) : (
                <>
                <p className="text-center text-600 mt-0 mb-4 line-height-3">
                    Ingresa tu nueva contraseña
                </p>
                
                <Formik
                    initialValues={{ password: '', confirmPassword: '' }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ handleChange, values }) => (
                    <Form className="w-full flex flex-column align-items-center gap-3">
                        <div className="w-full md:w-20rem">
                        <div className="flex flex-column gap-2">
                            <label htmlFor="password" className="font-semibold">Nueva Contraseña</label>
                            <Password
                            id="password"
                            name="password"
                            value={values.password}
                            onChange={handleChange}
                            placeholder="Mínimo 6 caracteres"
                            className="w-full"
                            inputClassName="w-full"
                            toggleMask
                            />
                            <small className="p-error">
                            <ErrorMessage name="password" />
                            </small>
                        </div>
                        </div>

                        <div className="w-full md:w-20rem">
                        <div className="flex flex-column gap-2">
                            <label htmlFor="confirmPassword" className="font-semibold">Confirmar Contraseña</label>
                            <Password
                            id="confirmPassword"
                            name="confirmPassword"
                            value={values.confirmPassword}
                            onChange={handleChange}
                            placeholder="Repite tu contraseña"
                            className="w-full"
                            inputClassName="w-full"
                            toggleMask
                            feedback={false}
                            />
                            <small className="p-error">
                            <ErrorMessage name="confirmPassword" />
                            </small>
                        </div>
                        </div>

                        <Button
                        type="submit"
                        label={loading ? 'Procesando...' : 'Restablecer Contraseña'}
                        icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
                        className="w-full md:w-20rem mt-3"
                        disabled={loading}
                        />
                    </Form>
                    )}
                </Formik>

                <Divider className="w-full md:w-20rem" />

                <Button
                    label="Volver al inicio de sesión"
                    link
                    icon="pi pi-arrow-left"
                    className="p-0"
                    onClick={() => setCurrentView('login')}
                />
                </>
            )}
            </div>
        </div>
        );
    };
export default ResetPassword