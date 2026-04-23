"use client";
import { Button, Card, Form, Input } from "antd";
import { Formik } from "formik";
import { signIn } from "next-auth/react";

export const Login = () => {
  return (
    <Card style={{ margin: "auto", padding: 0, width: "400px" }}>
      <Formik
        initialValues={{ email: "", password: "" }}
        onSubmit={async (values) => {
          const res=await signIn("credentials", {
            email: values.email,
            password: values.password,
            redirect: false,
          });
          console.log("ERROR",res?.error)
        }}
      >
        {({
          values,
          errors,
          setFieldValue,
          handleSubmit,
          submitForm,
          handleReset,
          isSubmitting,
        }) => {
          return (
            <div className="space-y-4">
              <Form.Item<string> label="Email">
                <Input
                  placeholder="Enter Email"
                  onChange={(e) => {
                    setFieldValue("email", e.target.value);
                  }}
                  value={values.email}
                />
              </Form.Item>
              <Form.Item<string> label="Password">
                <Input.Password
                  placeholder="Enter Password"
                  onChange={(e) => {
                    setFieldValue("password", e.target.value);
                  }}
                  value={values.password}
                  visibilityToggle
                />
              </Form.Item>
              <Button onClick={() => handleSubmit()} loading={isSubmitting}>
                Login
              </Button>
              <Button onClick={() => handleReset()}>Reset</Button>
            </div>
          );
        }}
      </Formik>
    </Card>
  );
};

export default Login;
