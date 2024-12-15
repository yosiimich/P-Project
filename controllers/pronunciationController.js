const asyncHandler = require("express-async-handler");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const dbConnect = require("../config/dbConnect");
const path = require("path");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const jwtSecret = process.env.JWT_SECRET; // npm i jsonwebtoken
const fs = require('fs')
const multer = require("multer");
const multerS3 = require("multer-s3");
const { spawn } = require('child_process');

const s3 = new S3Client({
  region: "ap-northeast-2", // 서울로 기입했으면 이거 기입
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESSKEY,
    secretAccessKey: process.env.AWS_S3_SECRETKEY,
  },
});

const uploadToS3 = multer({
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

// 로컬 디스크에 저장하는 multer 설정
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tmpDir = "./tmp";

    // tmp 디렉토리가 없으면 생성
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir);
    }

    cb(null, tmpDir); // 파일이 저장될 디렉토리 설정
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`); // 파일 이름 설정
  },
});

const uploadToLocal = multer({ storage: localStorage });

// 뷰 렌더링 - 업로드 페이지
//@desc Get pronunciation-check page
//@route GET /
const getPronunciation = (req, res) => {
  res.render("pronunciation-upload"); // 업로드 뷰
};

// S3에 파일 저장 - POST
//@desc Post pronunciation-check page
//@route POST /upload-s3
const saveAndUpload = asyncHandler(async (req, res, next) => {
  const uploadSingleLocal = uploadToLocal.single("audio");

  uploadSingleLocal(req, res, async (err) => {
    if (err) {
      console.error("Local Upload Error:", err);
      return res
        .status(500)
        .send({ message: "Local file upload failed", error: err });
    }

    if (!req.file) {
      console.error("No file uploaded");
      return res.status(400).send({
        message: "No file uploaded",
      });
    }

    // 로컬에 저장된 파일 경로
    const localFilePath = path.join(__dirname, "../tmp", req.file.filename);
    console.log(`File uploaded locally: ${localFilePath}`);
    res.locals.fileName = localFilePath;
    // S3로 업로드
    try {
      const uploadResult = await s3.send(new PutObjectCommand({
        Bucket: "pproject-voice",
        Key: `uploads/${Date.now()}${path.extname(req.file.originalname)}`,
        Body: fs.createReadStream(localFilePath),
        ContentType: req.file.mimetype,
      }));

      if (uploadResult.$metadata.httpStatusCode === 200) {
        console.log("File successfully uploaded to S3");
        res.locals.fileUrl = `https://pproject-voice.s3.amazonaws.com/uploads/${Date.now()}${path.extname(req.file.originalname)}`;
        next();
      } else {
        console.error("S3 Upload Error: Unsuccessful upload");
        return res
          .status(500)
          .send({ message: "S3 file upload failed" });
      }
    } catch (s3Error) {
      console.error("S3 Upload Error:", s3Error);
      return res
        .status(500)
        .send({ message: "S3 file upload failed", error: s3Error });
    }
  });
});

const savePronunciation = asyncHandler(async (req, res, next) => {
  const fileUrl = res.locals.fileUrl;
  const {title, text} = req.body;
  const token = req.cookies.token;
  const decoded = jwt.verify(token, jwtSecret);
  const email = decoded.email;

  dbConnect.query(
    "INSERT INTO voice (author_email, url, script) VALUES (?, ?, ?)",
    [email, fileUrl, text],
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
  const {title, text} = req.body;
  const fileName = res.locals.fileName
  console.log("Pronunciation check started for file:", fileUrl);

  let ai = "";

  const pythonProcess = spawn('python', ['../AI/voice.py', '--model_path', '../AI/saved_model','--file_path',fileName]);
    pythonProcess.stdout.on('data', (data) => {
      ai += data.toString('utf-8');
      console.log(`${data.toString('utf-8')}`);
    });
    
    // 오류 처리
    pythonProcess.stderr.on('data', (data) => {
      console.error(`Error: ${data.toString('utf-8')}`);
    });
    
    // 종료 처리
    pythonProcess.on('close', (code) => {
      console.log(`Python process exited with code ${code}`);
      dbConnect.query(
        "INSERT INTO ai_voice (voice_id, ai) VALUES (?, ?)",
        [req.voiceId, ai],
        function (error, results) {
          if (error) {
            console.error("Error inserting voice:", error);
            return res.status(500).json({ message: "Internal Server Error" });
          }
          fs.unlinkSync(fileName);
          return res.status(200).json({
            fileUrl: fileUrl,
            userText: text,
            aiText: ai,
          });
        }
      );
    });
  
  // 발음 검사 로직 추가
};

module.exports = {
  getPronunciation,
  saveAndUpload,
  savePronunciation,
  pronunciationCheck,
};
