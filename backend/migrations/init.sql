-- PostgreSQL Database Schema for P4 Solution Website
-- Run this after creating PostgreSQL database on Render

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    location VARCHAR(255),
    "completionDate" VARCHAR(100),
    "clientName" VARCHAR(255),
    images TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on category for faster filtering
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);

-- Create index on createdAt for sorting
CREATE INDEX IF NOT EXISTS idx_projects_created ON projects("createdAt" DESC);
