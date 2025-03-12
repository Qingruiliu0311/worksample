import * as yup from "yup";

const passwordRules = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{10,}$/;

const postcodeRules = /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/;

const basicSchema = yup.object().shape({
    Firstname: yup
        .string()
        .required("Please provide your firstname"),
    Lastname: yup
        .string()
        .required("Please provide your lastname"),
    Businessname: yup
        .string()
        .required("Please provide your business name"),
    Contactnumber: yup
        .string()
        .required("Please provide your phone number")
        .matches(/^\+?[0-9]{11}$/, "Shop number must be exactly 11 digits"),
    Businessaddress: yup
        .string()
        .required("Please provide your business address"),
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
        .required("Please provide your business email address"),
    password: yup
        .string()
        .required("Password is required")
        .matches(passwordRules, "Password must be at least 10 characters long, include at least one uppercase letter, one lowercase letter, and one number"),
    cpassword: yup
        .string()
        .oneOf([yup.ref('password'), null], "Passwords must match")
        .required("Confirm password is required")
});

export { basicSchema };