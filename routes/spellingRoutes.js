const express = require("express");
const router = express.Router();
const { getSpelling } = require("../controllers/spellingController");

router.route("/").get(getSpelling)

module.exports = router;