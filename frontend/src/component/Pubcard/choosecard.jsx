import Header_without_menu from "./Header_without_menu"
import { useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Card from "./pubcard"
import apiClient from "../apiClient";
import { useNavigate } from "react-router-dom";



function Choosepubcard(){
    const location = useLocation();
    const [notification, setNotification] = useState(null);
    const [userData, setUserData] = useState(null);
    const [selectedCardStyle, setSelectedCardStyle] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (location.state && location.state.notification) {
            setNotification(location.state.notification);
        }
    }, [location.state]);

    const handleCloseNotification = () => {
        setNotification(null);
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await apiClient.get("/api/user/");
                setUserData(response.data);
                console.log(response.data);
            } catch (error) {
                console.error("Error fetching user data:", error);
                setNotification({
                    message: "Failed to load user data. Please try again.",
                    severity: "error",
                });
            }
        };

        fetchUserData();
    }, []);

    const handleCardSelect = (style) => {
        setSelectedCardStyle(style);
    };

    const handleConfirm = async () => {
        if (!selectedCardStyle) {
            setNotification({
                message: "Please select a card style before confirming.",
                severity: "warning",
            });
            return;
        }

        try {
            const response = await apiClient.patch(
                "/api/pubcard/",
                { card_type: selectedCardStyle },
                { headers: { "Content-Type": "application/json" } }
            );
            console.log("Card type saved:", response.data);
            navigate("/"); // Redirect to home or desired page
        } catch (error) {
            console.error("Error saving card type:", error);
            setNotification({
                message: "Failed to save card type. Please try again.",
                severity: "error",
            });
        }
    };


    return(
        <div>
            <div className="Header_without_menu">
                <Header_without_menu />
            </div>

            <div className="choosecarddiv">
                <div className="choosecardtitle">
                    <p className="choosecardTitle">
                        Pick your pub card
                    </p>
                    <p className="choosecardtextfont">
                        Pub card is your identity in INVITE world - have fun!
                    </p>
                </div>
                <div className="choosecardcarddiv">
                    <Card styleType="pubcardFFB6B9" userData={userData} isSelected={selectedCardStyle === "pubcardFFB6B9"} onCardSelect={() => handleCardSelect("pubcardFFB6B9")} />
                    <Card styleType="pubcardBBDED6" userData={userData} isSelected={selectedCardStyle === "pubcardBBDED6"} onCardSelect={() => handleCardSelect("pubcardBBDED6")}/>
                </div>
                <div className="choosecardconfirmbutton">
                    <button
                        className="confirm-choose-card-button"
                        onClick={handleConfirm}
                    >
                        <span className="confirm-choose-card-text">
                            Confirm
                        </span>
                    </button>
                </div>
            </div>

            {notification && (
                <Snackbar
                    open={true}
                    autoHideDuration={6000}
                    onClose={handleCloseNotification}
                    anchorOrigin={{ vertical: "top", horizontal: "center" }}
                >
                    <Alert
                        onClose={handleCloseNotification}
                        severity={notification.severity}
                        sx={{ width: "100%" }}
                    >
                        {notification.message}
                    </Alert>
                </Snackbar>
            )}

        </div>
    )
    
}

export default Choosepubcard