const express = require("express");
const router = express.Router();
const { getHistory, getScriptHistory, getVoiceHistory } = require("../controllers/historyController");

router.route("/").get(getHistory)
router.route("/script/:id").get(getScriptHistory)
router.route("/pronunciation/:id").get(getVoiceHistory)


module.exports = router;