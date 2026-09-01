-- PostgreSQL Database Schema for P4 Solution Website
-- Run this after creating PostgreSQL database on Render

-- Create P4 projects table
CREATE TABLE IF NOT EXISTS p4_projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    location VARCHAR(255),
    completiondate VARCHAR(100),
    clientname VARCHAR(255),
    images TEXT,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on category for faster filtering
CREATE INDEX IF NOT EXISTS idx_p4_projects_category ON p4_projects(category);

-- Create index on createdAt for sorting
CREATE INDEX IF NOT EXISTS idx_p4_projects_created ON p4_projects(createdat DESC);
