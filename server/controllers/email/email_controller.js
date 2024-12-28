const db = require("../../Models/config/db");
const nodemailer = require("nodemailer");

const { bcrypt, Joi } = require('../../utils/dependencies');

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAILNODEMAILER,
    pass: process.env.PASSWORDNODEMAILER,
  },
  tls: {
    rejectUnauthorized: false,
  },
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
    subject: "Email Verification Code",
    text: `Your email verification code is: ${verificationCode}`,
  };
  // console.log('Sending verification email to ' + email);
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email verification");
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

const updatePassword = async (req, res) => {
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

module.exports = {
  sendEmail,
  verificationCode,
  updatePassword,
};
