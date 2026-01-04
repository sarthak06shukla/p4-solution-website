import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { projectsAPI } from '../services/api';
import { getMediaUrl } from '../utils/mediaHelpers';
import './ProjectForm.css';

function ProjectForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        location: '',
        completionDate: '',
        clientName: ''
    });
    const [images, setImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Check authentication
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/admin/login');
            return;
        }

        if (isEdit) {
            fetchProject();
        }
    }, [id, isEdit, navigate]);

    const fetchProject = async () => {
        try {
            const response = await projectsAPI.getOne(id);
            const project = response.data;
            setFormData({
                title: project.title || '',
                description: project.description || '',
                category: project.category || '',
                location: project.location || '',
                completionDate: project.completionDate || '',
                clientName: project.clientName || ''
            });
            setExistingImages(project.images || []);
        } catch (error) {
            console.error('Error fetching project:', error);
            setError('Failed to load project');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(files);
    };

    const handleRemoveExistingImage = (index) => {
        setExistingImages(existingImages.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('location', formData.location);
            formDataToSend.append('completionDate', formData.completionDate);
            formDataToSend.append('clientName', formData.clientName);

            if (isEdit) {
                formDataToSend.append('existingImages', JSON.stringify(existingImages));
            }

            images.forEach(image => {
                formDataToSend.append('images', image);
            });

            if (isEdit) {
                await projectsAPI.update(id, formDataToSend);
            } else {
                await projectsAPI.create(formDataToSend);
            }

            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save project');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="project-form-page">
            <div className="project-form-header">
                <div className="container">
                    <button onClick={() => navigate('/admin/dashboard')} className="back-btn">
                        ← Back to Dashboard
                    </button>
                    <h1>{isEdit ? 'Edit Project' : 'Add New Project'}</h1>
                </div>
            </div>

            <div className="container section">
                <div className="form-container">
                    {error && (
                        <div className="error-alert">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="project-form card">
                        <div className="form-group">
                            <label className="form-label">Project Title *</label>
                            <input
                                type="text"
                                name="title"
                                className="form-input"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <input
                                    type="text"
                                    name="category"
                                    className="form-input"
                                    placeholder="e.g., Residential, Commercial"
                                    value={formData.category}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    className="form-input"
                                    placeholder="e.g., New York, NY"
                                    value={formData.location}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Completion Date</label>
                                <input
                                    type="text"
                                    name="completionDate"
                                    className="form-input"
                                    placeholder="e.g., December 2023"
                                    value={formData.completionDate}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Client Name</label>
                                <input
                                    type="text"
                                    name="clientName"
                                    className="form-input"
                                    value={formData.clientName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                name="description"
                                className="form-textarea"
                                rows="6"
                                placeholder="Describe the project in detail..."
                                value={formData.description}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Project Images</label>

                            {existingImages.length > 0 && (
                                <div className="existing-images mb-md">
                                    <p className="image-label">Current Images:</p>
                                    <div className="image-preview-grid">
                                        {existingImages.map((img, index) => (
                                            <div key={index} className="image-preview">
                                                <img src={getMediaUrl(img)} alt={`Existing ${index + 1}`} />
                                                <button
                                                    type="button"
                                                    className="remove-image-btn"
                                                    onClick={() => handleRemoveExistingImage(index)}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <input
                                type="file"
                                className="form-input"
                                accept="image/*,video/*"
                                multiple
                                onChange={handleImageChange}
                            />
                            <p className="form-help">Select images (JPG, PNG, WebP) or videos (MP4, MOV, WebM). Max 100MB each.</p>

                            {images.length > 0 && (
                                <div className="new-images mt-md">
                                    <p className="image-label">New Images ({images.length}):</p>
                                    <div className="file-list">
                                        {images.map((file, index) => (
                                            <div key={index} className="file-item">
                                                📷 {file.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => navigate('/admin/dashboard')}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : (isEdit ? 'Update Project' : 'Create Project')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ProjectForm;
