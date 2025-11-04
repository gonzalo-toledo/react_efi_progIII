import { useContext, useState } from "react"
import { AuthContext } from "../../context/AuthContext"
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { InputText } from "primereact/inputtext"
import { Button } from "primereact/button"
import { Card } from "primereact/card"
import { Divider } from "primereact/divider"
import { useNavigate } from "react-router-dom"

const ForgotPassword = () => {

    const { forgotPassword } = useContext(AuthContext)
    const [ loading, setLoading ] = useState(false)
    const navigate = useNavigate()

    const initialValues = {
        email: ''
    }

    const validationSchema = Yup.object().shape({
        email: Yup.string().email('Email inválido').required('Campo requerido')
    })

    const handleSubmit = async (values) => {
        setLoading(true)
        await forgotPassword(values.email)
        setLoading(false)
    }

    return (
        <div className="card">
            <div className="flex flex-column align-items-center gap-3 py-5">
            <h2 className="text-3xl font-bold m-0 mb-3">Recuperar Contraseña</h2>
            <p className="text-center text-600 mt-0 mb-4 line-height-3">
                Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
            </p>
            
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ handleChange, values }) => (
                <Form className="w-full flex flex-column align-items-center gap-3">
                    <div className="w-full md:w-20rem">
                    <div className="flex flex-column gap-2">
                        <label htmlFor="email" className="font-semibold">Email</label>
                        <InputText
                        id="email"
                        name="email"
                        type="email"
                        value={values.email}
                        onChange={handleChange}
                        placeholder="ejemplo@email.com"
                        className="w-full"
                        />
                        <small className="p-error">
                        <ErrorMessage name="email" />
                        </small>
                    </div>
                    </div>

                    <Button
                    type="submit"
                    label="Enviar link de recuperación"
                    icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-envelope'}
                    className="w-full md:w-20rem mt-3"
                    disabled={loading}
                    />
                </Form>
                )}
            </Formik>

            <Divider className="w-full md:w-20rem" />

            <div className="flex flex-column gap-2 align-items-center">
                <Button
                label="Volver al inicio de sesión"
                link
                icon="pi pi-arrow-left"
                className="p-0"
                onClick={() => navigate('/login')}
                />
                <Button
                label="¿No tienes cuenta? Regístrate"
                link
                className="p-0"
                onClick={() => navigate('/register')}
                />
            </div>
            </div>
        </div>
        );
    };

export default ForgotPassword