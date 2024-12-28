const nodemailer = require("nodemailer");

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

module.exports = {
  sendEmail,
  verificationCode,
};
