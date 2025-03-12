import React, {useState, useEffect} from "react";
import apiClient from "../apiClient";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Invitecard from "./Invite_card"


function Add_friend({ setHasPendingInvites }){
    
    const [cards, setCards] = useState([]);
    const [friendId, setFriendId] = useState("");
    const [notification, setNotification] = useState({
        open: false,
        message: "",
        severity: "", // "success" or "error"
    });
    const handleCloseNotification = () => {
        setNotification((prev) => ({ ...prev, open: false }));
    };


    const updateCardStatus = (cardId, status) => {
        setCards((prevCards) => {
            const updatedCards = prevCards.map((card) =>
                card.card_id === cardId ? { ...card, friendship_status: status } : card
            );
            // Check if there are still pending invites
            const hasPending = updatedCards.some(card => card.friendship_status === "pending");
            setHasPendingInvites(hasPending); // Update parent state
            return updatedCards;
        });
    };

    useEffect(() => {
        const fetchCards = async () => {
            try {
                const response = await apiClient.get("friend/invite/cards/");
                setCards(response.data);
            } catch (error) {
                console.error("Error fetching card data:", error);
            }
        };
        fetchCards();
    }, [])



    const sendFriendRequest = async () => {
        if (!friendId.trim()) {
            setNotification({
                open: true,
                message: "Please enter a valid card ID.",
                severity: "error",
            });
            return;
        }

        try {
            // Send a POST request using apiClient
            const response = await apiClient.post("friend/send/", {
                pub_card: friendId, // Pass the pub_card ID in the request body
            });

            if (response.status === 200 || response.status === 201) {
                setNotification({
                    open: true,
                    message: response.data.message,
                    severity: "success",
                });
                setFriendId(""); // Clear the input field
                window.location.reload()
            } else {
                setNotification({
                    open: true,
                    message: "Failed to send friend request. Please try again.",
                    severity: "error",
                });
            }
        } catch (error) {
            console.error("Error sending friend request:", error);
            if (error.response) {
                // Check for a 404 error (user not found)
                if (error.response.status === 404) {
                    setNotification({
                        open: true,
                        message: "User you are trying to add does not exist.",
                        severity: "error",
                    });
                } else {
                    // Default message for other errors
                    setNotification({
                        open: true,
                        message: error.response.data.error || error.response.data.detail || "An error occurred. Please try again.",
                        severity: "error",
                    });
                }
            } else if (error.request) {
                // Request was made but no response received
                setNotification({
                    open: true,
                    message: "No response from server. Please check your connection.",
                    severity: "error",
                });
            } else {
                // Something else went wrong
                setNotification({
                    open: true,
                    message: error.response.data.detail || "Something went wrong. Please try again.",
                    severity: "error",
                });
            }
        }
    };
    return (
        <div className="zeromargin">
            <div className="add_friend_rectangle">
                <div className="add_friend_content">
                    <div className="add_friend_title_div">
                        <p className="add_friend_title">Add friends</p>
                    </div>
                    <div className="add_friend_instruction_div">
                        <p className="add_friend_instruction">Already know your friend's card ID? Sent them a friend request and collect their card!</p>
                    </div>
                    <div className="add_friend_input_div">
                        <input
                            type="text"
                            className="add_friend_input"
                            placeholder="Enter friend's pub card ID"
                            value={friendId}
                            onChange={(e) => setFriendId(e.target.value)}
                        />
                        <button className="add_friend_button" onClick={sendFriendRequest}>
                            Add Friend
                        </button>
                    </div>
                    <div className="response_to_invites">
                        <p className="add_friend_instruction">Response to add friend requests:</p>
                    </div>
                    <div className="response_card_div">
                        {cards.map((cards, index) => (
                                <Invitecard
                                    key={index}
                                    userData={cards}
                                    updateCardStatus={updateCardStatus}
                                />
                        ))}
                    </div>
                </div>
            </div>
                        {/* Material UI Snackbar for Notifications */}
            <Snackbar
                open={notification.open}
                autoHideDuration={3000}
                onClose={() => setNotification({ ...notification, open: false })}
                severity={notification.severity}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: "100%" }}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </div>
    )
}

export default Add_friend

