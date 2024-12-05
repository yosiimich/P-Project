const express = require("express");
const router = express.Router();
const { checkLogin } = require("../middlewares/checkLogin");
const cookieParser = require("cookie-parser");
const { getMine } = require("../controllers/mineController");

router.route("/").get(checkLogin, getMine);

module.exports = router;
