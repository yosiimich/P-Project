const express = require("express");
const router = express.Router();
const { getSpelling, saveScript, saveFile, spellCheck } = require("../controllers/spellingController");

router.route("/").get(getSpelling).post(saveScript, saveFile, spellCheck);


module.exports = router;