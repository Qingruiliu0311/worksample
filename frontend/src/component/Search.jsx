import React from "react";
import { useNavigate } from "react-router-dom";

function Search() {
  const Navigate = useNavigate();

    return (
    <div className="containerSearchContainer">
      <div className="homeWelcome">
        <p className="homeWelcomefont">
          Welcome to Invite!<br />Invite your loved ones then
          Plan, reserve, order, and even splitting your  social events in one place
        </p>
        <p className="homeinstructionfont">
          Start with signing in and inviting your friend!
        </p>
        <div className="homesignin">
          <button className="homesigninbutton" onClick={()=>{Navigate("/login")}}>Sign in</button>
          <button className="homecreateaccountbutton" onClick={()=>{Navigate("/registration")}}>Create Account</button>
        </div>
      </div>
      <div className="searchImageDiv">
        <img height={500} width={500} src="./src/assets/pub1-removebg-preview 1.png" />
      </div>
    </div>
    )
}

export default Search;