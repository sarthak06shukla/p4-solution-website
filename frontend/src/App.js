import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Portfolio from './components/Portfolio';
import ProjectDetail from './components/ProjectDetail';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Login from './admin/Login';
import Dashboard from './admin/Dashboard';
import ProjectForm from './admin/ProjectForm';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={
                        <>
                            <Navbar />
                            <Hero />
                            <Portfolio />
                            <About />
                            <Contact />
                            <Footer />
                        </>
                    } />

                    <Route path="/portfolio" element={
                        <>
                            <Navbar />
                            <Portfolio fullPage />
                            <Footer />
                        </>
                    } />

                    <Route path="/project/:id" element={
                        <>
                            <Navbar />
                            <ProjectDetail />
                            <Footer />
                        </>
                    } />

                    <Route path="/about" element={
                        <>
                            <Navbar />
                            <About fullPage />
                            <Footer />
                        </>
                    } />

                    <Route path="/contact" element={
                        <>
                            <Navbar />
                            <Contact fullPage />
                            <Footer />
                        </>
                    } />

                    {/* Admin Routes */}
                    <Route path="/admin/login" element={<Login />} />
                    <Route path="/admin/dashboard" element={<Dashboard />} />
                    <Route path="/admin/project/new" element={<ProjectForm />} />
                    <Route path="/admin/project/edit/:id" element={<ProjectForm />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
