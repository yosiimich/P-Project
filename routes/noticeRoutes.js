const express = require("express");
const router = express.Router();
const { getAllNotice} = require("../controllers/noticeController");

router.route("/").get(getAllNotice);

module.exports = router;