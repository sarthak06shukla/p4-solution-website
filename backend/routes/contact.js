const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

const escapeHtml = (value = '') => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

// POST contact form submission
router.post('/', async (req, res) => {
    const { name, email, phone, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    try {
        // Check if email credentials are configured
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.error('Email credentials not configured in environment variables');
            return res.status(503).json({
                error: 'Email service is not configured. Please call or email us directly.'
            });
        }

        // Create transporter using Gmail
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            connectionTimeout: 15000,
            greetingTimeout: 10000,
            socketTimeout: 20000,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const toEmail = process.env.EMAIL_TO || process.env.EMAIL_USER;
        const safeName = escapeHtml(name);
        const safeEmail = escapeHtml(email);
        const safePhone = escapeHtml(phone || 'Not provided');
        const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');
        const subjectName = String(name).replace(/[\r\n]/g, ' ').trim();

        // Email content
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: toEmail,
            replyTo: email,
            subject: `New Contact Form Submission from ${subjectName}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${safeName}</p>
                <p><strong>Email:</strong> ${safeEmail}</p>
                <p><strong>Phone:</strong> ${safePhone}</p>
                <p><strong>Message:</strong></p>
                <p>${safeMessage}</p>
                <hr>
                <p><em>This message was sent from the P4 Solution contact form</em></p>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: 'Thank you! Your message has been sent successfully.'
        });

    } catch (error) {
        console.error('Error sending email:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            command: error.command
        });

        res.status(502).json({
            error: 'Message could not be sent right now. Please call or email us directly.',
            detail: process.env.NODE_ENV === 'production' ? undefined : error.message
        });
    }
});

module.exports = router;
