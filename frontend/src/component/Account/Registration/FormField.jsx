import React from "react";


const FormField = ({ label, name, type = "text", formik, placeholder }) => (
    <div className="login-form-item">
        <label className="login-text">{label}</label>
        <input
            name={name}
            type={type}
            value={formik.values[name]}
            className={formik.errors[name] && formik.touched[name] ? "input-error login-input" : "login-input"}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder={placeholder}
        />
        {formik.errors[name] && formik.touched[name] && <p className="error">{formik.errors[name]}</p>}
    </div>

);

export { FormField};
