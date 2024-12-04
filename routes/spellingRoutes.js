const express = require("express");
const router = express.Router();
const { getSpelling, saveScript, spellCheck } = require("../controllers/spellingController");

router.route("/").get(getSpelling).post(saveScript, spellCheck);


module.exports = router;