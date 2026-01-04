import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { projectsAPI } from '../services/api';
import { getMediaUrl } from '../utils/mediaHelpers';
import './Dashboard.css';

function Dashboard() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/admin/login');
            return;
        }
        fetchProjects();
    }, [navigate]);

    const fetchProjects = async () => {
        try {
            const response = await projectsAPI.getAll();
            setProjects(response.data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this project?')) {
            return;
        }

        try {
            await projectsAPI.delete(id);
            setProjects(projects.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Failed to delete project');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/admin/login');
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div className="container">
                    <div className="header-content">
                        <h1>Admin Dashboard</h1>
                        <div className="header-actions">
                            <Link to="/" className="btn btn-outline">
                                View Site
                            </Link>
                            <button onClick={handleLogout} className="btn btn-secondary">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dashboard-content container section">
                <div className="dashboard-toolbar">
                    <h2>Manage Projects</h2>
                    <Link to="/admin/project/new" className="btn btn-primary">
                        + Add New Project
                    </Link>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                ) : projects.length === 0 ? (
                    <div className="empty-state card">
                        <h3>No projects yet</h3>
                        <p>Get started by adding your first project</p>
                        <Link to="/admin/project/new" className="btn btn-primary mt-md">
                            Add Project
                        </Link>
                    </div>
                ) : (
                    <div className="projects-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Location</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.map(project => (
                                    <tr key={project.id}>
                                        <td>
                                            <div className="table-image">
                                                {project.images && project.images[0] ? (
                                                    <img
                                                        src={getMediaUrl(project.images[0])}
                                                        alt={project.title}
                                                    />
                                                ) : (
                                                    <div className="no-image">No Image</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="project-title-cell">{project.title}</td>
                                        <td>{project.category || '-'}</td>
                                        <td>{project.location || '-'}</td>
                                        <td>{project.completionDate || '-'}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <Link
                                                    to={`/admin/project/edit/${project.id}`}
                                                    className="btn-action btn-edit"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(project.id)}
                                                    className="btn-action btn-delete"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
