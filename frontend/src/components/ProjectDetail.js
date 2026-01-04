import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI } from '../services/api';
import { getMediaUrl, isVideo } from '../utils/mediaHelpers';
import './ProjectDetail.css';

function ProjectDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedMedia, setSelectedMedia] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    useEffect(() => {
        fetchProject();
    }, [id]);

    const fetchProject = async () => {
        try {
            const response = await projectsAPI.getOne(id);
            setProject(response.data);
        } catch (error) {
            console.error('Error fetching project:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container" style={{ minHeight: '100vh', paddingTop: '100px' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="error-container">
                <h2>Project not found</h2>
                <button className="btn btn-primary" onClick={() => navigate('/portfolio')}>
                    Back to Portfolio
                </button>
            </div>
        );
    }

    const currentMediaIsVideo = project.images && project.images.length > 0 && isVideo(project.images[selectedMedia]);

    return (
        <div className="project-detail">
            <div className="project-detail-hero">
                <div className="container">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        ← Back
                    </button>

                    <div className="project-detail-header fade-in">
                        {project.category && (
                            <span className="project-category">{project.category}</span>
                        )}
                        <h1>{project.title}</h1>
                        <div className="project-meta">
                            {project.location && <span>📍 {project.location}</span>}
                            {project.completionDate && <span>📅 {project.completionDate}</span>}
                            {project.clientName && <span>👤 {project.clientName}</span>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container section">
                {/* Main Media Gallery */}
                {project.images && project.images.length > 0 && (
                    <div className="image-gallery mb-xl fade-in">
                        <div
                            className="main-image"
                            onClick={() => setLightboxOpen(true)}
                        >
                            {currentMediaIsVideo ? (
                                <>
                                    <video
                                        className="project-video"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <source src={getMediaUrl(project.images[selectedMedia])} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                    <div className="image-overlay">
                                        <span>Click to play fullscreen</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <img
                                        src={getMediaUrl(project.images[selectedMedia])}
                                        alt={`${project.title} - ${selectedMedia + 1}`}
                                    />
                                    <div className="image-overlay">
                                        <span>Click to enlarge</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {project.images.length > 1 && (
                            <div className="image-thumbnails">
                                {project.images.map((media, index) => (
                                    <div
                                        key={index}
                                        className={`thumbnail ${selectedMedia === index ? 'active' : ''}`}
                                        onClick={() => setSelectedMedia(index)}
                                    >
                                        {isVideo(media) ? (
                                            <div className="video-thumbnail">
                                                <video src={getMediaUrl(media)} />
                                                <div className="play-icon">▶</div>
                                            </div>
                                        ) : (
                                            <img
                                                src={getMediaUrl(media)}
                                                alt={`Thumbnail ${index + 1}`}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Project Description */}
                <div className="project-content fade-in">
                    <div className="content-card glass-card">
                        <h2 className="mb-md">Project Details</h2>
                        <p className="project-description">
                            {project.description || 'No description available for this project.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Lightbox - For both images and videos */}
            {lightboxOpen && (
                <div className="lightbox" onClick={() => setLightboxOpen(false)}>
                    <button className="lightbox-close">×</button>

                    {currentMediaIsVideo ? (
                        <video
                            controls
                            autoPlay
                            className="lightbox-video"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <source src={getMediaUrl(project.images[selectedMedia])} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    ) : (
                        <img
                            src={getMediaUrl(project.images[selectedMedia])}
                            alt={project.title}
                            onClick={(e) => e.stopPropagation()}
                        />
                    )}

                    {project.images.length > 1 && (
                        <>
                            <button
                                className="lightbox-nav prev"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedMedia((prev) =>
                                        prev === 0 ? project.images.length - 1 : prev - 1
                                    );
                                }}
                            >
                                ‹
                            </button>
                            <button
                                className="lightbox-nav next"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedMedia((prev) =>
                                        prev === project.images.length - 1 ? 0 : prev + 1
                                    );
                                }}
                            >
                                ›
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default ProjectDetail;
