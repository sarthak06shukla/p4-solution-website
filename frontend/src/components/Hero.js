import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

function Hero() {
    return (
        <section className="hero">
            <div className="hero-overlay"></div>
            <div className="hero-content container">
                <div className="hero-text fade-in">
                    <h1 className="hero-title">
                        Building Dreams
                        <span className="text-gradient"> Into Reality</span>
                    </h1>
                    <p className="hero-subtitle">
                        Professional construction services with unmatched quality and craftsmanship.
                        Transforming spaces, exceeding expectations.
                    </p>
                    <div className="hero-buttons">
                        <Link to="/portfolio" className="btn btn-primary">
                            View Our Work
                        </Link>
                        <Link to="/contact" className="btn btn-outline">
                            Get Started
                        </Link>
                    </div>
                </div>

                <div className="hero-stats">
                    <div className="stat-card glass-card">
                        <div className="stat-number">250+</div>
                        <div className="stat-label">Projects Completed</div>
                    </div>
                    <div className="stat-card glass-card">
                        <div className="stat-number">30+</div>
                        <div className="stat-label">Years Experience</div>
                    </div>
                    <div className="stat-card glass-card">
                        <div className="stat-number">100%</div>
                        <div className="stat-label">Client Satisfaction</div>
                    </div>
                </div>
            </div>

            <div className="scroll-indicator">
                <div className="scroll-arrow"></div>
            </div>
        </section>
    );
}

export default Hero;
