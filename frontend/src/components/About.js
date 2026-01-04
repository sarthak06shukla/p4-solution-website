import React from 'react';
import './About.css';

function About({ fullPage = false }) {
    return (
        <section className={`about section ${fullPage ? 'full-page' : ''}`} id="about">
            <div className="container">
                <div className="section-header text-center mb-xl">
                    <h2 className="fade-in">
                        About <span className="text-gradient">Us</span>
                    </h2>
                    <p className="section-subtitle fade-in">
                        Excellence in construction, delivered with passion and precision
                    </p>
                </div>

                <div className="about-content grid grid-2 mb-xl">
                    <div className="about-text fade-in">
                        <h3 className="mb-md">Established Excellence Since 2006</h3>
                        <p className="mb-md">
                            P4 Solution was established in 2006 under the ownership of Mr. Shailendra Shukla,
                            who brings over 15 years of exhaustive experience in the civil construction industry.
                            Starting his journey in 1993 as a lead field operator, he has built a legacy of quality
                            and reliability in construction.
                        </p>
                        <p className="mb-md">
                            With our operations spread across multiple locations in Uttar Pradesh, we bring an
                            assortment of professional services in the fields of civil, electrical, and telecom.
                            We ensure that our clients benefit from our comprehensive solutions.
                        </p>
                        <p>
                            The company has an annual turnover of Rs. 35 lac and has worked with leading telecom
                            and real estate companies such as Airtel, Vodafone, Idea, Tata Indicom, Infratel,
                            Ansal API, and Reliance Jio. We have rich experience in construction with both
                            private and public sectors.
                        </p>
                    </div>

                    <div className="about-image fade-in">
                        <div className="image-wrapper glass-card">
                            <div className="placeholder-about-image">
                                <span>Building Excellence</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="services mb-xl">
                    <h3 className="text-center mb-lg">Our Services</h3>
                    <div className="grid grid-3">
                        <div className="service-card card fade-in">
                            <div className="service-icon">🏗️</div>
                            <h4>Civil Construction</h4>
                            <p>Construction of sewer systems, pitch roads, interlocking tiles, RCC walls, and CC roads.</p>
                        </div>
                        <div className="service-card card fade-in">
                            <div className="service-icon">🏢</div>
                            <h4>Residential & Commercial Buildings</h4>
                            <p>Construction of residential and commercial buildings for both public and private sectors.</p>
                        </div>
                        <div className="service-card card fade-in">
                            <div className="service-icon">📡</div>
                            <h4>Telecom Infrastructure</h4>
                            <p>Initial telecom ground base towers, tower fencing, BTS pads, and MSC sites installation.</p>
                        </div>
                        <div className="service-card card fade-in">
                            <div className="service-icon">💧</div>
                            <h4>Drainage Systems</h4>
                            <p>Open and underground drainage systems with modern engineering solutions.</p>
                        </div>
                        <div className="service-card card fade-in">
                            <div className="service-icon">⚡</div>
                            <h4>Electrical Services</h4>
                            <p>Comprehensive electrical solutions for residential and commercial projects.</p>
                        </div>
                        <div className="service-card card fade-in">
                            <div className="service-icon">🏗️</div>
                            <h4>Real Estate Development</h4>
                            <p>Complete real estate development and infrastructure solutions.</p>
                        </div>
                    </div>
                </div>

                <div className="vision-mission mb-xl">
                    <div className="grid grid-2">
                        <div className="vm-card glass-card fade-in">
                            <h3>Our Vision</h3>
                            <p className="vision-text">"Building Excellence"</p>
                            <p>
                                To become a national player by delivering quality, ensuring on-time completion
                                of projects, employee satisfaction with experience, excellence, and high caliber work.
                            </p>
                        </div>
                        <div className="vm-card glass-card fade-in">
                            <h3>Our Mission</h3>
                            <p>
                                To safely and profitably serve our clients by providing appropriate and desired
                                solutions to keep the highest level of satisfaction among the clients.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="values">
                    <h3 className="text-center mb-lg">Our Core Beliefs</h3>
                    <div className="grid grid-2">
                        <div className="value-item glass-card fade-in">
                            <h4>Coordination & Support</h4>
                            <p>
                                We coordinate and support mega projects apart from undertaking civil engineering
                                projects and executing them independently.
                            </p>
                        </div>
                        <div className="value-item glass-card fade-in">
                            <h4>Client Partnership</h4>
                            <p>
                                We work hand in hand with clients to meet their requirements at all times, increasing
                                productivity and optimizing overall cost of production.
                            </p>
                        </div>
                        <div className="value-item glass-card fade-in">
                            <h4>Quality & Safety</h4>
                            <p>
                                We employ the best workforce with industry-specific domain knowledge to execute
                                projects on schedule without compromising on quality and safety.
                            </p>
                        </div>
                        <div className="value-item glass-card fade-in">
                            <h4>Sustainable Growth</h4>
                            <p>
                                We constantly strive to reach greater heights through sustainable progressive
                                growth and customer satisfaction.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="leadership mt-xl">
                    <h3 className="text-center mb-lg">Our Leadership</h3>
                    <div className="grid grid-2">
                        <div className="leader-card glass-card fade-in">
                            <h4>Mr. Shailendra Shukla</h4>
                            <p className="leader-title">Founder & Senior Partner</p>
                            <p>
                                Holds a degree in arts and communication with over 15 years of experience. He brings
                                the perfect blend of financial and human resource management. Previously senior partner
                                at Prabha Enterprises, Poornima Constructions, and Prayas Infrastructure.
                            </p>
                        </div>
                        <div className="leader-card glass-card fade-in">
                            <h4>Ms. Manju Shukla</h4>
                            <p className="leader-title">Partner</p>
                            <p>
                                Holds a master's degree in arts and library science with over 5 years of experience
                                in civil construction work, contributing valuable expertise to project management
                                and operations.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default About;
