const db = require("../../Models/config/db");

const userModel = require("../../Models/user/user_model");

const registerUser = async (req, res) => {
  const { first_name, last_name, email, password, confirm_password, country } =
    req.body;

  try {
    const result = await userModel.registerUser({
      first_name,
      last_name,
      email,
      password,
      confirm_password,
      country,
    });

    if (result.error) {
      res.status(400).json({ error: result.error.details });
    } else if (result.emailExists) {
      res.status(400).json({ error: "Email already exists" });
    } else {
      const { token, role_id } = result;
      res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
      res.status(200).json({
        message: "User added successfully",
        token,
        role_id,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to register user");
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { error, message, token, role_id, user_id } =
      await userModel.loginUser({ email, password });

    if (error) {
      res.status(400).json({ error });
    } else if (message) {
      res.status(400).json({ message });
    } else {
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        maxAge: 3600000,
      });
      res.status(200).json({
        validate: { email },
        message: "Successfully Login",
        token,
        role_id,
        user_id,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to Authenticate");
  }
};

const MakeAdmin = async (req, res) => {
  try {
    const user_id = req.params.id;

    const selectResult = await db.query(
      "SELECT * FROM users WHERE user_id = $1",
      [user_id]
    );

    if (selectResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    const currentRole = selectResult.rows[0].role_id;

    const newRole = currentRole === 1 ? 2 : 1;

    const updateResult = await db.query(
      "UPDATE users SET role_id = $1 WHERE user_id = $2",
      [newRole, user_id]
    );

    if (updateResult.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "User not found or already deleted." });
    }

    res
      .status(200)
      .json({ message: "User status toggled successfully.", newRole });
  } catch (error) {
    console.error("Error toggling contact status:", error);
    res
      .status(500)
      .json({ error: "An error occurred while toggling User status." });
  }
};

const getUsersPaginated = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 4;
    const search = req.query.search;

    if (isNaN(page) || isNaN(pageSize) || page <= 0 || pageSize <= 0) {
      throw new Error("Invalid page or limit parameter");
    }
    const result = await userModel.getUserPaginated(page, pageSize, search);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  registerUser,

  loginUser,

  MakeAdmin,

  getUsersPaginated,
};
