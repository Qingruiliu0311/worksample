import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, OverlayView } from '@react-google-maps/api';
import tt from '@tomtom-international/web-sdk-maps';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import MapUserCard from './Map_user_card';
import Vendor_card from './Vendor_card';
import apiClient from '../apiClient';
import axios from 'axios';
import { debounce } from 'lodash'; // or any debounce utility


const mapContainerStyle = {
  width: '100vw', // Full viewport width
  height: '100vh', // Full viewport height (this will fill the entire screen vertically)
};

const defaultCenter = {
    lat: 51.5074, // Default center (will be updated to user's location)
    lng: -0.1278,
  };
  

  

function Vendor_map({setSocket, socket, setMapSocket, mapSocket}){
    const mapElement = useRef(null);
    const mapInstance = useRef(null);
    const vendorMarker = useRef(null);
    const [userLocation, setUserLocation] = useState(null);
    const [users, setUsers] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState("");
    const [selectedCard, setSelectedCard] = useState(null);
    const [vendors, setVendors] = useState([]);
    const [vendorLocation, setVendorLocation] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [hasCenteredOnVendor, setHasCenteredOnVendor] = useState(false);
    const [popups, setPopups] = useState([]);
    const [travelTimeMarkers, setTravelTimeMarkers] = useState([]);
    const [userProposal, setUserProposal] = useState(null);

    const handleCardSelect = (id) => {
      // Clear all routes, markers, and popups from the map
    
      // Delete all routes (including untracked ones)
      if (mapInstance.current) {
        // Get all layers and sources from the map style
        const layers = mapInstance.current.getStyle().layers;
        const sources = Object.keys(mapInstance.current.getStyle().sources);
    
        // Remove all route layers
        layers.forEach(layer => {
          if (layer.type === 'line' && layer.source.startsWith('route-')) {
            mapInstance.current.removeLayer(layer.id);
          }
        });
    
        // Remove all route sources
        sources.forEach(source => {
          if (source.startsWith('route-')) {
            mapInstance.current.removeSource(source);
          }
        });
      }
    
      // Delete all popups (including untracked ones)
      if (mapInstance.current) {
        // Get all popups from the map
        const popups = mapInstance.current._popups; // Access internal popups list
        if (popups) {
          popups.forEach(popup => {
            if (popup && popup.remove) {
              popup.remove(); // Remove the popup from the map
            }
          });
        }
      }
    
      // Clear travel time markers
      travelTimeMarkers.forEach(marker => {
        if (marker && marker.remove) {
          marker.remove();
        }
      });
    
      // Reset the state variables
      setRoutes([]);
      setPopups([]);
      setTravelTimeMarkers([]);
    
      // Toggle the selected card
      const isSelected = selectedCard === id;
    
      if (isSelected) {
        // Deselect the vendor
        setSelectedCard(null);
        setVendorLocation(null); // Clear vendorLocation when deselected
    
        // Remove the vendor marker from the map
        if (vendorMarker.current) {
          vendorMarker.current.remove();
          vendorMarker.current = null; // Reset the reference
        }
      } else {
        // Select the vendor
        setSelectedCard(id);
        setHasCenteredOnVendor(false); // Reset centering state when a new vendor is selected
      }
    };

    const calculateAndDisplayRoute = async (userPosition, vendorPosition, mapInstance, userColor, userName) => {
      const apiKey = '3MgO4GTFjnXGYfS00uPDcO8o0VYjMsdF'; // Replace with your TomTom API key
      const routeUrl = `https://api.tomtom.com/routing/1/calculateRoute/${userPosition.lat},${userPosition.lng}:${vendorPosition.lat},${vendorPosition.lng}/json?key=${apiKey}`;
    
      try {
        const response = await axios.get(routeUrl);
        const routeData = response.data;
    
        if (routeData.routes && routeData.routes.length > 0) {
          const routeCoordinates = routeData.routes[0].legs[0].points.map(point => [point.longitude, point.latitude]);
          const travelTimeInSeconds = routeData.routes[0].summary.travelTimeInSeconds; // Extract travel time
    
          // Calculate the midpoint of the route
          const midpointIndex = Math.floor(routeCoordinates.length / 2);
          const midpoint = routeCoordinates[midpointIndex];
    
          // Create a LineString geometry for the route
          const routeLine = {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: routeCoordinates,
            },
            properties: {},
          };
    
          // Generate a unique route ID
          const routeId = `route-${Math.random().toString(36).substr(2, 9)}`;
    
          // Add the route as a source to the map
          if (mapInstance.current.getSource(routeId)) {
            mapInstance.current.removeLayer(routeId);
            mapInstance.current.removeSource(routeId);
          }
    
          mapInstance.current.addSource(routeId, {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [routeLine],
            },
          });
    
          // Add a layer to display the route with the user's color
          mapInstance.current.addLayer({
            id: routeId,
            type: 'line',
            source: routeId,
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': userColor, // Use the user's color
              'line-opacity': 0.6,
              'line-width': 5,
            },
          });
    
          // Create a custom marker element to display the user's name and travel time
          const markerElement = document.createElement('div');
          markerElement.className = 'travel-time-marker';
          markerElement.innerHTML = `
            <div class="travel-time-text">
              <span class="user-name">${userName}</span>: ${Math.round(travelTimeInSeconds / 60)} mins
            </div>
          `;
    
          // Apply the provided CSS styles
          markerElement.style.border = '1px solid #000';
          markerElement.style.background = userColor; // Use the user's color
          markerElement.style.boxShadow = '0px 4px 4px 0px rgba(0, 0, 0, 0.25)';
          markerElement.style.width = 'auto';
          markerElement.style.height = 'auto';
          markerElement.style.flexShrink = '0';
          markerElement.style.display = 'flex';
          markerElement.style.alignItems = 'center';
          markerElement.style.justifyContent = 'center';
          markerElement.style.borderRadius = '5px'; // Optional: Add border radius for better appearance
    
          // Style the text inside the marker
          const textElement = markerElement.querySelector('.travel-time-text');
          textElement.style.color = '#000';
          textElement.style.fontFamily = 'Antic, sans-serif';
          textElement.style.fontSize = '18px';
          textElement.style.fontStyle = 'normal';
          textElement.style.fontWeight = '400';
          textElement.style.lineHeight = 'normal';
    
          // Add the custom marker to the map
          const marker = new tt.Marker({
            element: markerElement,
          })
            .setLngLat(midpoint)
            .addTo(mapInstance.current);
    
          return { routeId, travelTimeInSeconds, marker }; // Return the marker
        }
      } catch (error) {
        console.error('Error calculating route:', error);
      }
    };
    



    useEffect(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ lat: latitude, lng: longitude });
          },
          (error) => {
            console.error("Error getting user location:", error);
            setUserLocation(defaultCenter); // Fallback to default
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
        setUserLocation(defaultCenter); // Fallback to default
      }
    }, []);

    useEffect(() => {
      // Initialize TomTom map after userLocation is set (only once)
      if (userLocation && mapElement.current && !mapInstance.current) {
        mapInstance.current = tt.map({
          key: '3MgO4GTFjnXGYfS00uPDcO8o0VYjMsdF', // Replace with your TomTom API key
          container: mapElement.current,
          center: userLocation,
          zoom: 15,
        });
      }
    }, [userLocation]); // Run only when userLocation is available
  


    useEffect(() => {
      // Fetch vendor data from the backend
      const fetchVendors = async () => {
        try {
          const response = await apiClient.get('http://localhost:8000/vendors');
          const data = await response.data;
          setVendors(data.vendors);
        } catch (error) {
          console.error('Error fetching vendors:', error);
        }
      };
  
      fetchVendors();
    }, []);



    useEffect(() => {
      if (!mapInstance.current) return;
    
      // Store a reference to all the markers on the map
      const markers = [];
    
      // Function to add markers for users
      const addMarkers = () => {
        users.forEach((user) => {
          // Create a custom marker element
          const userMarkerElement = document.createElement('div');
          userMarkerElement.className = 'user_marker';
          userMarkerElement.style.backgroundColor = user.color; // Dynamically set the color
    
          // Add a click event to the marker
          userMarkerElement.addEventListener('click', () => {
            alert(`User ID: ${user.user_id}`);
          });
    
          // Create and add the marker to the map
          const marker = new tt.Marker({
            element: userMarkerElement,
          })
            .setLngLat(user.position)
            .addTo(mapInstance.current);
    
          markers.push(marker); // Store marker reference
        });
      };
    
      // Remove all existing markers
      const removeMarkers = () => {
        markers.forEach((marker) => marker.remove());
        markers.length = 0; // Clear the markers array
      };
    
      // Add new markers
      removeMarkers();
      addMarkers();
    
      // Clean up on unmount
      return () => {
        removeMarkers();
      };
    }, [users, userLocation]);


    useEffect(() => {
      if (!mapInstance.current || !vendorLocation || !vendorLocation.lat || !vendorLocation.lon) return;
    
      const markerPosition = [vendorLocation.lon, vendorLocation.lat];
      console.log("markerPosition is:", markerPosition);
    
      // Add the vendor marker to the map
      vendorMarker.current = new tt.Marker()
        .setLngLat(markerPosition)
        .addTo(mapInstance.current);
    
      // Center the map on the vendor's location only once
      if (!hasCenteredOnVendor) {
        mapInstance.current.setCenter(markerPosition);
        setHasCenteredOnVendor(true);
      }
    
      // Remove previous routes, popups, and travel time markers
      routes.forEach(route => {
        if (mapInstance.current.getLayer(route.routeId)) {
          mapInstance.current.removeLayer(route.routeId);
        }
        if (mapInstance.current.getSource(route.routeId)) {
          mapInstance.current.removeSource(route.routeId);
        }
      });
      popups.forEach(popup => {
        if (popup && popup.remove) {
          popup.remove();
        }
      });
      travelTimeMarkers.forEach(marker => {
        if (marker && marker.remove) {
          marker.remove();
        }
      });
      setRoutes([]);
      setPopups([]);
      setTravelTimeMarkers([]);
    
      // Calculate and display routes for each user
      const newRoutes = [];
      const newPopups = [];
      const newTravelTimeMarkers = [];
      users.forEach(async user => {
        const result = await calculateAndDisplayRoute(
          user.position,
          { lat: vendorLocation.lat, lng: vendorLocation.lon },
          mapInstance,
          user.color,
          user.firstname
        );
        if (result) {
          const { routeId, travelTimeInSeconds, marker } = result;
          newRoutes.push({ routeId, travelTimeInSeconds, userId: user.user_id });
          newTravelTimeMarkers.push(marker);
        }
      });
    
      setRoutes(newRoutes);
      setPopups(newPopups);
      setTravelTimeMarkers(newTravelTimeMarkers);
    
      // Cleanup function to remove the vendor marker when vendorLocation changes
      return () => {
        if (vendorMarker.current && vendorMarker.current.remove) {
          vendorMarker.current.remove();
          vendorMarker.current = null;
        }
      };
    }, [vendorLocation]); // Ensure users is included in the dependency array


    useEffect(() => {
        if (!socket) {
          const group_id = localStorage.getItem("group_id");
          const newSocket = new WebSocket(`ws://localhost:8000/ws/group/${group_id}/`);
          newSocket.onopen = () => console.log("WebSocket to group reconnected.");
          setSocket(newSocket);
          return;
        }
      
        socket.onmessage = (event) => {
          const message = JSON.parse(event.data);
      
          if (message.event === "chat_message") {
            setChatMessages((prevMessages) => [...prevMessages, message]);
          }
        };
      
        socket.onerror = (error) => {
          console.error("Chat WebSocket error:", error);
        };
      
        socket.onclose = () => {
          console.log("Chat WebSocket disconnected.");
        };
      
        // Cleanup on unmount
        return () => {
          socket.close();
        };
      }, [socket]);

    useEffect(() => {
      const group_id = localStorage.getItem("group_id");
      const newSocket = new WebSocket(`ws://localhost:8000/ws/livemap/${group_id}/`);
    
      newSocket.onopen = () => {
        console.log("WebSocket to live map connected.");
        setMapSocket(newSocket); // Pass the WebSocket instance here
      };
    
      newSocket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    
      newSocket.onclose = () => {
        console.log("Live map WebSocket disconnected.");
      };

      newSocket.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (message.type === "positions_update" && Array.isArray(message.positions)) {
          const userColors = ["#FFB6B9", "#FCDDB0", "#EF9922", "#78A75A"];
          const updatedUsers = message.positions.map((user, index) => ({
            ...user,
            color: userColors[index % userColors.length], // Assign color cyclically
          }));
          setUsers(updatedUsers);
        }
      };
    
      // Cleanup on unmount
      return () => {
        newSocket.close();
      };
    }, []);

    useEffect(() => {
      let watchId;
      let intervalId;
    
      const sendPosition = (latitude, longitude) => {
        if (mapSocket && mapSocket.readyState === WebSocket.OPEN) {
          const payload = JSON.stringify({
            action: 'update_position',
            data: { position: { lat: latitude, lng: longitude } },
          });
          console.log("Sending position to server:", payload);
          mapSocket.send(payload);
        } else {
          console.error("WebSocket not ready. Position not sent.");
        }
      };
    
      if (navigator.geolocation) {
        // Track user's location
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log("User position:", position.coords);
            setUserLocation({ lat: latitude, lng: longitude });
    
            // Optionally, send position immediately if desired
            sendPosition(latitude, longitude);
          },
          (error) => {
            console.error('Error tracking user location:', error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
    
        // Send location updates periodically
        intervalId = setInterval(() => {
          if (userLocation) {
            const { lat, lng } = userLocation;
            console.log("Sending periodic update:", userLocation);
            sendPosition(lat, lng);
          }
        }, 5000); // Send updates every 5 seconds
      } else {
        console.error('Geolocation is not supported by this browser.');
      }
    
      // Cleanup on unmount
      return () => {
        if (watchId) navigator.geolocation.clearWatch(watchId);
        if (intervalId) clearInterval(intervalId);
      };
    }, [mapSocket]); // Ensure the latest mapSocket and userLocation are used

    useEffect(async() => {
      const isOwnerResponse = await apiClient.get('http://localhost:8000/proposals/is-owner/');
      const proposal_id = isOwnerResponse.data.proposal_ids[0]
      const proposalResponse = await apiClient.get(`http://localhost:8000/proposals/${proposal_id}/with-vendor/`);
      setUserProposal(proposalResponse.data)
    }, [])

    const sendMessage = () => {
      if (socket && chatInput.trim()) {
        const payload = JSON.stringify({
          action: "send_message",
          data: { text: chatInput.trim() },
        });
        socket.send(payload);
        setChatInput("");
      }
    };

    const handleProposalClick = async() =>{
      try {
        const group_id = localStorage.getItem("group_id");
        const selectedCardId = selectedCard;
    
        // Check if all required fields are populated
        if (!group_id || !selectedCardId || !vendorLocation || !vendorLocation.lat || !vendorLocation.lon) {
          console.error("Missing required fields in payload. Cannot send request.");
          return; // Exit the function if any field is missing
        }
    
        // Prepare the request payload
        const payload = {
          group: group_id,
          vendor: selectedCardId,
          vendor_latitude: vendorLocation.lat,
          vendor_longitude: vendorLocation.lon,
        };
    
        // Log the payload for debugging
        console.log("Payload being sent:", payload);
    
        // Make the POST request with the payload
        const response = await apiClient.post('http://localhost:8000/proposals/', payload);
        console.log("Proposal created successfully:", response.data);
      } catch (error) {
        console.error('Error creating proposal:', error.response?.data || error.message);
      }

      try {
        // Step 1: Fetch the latest proposal ID
        const response = await apiClient.get('http://localhost:8000/proposals/');
        const proposal_id = response.data[0].id; // Assuming the first proposal is the one you want
      
        // Step 2: Fetch the list of group members
        const response_groupmember = await apiClient.get('http://localhost:8000/group/getmembers/');
        const group_members = response_groupmember.data.proposed_member; // Assuming the response contains `proposed_member`
      
        // Step 3: Iterate through each user and create a ProposalMember entry
        for (const member of group_members) {
          const payload = {
            proposal: proposal_id, // Use the proposal ID
            member: member.id, // Use the member's ID
            status: "pending", // Default status for new members
          };
      
          // Step 4: Send a POST request to create the ProposalMember entry
          await apiClient.post('http://localhost:8000/proposal-members/', payload);
          console.log(`Created ProposalMember for user ${member.id}`);
        }
      
        console.log("All ProposalMember entries created successfully.");
      } catch (error) {
        console.error('Error creating proposal members:', error.response?.data || error.message);
      }
      try{
        const isOwnerResponse = await apiClient.get('http://localhost:8000/proposals/is-owner/');
        const proposal_id = isOwnerResponse.data.proposal_ids[0]
        const proposalResponse = await apiClient.get(`http://localhost:8000/proposals/${proposal_id}/with-vendor/`);
        setUserProposal(proposalResponse.data)
      }catch(error){
        console.error('Error list proposal info:', error.response?.data || error.message);
      }
    
    }

    const handleProposalCancelClick = async () => {
      try {
        // Fetch the proposal ID from the userProposal state
        const proposal_id = userProposal.id;
    
        // Send a DELETE request to cancel the proposal
        await apiClient.delete(`http://localhost:8000/proposals/${proposal_id}/`);
    
        // Set the userProposal state to null after successful deletion
        setUserProposal(null);
    
        console.log("Proposal canceled successfully.");
      } catch (error) {
        console.error('Error canceling proposal:', error.response?.data || error.message);
      }
    };

    return (
      <div className='map_container'>
        <div ref={mapElement} style={mapContainerStyle}></div>
        {/* Floating div */}
        <div className='vendor_manu_container'>
          <div className='vendor_manu_div'>
            <div className='title_div'>
                <div className="vendor_manu_headerTitleSvgDiv">
                  <svg width={40} fill="#000000" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Beer_Mug_Full" data-name="Beer Mug Full"> <g> <path d="M18.356,9.63h-.97V7.99a2.938,2.938,0,0,0,.5-1.65,1.77,1.77,0,0,0-.01-.23,2.905,2.905,0,0,0-1.64-2.38,2.956,2.956,0,0,0-2.4-.07,3.278,3.278,0,0,0-5.62,0,2.9,2.9,0,0,0-1.68-.17,2.866,2.866,0,0,0-2.16,1.75,2.948,2.948,0,0,0,.3,2.77V19.43a2.5,2.5,0,0,0,2.5,2.5h7.71a2.5,2.5,0,0,0,2.5-2.5v-.99l.91-.36a2.433,2.433,0,0,0,1.54-2.27V11.1A1.481,1.481,0,0,0,18.356,9.63Zm-1.97,9.8a1.5,1.5,0,0,1-1.5,1.5H7.176a1.5,1.5,0,0,1-1.5-1.5V11.34a2.858,2.858,0,0,0,1.93.74c.13,0,.25-.01.37-.02V18.4a.5.5,0,0,0,.5.5.5.5,0,0,0,.5-.5V11.82a.17.17,0,0,0-.01-.07,2.939,2.939,0,0,0,1.57-2.46h4.42a2.86,2.86,0,0,0,1.43-.38Zm-.01-11.77a1.949,1.949,0,0,1-1.42.63h-4.61a.8.8,0,0,0-.79.61,1.231,1.231,0,0,0-.02.2,1.975,1.975,0,0,1-1.05,1.78,1.934,1.934,0,0,1-2.8-1.72,1.808,1.808,0,0,1,.17-.77.6.6,0,0,0-.13-.68,1.939,1.939,0,0,1-.41-2.11,1.868,1.868,0,0,1,1.4-1.13,2.531,2.531,0,0,1,.38-.03,1.909,1.909,0,0,1,.86.2.766.766,0,0,0,.59.06A.8.8,0,0,0,9,4.32a2.273,2.273,0,0,1,4.06,0,.751.751,0,0,0,.44.38.8.8,0,0,0,.59-.05,1.917,1.917,0,0,1,2.79,1.54A1.886,1.886,0,0,1,16.376,7.66Zm2.46,8.15a1.428,1.428,0,0,1-.92,1.34l-.52.22V10.63h.96a.478.478,0,0,1,.48.47Z"></path> <path d="M13.577,18.9a.5.5,0,0,1-.5-.5V11.82a.5.5,0,0,1,1,0V18.4A.5.5,0,0,1,13.577,18.9Z"></path> </g> </g> </g></svg>
                </div>
                <div>
                  <p className='vendor_manu_title'>Invite</p>
                </div>
            </div>
            <div>
              <p className='vendor_manu_instruction'>Choose where to go!</p>
            </div>
            <div className="vendor_list_div">
                {vendors.map((vendor) => (
                  <Vendor_card 
                    key={vendor.id} 
                    id={vendor.id} 
                    selectedCard={selectedCard} 
                    onSelect={handleCardSelect}
                    vendor={vendor}
                    setVendorLocation={setVendorLocation}
                  />
                ))}
            </div>
          </div>

          {userProposal ? (
            <div className='proposal_cancel_button' onClick={handleProposalCancelClick}>
              <p className='proposal_cancel_button_text'>Cancel My proposal</p>
            </div>
          ) : (
            <div className='proposal_button' onClick={handleProposalClick}>
              <p className='proposal_button_text'>propose this place</p>
            </div>
          ) }


        </div>
        {userProposal &&(
          <div className='proposed_card'
          style={{ 
            backgroundColor: users.find(user => user.user_id === userProposal.proposed_by)?.color || '#fff' 
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50" fill="none">
              <path d="M12.084 41.0417C11.1812 41.0417 10.4347 40.7466 9.8444 40.1563C9.25412 39.566 8.95898 38.8195 8.95898 37.9167V12.0834C8.95898 11.1806 9.25412 10.4341 9.8444 9.84379C10.4347 9.25351 11.1812 8.95837 12.084 8.95837H37.9173C38.8201 8.95837 39.5666 9.25351 40.1569 9.84379C40.7472 10.4341 41.0423 11.1806 41.0423 12.0834V37.9167C41.0423 38.8195 40.7472 39.566 40.1569 40.1563C39.5666 40.7466 38.8201 41.0417 37.9173 41.0417H12.084ZM12.084 39.5834H37.9173C38.334 39.5834 38.7159 39.4098 39.0632 39.0625C39.4104 38.7153 39.584 38.3334 39.584 37.9167V12.0834C39.584 11.6667 39.4104 11.2848 39.0632 10.9375C38.7159 10.5903 38.334 10.4167 37.9173 10.4167H12.084C11.6673 10.4167 11.2854 10.5903 10.9382 10.9375C10.5909 11.2848 10.4173 11.6667 10.4173 12.0834V37.9167C10.4173 38.3334 10.5909 38.7153 10.9382 39.0625C11.2854 39.4098 11.6673 39.5834 12.084 39.5834ZM16.5632 34.0625H33.8548L28.5423 26.9792L23.334 33.4375L20.0007 29.5834L16.5632 34.0625Z" fill="black"/>
            </svg>
            <div className='proposal_text_div'>
                <p className='proposal_text'>Proposal from you: {userProposal.vendor.Businessname}</p>
                <p className='proposal_text'>Accepted: {userProposal.number_of_acceptance}/{userProposal.total_members}</p>
            </div>
            <div className='book_button'>
              <p>Book Now</p>
            </div>
          </div>
        )}

        <div className='proposal_invitation'></div>
        <div className='map_user_container'>
          <div className='map_user_profile'>
            {users.map((user) => (
              <MapUserCard key={user.user_id} user={user} />
            ))}
          </div>
          <div className='map_chat'>
            <div className='chat_input_div'>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      sendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="chat_input"
                />
              </div>
              <div className="chat_messages_container">
                {chatMessages.map((msg, index) => {
                  // Find the user who sent the message
                  const sender = users.find((user) => user.user_id === msg.sender.id);
                  const backgroundColor = sender ? sender.color : "#fff"; // Default to white if user not found
                  const formattedTime = new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  console.log(msg.timestamp)

                  return (
                    <div
                      key={index}
                      className="chat_message"
                      style={{ backgroundColor }} // Set the background color dynamically
                    >
                      <div className="chat_messages_svg_div">
                      <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50" fill="none">
                        <path d="M12.9089 36.426C14.6797 35.1521 16.5587 34.1446 18.5458 33.4036C20.533 32.6623 22.6844 32.2917 25 32.2917C27.3156 32.2917 29.467 32.6623 31.4542 33.4036C33.4413 34.1446 35.3203 35.1521 37.0911 36.426C38.4668 35.0024 39.5733 33.3212 40.4104 31.3823C41.2479 29.4431 41.6667 27.3156 41.6667 25C41.6667 20.3819 40.0434 16.4497 36.7969 13.2031C33.5503 9.9566 29.6181 8.33333 25 8.33333C20.3819 8.33333 16.4497 9.9566 13.2031 13.2031C9.9566 16.4497 8.33333 20.3819 8.33333 25C8.33333 27.3156 8.75208 29.4431 9.58958 31.3823C10.4267 33.3212 11.5332 35.0024 12.9089 36.426ZM25.001 26.0417C23.2455 26.0417 21.7648 25.4391 20.5589 24.2339C19.353 23.0286 18.75 21.5483 18.75 19.7927C18.75 18.0372 19.3526 16.5564 20.5578 15.3505C21.763 14.1446 23.2434 13.5417 24.999 13.5417C26.7545 13.5417 28.2352 14.1443 29.4411 15.3495C30.647 16.5547 31.25 18.0351 31.25 19.7906C31.25 21.5462 30.6474 23.0269 29.4422 24.2328C28.237 25.4387 26.7566 26.0417 25.001 26.0417ZM25 43.75C22.3851 43.75 19.9372 43.2632 17.6562 42.2896C15.3753 41.316 13.3908 39.9852 11.7026 38.2974C10.0148 36.6092 8.68403 34.6247 7.71042 32.3438C6.73681 30.0628 6.25 27.6149 6.25 25C6.25 22.3851 6.73681 19.9372 7.71042 17.6562C8.68403 15.3753 10.0148 13.3908 11.7026 11.7026C13.3908 10.0148 15.3753 8.68403 17.6562 7.71042C19.9372 6.7368 22.3851 6.25 25 6.25C27.6149 6.25 30.0628 6.7368 32.3438 7.71042C34.6247 8.68403 36.6092 10.0148 38.2974 11.7026C39.9852 13.3908 41.316 15.3753 42.2896 17.6562C43.2632 19.9372 43.75 22.3851 43.75 25C43.75 27.6149 43.2632 30.0628 42.2896 32.3438C41.316 34.6247 39.9852 36.6092 38.2974 38.2974C36.6092 39.9852 34.6247 41.316 32.3438 42.2896C30.0628 43.2632 27.6149 43.75 25 43.75ZM25 41.6667C26.9205 41.6667 28.8102 41.3307 30.6693 40.6589C32.528 39.9873 34.1344 39.0679 35.4885 37.9005C34.1344 36.8134 32.5679 35.954 30.7891 35.3224C29.0102 34.6908 27.0806 34.375 25 34.375C22.9194 34.375 20.983 34.6842 19.1906 35.3026C17.3986 35.921 15.8389 36.787 14.5115 37.9005C15.8656 39.0679 17.472 39.9873 19.3307 40.6589C21.1898 41.3307 23.0795 41.6667 25 41.6667ZM25 23.9583C26.1698 23.9583 27.1568 23.5564 27.9609 22.7526C28.7648 21.9484 29.1667 20.9615 29.1667 19.7917C29.1667 18.6219 28.7648 17.6349 27.9609 16.8307C27.1568 16.0269 26.1698 15.625 25 15.625C23.8302 15.625 22.8432 16.0269 22.0391 16.8307C21.2352 17.6349 20.8333 18.6219 20.8333 19.7917C20.8333 20.9615 21.2352 21.9484 22.0391 22.7526C22.8432 23.5564 23.8302 23.9583 25 23.9583Z" fill="black"/>
                      </svg>
                        <p className="normal_text">{msg.sender.firstname}</p>
                      </div>
                      <div className="chat_message_div">
                        <p className="chat_message_text">{msg.text}</p>
                        <span className="message_time">{formattedTime}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
          </div>
        </div>
      </div>
    );
}

export default Vendor_map