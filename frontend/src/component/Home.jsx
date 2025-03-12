import Header from './Header'
import Search from './Search.jsx';
import Feature from './Features.jsx'
import Footer from './Footer.jsx';
import Header_login from './Header_login.jsx';
import Search_login from './Search_login.jsx';
import React, { useState, useEffect } from "react";
import axios from "axios";

function Home({ setSocket, socket, setMapSocket, mapSocket }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuthStatus = async () => {
          try {
            const response = await axios.get("http://localhost:8000/api/auth/status", {
              withCredentials: true, // Include HttpOnly cookie in the request
            });
            if (response.data.authenticated) {
              setIsAuthenticated(true);
            }
          } catch (error) {
            setIsAuthenticated(false);
          } finally {
            setLoading(false);
          }
        };
    
        checkAuthStatus();
      }, []);

      if (loading) {
        return <div>Loading...</div>;
      }

    return (
        <div>
            {isAuthenticated ? (
                <Header_login />
            ) : (
                <Header />
            )}
            {isAuthenticated ? (
                <Search_login setSocket={setSocket} socket={socket} setMapSocket={setMapSocket} mapSocket={mapSocket} />
            ) : (
                <Search />
            )}
            <Feature />
            <Footer />
      </div>
    )
}

export default Home;