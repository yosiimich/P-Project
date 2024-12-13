const express = require("express");
const router = express.Router();
const { checkAdmin } = require("../middlewares/checkLogin");
const { getAdmin, getusers, deleteUser, getScript, deleteScript, getVoice, deleteVoice, getNotice, getANotice, makeNotice, postNotice, putNotice, deleteNotice } = require("../controllers/adminController");

router.use(checkAdmin);

router.route("/").get(getAdmin);
router.route("/user").get(getusers);
router.route("/user/:id").delete(deleteUser);
router.route("/script").get(getScript)
router.route("/script/:id").delete(deleteScript);
router.route("/voice").get(getVoice)
router.route("/voice/:id").delete(deleteVoice);
router.route("/notice").get(getNotice)
router.route("/notice/make").get(makeNotice).post(postNotice);
router.route("/notice/:id").get(getANotice).put(putNotice).delete(deleteNotice);

module.exports = router;