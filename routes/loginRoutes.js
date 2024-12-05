const express = require("express");
const router = express.Router();
const { getMain, getNotice, getLogin, loginUser, logout, getRegister,registerUser } = require("../controllers/loginController");

router.route("/").get(getMain)
router.route("/notice").get(getNotice)
router.route("/login").get(getLogin).post(loginUser);
router.route("/register").get(getRegister).post(registerUser);
router.route("/logout").get(logout);


module.exports = router;