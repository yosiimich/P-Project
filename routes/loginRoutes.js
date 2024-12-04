const express = require("express");
const router = express.Router();
const { getMain } = require("../controllers/mainController");
const { getLogin, loginUser, logout, getRegister,registerUser } = require("../controllers/loginController");

router.route("/").get(getMain)
router.route("/login").get(getLogin).post(loginUser);
router.route("/register").get(getRegister).post(registerUser);
router.route("/logout").get(logout);


module.exports = router;