import apiClient from "./apiClient";

function Homeinvitation({ group_id, inviterFirstname, inviterLastname, inviterPubCard, inviterCardType, setSocket, socket, setIsInviteStarted, setOwnerData, setMemberData, checkInvitationExists }) {

    const cardBackgrounds = {
        pubcardFFB6B9: 'linear-gradient(90deg, #FFB6B9 0%, #FAE3D9 100%)', // Light Pink
        pubcardBBDED6: 'linear-gradient(90deg, #BBDED6 0%, #FAE3D9 100%)', // Light Blue
        // Add more card types if needed
      };

    const backgroundStyle = {
        background: cardBackgrounds[inviterCardType] || '#FFFFFF', // Default to white if type not matched
      };

    const handleDecline = async () => {
        try {
            // Establish WebSocket connection if not already connected
            if (!socket) {
                const newSocket = new WebSocket(`ws://localhost:8000/ws/group/${group_id}/`);
                newSocket.onopen = () => {
                    console.log("WebSocket connected.");
                    console.log("group_id in home invitation is",group_id)
                    // Send accept invitation action once connected
                    setSocket(newSocket); // Save the socket instance in state
                    newSocket.send(JSON.stringify({
                        action: "decline_invitation",
                        data: {
                            group_id: group_id // Explicitly include the group_id in the expected format
                        }
                    }));
                };
                console.log("next step is check invitationExists")
                

                newSocket.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    if (data.event === "invitation_declined") {
                      console.log("Invitation declined successfully.");
                      checkInvitationExists(); // Refresh the invitation list
                    }
                  };

                newSocket.onerror = (error) => {
                    console.error("WebSocket error:", error);
                };

                newSocket.onclose = () => {
                    console.log("WebSocket closed.");
                    setSocket(null); // Clear the socket instance on close
                };
            } else {
                // If already connected, send the accept invitation action
                socket.send(JSON.stringify({
                    action: "accept_invitation",
                    data: { group_id }
                }));
            }
        } catch (error) {
            console.error("Error handling invitation:", error);
        }};
      
    const handleAccept = async () => {
        try {
            // Establish WebSocket connection if not already connected
            if (!socket) {
                const newSocket = new WebSocket(`ws://localhost:8000/ws/group/${group_id}/`);
                newSocket.onopen = () => {
                    console.log("WebSocket connected.");
                    console.log("group_id in home invitation is",group_id)
                    // Send accept invitation action once connected
                    setSocket(newSocket); // Save the socket instance in state
                    newSocket.send(JSON.stringify({
                        action: "accept_invitation",
                        data: {
                            group_id: group_id // Explicitly include the group_id in the expected format
                        }
                    }));
                    setIsInviteStarted(true)
                };

                newSocket.onmessage = (event) => {
                    const message = JSON.parse(event.data);
                    console.log("WebSocket message received:", message);
                
                    if (message.type === "group_update") {
                        // Update owner data
                        const { owner } = message.data;
                        console.log("Owner is:", owner);
                        setOwnerData({
                            firstname: owner.firstname,
                            lastname: owner.lastname,
                            pub_cards: owner.pub_cards[0]?.pub_card || '',
                            card_type: owner.pub_cards[0]?.card_type || '',
                        });
                
                        // Update member data
                        const { members } = message.data;
                        console.log("Members are:", members);
                        setMemberData(
                            members.map((member) => ({
                                id: member.id,
                                firstname: member.Firstname,
                                lastname: member.Lastname,
                                pub_card: member.pub_cards[0]?.pub_card || '',
                                card_type: member.pub_cards[0]?.card_type || '',
                                invitation_status: member.invitation_status,
                            }))
                        );
                    }
                };

                newSocket.onerror = (error) => {
                    console.error("WebSocket error:", error);
                };

                newSocket.onclose = () => {
                    console.log("WebSocket closed.");
                    setSocket(null); // Clear the socket instance on close
                };
            } else {
                // If already connected, send the accept invitation action
                socket.send(JSON.stringify({
                    action: "accept_invitation",
                    data: { group_id }
                }));
            }
        } catch (error) {
            console.error("Error handling invitation:", error);
        }
    };
    
    return(
        <div className="groupmemberdiv" style={backgroundStyle}>
            <div className="groupmembersvgdiv">
                <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50" fill="none">
                <path d="M12.9089 36.426C14.6797 35.1521 16.5587 34.1446 18.5458 33.4036C20.533 32.6623 22.6844 32.2917 25 32.2917C27.3156 32.2917 29.467 32.6623 31.4542 33.4036C33.4413 34.1446 35.3203 35.1521 37.0911 36.426C38.4668 35.0024 39.5733 33.3212 40.4104 31.3823C41.2479 29.4431 41.6667 27.3156 41.6667 25C41.6667 20.3819 40.0434 16.4497 36.7969 13.2031C33.5503 9.9566 29.6181 8.33333 25 8.33333C20.3819 8.33333 16.4497 9.9566 13.2031 13.2031C9.9566 16.4497 8.33333 20.3819 8.33333 25C8.33333 27.3156 8.75208 29.4431 9.58958 31.3823C10.4267 33.3212 11.5332 35.0024 12.9089 36.426ZM25.001 26.0417C23.2455 26.0417 21.7648 25.4391 20.5589 24.2339C19.353 23.0286 18.75 21.5483 18.75 19.7927C18.75 18.0372 19.3526 16.5564 20.5578 15.3505C21.763 14.1446 23.2434 13.5417 24.999 13.5417C26.7545 13.5417 28.2352 14.1443 29.4411 15.3495C30.647 16.5547 31.25 18.0351 31.25 19.7906C31.25 21.5462 30.6474 23.0269 29.4422 24.2328C28.237 25.4387 26.7566 26.0417 25.001 26.0417ZM25 43.75C22.3851 43.75 19.9372 43.2632 17.6562 42.2896C15.3753 41.316 13.3908 39.9852 11.7026 38.2974C10.0148 36.6092 8.68403 34.6247 7.71042 32.3438C6.73681 30.0628 6.25 27.6149 6.25 25C6.25 22.3851 6.73681 19.9372 7.71042 17.6562C8.68403 15.3753 10.0148 13.3908 11.7026 11.7026C13.3908 10.0148 15.3753 8.68403 17.6562 7.71042C19.9372 6.7368 22.3851 6.25 25 6.25C27.6149 6.25 30.0628 6.7368 32.3438 7.71042C34.6247 8.68403 36.6092 10.0148 38.2974 11.7026C39.9852 13.3908 41.316 15.3753 42.2896 17.6562C43.2632 19.9372 43.75 22.3851 43.75 25C43.75 27.6149 43.2632 30.0628 42.2896 32.3438C41.316 34.6247 39.9852 36.6092 38.2974 38.2974C36.6092 39.9852 34.6247 41.316 32.3438 42.2896C30.0628 43.2632 27.6149 43.75 25 43.75ZM25 41.6667C26.9205 41.6667 28.8102 41.3307 30.6693 40.6589C32.528 39.9873 34.1344 39.0679 35.4885 37.9005C34.1344 36.8134 32.5679 35.954 30.7891 35.3224C29.0102 34.6908 27.0806 34.375 25 34.375C22.9194 34.375 20.983 34.6842 19.1906 35.3026C17.3986 35.921 15.8389 36.787 14.5115 37.9005C15.8656 39.0679 17.472 39.9873 19.3307 40.6589C21.1898 41.3307 23.0795 41.6667 25 41.6667ZM25 23.9583C26.1698 23.9583 27.1568 23.5564 27.9609 22.7526C28.7648 21.9484 29.1667 20.9615 29.1667 19.7917C29.1667 18.6219 28.7648 17.6349 27.9609 16.8307C27.1568 16.0269 26.1698 15.625 25 15.625C23.8302 15.625 22.8432 16.0269 22.0391 16.8307C21.2352 17.6349 20.8333 18.6219 20.8333 19.7917C20.8333 20.9615 21.2352 21.9484 22.0391 22.7526C22.8432 23.5564 23.8302 23.9583 25 23.9583Z" fill="black"/>
                </svg>
            </div>
            <div className="groupmemberinfodiv">
                <p className="groupmemberinfo">Name: {inviterFirstname} {inviterLastname}</p>
                <p className="groupmemberinfo">Card ID: {inviterPubCard}</p>
            </div>
            <div>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="50"
                    height="50"
                    viewBox="0 0 50 50"
                    fill="none"
                    className="clickable-svg"
                    onClick={handleAccept}
                >
                    <path d="M22.0429 33.8619L36.0492 19.8556L33.8538 17.6603L22.0429 29.4713L16.1054 23.5338L13.9101 25.7291L22.0429 33.8619ZM25.0033 44.7916C22.2658 44.7916 19.6927 44.2721 17.284 43.2333C14.8754 42.1944 12.7802 40.7845 10.9986 39.0036C9.21704 37.2227 7.80644 35.1284 6.76686 32.7208C5.72763 30.3131 5.20801 27.7407 5.20801 25.0036C5.20801 22.2661 5.72745 19.693 6.76634 17.2843C7.80523 14.8756 9.21513 12.7805 10.996 10.9989C12.7769 9.21728 14.8712 7.80669 17.2788 6.76711C19.6865 5.72787 22.2589 5.20825 24.996 5.20825C27.7335 5.20825 30.3066 5.7277 32.7153 6.76658C35.124 7.80547 37.2191 9.21537 39.0007 10.9963C40.7823 12.7772 42.1929 14.8714 43.2325 17.2791C44.2717 19.6867 44.7913 22.2591 44.7913 24.9963C44.7913 27.7338 44.2719 30.3069 43.233 32.7155C42.1941 35.1242 40.7842 37.2194 39.0033 39.001C37.2224 40.7826 35.1281 42.1931 32.7205 43.2327C30.3129 44.272 27.7405 44.7916 25.0033 44.7916ZM24.9997 41.6666C29.6525 41.6666 33.5934 40.052 36.8226 36.8228C40.0518 33.5937 41.6663 29.6527 41.6663 24.9999C41.6663 20.3471 40.0518 16.4062 36.8226 13.177C33.5934 9.94783 29.6525 8.33325 24.9997 8.33325C20.3469 8.33325 16.4059 9.94783 13.1768 13.177C9.94759 16.4062 8.33301 20.3471 8.33301 24.9999C8.33301 29.6527 9.94759 33.5937 13.1768 36.8228C16.4059 40.052 20.3469 41.6666 24.9997 41.6666Z" fill="#78A75A"/>
                </svg>

                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="50"
                    height="50"
                    viewBox="0 0 50 50"
                    fill="none"
                    className="clickable-svg"
                    onClick={handleDecline}
                >
                    <path d="M17.4997 34.6952L24.9997 27.1952L32.4997 34.6952L34.695 32.4999L27.195 24.9999L34.695 17.4999L32.4997 15.3046L24.9997 22.8046L17.4997 15.3046L15.3044 17.4999L22.8044 24.9999L15.3044 32.4999L17.4997 34.6952ZM25.0033 44.7916C22.2658 44.7916 19.6927 44.2721 17.284 43.2333C14.8754 42.1944 12.7802 40.7845 10.9986 39.0036C9.21704 37.2227 7.80644 35.1284 6.76686 32.7208C5.72763 30.3131 5.20801 27.7407 5.20801 25.0036C5.20801 22.2661 5.72745 19.693 6.76634 17.2843C7.80523 14.8756 9.21513 12.7805 10.996 10.9989C12.7769 9.21728 14.8712 7.80669 17.2788 6.76711C19.6865 5.72787 22.2589 5.20825 24.996 5.20825C27.7335 5.20825 30.3066 5.7277 32.7153 6.76658C35.124 7.80547 37.2191 9.21537 39.0007 10.9963C40.7823 12.7772 42.1929 14.8714 43.2325 17.2791C44.2717 19.6867 44.7913 22.2591 44.7913 24.9963C44.7913 27.7338 44.2719 30.3069 43.233 32.7155C42.1941 35.1242 40.7842 37.2194 39.0033 39.001C37.2224 40.7826 35.1281 42.1931 32.7205 43.2327C30.3129 44.272 27.7405 44.7916 25.0033 44.7916ZM24.9997 41.6666C29.6525 41.6666 33.5934 40.052 36.8226 36.8228C40.0518 33.5937 41.6663 29.6527 41.6663 24.9999C41.6663 20.3471 40.0518 16.4062 36.8226 13.177C33.5934 9.94783 29.6525 8.33325 24.9997 8.33325C20.3469 8.33325 16.4059 9.94783 13.1768 13.177C9.94759 16.4062 8.33301 20.3471 8.33301 24.9999C8.33301 29.6527 9.94759 33.5937 13.1768 36.8228C16.4059 40.052 20.3469 41.6666 24.9997 41.6666Z" fill="#E4273E"/>
                </svg>
            </div>
        </div>
    )
}



export default Homeinvitation