const express = require("express");
const router = express.Router();
const { getPronunciation } = require("../controllers/pronunciationController");

router.route("/").get(getPronunciation)

module.exports = router;