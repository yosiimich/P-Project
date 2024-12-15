const express = require("express");
const router = express.Router();
const {
  getPronunciation,
  saveAndUpload,
  savePronunciation,
  pronunciationCheck,
} = require("../controllers/pronunciationController");

router
  .route("/")
  .get(getPronunciation)
  .post(saveAndUpload, savePronunciation, pronunciationCheck);

module.exports = router;
