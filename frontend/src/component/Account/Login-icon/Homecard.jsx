import { useEffect } from "react";
import React, { useState } from "react";
import apiClient from "../../apiClient";


const Homecard =({ styleType, userData}) => {
    useEffect(() => {
        if (userData) {
            setSelectedInvite(userData.card_invite || '');
        }
    }, [userData]);

    const [showInviteModal, setShowInviteModal] = useState(false);
    const [selectedInvite, setSelectedInvite] = useState(userData?.card_invite || '');

    const handleEditClick = () => {
        setSelectedInvite(userData?.card_invite || 'Yes'); // Set the current value as default
        setShowInviteModal(true);
    };

    const handleInviteSelect = async (invite) => {
        try {
            console.log("Preparing to send PATCH request with:", invite); // Log the invite value
    
            const response = await apiClient.patch(
                '/api/pubcard/', 
                { card_invite: invite }, 
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
    
            console.log("Request successful:", response.data); // Log the response
    
            setSelectedInvite(invite);
            setShowInviteModal(false); // Close modal
        } catch (error) {
            console.error("Error in PATCH request:", error); // Log error if any
        }
    };

    return (
        <div className={`${styleType} zeromargin`}>
            <div className="pubcard1">
                <div className="cardtitlediv">
                    <p className="cardtitle">
                        My Pub Card
                    </p>
                    <div className="cardtitleeditsvgdiv" onClick={handleEditClick}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M4.9998 19H5.9998L16.9748 8.025L15.9748 7.025L4.9998 18V19ZM4.2998 19.7V17.7L17.4748 4.5C17.548 4.43617 17.6288 4.38692 17.7173 4.35225C17.8056 4.31742 17.8971 4.3 17.9918 4.3C18.0863 4.3 18.178 4.3125 18.2668 4.3375C18.3555 4.3625 18.4415 4.41667 18.5248 4.5L19.4998 5.475C19.5831 5.55833 19.6373 5.64508 19.6623 5.73525C19.6873 5.82542 19.6998 5.91558 19.6998 6.00575C19.6998 6.10192 19.6839 6.19417 19.6521 6.2825C19.6201 6.371 19.5693 6.45183 19.4998 6.525L6.2998 19.7H4.2998ZM16.4661 7.53375L15.9748 7.025L16.9748 8.025L16.4661 7.53375Z" fill="black"/>
    </svg>
                    </div>
                </div>
                <div className="cardbody">
                        <div className="cardbodysvgdiv">
                            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" fill="none">
                    <path d="M24.1665 82.0833C22.3609 82.0833 20.8679 81.4931 19.6873 80.3125C18.5068 79.1319 17.9165 77.6389 17.9165 75.8333V24.1667C17.9165 22.3611 18.5068 20.8681 19.6873 19.6875C20.8679 18.5069 22.3609 17.9167 24.1665 17.9167H75.8332C77.6387 17.9167 79.1318 18.5069 80.3123 19.6875C81.4929 20.8681 82.0832 22.3611 82.0832 24.1667V75.8333C82.0832 77.6389 81.4929 79.1319 80.3123 80.3125C79.1318 81.4931 77.6387 82.0833 75.8332 82.0833H24.1665ZM24.1665 79.1667H75.8332C76.6665 79.1667 77.4304 78.8194 78.1248 78.125C78.8193 77.4306 79.1665 76.6667 79.1665 75.8333V24.1667C79.1665 23.3333 78.8193 22.5694 78.1248 21.875C77.4304 21.1806 76.6665 20.8333 75.8332 20.8333H24.1665C23.3332 20.8333 22.5693 21.1806 21.8748 21.875C21.1804 22.5694 20.8332 23.3333 20.8332 24.1667V75.8333C20.8332 76.6667 21.1804 77.4306 21.8748 78.125C22.5693 78.8194 23.3332 79.1667 24.1665 79.1667ZM33.1248 68.125H67.7082L57.0832 53.9583L46.6665 66.875L39.9998 59.1667L33.1248 68.125Z" fill="black"/>
                    </svg>
                        </div>
                        <div className="cardbodytextdiv">
                            {userData && (
                                <>
                                    <p className="cardtext">
                                        First name: {userData.firstname}
                                    </p>
                                    <p className="cardtext">
                                        Last name: {userData.lastname}
                                    </p>
                                    <p className="cardtext">
                                        Card ID: {userData.pubID}
                                    </p>
                                    <div className="inviteme">
                                        <p className="cardtext">
                                            Invite me?:
                                        </p>
                                        {showInviteModal ? (
                                            <div className="mood-modal">
                                                <div className="modal-content">
                                                    <select
                                                        className="select"
                                                        value={selectedInvite}
                                                        onChange={(e) => setSelectedInvite(e.target.value)}
                                                    >
                                                        <option className="optiontext" value="Yes">Yes</option>
                                                        <option className="optiontext" value="No">No</option>
                                                    </select>
                                                    <button onClick={() => handleInviteSelect(selectedInvite)}>Save</button>
                                                    <button onClick={() => setShowInviteModal(false)}>Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="cardtext">{selectedInvite || ` ${userData.card_invite}`}</p>
                                        )}
                                    </div>
                                    <p className="cardtext">
                                        Payment method:
                                    </p>
                                </>
                            )}
                        </div>
                </div>
            </div>

        </div>
    )
}
export default Homecard
