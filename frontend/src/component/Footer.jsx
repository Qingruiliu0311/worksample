import React from "react";

function Footer() {
    const footers = [
        {
            "Header": "Discover INVITE",
            "Item1": "About us",
            "Item2": "Investors",
        },
        {
            "Header": "Legal",
            "Item1": "Terms and conditions",
            "Item2": "Privacy",
            "Item3": "Cookie"
        },
        {
            "Header": "Help",
            "Item1": "FAQ",
            "Item2": "Contact us",
        }
    ]

    return(
        
        <div className="footerContainer">
            <div>
                <hr class="horizontal-line" />
            </div>
            <div className="footertextsContainer">
                {footers.map((footer)=>{return(
                        <div className="footertexts">
                            <div className="footerHeader">
                                <h3>
                                    {footer.Header}
                                </h3>
                            </div>
                            <div className="footerItem">
                                <p>{footer.Item1}</p>
                            </div>
                            <div className="footerItem">            
                                <p>{footer.Item2}</p>
                            </div>
                            <div className="footerItem">            
                                <p>{footer.Item3}</p>
                            </div>
                        </div>
                )})}
            </div>
        </div>
    )
}

export default Footer;