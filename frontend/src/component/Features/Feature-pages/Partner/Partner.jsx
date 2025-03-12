import React, { useState } from "react";
import { useFormik } from "formik";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { basicSchema } from "./PartnerFormSchema";
import { FormField } from "./FormField";
import Header from '../../../Header'
import LooksOneOutlinedIcon from '@mui/icons-material/LooksOneOutlined';
import LooksTwoOutlinedIcon from '@mui/icons-material/LooksTwoOutlined';
import Looks3OutlinedIcon from '@mui/icons-material/Looks3Outlined';
function Partner() {

    const [notification, setNotification] = useState({
        open: false,
        message: "",
        severity: "success", // success, error, info, warning
    });

    const handleCloseNotification = () => {
        setNotification((prev) => ({ ...prev, open: false }));
    };

    const formik = useFormik({
        initialValues: {
            Firstname: "",
            Lastname: "",
            Contactnumber: "",
            email: "",
            Businessname: "",
            Businessaddress: "",
            password: "",
            cpassword: ""
        },
        validationSchema: basicSchema,
        onSubmit: async (values, { resetForm }) => {
            const dataToSubmit = {...values,is_vendor: true};
            console.log(dataToSubmit);
            try {
                const response = await axios.post("http://localhost:8000/register/", dataToSubmit);
                console.log("Success:", response.data);
                setNotification({
                    open: true,
                    message: "Registration successful!",
                    severity: "success",
                });
                resetForm(); // Reset form on success
            } catch (error) {
                let errorMessage = "An unexpected error occurred.";
                if (error.response){
                    const responseData = error.response.data;
                    if (typeof responseData === "object" && responseData !== null) {
                        errorMessage =  Object.values(responseData)
                        .flat()
                        .join(", ");
                    } else {
                        errorMessage = responseData.error || "Please check your input.";
                    }
                }
                else if (error.request) {
                    errorMessage = "No response from the server. Please try again later.";
                }


                console.error("Error:", errorMessage);
                setNotification({
                    open: true,
                    message: `Registration failed: ${errorMessage}`,
                    severity: "error",
                });
            }
        },
    });

    return (
        <div>
            <Header />

            <div className="partner-container">
                <div className="vendorRegiInstructionDiv">
                    <div className="vendorRegiInstruction1Div">
                        <LooksOneOutlinedIcon style={{ fontSize: "70px" }}/>
                        <p className="vendorRegiInstruction">Tell us about your business</p>
                    </div>
                    <div className="vendorRegiInstruction2Div">
                        <LooksTwoOutlinedIcon style={{ fontSize: "70px" }}/>
                        <p className="vendorRegiInstruction">Upload your ID, proof of ownership <br /> and menu or product catalogue</p>
                    </div>
                    <div className="vendorRegiInstruction3Div">
                        <Looks3OutlinedIcon style={{ fontSize: "70px" }}/>
                        <p className="vendorRegiInstruction">Receive your Orderpad and start <br /> taking orders.</p>
                    </div>

                </div>
                <div className="rectangle">
                    <form onSubmit={formik.handleSubmit}>
                        <h3 className="partner-header">INVITE</h3>
                        <p className="partner-text">Tell us about your business <br /> and start create your business account!</p>

                        <FormField label="First name:" name="Firstname" formik={formik} placeholder="Enter your fisrtname" />
                        <FormField label="Last name:" name="Lastname" formik={formik} placeholder="Enter your lastname" />
                        <FormField label="Contact number:" name="Contactnumber" formik={formik} placeholder="e.g. 07755555555" />
                        <FormField label="Email address:" name="email" formik={formik} placeholder="e.g. email@example.com" />
                        
                        {/* <div className="partner-form-item city-postcode-container">
                                <City_Postcode_field label="City:" name="city" formik={formik} placeholder="e.g. Manchester" />
                                <City_Postcode_field label="Postcode:" name="postcode" formik={formik} placeholder="e.g. M3 12GD" />
                        </div> */}

                        <FormField label="Business name:" name="Businessname" formik={formik} placeholder="e.g. Bob's pub" />
                        <FormField label="Business address:" name="Businessaddress" formik={formik} placeholder="e.g. 123 high street" />

                        <div className="partner-form-item">
                            <label className="partner-text">Your Password:</label>
                            <input
                                name="password"
                                type="password"
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={formik.errors.password && formik.touched.password ? "input-error partner-input" : "partner-input"}
                                placeholder="e.g. ********************"
                            />
                            <p className="partner-text-min-password">Minimum 10 characters</p>
                            {formik.errors.password && formik.touched.password && <p className="error">{formik.errors.password}</p>}
                        </div>

                        <div className="partner-form-item">
                            <label className="partner-text">Confirm Password:</label>
                            <input
                                name="cpassword"
                                type="password"
                                value={formik.values.cpassword}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={formik.errors.cpassword && formik.touched.cpassword ? "input-error partner-input" : "partner-input"}
                                placeholder="e.g. ********************"
                            />
                            {formik.errors.cpassword && formik.touched.cpassword && <p className="error">{formik.errors.cpassword}</p>}
                        </div>

                        <button type="submit" className="partner-button">NEXT</button>
                        <p className="partner-text">Already have an account? <a href="#" className="partner-link">Log in</a></p>
                        <div>
                            <hr className="partner-horizontal-line" />
                        </div>
                        <div className="partner-privacy-policy">
                            <p>
                                By creating an account you agree to our <a href="#" className="partner-link">Terms and Conditions</a>. <br />Please read our <a href="#" className="partner-link">Privacy Statement</a> and <a href="#" className="partner-link">Cookie Policy</a>.
                            </p>
                        </div>
                    </form>
                </div>

                {/* Notification Bar */}
                <Snackbar
                    open={notification.open}
                    autoHideDuration={6000}
                    onClose={handleCloseNotification}
                    anchorOrigin={{ vertical: "top", horizontal: "center" }}
                >
                    <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: "100%" }}>
                        {notification.message}
                    </Alert>
                </Snackbar>
            </div>
        </div>
    );
}

export default Partner;