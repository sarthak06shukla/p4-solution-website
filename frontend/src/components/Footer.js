import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content container">
                <div className="footer-grid">
                    <div className="footer-section">
                        <div className="footer-logo">
                            <span className="logo-text">P4</span>
                            <span className="logo-subtext">Solution</span>
                        </div>
                        <p className="footer-description">
                            Excellence in civil construction since 2006. Professional services across
                            Uttar Pradesh in civil, electrical, and telecom infrastructure.
                        </p>
                    </div>

                    <div className="footer-section">
                        <h4>Quick Links</h4>
                        <ul className="footer-links">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/portfolio">Portfolio</Link></li>
                            <li><Link to="/about">About</Link></li>
                            <li><Link to="/contact">Contact</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>Services</h4>
                        <ul className="footer-links">
                            <li>Civil Construction</li>
                            <li>Telecom Infrastructure</li>
                            <li>Drainage Systems</li>
                            <li>Real Estate Development</li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>Contact</h4>
                        <ul className="footer-contact">
                            <li>📍 557/19 Om Nagar, Alambagh, Lucknow, UP - 226005</li>
                            <li>📞 +91 9415004108 / +91 9793511008</li>
                            <li>✉️ p4solution@gmail.com</li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} P4 Solution. All rights reserved.</p>
                    <div className="footer-social">
                        <a href="#" aria-label="Facebook">FB</a>
                        <a href="#" aria-label="Instagram">IG</a>
                        <a href="#" aria-label="LinkedIn">LI</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
