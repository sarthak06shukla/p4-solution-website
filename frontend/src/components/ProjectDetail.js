import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI } from '../services/api';
import { getMediaUrl, getValidMedia, getVideoPosterUrl, isVideo } from '../utils/mediaHelpers';
import './ProjectDetail.css';

function ProjectDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedMedia, setSelectedMedia] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    const fetchProject = useCallback(async () => {
        try {
            const response = await projectsAPI.getOne(id);
            setProject(response.data);
        } catch (error) {
            console.error('Error fetching project:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchProject();
    }, [fetchProject]);

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

    const media = getValidMedia(project.images);
    const activeMedia = media[selectedMedia] || media[0];
    const activeMediaUrl = getMediaUrl(activeMedia);
    const currentMediaIsVideo = isVideo(activeMedia);
    const activeVideoPosterUrl = currentMediaIsVideo ? getVideoPosterUrl(activeMedia) : '';

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
                {media.length > 0 && (
                    <div className="image-gallery mb-xl fade-in">
                        <div
                            className="main-image"
                            onClick={() => setLightboxOpen(true)}
                        >
                            {currentMediaIsVideo ? (
                                <>
                                    <video
                                        className="project-video"
                                        poster={activeVideoPosterUrl || undefined}
                                        preload="metadata"
                                        muted
                                        playsInline
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <source src={activeMediaUrl} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                    <div className="image-overlay">
                                        <span>Click to play fullscreen</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <img
                                        src={activeMediaUrl}
                                        alt={`${project.title} - ${selectedMedia + 1}`}
                                    />
                                    <div className="image-overlay">
                                        <span>Click to enlarge</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {media.length > 1 && (
                            <div className="image-thumbnails">
                                {media.map((mediaItem, index) => {
                                    const mediaUrl = getMediaUrl(mediaItem);
                                    const posterUrl = isVideo(mediaItem) ? getVideoPosterUrl(mediaItem) : '';

                                    return (
                                    <div
                                        key={index}
                                        className={`thumbnail ${selectedMedia === index ? 'active' : ''}`}
                                        onClick={() => setSelectedMedia(index)}
                                    >
                                        {isVideo(mediaItem) ? (
                                            <div className="video-thumbnail">
                                                {posterUrl ? (
                                                    <img
                                                        src={posterUrl}
                                                        alt={`Video thumbnail ${index + 1}`}
                                                    />
                                                ) : (
                                                    <video
                                                        src={mediaUrl}
                                                        preload="metadata"
                                                        muted
                                                        playsInline
                                                    />
                                                )}
                                                <div className="play-icon">▶</div>
                                            </div>
                                        ) : (
                                            <img
                                                src={mediaUrl}
                                                alt={`Thumbnail ${index + 1}`}
                                            />
                                        )}
                                    </div>
                                    );
                                })}
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
                            poster={activeVideoPosterUrl || undefined}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <source src={activeMediaUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    ) : (
                        <img
                            src={activeMediaUrl}
                            alt={project.title}
                            onClick={(e) => e.stopPropagation()}
                        />
                    )}

                    {media.length > 1 && (
                        <>
                            <button
                                className="lightbox-nav prev"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedMedia((prev) =>
                                        prev === 0 ? media.length - 1 : prev - 1
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
                                        prev === media.length - 1 ? 0 : prev + 1
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
