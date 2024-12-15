const asyncHandler = require("express-async-handler");
const dbConnect = require("../config/dbConnect");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET; // npm i jsonwebtoken
const fs = require("fs");
const { spawn } = require("child_process");

//@desc Get spelling-check page
//@route GET /
const getSpelling = (req, res) => {
  res.render("spelling-check");
};

//@desc Post spelling-check page
//@route POST /
const saveScript = async (req, res, next) => {
  const { title, text } = req.body;
  const token = req.cookies.token;
  const decoded = jwt.verify(token, jwtSecret);
  const email = decoded.email;

  if (!title || !text) {
    return res.status(400).json({ message: "All fields are required" });
  }

  dbConnect.query(
    "INSERT INTO script (author_email, title, content) VALUES (?, ?, ?)",
    [email, title, text],
    function (error, results) {
      if (error) {
        console.error("Error inserting script:", error);
        return res.status(500).json({ message: "Internal Server Error" });
      }
      req.scriptId = results.insertId;
      next();
    }
  );
};

const saveFile = async (req, res, next) => {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, "-"); // ISO 형식 시간 (콜론과 점을 대시로 교체)
  const filename = `./tmp/file-${timestamp}.txt`;
  const { title, text } = req.body;

  fs.writeFileSync(filename, text);
  req.fileName = filename;
  next();
};

const spellCheck = asyncHandler(async (req, res) => {
  console.log("spellCheck");
  const { title, text } = req.body;
  const scriptId = req.scriptId;
  const fileName = req.fileName;
  let ai = "";

  const pythonProcess = spawn("python", [
    "../AI/pridict.py",
    "--model_path",
    "../AI/grm_model",
    "--test_file",
    fileName,
  ]);
  pythonProcess.stdout.on("data", (data) => {
    ai += data.toString("utf-8");
    console.log(`${data.toString("utf-8")}`);
  });

  // 오류 처리
  pythonProcess.stderr.on("data", (data) => {
    console.error(`Error: ${data.toString("utf-8")}`);
  });

  // 종료 처리
  pythonProcess.on("close", (code) => {
    console.log(`Python process exited with code ${code}`);
    dbConnect.query(
      "INSERT INTO ai_script (script_id, text) VALUES (?, ?)",
      [scriptId, ai],
      function (error, results) {
        if (error) {
          console.error("Error inserting script:", error);
          return res.status(500).json({ message: "Internal Server Error" });
        }
        fs.unlinkSync(fileName);
        return res.status(200).json({
          title: title,
          user: text,
          ai: ai,
        });
      }
    );
  });
});

module.exports = { getSpelling, saveScript, saveFile, spellCheck };
