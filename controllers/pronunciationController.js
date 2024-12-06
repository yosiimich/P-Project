const asyncHandler = require("express-async-handler");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const dbConnect = require("../config/dbConnect");
const path = require("path");
const { S3Client } = require("@aws-sdk/client-s3");
const jwtSecret = process.env.JWT_SECRET; // npm i jsonwebtoken

const multer = require("multer");
const multerS3 = require("multer-s3");

const s3 = new S3Client({
  region: "ap-northeast-2", // 서울로 기입했으면 이거 기입
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESSKEY,
    secretAccessKey: process.env.AWS_S3_SECRETKEY,
  },
});

const ext = path.extname(__filename);

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "pproject-voice", // 업로드할 S3 버킷 이름
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `uploads/${Date.now()}${ext}`);
    },
  }),
});

//@desc Get pronunciation-check page
//@route GET /
const getPronunciation = (req, res) => {
  res.render("pronunciation-upload"); // 업로드 뷰
};

//@desc Post pronunciation-check page
//@route POST /
const saveS3Pronunciation = asyncHandler(async (req, res, next) => {
  const uploadSingle = upload.single("audio");

  uploadSingle(req, res, (err) => {
    if (err) {
      console.error("S3 Upload Error:", err);
      return res
        .status(500)
        .send({ message: "File upload failed", error: err });
    }

    if (!req.file) {
      console.error("No file uploaded");
      return res.status(400).send({
        message: "No file uploaded",
      });
    }

    // 파일 URL 저장
    res.locals.fileUrl = req.file.location;
    console.log(`File uploaded: ${res.locals.fileUrl}`);
    next(); // 다음 미들웨어로 이동
  });
});

const savePronunciation = asyncHandler(async (req, res, next) => {
  const fileUrl = res.locals.fileUrl;

  const token = req.cookies.token;
  const decoded = jwt.verify(token, jwtSecret);
  const email = decoded.email;

  dbConnect.query(
    "INSERT INTO voice (author_email, url) VALUES (?, ?)",
    [email, fileUrl],
    function (error, results) {
      if (error) {
        console.error("Error inserting voice:", error);
        return res.status(500).json({ message: "Internal Server Error" });
      }
      req.voiceId = results.insertId;
      next();
    }
  );
});

const pronunciationCheck = async (req, res) => {
  const fileUrl = res.locals.fileUrl;

  console.log("Pronunciation check started for file:", fileUrl);
  user = "voice_test_text_user";
  ai = "voice_test_text_ai";
  dbConnect.query(
    "INSERT INTO ai_voice (voice_id, user, ai) VALUES (?, ?, ?)",
    [req.voiceId, user, ai],
    function (error, results) {
      if (error) {
        console.error("Error inserting voice:", error);
        return res.status(500).json({ message: "Internal Server Error" });
      }
      res.status(200).json({
        fileUrl: fileUrl,
        userText: user,
        aiText: ai,
      });
    }
  );
  // 발음 검사 로직 추가
};

module.exports = {
  getPronunciation,
  saveS3Pronunciation,
  savePronunciation,
  pronunciationCheck,
};
