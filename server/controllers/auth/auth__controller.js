const authModel = require("../../Models/auth/auth_model");
const { jwt, bcrypt, Joi } = require("../../utils/dependencies");

const googleLogin = async (req, res) => {
  try {
    const first_name = req.body.given_name;
    const last_name = req.body.family_name;
    const { email, picture } = req.body;

    const existUser = await authModel.getUserByEmail(email);

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
      const user = await authModel.createUser({
        first_name,
        last_name,
        email,
        picture,
      });
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
  googleLogin,
};
