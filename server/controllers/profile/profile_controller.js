const db = require("../../Models/config/db");
const profileModel = require("../../Models/profile/profile_model");
const Firebase = require("../../Middleware/FirebaseConfig/FireBaseConfig");

const { bcrypt, Joi } = require("../../utils/dependencies");

const getUserId = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user_id = req.user.user_id;

  try {
    const result = await db.query(profileModel.getUserByIdQuery, [user_id]);
    if (!result.rowCount) {
      return res.status(404).json({ error: "The User not found" });
    } else {
      res.status(200).json(result.rows);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const updateUserData = async (req, res) => {
  const user_id = req.user.user_id;
  const { first_name, last_name, email, password, confirm_password, country } =
    req.body;

  try {
    const schema = Joi.object({
      first_name: Joi.string().min(3).max(25),
      last_name: Joi.string().min(3).max(25),
      email: Joi.string().email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
      }),
      country: Joi.string().min(3).max(25),
      password: Joi.string().pattern(
        new RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%^&!])[A-Za-z\\d@#$%^&!]{8,30}$"
        )
      ),
      confirm_password: Joi.string()
        .optional()
        .valid(Joi.ref("password"))
        .when("password", {
          is: Joi.exist(),
          then: Joi.required(),
        }),
    });

    const validate = schema.validate({
      first_name,
      last_name,
      email,
      password,
      confirm_password,
      country,
    });

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

      req.body.profileimage = fileUrl;
    }

    const userData = {
      first_name,
      last_name,
      email,
      password: hashedPassword,
      country,
      profileimage: fileUrl,
    };

    const updatedUser = await profileModel.updateUserData(user_id, userData);

    if (!updatedUser) {
      return res.status(404).json({ error: "The User not found" });
    } else {
      res.status(200).json({
        message: "The User Updated!",
        validate,
        updatedUser,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const deleteUser = async (req, res) => {
  const user_id = req.user.user_id;
  try {
    const result = await db.query(profileModel.deleteUserQuery, [user_id]);
    if (!result.rowCount) {
      return res.json({});
    } else {
      res.status(200).json({
        message: "The User Deleted !",
      });
    }
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};

const getBookingOfUser = async (req, res) => {
  const user_id = req.user.user_id;

  try {
    const result = await profileModel.getBookingOfUser(user_id);

    if (!result || result.length === 0) {
      return res.json("Booking not found for the user");
    } else {
      res.status(200).json(result);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const getFlightsOfUser = async (req, res) => {
  const user_id = req.user.user_id;
  try {
    const result = await profileModel.getFlightsOfUser(user_id);

    if (!result || result.length === 0) {
      return res.json("Ticket not found for the user");
    } else {
      res.status(200).json(result);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  getUserId,
  updateUserData,
  deleteUser,
  getBookingOfUser,
  getFlightsOfUser,
};
