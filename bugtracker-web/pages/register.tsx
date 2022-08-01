import React from 'react'
import { Formik, Field, Form } from 'formik';
import { useMutation } from 'urql';
import { useRegisterMutation } from "../src/generated/graphql"; 

interface registerProps {

}

const register: React.FC<registerProps> = ({}) => {
    const [,register] = useRegisterMutation();

        return (
            <div>
            <h1>Sign Up</h1>
            <Formik
            initialValues={{
                username: '',
                password: '',
            }}
            onSubmit={async (values) => {
                console.log(values)
                const response = await register(values);
            }}
            >
            {({values, handleChange }) => (
                <Form>
                    <label htmlFor="firstName">Username</label>
                    <Field value={values.username} onChange={handleChange} id="firstName" name="username" placeholder="Jane" />
                    <label htmlFor="firstName">Password</label>
                    <Field value={values.password} onChange={handleChange} id="firstName" name="password" type="password" placeholder="Jane" />
                    <button type="submit">Submit</button>
                </Form> 
            )}
            </Formik>
            </div>
        );
}

export default register;