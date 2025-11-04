import { useContext } from "react"
import { AuthContext } from "../../context/AuthContext"
import { Formik, Form, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { InputText } from "primereact/inputtext"
import { Password } from 'primereact/password'
import { Button } from "primereact/button"
import { Divider } from "primereact/divider"
import { useNavigate } from "react-router-dom"

const LoginForm = () => {
    const { login } = useContext(AuthContext)
    const navigate = useNavigate()

    const initialValuesUser = {
        email: '',
        password: ''
    }

    const validationSchemaUser = Yup.object({
        email: Yup.string().email('Email inválido').required('Campo requerido'),
        password: Yup.string().required('Campo requerido')
    })

    const onSubmitLogin = async (values) => {
        await login(values)
    }

    return (
        <div className="flex align-items-center justify-content-center min-h-screen bg-gray-50">
            <div className="surface-card p-4 shadow-2 border-round w-full lg:w-6">
                <div className="card">
                    <div className="flex flex-column align-items-center gap-3 py-5">
                        <h2 className="text-3xl font-bold m-0 mb-3">Iniciar Sesión</h2>

                        <Formik 
                            initialValues={initialValuesUser} 
                            validationSchema={validationSchemaUser} 
                            onSubmit={onSubmitLogin}
                        >
                            {({ handleChange, values, isSubmitting, handleSubmit }) => (
                                <Form className="flex flex-column justify-content-center align-items-center gap-6 w-full">
                                    <div className="w-full md:w-20rem">
                                        <div className="flex flex-column gap-3 mb-4">
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

                                    <div className="w-full md:w-20rem">
                                        <div className="flex flex-column gap-4 mb-4">
                                            <Password
                                                id="password"
                                                name="password"
                                                value={values.password}
                                                onChange={handleChange}
                                                placeholder="Ingresa tu contraseña"
                                                className="w-full"
                                                inputClassName="w-full"
                                                toggleMask
                                                feedback={false}
                                            />

                                            <small className="p-error">
                                                <ErrorMessage name="password" />
                                            </small>
                                        </div>
                                    </div>

                                    <Button
                                        type="button"
                                        label="Iniciar Sesión"
                                        icon="pi pi-sign-in"
                                        className="w-full md:w-20rem mt-3"
                                        disabled={isSubmitting}
                                        onClick={handleSubmit}
                                    />
                                </Form>
                            )}
                        </Formik>

                        <Divider className="w-full md:w-20rem" />

                        <div className="flex flex-column gap-2 align-items-center w-full">
                            <Button
                                label="¿Olvidaste tu contraseña?"
                                link
                                className="p-0"
                                onClick={() => navigate('/forgot-password')}
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
            </div>
        </div>
    )
}

export default LoginForm