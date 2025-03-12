import React, {useState, useEffect} from "react";
import Header_without_menu from "./Header_without_menu"
import Add_friend from "./Add_friend";
import apiClient from "../apiClient";
import Card from "./pubcard";
import { useNavigate } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";


function Wallet({socket}){
    const [showOverlay, setShowOverlay] = useState(false);
    const [cards, setCards] = useState([]);
    const [showSearchInput, setShowSearchInput] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredCards, setFilteredCards] = useState([]);
    const [hasPendingInvites, setHasPendingInvites] = useState(false);
    const [selectedCards, setSelectedCards] = useState([]);
    const [errorMessage, setErrorMessage] = useState(""); // State for error messages
    const [showSnackbar, setShowSnackbar] = useState(false); // State to control Snackbar visibility
    const Navigate = useNavigate();

    
    


    const handleOverlayClick = async () => {
        try {
          console.log("add friend")
          setShowOverlay(true);
        } catch (error) {
          console.error("Error fetching selected card data:", error);
        }
      };

    const closeOverlay = () => {
        setShowOverlay(false);
      };

    const handleSearchClick = () => {
        setShowSearchInput(!showSearchInput);
        setSearchQuery(""); // Reset search query when toggling
        setFilteredCards(cards); // Reset filtered cards to show all
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        setFilteredCards(
            cards.filter((card) =>
                card.card_id.toLowerCase().includes(query.toLowerCase()) || card.firstname.toLowerCase().includes(query.toLowerCase()) || card.lastname.toLowerCase().includes(query.toLowerCase()) || card.invite_status.toLowerCase().includes(query.toLowerCase()) // Assumes `card.name` is a searchable property
            )
        );
    };

    const handleCardSelect = (card) => {
        setSelectedCards((prevSelectedCards) => {
          if (prevSelectedCards.includes(card)) {
            return prevSelectedCards.filter((selectedCard) => selectedCard !== card); // Deselect if already selected
          } else {
            return [...prevSelectedCards, card]; // Select card
          }
        });
      };


      const handleInviteClick = () => {
        if (!socket) {
          console.error("WebSocket connection is not established.");
          return;
        }
      
        const cardIds = selectedCards.map((card) => card.card_prime_id);
        console.log("Selected Card IDs:", cardIds);
      
        // Send data via WebSocket
        socket.send(
          JSON.stringify({
            action: "add_member",
            data: {
              user_ids: cardIds, // Adjust to match server expectations
            },
          })
        );
      
        // Optionally, clear selected cards or provide feedback
        Navigate("/")
        setSelectedCards([]);
      };

    useEffect(() => {
        const fetchCards = async () => {
            try {
                // Fetch cards of people the user has added
                const response1 = await apiClient.get("friend/cards/");
                // Fetch cards of people who have added the user
                const response2 = await apiClient.get("friend/invite/cards/");

                // Combine both responses into one array
                const allCards = [...response1.data, ...response2.data];
                setCards(allCards);
                setFilteredCards(allCards); // Initialize filtered cards

                // Check for pending invites (update hasPendingInvites state)
                const pendingInvites = response2.data.some(card => card.friendship_status === "pending");
                console.log(response2.data)
                console.log(pendingInvites)
                setHasPendingInvites(pendingInvites);  // Set to true if there's any pending invite
            } catch (error) {
                console.error("Error fetching card data:", error);
            }
        };

        fetchCards();
    }, []);

    const handleSnackbarClose = (event, reason) => {
        if (reason === "clickaway") {
            return; // Prevent closing Snackbar on clickaway
        }
        setShowSnackbar(false);
    };


    return(
        <div>
            <div className="Header_without_menu">
                <Header_without_menu />
            </div>
            <div className="Wallet_div">
                <div className="Wallet_rectangle">
                    <div className="Wallet_header">
                        <div>
                            <p className="Wallet_header_title">My wallet</p>
                        </div>
                        <div className="Wallet_header_svg_div">
                            <span onClick={handleOverlayClick} className="clickable-svg">
                                {hasPendingInvites ? (

                                    <li class="notification-container">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50" fill="none">
                                        <path d="M26.2419 24.2548C27.1283 23.2906 27.784 22.1834 28.209 20.9334C28.6337 19.6834 28.846 18.3947 28.846 17.0673C28.846 15.7399 28.6337 14.4512 28.209 13.2012C27.784 11.9512 27.1283 10.844 26.2419 9.8798C28.0714 10.0909 29.5905 10.8808 30.7992 12.2496C32.0075 13.6187 32.6117 15.2246 32.6117 17.0673C32.6117 18.9104 32.0075 20.5163 30.7992 21.885C29.5905 23.2538 28.0714 24.0437 26.2419 24.2548ZM37.1794 40.2246V35.3366C37.1794 34.2008 36.9483 33.1203 36.4861 32.0949C36.024 31.0696 35.3683 30.1897 34.5189 29.4553C36.1162 29.9869 37.5865 30.7041 38.9299 31.6069C40.2733 32.5097 40.945 33.7529 40.945 35.3366V40.2246H37.1794ZM40.945 26.5626V22.3959H36.7783V19.2709H40.945V15.1043H44.07V19.2709H48.2367V22.3959H44.07V26.5626H40.945ZM17.3877 24.359C15.3825 24.359 13.6658 23.6451 12.2377 22.2173C10.8099 20.7892 10.096 19.0725 10.096 17.0673C10.096 15.0621 10.8099 13.3456 12.2377 11.9178C13.6658 10.4897 15.3825 9.77563 17.3877 9.77563C19.3929 9.77563 21.1094 10.4897 22.5372 11.9178C23.9653 13.3456 24.6794 15.0621 24.6794 17.0673C24.6794 19.0725 23.9653 20.7892 22.5372 22.2173C21.1094 23.6451 19.3929 24.359 17.3877 24.359ZM1.7627 40.2246V35.5928C1.7627 34.5727 2.03978 33.6279 2.59395 32.7584C3.14811 31.889 3.88856 31.2206 4.8153 30.7532C6.87467 29.7439 8.9521 28.9867 11.0476 28.4819C13.1427 27.977 15.2561 27.7246 17.3877 27.7246C19.5189 27.7246 21.6323 27.977 23.7278 28.4819C25.8229 28.9867 27.9002 29.7439 29.9596 30.7532C30.8863 31.2206 31.6268 31.889 32.1809 32.7584C32.7354 33.6279 33.0127 34.5727 33.0127 35.5928V40.2246H1.7627ZM17.3877 21.234C18.5335 21.234 19.5144 20.826 20.3304 20.01C21.1464 19.194 21.5544 18.2131 21.5544 17.0673C21.5544 15.9215 21.1464 14.9406 20.3304 14.1246C19.5144 13.3086 18.5335 12.9006 17.3877 12.9006C16.2419 12.9006 15.261 13.3086 14.445 14.1246C13.629 14.9406 13.221 15.9215 13.221 17.0673C13.221 18.2131 13.629 19.194 14.445 20.01C15.261 20.826 16.2419 21.234 17.3877 21.234ZM4.8877 37.0996H29.8877V35.5928C29.8877 35.1709 29.7655 34.7803 29.521 34.4209C29.2766 34.0619 28.9446 33.7689 28.5252 33.5418C26.7304 32.6578 24.9004 31.988 23.0351 31.5324C21.1695 31.0772 19.287 30.8496 17.3877 30.8496C15.488 30.8496 13.6056 31.0772 11.7403 31.5324C9.87467 31.988 8.04447 32.6578 6.24967 33.5418C5.83023 33.7689 5.49846 34.0619 5.25436 34.4209C5.00992 34.7803 4.8877 35.1709 4.8877 35.5928V37.0996Z" fill="black"/>
                                    </svg>
                                    <span class="notification-counter">{
                                            cards.filter((card) => card.friendship_status === "pending").length
                                        }</span>
                                </li>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50" fill="none">
                                        <path d="M26.2419 24.2548C27.1283 23.2906 27.784 22.1834 28.209 20.9334C28.6337 19.6834 28.846 18.3947 28.846 17.0673C28.846 15.7399 28.6337 14.4512 28.209 13.2012C27.784 11.9512 27.1283 10.844 26.2419 9.8798C28.0714 10.0909 29.5905 10.8808 30.7992 12.2496C32.0075 13.6187 32.6117 15.2246 32.6117 17.0673C32.6117 18.9104 32.0075 20.5163 30.7992 21.885C29.5905 23.2538 28.0714 24.0437 26.2419 24.2548ZM37.1794 40.2246V35.3366C37.1794 34.2008 36.9483 33.1203 36.4861 32.0949C36.024 31.0696 35.3683 30.1897 34.5189 29.4553C36.1162 29.9869 37.5865 30.7041 38.9299 31.6069C40.2733 32.5097 40.945 33.7529 40.945 35.3366V40.2246H37.1794ZM40.945 26.5626V22.3959H36.7783V19.2709H40.945V15.1043H44.07V19.2709H48.2367V22.3959H44.07V26.5626H40.945ZM17.3877 24.359C15.3825 24.359 13.6658 23.6451 12.2377 22.2173C10.8099 20.7892 10.096 19.0725 10.096 17.0673C10.096 15.0621 10.8099 13.3456 12.2377 11.9178C13.6658 10.4897 15.3825 9.77563 17.3877 9.77563C19.3929 9.77563 21.1094 10.4897 22.5372 11.9178C23.9653 13.3456 24.6794 15.0621 24.6794 17.0673C24.6794 19.0725 23.9653 20.7892 22.5372 22.2173C21.1094 23.6451 19.3929 24.359 17.3877 24.359ZM1.7627 40.2246V35.5928C1.7627 34.5727 2.03978 33.6279 2.59395 32.7584C3.14811 31.889 3.88856 31.2206 4.8153 30.7532C6.87467 29.7439 8.9521 28.9867 11.0476 28.4819C13.1427 27.977 15.2561 27.7246 17.3877 27.7246C19.5189 27.7246 21.6323 27.977 23.7278 28.4819C25.8229 28.9867 27.9002 29.7439 29.9596 30.7532C30.8863 31.2206 31.6268 31.889 32.1809 32.7584C32.7354 33.6279 33.0127 34.5727 33.0127 35.5928V40.2246H1.7627ZM17.3877 21.234C18.5335 21.234 19.5144 20.826 20.3304 20.01C21.1464 19.194 21.5544 18.2131 21.5544 17.0673C21.5544 15.9215 21.1464 14.9406 20.3304 14.1246C19.5144 13.3086 18.5335 12.9006 17.3877 12.9006C16.2419 12.9006 15.261 13.3086 14.445 14.1246C13.629 14.9406 13.221 15.9215 13.221 17.0673C13.221 18.2131 13.629 19.194 14.445 20.01C15.261 20.826 16.2419 21.234 17.3877 21.234ZM4.8877 37.0996H29.8877V35.5928C29.8877 35.1709 29.7655 34.7803 29.521 34.4209C29.2766 34.0619 28.9446 33.7689 28.5252 33.5418C26.7304 32.6578 24.9004 31.988 23.0351 31.5324C21.1695 31.0772 19.287 30.8496 17.3877 30.8496C15.488 30.8496 13.6056 31.0772 11.7403 31.5324C9.87467 31.988 8.04447 32.6578 6.24967 33.5418C5.83023 33.7689 5.49846 34.0619 5.25436 34.4209C5.00992 34.7803 4.8877 35.1709 4.8877 35.5928V37.0996Z" fill="black"/>
                                    </svg>
                                )}
                            </span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50" fill="none">
                            <path d="M24.5191 39.5833C24.0625 39.5833 23.6812 39.4303 23.3753 39.1244C23.0694 38.8185 22.9165 38.4373 22.9165 37.9807V26.3619L11.6743 12.1474C11.3941 11.7734 11.3561 11.3915 11.5602 11.0015C11.7648 10.6116 12.0913 10.4166 12.5399 10.4166H37.4597C37.9083 10.4166 38.2349 10.6116 38.4394 11.0015C38.6436 11.3915 38.6055 11.7734 38.3253 12.1474L27.0832 26.3619V37.9807C27.0832 38.4373 26.9302 38.8185 26.6243 39.1244C26.3184 39.4303 25.9371 39.5833 25.4806 39.5833H24.5191ZM24.9998 25.625L35.3123 12.5H14.6873L24.9998 25.625Z" fill="black"/>
                            </svg>
                            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50" fill="none" onClick={handleSearchClick} className="clickable-svg">
                            <path d="M40.5925 41.987L27.5477 28.9422C26.5061 29.8291 25.3081 30.5155 23.954 31.0016C22.5998 31.4877 21.239 31.7308 19.8717 31.7308C16.5349 31.7308 13.7107 30.5758 11.3993 28.2657C9.08817 25.9556 7.93262 23.1332 7.93262 19.7985C7.93262 16.4634 9.08765 13.6386 11.3977 11.324C13.7078 9.00978 16.5302 7.85266 19.8649 7.85266C23.2 7.85266 26.0248 9.00822 28.3394 11.3193C30.6536 13.6308 31.8107 16.4549 31.8107 19.7917C31.8107 21.2393 31.5543 22.6402 31.0415 23.9943C30.5286 25.3485 29.8555 26.5063 29.0222 27.4678L42.067 40.5131L40.5925 41.987ZM19.8717 29.6475C22.6359 29.6475 24.9696 28.6959 26.8727 26.7928C28.7758 24.89 29.7274 22.5563 29.7274 19.7917C29.7274 17.0271 28.7758 14.6935 26.8727 12.7907C24.9696 10.8876 22.6359 9.93599 19.8717 9.93599C17.1071 9.93599 14.7734 10.8876 12.8706 12.7907C10.9675 14.6935 10.016 17.0271 10.016 19.7917C10.016 22.5563 10.9675 24.89 12.8706 26.7928C14.7734 28.6959 17.1071 29.6475 19.8717 29.6475Z" fill="black"/>
                            </svg>
                            {showSearchInput && (
                                <div className="searchInputContainer">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        placeholder="Search cards..."
                                        className="searchInput"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="Wallet_cards">
                        <div className="add_friend_card" onClick={handleOverlayClick}>
                            <p className="add_friend_card_text">Click to add cards</p>
                        </div>
                        {filteredCards.map((cards, index) => (
                            <Card 
                                key={index}
                                styleType={cards.card_type}
                                userData={cards}
                                isSelected={selectedCards.includes(cards)}
                                onCardSelect={() => handleCardSelect(cards)} // Handle selection
                            />
                        ))}
                    </div>
                    <div className="walletinvitebuttondiv">
                        <button className="walletinvitebutton" onClick={handleInviteClick}>Invite them!</button>
                    </div>
                </div>
            </div>
                  {/* Render the Overlay */}
                {showOverlay && (
                    <div className="cardOverlay" onClick={closeOverlay}>
                        <div className="overlayContent" onClick={(e) => e.stopPropagation()}>
                            <Add_friend setHasPendingInvites={setHasPendingInvites}/>
                        </div>
                    </div>
                )}
            <Snackbar open={showSnackbar} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
                <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: "100%" }}>
                    {errorMessage}
                </Alert>
            </Snackbar>
        </div>
    )
}

export default Wallet