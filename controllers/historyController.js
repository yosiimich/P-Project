const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;
const dbConnect = require("../config/dbConnect");

// @desc Get history page
// @route GET /history
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
          title: voice.title,
          time: voice.created_at,
          aiScript: {
            userText: voice.script,
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

// 스크립트 세부 정보
const getScriptHistory = asyncHandler(async (req, res) => {
  const id = req.params.id;
  dbConnect.query("SELECT * FROM script WHERE id=?", [id], (error, results) => {
    if (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
    if (results.length == 0) {
      return res.status(401).json({ message: "script not found" });
    } else {
      const script = results[0];
      dbConnect.query("SELECT * FROM ai_script WHERE script_id=?", [script.id], (error, results) => {
        if (error) {
          return res.status(500).json({ message: "Internal Server Error" });
        }
        if (results.length == 0) {
          return res.status(401).json({ message: "script not found" });
        }
        const ai_script = results[0];
        res.render("historyDetail", {
          title: "맞춤법", // 제목 설정
          type: "spelling", // 스크립트 타입
          script: {
            id: script.id,
            title: script.title,
            text: script.content,
            time: script.created_at,
            aiScript: {
              text: ai_script.text,  // ai_script.text 값을 넘겨줍니다.
            },
          },
          layout: "layouts/mainFrame", // 필요한 레이아웃을 추가
        });
      });
    }
  });
});

// 음성 세부 정보
const getVoiceHistory = asyncHandler(async (req, res) => {
  const id = req.params.id;
  dbConnect.query("SELECT * FROM voice WHERE id=?", [id], (error, results) => {
    if (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
    if (results.length == 0) {
      return res.status(401).json({ message: "voice not found" });
    } else {
	console.log(results);
      const voice = results[0];
      dbConnect.query("SELECT * FROM ai_voice WHERE voice_id=?", [voice.id], (error, results) => {
        if (error) {
          return res.status(500).json({ message: "Internal Server Error" });
        }
        if (results.length == 0) {
          return res.status(401).json({ message: "voice not found" });
        }
        const ai_voice = results[0];

        const aivoiceText = {
          ai: ai_voice.ai
        };
        res.render("historyDetail", {
          title: "발음", // 제목 설정
          type: "pronunciation", // 발음 타입
          voiceItem: {
            id: voice.id,
            url: voice.url,
            title: voice.title,
            time: voice.created_at,
            aiScript: {
              userText: voice.script,
              aiText: aivoiceText.ai,
          },
        },
        });
      });
    }
  });
});

module.exports = { getHistory, getScriptHistory, getVoiceHistory };