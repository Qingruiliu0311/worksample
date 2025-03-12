import React from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const NotificationBar = ({ open, onClose, message, severity }) => {
    return (
        <Snackbar
            open={open}
            autoHideDuration={6000}
            onClose={onClose}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
            <Alert onClose={onClose} severity={severity} sx={{ width: "100%" }}>
                {message}
            </Alert>
        </Snackbar>
    );
};

export default NotificationBar;