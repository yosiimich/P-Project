const express = require("express");
const router = express.Router();
const { getAdmin, getusers, deleteUser, getScript, deleteScript, getVoice, deleteVoice, getNotice, getANotice, postNotice, putNotice, deleteNotice } = require("../controllers/adminController");

router.route("/").get(getAdmin);
router.route("/user").get(getusers).delete(deleteUser);
router.route("/script").get(getScript)
router.route("/script/:id").delete(deleteScript);
router.route("/voice").get(getVoice)
router.route("/voice/:id").delete(deleteVoice);
router.route("/notice").get(getNotice).post(postNotice);
router.route("/notice/:id").get(getANotice).put(putNotice).delete(deleteNotice);

module.exports = router;