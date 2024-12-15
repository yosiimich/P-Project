const express = require("express");
const router = express.Router();
const {
  getPronunciation,
  saveAndUpload,
  savePronunciation,
  pronunciationCheck,
  getPronunciationResult,
} = require("../controllers/pronunciationController");

router
  .route("/")
  .get(getPronunciation)
  .post(saveAndUpload, savePronunciation, pronunciationCheck);

router.get("/result", getPronunciationResult);
module.exports = router;
