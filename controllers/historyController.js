const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;
const dbConnect = require("../config/dbConnect");

//@desc Get history page
//@route GET /
const getHistory = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  const decoded = jwt.verify(token, jwtSecret);
  const email = decoded.email;

  try {
    const scriptResults = await new Promise((resolve, reject) => {
      dbConnect.query(
        "SELECT * FROM script WHERE author_email = ?",
        [email],
        (error, results) => {
          if (error) return reject(error);
          resolve(results);
        }
      );
    });

    const scriptsWithAI = await Promise.all(
      scriptResults.map(async (script) => {
        const aiScriptText = await new Promise((resolve, reject) => {
          dbConnect.query(
            "SELECT text FROM ai_script WHERE script_id = ?",
            [script.id],
            (err, aiScriptResults) => {
              if (err) return reject(err);
              resolve(
                aiScriptResults.length > 0 ? aiScriptResults[0].text : null
              );
            }
          );
        });

        return {
          id: script.id,
          title: script.title,
          text: script.content,
          time: script.created_at,
          aiScript: {
            text: aiScriptText,
          },
        };
      })
    );

    const voiceResults = await new Promise((resolve, reject) => {
      dbConnect.query(
        "SELECT * FROM voice WHERE author_email = ?",
        [email],
        (error, results) => {
          if (error) return reject(error);
          resolve(results);
        }
      );
    });

    const voiceWithAI = await Promise.all(
      voiceResults.map(async (voice) => {
        const aivoiceText = await new Promise((resolve, reject) => {
          dbConnect.query(
            "SELECT * FROM ai_voice WHERE voice_id = ?",
            [voice.id],
            (err, aiScriptResults) => {
              if (err) return reject(err);
              if (aiScriptResults.length > 0) {
                resolve({
                  user: aiScriptResults[0].user,
                  ai: aiScriptResults[0].ai,
                });
              } else {
                resolve({ user: null, ai: null });
              }
            }
          );
        });

        return {
          id: voice.id,
          url: voice.url,
          time: voice.created_at,
          aiScript: {
            userText: aivoiceText.user,
            aiText: aivoiceText.ai,
          },
        };
      })
    );

    // JSON 응답 대신 페이지 렌더링
    res.render("history", {
      scripts: scriptsWithAI,
      voice: voiceWithAI,
      layout: "layouts/mainFrame", // 레이아웃 지정
    });
  } catch (error) {
    console.error("Error getting history:", error);
    res.status(500).render("error", {
      message: "기록을 불러오는데 실패했습니다.",
      layout: "layouts/mainFrame",
    });
  }
});

module.exports = { getHistory };
