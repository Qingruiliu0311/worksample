import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, {useState} from "react";
import ReactDom from 'react-dom'
import Home from './Home'
import Partner from './Features/Feature-pages/Partner/Partner'
import Game from "./Features/Feature-pages/Game/Game";
import Forum from "./Features/Feature-pages/Forum/Forum";
import Account from "./Account/Account";
import Login from "./Login/Login"
import Registration from "./Account/Registration/Registration"
import Choosepubcard from "./Pubcard/choosecard"
import Wallet from "./Wallet/Wallets"
import Walletinvite from "./Wallet/Wallets_invite"
import Vendor_map from "./Vendor_map/Vendor_map"



function App () {
  const [socket, setSocket] = useState(null);
  const [mapSocket, setMapSocket] = useState(null);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home setSocket={setSocket} socket={socket} setMapSocket={setMapSocket} mapSocket={mapSocket}/>} />
        <Route path="/partner" element={<Partner />} />
        <Route path="/game" element={<Game />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/choosepubcard" element={<Choosepubcard />} />
        <Route path="/Wallet" element={<Wallet />} />
        <Route path="/Walletinvite" element={<Walletinvite socket={socket}/>} />
        <Route path="/Vendor_map" element={<Vendor_map setSocket={setSocket} socket={socket} setMapSocket={setMapSocket} mapSocket={mapSocket} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;