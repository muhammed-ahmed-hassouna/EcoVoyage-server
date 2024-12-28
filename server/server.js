const express = require("express");
const app = express();
app.use(express.json());
var cors = require("cors");
app.use(cors());
require("dotenv").config();

const setupRoutes = require("./routes");
setupRoutes(app);

const PORT = 3999;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
