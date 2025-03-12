import React, { useState, useEffect } from 'react';
import Product_card from './Product_card';
import apiClient from '../apiClient';
import axios from 'axios';

function Vendor_card({ id, selectedCard, onSelect, vendor, setVendorLocation }){
    const [vendorReview, setVendorsReview] = useState(null);
    const [vendorProduct, setVendorProduct] = useState([]);


    const fetchVendorPosition = async () => {
        const apiKey = "3MgO4GTFjnXGYfS00uPDcO8o0VYjMsdF";
        const place = vendor.Businessname;
        const country = "GB"; // Country code for the UK
    
        try {
          const response = await axios.get(
            `https://api.tomtom.com/search/2/search/${encodeURIComponent(place)}.json`, {
              params: {
                key: apiKey,
                limit: 1,                 // Limit the number of results
                countrySet: country,      // Filter results by country
                typeahead: true,          // Enable typeahead for better suggestions
                language: 'en-US',        // Language preference
                streetNumber: vendor.Businessaddress,     // Include street number for accuracy (if applicable)
              }
            }
          );
          console.log("Novella location is ", response.data.results[0].position); // Extract results
          return response.data.results[0].position
        } catch (error) {
          console.error('Error fetching data:', error); // Handle errors
        }
      };
    
      const handleClick = async () => {
        // Toggle selection
        onSelect(isSelected ? null : id);
      
        // Fetch data only if the item is being selected (not deselected)
        if (!isSelected) {
          const position = await fetchVendorPosition(); // Await the result
          console.log("vendor location before setting to state is ", position)
          setVendorLocation(position); // Set the resolved position
        } else {
          setVendorLocation(null); // Clear vendorLocation when deselected
        }
      };

    const isSelected = selectedCard === id;
    useEffect(() => {
        // Fetch vendor data from the backend
        const fetchVendor_reviews = async () => {
          try {
            const response = await apiClient.get(`http://localhost:8000/${vendor.id}/reviews/`);
            const data = await response.data;
            setVendorsReview(data[0].average_rating);
          } catch (error) {
            console.error('Error fetching vendors:', error);
          }
        };

        const fetchVendor_product = async () => {
            try {
            const response = await apiClient.get(`http://localhost:8000/${vendor.id}/product/`);
            setVendorProduct(response.data)
        } catch (error) {
            console.error('Error fetching vendor product:', error);
        }
        }

            
        fetchVendor_product();
        fetchVendor_reviews();
      }, []);

    return (
        <div>
            <div 
                className="vendor_card" 
                onClick={handleClick} // Toggle selection
                style={{ cursor: 'pointer' }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" fill="none">
                    <path d="M24.166 82.0834C22.3605 82.0834 20.8674 81.4931 19.6868 80.3126C18.5063 79.132 17.916 77.639 17.916 75.8334V24.1667C17.916 22.3612 18.5063 20.8681 19.6868 19.6876C20.8674 18.507 22.3605 17.9167 24.166 17.9167H75.8327C77.6382 17.9167 79.1313 18.507 80.3119 19.6876C81.4924 20.8681 82.0827 22.3612 82.0827 24.1667V75.8334C82.0827 77.639 81.4924 79.132 80.3119 80.3126C79.1313 81.4931 77.6382 82.0834 75.8327 82.0834H24.166ZM24.166 79.1668H75.8327C76.666 79.1668 77.4299 78.8195 78.1244 78.1251C78.8188 77.4306 79.166 76.6668 79.166 75.8334V24.1667C79.166 23.3334 78.8188 22.5695 78.1244 21.8751C77.4299 21.1806 76.666 20.8334 75.8327 20.8334H24.166C23.3327 20.8334 22.5688 21.1806 21.8743 21.8751C21.1799 22.5695 20.8327 23.3334 20.8327 24.1667V75.8334C20.8327 76.6668 21.1799 77.4306 21.8743 78.1251C22.5688 78.8195 23.3327 79.1668 24.166 79.1668ZM33.1243 68.1251H67.7077L57.0827 53.9584L46.666 66.8751L39.9993 59.1668L33.1243 68.1251Z" fill="black" />
                </svg>
                <div className="vendor_card_text">
                    <p className="vendor_texts">{vendor.Businessname}</p>
                    <p className="vendor_texts">Fish and Chips</p>
                </div>
                <div className="review_score_div">
                    <img src="./src/assets/icons8-star-48.png" alt="Star" />
                    <p className="vendor_texts">{vendorReview || "5.0"}/5.0</p>
                </div>
            </div>
            {isSelected && (
                    <div className="vendor_card_details_div">
                        {vendorProduct.map((product) => (
                            < Product_card 
                            key={product.id} 
                            id={product.id} 
                            product={product}
                            />
                        ))}
                    </div>
                )}
        </div>
    )
}

export default Vendor_card