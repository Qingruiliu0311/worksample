import React, {useState, useEffect} from "react";


const Card =({ styleType, userData, isSelected, onCardSelect }) => {
    return (
        <div 
            className={`${styleType} logincard ${isSelected ? "selected-card" : ""}`}
            onClick={onCardSelect}
        >
            <div className="pubcard1">
                <p className="cardtitle">
                    My Pub Card
                </p>
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
                                        Card ID: {userData.card_id}
                                    </p>
                                    <p className="cardtext">
                                        Invite me?: {userData.invite_status}
                                    </p>
                                    <p className="cardtext">
                                        Request status: {userData.friendship_status}
                                    </p>
                                </>
                            )}
                        </div>
                </div>
            </div>
        </div>
    )
}
export default Card
