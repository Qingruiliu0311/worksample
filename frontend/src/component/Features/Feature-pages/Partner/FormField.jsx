import React from "react";

const FormField = ({ label, name, type = "text", formik, placeholder }) => (
    <div className="partner-form-item">
        <label className="partner-text">{label}</label>
        <input
            name={name}
            type={type}
            value={formik.values[name]}
            className={formik.errors[name] && formik.touched[name] ? "input-error partner-input" : "partner-input"}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder={placeholder}
        />
        {formik.errors[name] && formik.touched[name] && <p className="error">{formik.errors[name]}</p>}
    </div>

);

const City_Postcode_field = ({label, name, type = "text", formik, placeholder}) => (
    <div className="city-postcode-div">
        <label className="partner-text">{label}</label>
        <input
            name={name}
            type={type}
            value={formik.values[name]}
            className={formik.errors[name] && formik.touched[name] ? "input-error partner-input" : "partner-input"}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder={placeholder}
        />
        {formik.errors[name] && formik.touched[name] && <p className="error">{formik.errors[name]}</p>}
    </div>
)


export { FormField, City_Postcode_field };
