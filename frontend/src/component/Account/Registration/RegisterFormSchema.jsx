import * as yup from "yup";

const basicSchema = yup.object().shape({
    // city: yup
    //     .string()
    //     .required("City is required"),
    // postcode: yup
    //     .string()
    //     .required("Postcode is required")
    //     .matches(postcodeRules, "Postcode must be a valid format"),
    Firstname: yup
        .string()
        .required("First name is required"),
    Lastname: yup
        .string()
        .required("Last name is required"),
    email: yup
        .string()
        .email("Invalid email format")
        .required("Please provide your email address"),
    password: yup
        .string()
        .required("Password is required"),
    
    cpassword: yup
        .string()
        .required("Confirm password is required"),
});

export { basicSchema };