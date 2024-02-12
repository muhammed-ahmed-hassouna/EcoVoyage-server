require("dotenv").config();
const jwt = require("jsonwebtoken");

function authorize(allowedRoles) {
  return (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Access is forbidden. You must authenticate first" });
    }

    try {
      const secretKey = process.env.SECRET_KEY;
      const decodedToken = jwt.verify(token, secretKey);
      const role_id = decodedToken.role_id;
      // Inside your authorize middleware
      // console.log('Headers:', req.headers);
      // console.log('Decoded Token:', decodedToken);

      req.user = decodedToken;
      if (allowedRoles.includes(role_id)) {
        next();
      } else {
        res.status(403).json({
          message: "Access is prohibited. You do not have permission.",
        });
      }
    } catch (error) {
      console.error("Error verifying token:", error);
      res.status(401).json({ message: "Access is forbidden. Invalid token." });
    }
  };
}

module.exports = {
  authorize,
};

