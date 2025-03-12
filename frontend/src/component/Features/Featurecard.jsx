import React from "react";
import ReactDOM from "react-dom/client";
import { useNavigate } from "react-router-dom";

function Featurecard () {
    const Navigate = useNavigate();

    const cards = [
        {
            "name":"Partner",
            "text":"Partner with us",
            "src": "./src/assets/partner.webp",
            "path": "/partner"
        },
        {
            "name":"Like",
            "text":"See what people like",
            "src": "./src/assets/Heart.webp",
            "path": "/forum"
        },
        {
            "name":"Game",
            "text":"Social game time!",
            "src": "./src/assets/game.webp",
            "path": "/game"
        },
    ]

    
    return (
        cards.map(card=>{
            return(
                <div className="featureCard" onClick={()=>{Navigate(card.path)}}>
                    <div className="featureBackground">
                        <img height={237} width={323} src="./src/assets/box_for_feature.webp" />
                        <div className="featureText">
                            <p>{card.text}</p>
                        </div>
                    </div>
                    <div className="featureImage">
                        <img height={130} src={card.src} />
                    </div>
                </div>
                )
        })
    )
}

export default Featurecard;