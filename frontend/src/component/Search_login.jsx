import React, { useState, useEffect } from 'react';
import Groupmembercard from './Groupmembercard';
import Groupownercard from './Groupownercard';
import { useNavigate } from "react-router-dom";
import apiClient from './apiClient';
import Homeinvitationcard from './Home_invitation_card';


function Search_login({setSocket, socket, setMapSocket, mapSocket}) {
    const Navigate = useNavigate();
    const [isInviteStarted, setIsInviteStarted] = useState(false);
    // const [socket, setSocket] = useState(null);
    const [ownerData, setOwnerData] = useState(null); // To store owner details
    const [memberData, setMemberData] = useState(null);
    const [invitations, setInvitations] = useState([]);
    const handleNavigateToWalletInvite = () => {
        Navigate("/Walletinvite");
      };
    const handleNavigateToVendorMap = async() => {
      try{
        const response = await apiClient.get("group/check/");
        const { group_id } = response.data.data;
        console.log(response.data)
        localStorage.setItem("group_id", group_id);
        localStorage.setItem("role", role);
      }
      catch{}

      Navigate("/Vendor_map");
      };

      const checkExistingGroup = async () => {
        try {
          const response = await apiClient.get("group/check/");
          console.log(response.data)
          if (response.data.exists) {
            const { group_id, role } = response.data.data;
  
            // Store group details in local storage
            localStorage.setItem("group_id", group_id);
            localStorage.setItem("role", role);
  
            // Update state
            setIsInviteStarted(true);
            console.log("group_id is ", group_id)
  
            // Reconnect to WebSocket
            const newSocket = new WebSocket(`ws://localhost:8000/ws/group/${group_id}/`);
            newSocket.onopen = () => console.log("WebSocket to group connected.");
            newSocket.onmessage = (event) => {
              const message = JSON.parse(event.data);
              console.log("WebSocket message received:", message);
          
              if (message.type === "group_update") {
                  const { owner, members } = message.data;
          
                  // Update owner data
                  setOwnerData({
                      firstname: owner.firstname,
                      lastname: owner.Lastname,
                      pub_cards: owner.pub_cards[0]?.pub_card || "",
                      card_type: owner.pub_cards[0]?.card_type || "",
                  });
          
                  // Update member data
                  const updatedMembers = members.map((member) => ({
                      firstname: member.firstname,
                      lastname: member.lastname,
                      pub_card: member.pub_cards?.[0]?.pub_card || "N/A",
                      card_type: member.pub_cards?.[0]?.card_type || "N/A",
                      invitation_status: member.invitation_status || "N/A",
                  }));
          
                  setMemberData(updatedMembers);
              }
          };
  
            newSocket.onclose = () => console.log("Group webSocket disconnected.");
  
            
            // Update socket state
            setSocket(newSocket);
          } else {
            // Clear stale group data
            localStorage.removeItem("group_id");
            localStorage.removeItem("role");
            setIsInviteStarted(false);
          }
        } catch (error) {
          console.error("Error checking group:", error);
        }
      };

      const checkInvitationExists = async () => {
        try {
          const response = await apiClient.get("group/checkinvitation/"); // Endpoint to check invitations
          const invitations = response.data.invitations
          setInvitations(response.data.invitations);
          // if (response.data.invitations && response.data.invitations.length > 0) {
          //   setInvitations(response.data.invitations);
          //   console.log(response.data.invitations)
          // }
        } catch (error) {
          console.error("Error checking invitations:", error);
        }
      };

  useEffect(() => {
    checkInvitationExists();
    checkExistingGroup();

    // Cleanup on component unmount
    return () => {
      if (socket) {
        socket.close();
        console.log("WebSocket connection closed.");
      }
    };
  }, []);

  const handleStartInvite = async () => {
    try {
      const response = await apiClient.get("/api/user/details/");

    const groupResponse = await apiClient.post("group/create/", {
        host_id: response.data.id,  // You might need to adjust this according to your model
        name: 'Group Name'  // You might want to pass a name dynamically
      });

    const groupId = groupResponse.data.id;
    console.log('Group created with ID:', groupId);

    const newSocket = new WebSocket(`ws://localhost:8000/ws/group/${groupId}/`);
    setSocket(newSocket); // Store the socket instance

    newSocket.onopen = () => {
        console.log('Group webSocket connection established');
        setIsInviteStarted(true); // Proceed to invite flow
      };

    newSocket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log("Group webSocket message received:", message);
    
        if (message.type === "group_update" && message.event === "connected") {
            // Update owner data
            const { owner } = message.data;
            console.log("Owner is:", owner);
            setOwnerData({
                firstname: owner.firstname,
                lastname: owner.lastname,
                pub_cards: owner.pub_cards[0]?.pub_card || '',
                card_type: owner.pub_cards[0]?.card_type || '',
            });

            // Set group_id to localstorage
            const {group_id} = message.data
            console.log(group_id)
            

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
    console.error('Group webSocket error:', error);
    };

    newSocket.onclose = () => {
    console.log('Group webSocket connection closed');
    };


    } catch (error) {
      console.error('Error starting invite:', error);
    }
  };

    return (
    <div className="containerSearchContainer">
        <div>
            <div className="homeWelcome">
                <p className="homeWelcomefont">
                Welcome to Invite!<br />Invite your loved ones then
                Plan, reserve, order, and even splitting your  social events in one place
                </p>
                <p className="homeinstructionfont">
                Start invite your friend!
                </p>
            </div>
            <div className="homeinvite">
                {isInviteStarted ? (
                                    <div className='creategroupdiv'>
                                        <div>
                                            <p className='homehost'>Host:</p>
                                        </div>
                                        <div>
                                            {ownerData && (
                                              <Groupownercard
                                                  firstname={ownerData.firstname}
                                                  lastname={ownerData.lastname}
                                                  pubID={ownerData.pub_cards}
                                                  card_type={ownerData.card_type}
                                              />
                                            )}
                                        </div>
                                        <div className='creategrouphrdiv'>
                                            <hr className='creategrouphr'></hr>
                                        </div>
                                        <div>
                                            <p className='homehost'>Guest:</p>
                                        </div>
                                        <div className='groupguestdiv' >
                                            <div className='inviteguestdiv' onClick={handleNavigateToWalletInvite}>
                                                <p className='inviteguesttext'>Click to invite friend</p>
                                            </div>
                                            {memberData && memberData.map((member) => (
                                                <Groupmembercard
                                                    key={member.id}
                                                    firstname={member.firstname}
                                                    lastname={member.lastname}
                                                    pubID={member.pub_card}
                                                    card_type={member.card_type}
                                                    invite_status={member.invitation_status}
                                                />
                                            ))}
                                        </div>
                                        <div className='createinvitegroupdiv'>
                                            <button className='creategroupbutton' onClick={handleNavigateToVendorMap}>Create Group</button>
                                        </div>
                                    </div>
                                    ) : (
                                    <div>
                                        <div className="startinvitebuttondiv">
                                            <button className="startinvitebutton" onClick={handleStartInvite}>
                                                Start Invite
                                            </button>
                                        </div>
                                        <div className="myinvitation_line">
                                                <hr className="or_left"></hr>
                                                <span className="or_text">My Invitation</span>
                                                <hr className="or_right"></hr>
                                        </div>
                                        <div className='creategroupdiv'>
                                            {invitations != null ? (
                                            invitations.map((invitation, index) => (
                                                <div>
                                                    <Homeinvitationcard
                                                    key={index}
                                                    group_id={invitation.group_id}
                                                    inviterFirstname={invitation.inviter_firstname}
                                                    inviterLastname={invitation.inviter_lastname}
                                                    inviterPubCard={invitation.inviter_pub_card}
                                                    inviterCardType={invitation.inviter_card_type}
                                                    setSocket = {setSocket}
                                                    socket = {socket}
                                                    setIsInviteStarted={setIsInviteStarted}
                                                    setOwnerData={setOwnerData}
                                                    setMemberData={setMemberData}
                                                    checkInvitationExists={checkInvitationExists}
                                                    />
                                                </div>
                                            ))
                                            ) : (
                                            <p>No invitations found try refresh the page</p>
                                            )}
                                        </div>
                                    </div>
                                    )}
            </div>
        </div>
      <div className="searchImageDiv">
        <img height={500} width={500} src="./src/assets/pub1-removebg-preview 1.png" />
      </div>
    </div>
    )
}

export default Search_login;