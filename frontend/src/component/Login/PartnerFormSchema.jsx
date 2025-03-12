import * as yup from "yup";

const basicSchema = yup.object().shape({
    // city: yup
    //     .string()
    //     .required("City is required"),
    // postcode: yup
    //     .string()
    //     .required("Postcode is required")
    //     .matches(postcodeRules, "Postcode must be a valid format"),
    email: yup
        .string()
        .email("Invalid email format")
        .required("Please provide your email address"),
    password: yup
        .string()
        .required("Password is required")
});

export { basicSchema };