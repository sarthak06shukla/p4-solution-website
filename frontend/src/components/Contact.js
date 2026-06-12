import React, { useState } from 'react';
import { contactAPI } from '../services/api';
import './Contact.css';

function Contact({ fullPage = false }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [sending, setSending] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitted(false);
        setStatusMessage('');
        setErrorMessage('');
        setSending(true);

        try {
            const response = await contactAPI.send(formData);

            setSubmitted(true);
            setStatusMessage(response.data?.message || "Thank you! We'll get back to you soon.");
            setFormData({ name: '', email: '', phone: '', message: '' });

            setTimeout(() => {
                setSubmitted(false);
                setStatusMessage('');
            }, 5000);
        } catch (error) {
            console.error('Error:', error);
            setErrorMessage(
                error.response?.data?.error ||
                'Failed to send message. Please try again or contact us directly.'
            );
        } finally {
            setSending(false);
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
                            <div className="info-icon">&#128205;</div>
                            <div>
                                <h4>Address</h4>
                                <p>557/19 Om Nagar Jhande Wale Shukla<br />Alambagh, Lucknow<br />Uttar Pradesh, India - 226005</p>
                            </div>
                        </div>

                        <div className="info-item mb-lg">
                            <div className="info-icon">&#128222;</div>
                            <div>
                                <h4>Phone</h4>
                                <p>+91 9415004108<br />+91 9793511008</p>
                            </div>
                        </div>

                        <div className="info-item mb-lg">
                            <div className="info-icon">&#9993;</div>
                            <div>
                                <h4>Email</h4>
                                <p>p4solution@gmail.com</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <div className="info-icon">&#128336;</div>
                            <div>
                                <h4>Business Hours</h4>
                                <p>Monday - Friday: 8:00 AM - 6:00 PM<br />Saturday: 9:00 AM - 4:00 PM</p>
                            </div>
                        </div>

                        <div className="social-links mt-xl">
                            <h4 className="mb-md">Follow Us</h4>
                            <div className="social-icons">
                                <button type="button" className="social-icon">FB</button>
                                <button type="button" className="social-icon">IG</button>
                                <button type="button" className="social-icon">LI</button>
                                <button type="button" className="social-icon">TW</button>
                            </div>
                        </div>
                    </div>

                    <div className="contact-form-wrapper fade-in">
                        <form className="contact-form glass-card" onSubmit={handleSubmit}>
                            {submitted && (
                                <div className="success-message">
                                    {statusMessage}
                                </div>
                            )}

                            {errorMessage && (
                                <div className="error-message">
                                    {errorMessage}
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="contact-name" className="form-label">Name *</label>
                                <input
                                    type="text"
                                    id="contact-name"
                                    name="name"
                                    className="form-input"
                                    placeholder="Your full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="contact-email" className="form-label">Email *</label>
                                <input
                                    type="email"
                                    id="contact-email"
                                    name="email"
                                    className="form-input"
                                    placeholder="your.email@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="contact-phone" className="form-label">Phone</label>
                                <input
                                    type="tel"
                                    id="contact-phone"
                                    name="phone"
                                    className="form-input"
                                    placeholder="+91 XXXXXXXXXX"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="contact-message" className="form-label">Message *</label>
                                <textarea
                                    id="contact-message"
                                    name="message"
                                    className="form-textarea"
                                    placeholder="Tell us about your project..."
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%' }}
                                disabled={sending}
                            >
                                {sending ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Contact;
