const express = require("express");
const router = express.Router();
const { getAllNotice, getDetailNotice } = require("../controllers/noticeController");

router.route("/").get(getAllNotice);
router.route("/:id").get(getDetailNotice);

module.exports = router;
