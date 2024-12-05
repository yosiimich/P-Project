const express = require("express");
const router = express.Router();
const { getPronunciation,saveS3Pronunciation, savePronunciation, pronunciationCheck } = require("../controllers/pronunciationController");

router.route("/").get(getPronunciation).post(pronunciationCheck, savePronunciation, saveS3Pronunciation )

module.exports = router;