const express = require("express");
const router = express.Router();
const { getPronunciation,saveS3Pronunciation, savePronunciation, pronunciationCheck } = require("../controllers/pronunciationController");

router.route("/").get(getPronunciation).post(saveS3Pronunciation,savePronunciation, pronunciationCheck )

module.exports = router;