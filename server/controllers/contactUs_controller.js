const express = require("express");
const app = express();
app.use(express.json());
const nodemailer = require('nodemailer');
var cors = require('cors');
app.use(cors());
const db = require("../Models/config/db");


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAILNODEMAILER,
        pass: process.env.PASSWORDNODEMAILER,
    },
    tls: {
        rejectUnauthorized: false
    }
});
const sendMessageEmail = async (fullname, email, message, subject) => {
    const mailOptions = {
        from: email, // Set the "from" email address to the user's email
        to: 'ecovoyagetravelling@gmail.com',
        subject: subject,
        html: `<p><strong>fullname:</strong> ${fullname}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong> ${message}</p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
};




const saveContactToDatabase = async (fullname, email, message, subject) => {
    try {
        const result = await db.query(
            'INSERT INTO contact_us (fullname, email, message, subject) VALUES ($1, $2, $3, $4)',
            [fullname, email, message, subject]
        );
        // console.log('Contact saved to database:', result);
    } catch (error) {
        console.error('Error saving contact to database:', error);
    }
};

const sendEmailContact = async (req, res) => {
    try {
        const fullname = req.body.fullname;
        const email = req.body.email;
        const message = req.body.message;
        const subject = req.body.subject;

        // Send contact email to your email address
        await sendMessageEmail(fullname, email, message, subject);

        // Save contact details to the database
        await saveContactToDatabase(fullname, email, message, subject);

        // Send thank-you email to the user
        const thankYouMailOptions = {
            from: 'ecovoyagetravelling@gmail.com',
            to: email, // Use the user's email address
            subject: 'Thank You for Contacting Us',
            html: `<p>Dear ${fullname},</p><p>Thank you for contacting us! We appreciate your message.</p>`,
        };
        await transporter.sendMail(thankYouMailOptions);

        // Send success response
        res.status(200).json({ message: 'Email has been sent and contact details saved. Thank you email sent.' });
    } catch (error) {
        console.error('Error sending email or saving contact:', error);
        res.status(500).json({ error: 'An error occurred while processing the form.' });
    }
};

const getContact = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM contact_us WHERE is_shown = true');

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Contact not found or already deleted.' });
        }
        const contactDetails = result.rows;
        res.status(200).json(contactDetails);
    } catch (error) {
        console.error('Error fetching contact details:', error);
        res.status(500).json({ error: 'An error occurred while fetching contact details.' });
    }
};

const getAllContact = async (req, res) => {
    try {
        const result = await db.query(
            "SELECT * FROM contact_us WHERE is_deleted = false"
        );

        if (result.rows.length === 0) {
            return res
                .status(404)
                .json({ error: "Contact not found or already deleted." });
        }
        const contactDetails = result.rows;
        res.status(200).json(contactDetails);
    } catch (error) {
        console.error("Error fetching contact details:", error);
        res
            .status(500)
            .json({ error: "An error occurred while fetching contact details." });
    }
};

const getContactById = async (req, res) => {
    try {
        const contactId = req.params.id;

        const result = await db.query('SELECT * FROM contact_us WHERE contact_id = $1 AND is_shown = true', [contactId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Contact not found or already deleted.' });
        }
        const contactDetails = result.rows;
        res.status(200).json(contactDetails);
    } catch (error) {
        console.error('Error fetching contact details:', error);
        res.status(500).json({ error: 'An error occurred while fetching contact details.' });
    }
};

const updateContactShownStatus = async (req, res) => {
    try {
        const contactId = req.params.id;

        const selectResult = await db.query('SELECT * FROM contact_us WHERE contact_id = $1', [contactId]);

        if (selectResult.rows.length === 0) {
            return res.status(404).json({ error: 'Contact not found.' });
        }

        const currentStatus = selectResult.rows[0].is_shown;
        const newStatus = !currentStatus;

        const updateResult = await db.query('UPDATE contact_us SET is_shown = $1 WHERE contact_id = $2', [newStatus, contactId]);

        if (updateResult.rowCount === 0) {
            return res.status(404).json({ error: 'Contact not found or already deleted.' });
        }

        res.status(200).json({ message: 'Contact status toggled successfully.', newStatus });
    } catch (error) {
        console.error('Error toggling contact status:', error);
        res.status(500).json({ error: 'An error occurred while toggling contact status.' });
    }
};


module.exports = {
    sendEmailContact,

    getContact,

    getAllContact,

    getContactById,

    updateContactShownStatus
}
