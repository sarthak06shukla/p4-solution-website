import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectsAPI } from '../services/api';
import { getMediaUrl, isVideo } from '../utils/mediaHelpers';
import './Portfolio.css';

function Portfolio({ fullPage = false }) {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [categories, setCategories] = useState(['all']);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await projectsAPI.getAll();
            setProjects(response.data);

            // Extract unique categories
            const uniqueCategories = ['all', ...new Set(
                response.data.map(p => p.category).filter(Boolean)
            )];
            setCategories(uniqueCategories);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProjects = filter === 'all'
        ? projects
        : projects.filter(p => p.category === filter);

    // Limit to 4 projects on homepage, show all on portfolio page
    const displayedProjects = fullPage ? filteredProjects : filteredProjects.slice(0, 4);

    return (
        <section className={`portfolio section ${fullPage ? 'full-page' : ''}`} id="portfolio">
            <div className="wide-container">
                <div className="section-header text-center mb-xl">
                    <h2 className="fade-in">
                        Our <span className="text-gradient">Portfolio</span>
                    </h2>
                    <p className="section-subtitle fade-in">
                        Explore our collection of exceptional projects that showcase our commitment to quality and innovation
                    </p>
                </div>

                {/* Category Filter */}
                <div className="portfolio-filter mb-lg">
                    {categories.map(category => (
                        <button
                            key={category}
                            className={`filter-btn ${filter === category ? 'active' : ''}`}
                            onClick={() => setFilter(category)}
                        >
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                ) : displayedProjects.length === 0 ? (
                    <div className="empty-state">
                        <p>No projects to display yet. Check back soon!</p>
                    </div>
                ) : (
                    <>
                        <div className="portfolio-grid grid grid-3">
                            {displayedProjects.map((project, index) => (
                                <Link
                                    to={`/project/${project.id}`}
                                    key={project.id}
                                    className="project-card"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="project-image">
                                        {project.images && project.images[0] ? (
                                            isVideo(project.images[0]) ? (
                                                <div className="video-thumbnail-wrapper">
                                                    <video
                                                        src={getMediaUrl(project.images[0])}
                                                        className="video-thumbnail"
                                                    />
                                                    <div className="video-play-overlay">
                                                        <div className="play-button">▶</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <img
                                                    src={getMediaUrl(project.images[0])}
                                                    alt={project.title}
                                                />
                                            )
                                        ) : (
                                            <div className="placeholder-image">
                                                <span>No Image</span>
                                            </div>
                                        )}
                                        <div className="project-overlay">
                                            <span className="view-project">View Project →</span>
                                        </div>
                                    </div>
                                    <div className="project-info">
                                        {project.category && (
                                            <span className="project-category">{project.category}</span>
                                        )}
                                        <h3 className="project-title">{project.title}</h3>
                                        {project.location && (
                                            <p className="project-location">📍 {project.location}</p>
                                        )}
                                        <p className="project-description">
                                            {project.description?.substring(0, 100) || 'View project details'}
                                            {project.description?.length > 100 && '...'}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* View All Button - Only show on homepage when there are more than 4 projects */}
                        {!fullPage && filteredProjects.length > 4 && (
                            <div className="view-all-container">
                                <Link to="/portfolio" className="btn btn-primary btn-lg">
                                    View All Projects →
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}

export default Portfolio;
