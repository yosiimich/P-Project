const express = require("express");
const router = express.Router();
const { getNotice } = require("../controllers/noticeController");

router.route("/").get(getNotice)

module.exports = router;