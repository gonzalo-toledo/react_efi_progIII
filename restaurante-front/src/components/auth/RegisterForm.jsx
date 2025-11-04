import { useContext, useEffect, useState } from 'react';
import { AuthContext } from "../../context/AuthContext";
import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Divider } from "primereact/divider"
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService.js";
import axios from 'axios';

const RegisterForm = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const handleSubmit = async (values) => {
    const userData = {
      nombre: values.name,
      email: values.email,
      password: values.password,
      rol: 'Mesero',
    };
    await register(userData);
  };

  const initialValues = {
    name: '',
    email: '',
    password: '',
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().required('Password is required'),
  });


return (
      <div className="card">
        <div className="flex flex-column align-items-center gap-3 py-5">
          <h2 className="text-3xl font-bold m-0 mb-3">Crear Cuenta</h2>
          
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ handleChange, values, isSubmitting }) => (
              <Form className="w-full flex flex-column align-items-center gap-3">
                <div className="w-full md:w-20rem">
                  <div className="flex flex-column gap-2">
                    <label htmlFor="name" className="font-semibold">Nombre</label>
                    <InputText
                      id="name"
                      name="name"
                      value={values.name}
                      onChange={handleChange}
                      placeholder="Tu nombre completo"
                      className="w-full"
                    />
                    <small className="p-error">
                      <ErrorMessage name="name" />
                    </small>
                  </div>
                </div>

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

                <div className="w-full md:w-20rem">
                  <div className="flex flex-column gap-2">
                    <label htmlFor="password" className="font-semibold">Contraseña</label>
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

                <Button
                  type="submit"
                  label="Registrarse"
                  icon="pi pi-user-plus"
                  severity="success"
                  className="w-full md:w-20rem mt-3"
                  disabled={isSubmitting}
                />
              </Form>
            )}
          </Formik>

          <Divider className="w-full md:w-20rem" />

          <Button
            label="¿Ya tienes cuenta? Inicia sesión"
            link
            className="p-0"
            onClick={() => navigate('/login')}
          />
        </div>
      </div>
    );
  };


export default RegisterForm;
