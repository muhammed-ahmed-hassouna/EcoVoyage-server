const db = require("../Models/config/db");

const jwt = require("jsonwebtoken");

require('dotenv').config();

const bcrypt = require('bcrypt');

const Joi = require('joi');

const nodemailer = require('nodemailer');

const userModel = require('../Models/userQueries');

const Firebase = require("../Middleware/FirebaseConfig/FireBaseConfig")

const express = require("express");

const app = express();

app.use(express.json());

var cors = require('cors');

app.use(cors());

const cookieParser = require('cookie-parser');

app.use(cookieParser());

const registerUser = async (req, res) => {
    const { first_name, last_name, email, password, confirm_password, country } = req.body;

    try {
        const result = await userModel.registerUser({ first_name, last_name, email, password, confirm_password, country });

        if (result.error) {
            res.status(400).json({ error: result.error.details });
        } else if (result.emailExists) {
            res.status(400).json({ error: 'Email already exists' });
        } else {
            const { token, role_id } = result;
            res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });
            res.status(200).json({
                message: 'User added successfully',
                token,
                role_id
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to register user');
    }
};



const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const { error, message, token, role_id, user_id } = await userModel.loginUser({ email, password });

        if (error) {
            res.status(400).json({ error });
        } else if (message) {
            res.status(400).json({ message });
        } else {
            res.cookie('token', token, { httpOnly: true, secure: true, maxAge: 3600000 });
            res.status(200).json({
                validate: { email }, // Include email validation in the response if needed
                message: "Successfully Login",
                token,
                role_id,
                user_id
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Failed to Authenticate");
    }
};

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAILNODEMAILER,
        pass: process.env.PASSWORDNODEMAILER
    },
    tls: {
        rejectUnauthorized: false
    }
});


const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const generatedVerificationCode = generateVerificationCode();

// console.log(generatedVerificationCode);
const sendVerificationEmail = async (email, verificationCode) => {
    const mailOptions = {
        from: process.env.EMAILNODEMAILER,
        to: email,
        subject: 'Email Verification Code',
        text: `Your email verification code is: ${verificationCode}`
    };
    // console.log('Sending verification email to ' + email);
    try {
        await transporter.sendMail(mailOptions);

    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email verification');
    }
};
let emailFromSendEmail;
let isVerificationComplete = false;

const sendEmail = async (req, res) => {
    try {
        const email = req.body.email;
        emailFromSendEmail = email;
        const checkEmailQuery =
            "SELECT user_id, password FROM users WHERE email = $1";

        const emailCheck = await db.query(checkEmailQuery, [email]);
        if (emailCheck.rows.length > 0) {
            await sendVerificationEmail(email, generatedVerificationCode);
            res
                .status(200)
                .json({ message: "Verification code email has been sent." });
        } else {
            res.status(404).json({ error: "Email not found in the database." });
        }
    } catch (error) {
        console.error("Error sending verification email:", error);
        res.status(500).json({
            error: "An error occurred while sending the verification email.",
        });
    }
};


const verificationCode = async (req, res) => {
    const verificationCode = req.body.verificationCode;

    if (verificationCode === generatedVerificationCode) {
        isVerificationComplete = true;
        res.status(200).json({
            message: "Verification successful. You can now reset your password.",
        });
    } else {
        res.status(400).json({
            message: "Invalid verification code",
        });
    }
};

const updatepassword = async (req, res) => {
    const newPassword = req.body.newPassword;
    const confirm_password = req.body.confirm_password;

    if (!isVerificationComplete) {
        return res.status(400).json({
            error:
                "Verification not complete. Please enter the verification code first.",
        });
    }

    const email = emailFromSendEmail;
    const updateQuery = "UPDATE users SET password = $1 WHERE email = $2";

    try {
        const schema = Joi.object({
            newPassword: Joi.string()
                .pattern(
                    new RegExp(
                        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%^&!])[A-Za-z\\d@#$%^&!]{6,30}$"
                    )
                )
                .required(),
            confirm_password: Joi.any().valid(Joi.ref("newPassword")).required(),
        });

        const validate = schema.validate({ newPassword, confirm_password });
        if (validate.error) {
            res.status(400).json({ error: validate.error.details });
        } else {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await db.query(updateQuery, [hashedPassword, email]);
            res.status(200).json({
                message: "Password updated successfully!",
            });
        }
    } catch (err) {
        console.error("Error updating password:", err);
        res
            .status(500)
            .json({ error: "An error occurred while updating the password" });
    }
};
// setInterval(() => {
//     emailSent = false; // Reset emailSent flag every 60 seconds
// }, 60000);

const getUserData = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM users WHERE is_deleted = false');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};


const getUserId = async (req, res) => {

    const user_id = req.user.user_id;

    // if (!req.user) {
    //     console.log(user_id);

    //     return res.status(401).json({ error: "Unauthorized" });
    // }
    try {
        const result = await db.query(userModel.getUserByIdQuery, [user_id]);
        if (!result.rowCount) {
            return res.status(404).json({ error: "The User not found" });
        } else {
            res.status(200).json(result.rows);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};


const updateUserData = async (req, res) => {
    const user_id = req.user.user_id;
    const { first_name, last_name, email, password, confirm_password, country } = req.body;

    try {
        const schema = Joi.object({
            first_name: Joi.string().min(3).max(25),
            last_name: Joi.string().min(3).max(25),
            email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
            country: Joi.string().min(3).max(25),
            password: Joi.string().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%^&!])[A-Za-z\\d@#$%^&!]{8,30}$')),
            confirm_password: Joi.string().optional().valid(Joi.ref('password')).when('password', {
                is: Joi.exist(),
                then: Joi.required(),
            })
        });

        const validate = schema.validate({ first_name, last_name, email, password, confirm_password, country });

        if (validate.error) {
            return res.status(400).json({ error: validate.error.details });
        }

        let hashedPassword;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        let fileUrl;

        const file = req.file;

        if (file) {
            const fileName = `${Date.now()}_${file.originalname}`;
            fileUrl = await Firebase.uploadFileToFirebase(file, fileName);

            // Use req.body.profileimage instead of req.body.fileUrl
            req.body.profileimage = fileUrl;
        }

        const userData = {
            first_name,
            last_name,
            email,
            password: hashedPassword,
            country,
            profileimage: fileUrl
        };

        const updatedUser = await userModel.updateUser(user_id, userData);

        if (!updatedUser) {
            return res.status(404).json({ error: 'The User not found' });
        } else {
            res.status(200).json({
                message: 'The User Updated!',
                validate,
                updatedUser
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const deleteUser = async (req, res) => {
    const user_id = req.user.user_id;
    try {
        const result = await db.query(userModel.deleteUserQuery, [user_id]);
        if (!result.rowCount) {
            return res.json({});
        } else {
            res.status(200).json({
                message: 'The User Deleted !',
            });
        }
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
};

const getBookingOfUser = async (req, res) => {
    const user_id = req.user.user_id;

    try {
        const result = await userModel.getBookingOfUser(user_id);

        if (!result || result.length === 0) {
            return res.json('Booking not found for the user');
        } else {
            res.status(200).json(result);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const getFlightsOfUser = async (req, res) => {
    const user_id = req.user.user_id;
    try {
        const result = await userModel.getFlightsOfUser(user_id);

        if (!result || result.length === 0) {
            return res.json('Ticket not found for the user');
        } else {
            res.status(200).json(result);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const CancelTicket = async (req, res) => {
    const ticket_id = req.params.id;
    try {
        const result = await userModel.CancelTicket(ticket_id);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};


const MakeAdmin = async (req, res) => {
    try {
        const user_id = req.params.id;

        const selectResult = await db.query('SELECT * FROM users WHERE user_id = $1', [user_id]);


        if (selectResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const currentRole = selectResult.rows[0].role_id;

        const newRole = (currentRole === 1) ? 2 : 1;


        const updateResult = await db.query('UPDATE users SET role_id = $1 WHERE user_id = $2', [newRole, user_id]);

        if (updateResult.rowCount === 0) {
            return res.status(404).json({ error: 'User not found or already deleted.' });
        }

        res.status(200).json({ message: 'User status toggled successfully.', newRole });
    } catch (error) {

        console.error('Error toggling contact status:', error);
        res.status(500).json({ error: 'An error occurred while toggling User status.' });
    }

};


const getUsersPaginated = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 4;
        const search = req.query.search;

        if (isNaN(page) || isNaN(pageSize) || page <= 0 || pageSize <= 0) {
            throw new Error("Invalid page or limit parameter")
        }
        const result = await userModel.getUserPaginated(page, pageSize, search);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }

};


const loginUsers = async (req, res) => {
    try {
        // console.log("object");
        const first_name = req.body.given_name;
        const last_name = req.body.family_name;
        const { email, picture } = req.body;
        // console.log(email);

        const existUser = await userModel.getUserByEmails(email);
        // console.log(`hhh`, existUser);

        if (existUser) {
            try {
                const payload = {
                    first_name: existUser.first_name,
                    last_name: existUser.last_name,
                    email: existUser.email,
                    role_id: existUser.role_id,
                    user_id: existUser.user_id,
                };
                const secretKey = process.env.SECRET_KEY;
                const token = jwt.sign(payload, secretKey, { expiresIn: "365d" });

                return res.status(200).json({
                    role_id: existUser.role_id,
                    logmessage: "User logged in successfully",
                    token: token,
                });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ error: "Internal Server Error" });
            }
        } else {
            const user = await userModel.createUsers({ first_name, last_name, email, picture });
            // console.log(user);
            const payload = {
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role_id: user.role_id,
                user_id: user.user_id,
            };
            const secretKey = process.env.SECRET_KEY;
            const token = jwt.sign(payload, secretKey, { expiresIn: "365d" });

            return res.status(200).json({
                role_id: user.role_id,
                logmessage: "User added successfully",
                token: token,
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


module.exports = {
    registerUser,

    loginUser,

    updatepassword,

    getUserData,

    deleteUser,

    sendEmail,

    verificationCode,

    getUserId,

    updateUserData,

    getBookingOfUser,

    getFlightsOfUser,

    CancelTicket,

    MakeAdmin,

    getUsersPaginated,

    loginUsers
};