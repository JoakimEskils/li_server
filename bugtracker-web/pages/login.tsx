import React from 'react'
import { Formik, Field, Form } from 'formik';
import { useMutation } from 'urql';
import { useLoginMutation } from "../src/generated/graphql"; 
import { toErrorMap } from "../utils/toErrorMap"
import { useRouter } from 'next/router';

interface loginProps {

}

const Login: React.FC<loginProps> = ({}) => {
    const router = useRouter();
    const [, login] = useLoginMutation();

        return (
            <div>
            <h1>Login</h1>
            <Formik
            initialValues={{
                username: '',
                password: '',
            }}
            onSubmit={async (values, { setErrors }) => {
                console.log(values)
                const response = await login({ options: values });
                if (response.data?.login.errors) {
                    setErrors(toErrorMap(response.data.login.errors))
                } else if (response.data?.login.user) {
                    router.push("/");
                }
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

export default Login;