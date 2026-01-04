import React, { useState } from 'react';
import './Contact.css';

function Contact({ fullPage = false }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5000/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setSubmitted(true);
                setTimeout(() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', phone: '', message: '' });
                }, 3000);
            } else {
                alert(data.error || 'Failed to send message. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to send message. Please try again or contact us directly.');
        }
    };

    return (
        <section className={`contact section ${fullPage ? 'full-page' : ''}`} id="contact">
            <div className="container">
                <div className="section-header text-center mb-xl">
                    <h2 className="fade-in">
                        Get In <span className="text-gradient">Touch</span>
                    </h2>
                    <p className="section-subtitle fade-in">
                        Ready to start your next project? Contact us today for a free consultation
                    </p>
                </div>

                <div className="contact-content grid grid-2">
                    <div className="contact-info fade-in">
                        <h3 className="mb-lg">Contact Information</h3>

                        <div className="info-item mb-lg">
                            <div className="info-icon">📍</div>
                            <div>
                                <h4>Address</h4>
                                <p>557/19 Om Nagar Jhande Wale Shukla<br />Alambagh, Lucknow<br />Uttar Pradesh, India - 226005</p>
                            </div>
                        </div>

                        <div className="info-item mb-lg">
                            <div className="info-icon">📞</div>
                            <div>
                                <h4>Phone</h4>
                                <p>+91 9415004108<br />+91 9793511008</p>
                            </div>
                        </div>

                        <div className="info-item mb-lg">
                            <div className="info-icon">✉️</div>
                            <div>
                                <h4>Email</h4>
                                <p>p4solution@gmail.com</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <div className="info-icon">🕐</div>
                            <div>
                                <h4>Business Hours</h4>
                                <p>Monday - Friday: 8:00 AM - 6:00 PM<br />Saturday: 9:00 AM - 4:00 PM</p>
                            </div>
                        </div>

                        <div className="social-links mt-xl">
                            <h4 className="mb-md">Follow Us</h4>
                            <div className="social-icons">
                                <a href="#" className="social-icon">FB</a>
                                <a href="#" className="social-icon">IG</a>
                                <a href="#" className="social-icon">LI</a>
                                <a href="#" className="social-icon">TW</a>
                            </div>
                        </div>
                    </div>

                    <div className="contact-form-wrapper fade-in">
                        <form className="contact-form glass-card" onSubmit={handleSubmit}>
                            {submitted && (
                                <div className="success-message">
                                    ✓ Thank you! We'll get back to you soon.
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-input"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    className="form-input"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Message *</label>
                                <textarea
                                    name="message"
                                    className="form-textarea"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                ></textarea>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Contact;
